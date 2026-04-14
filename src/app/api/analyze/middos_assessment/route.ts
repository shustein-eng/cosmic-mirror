import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { MIDDOS_QUESTIONS, MIDDOS_CATEGORIES } from '@/lib/middos/questions'
import { MIDDOS_SYSTEM_PROMPT } from '@/lib/claude/prompts'

function scoreMiddos(answers: Record<number, string | number>) {
  const scores: Record<string, { total: number; count: number }> = {}

  for (const q of MIDDOS_QUESTIONS) {
    const answer = answers[q.id]
    if (answer === undefined) continue

    if (!scores[q.middah]) scores[q.middah] = { total: 0, count: 0 }

    if (q.type === 'scale') {
      // Scale 1-7: normalize to 0-10
      scores[q.middah].total += ((Number(answer) - 1) / 6) * 10
      scores[q.middah].count++
    } else if (q.type === 'multiple_choice' && q.options) {
      // Option A = strongest, D = weakest
      const idx = q.options.indexOf(String(answer))
      const score = idx === -1 ? 5 : [10, 7, 4, 2][idx]
      scores[q.middah].total += score
      scores[q.middah].count++
    }
  }

  return Object.entries(scores).map(([middah, { total, count }]) => {
    const cat = MIDDOS_CATEGORIES.find((c) => c.name === middah)
    return {
      middah,
      hebrew: cat?.hebrew || '',
      score: count > 0 ? Math.round((total / count) * 10) / 10 : 5,
      answer_count: count,
    }
  })
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { lens_input_id, answers } = await req.json()

    // Score the middos
    const middosScores = scoreMiddos(answers)
    const sortedScores = [...middosScores].sort((a, b) => b.score - a.score)
    const dominant = sortedScores.slice(0, 3).map((m) => m.middah)
    const growth = sortedScores.slice(-3).reverse().map((m) => m.middah)

    await supabase
      .from('lens_inputs')
      .update({ input_data: { answers } })
      .eq('id', lens_input_id)

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1800,
      system: MIDDOS_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Please interpret the following Middos Assessment results for personality analysis:

Middos Scores (0-10 scale, 10 = strongest expression):
${JSON.stringify(middosScores, null, 2)}

Dominant middos (highest scores): ${dominant.join(', ')}
Growth areas (lowest scores): ${growth.join(', ')}

Raw answers for context:
${JSON.stringify(answers, null, 2)}

Questions reference:
${MIDDOS_QUESTIONS.slice(0, 10).map((q) => `Q${q.id} (${q.middah}): ${q.question}`).join('\n')}
[...and ${MIDDOS_QUESTIONS.length - 10} more questions]

Please provide a rich personality analysis grounded in the mussar tradition. Highlight how the dominant and growth middos interact to create this person's unique character pattern.`,
        },
      ],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

    let analysisResult
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      analysisResult = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: responseText, traits: [] }
    } catch {
      analysisResult = { summary: responseText, traits: [] }
    }

    analysisResult.scores = middosScores
    analysisResult.dominant_middos = dominant
    analysisResult.growth_middos = growth

    await supabase
      .from('lens_inputs')
      .update({ analysis_result: analysisResult })
      .eq('id', lens_input_id)

    return NextResponse.json({ success: true, analysis: analysisResult })
  } catch (error) {
    console.error('Middos analysis error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    )
  }
}
