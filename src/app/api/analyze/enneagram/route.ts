import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { ENNEAGRAM_SYSTEM_PROMPT } from '@/lib/claude/prompts'
import { scoreEnneagram, detectType } from '@/lib/enneagram/questions'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { lens_input_id, profile_id, answers } = await req.json()
    if (!answers || Object.keys(answers).length === 0) {
      return NextResponse.json({ error: 'Assessment answers are required' }, { status: 400 })
    }

    const scores = scoreEnneagram(answers)
    const { coreType, wing, likelyTritype } = detectType(scores)

    // Sort types by score for context
    const typeRanking = Object.entries(scores)
      .map(([k, v]) => ({ type: parseInt(k.replace('type', '')), score: v }))
      .sort((a, b) => b.score - a.score)

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: ENNEAGRAM_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Please provide a detailed Enneagram personality analysis based on this assessment.

ASSESSMENT RESULTS:
Core Type (highest score): Type ${coreType}
Wing: ${wing}
Likely Tri-Type: ${likelyTritype}

TYPE SCORES (all 9 types):
${typeRanking.map((t) => `Type ${t.type}: ${t.score} points`).join('\n')}

TOTAL QUESTIONS: ${Object.keys(answers).length}

Please provide the full Riso-Hudson analysis for Type ${coreType} with ${wing} wing, including:
- Core motivation, basic fear, core desire
- Behavioral patterns at this person's likely level of development (based on score distribution)
- How the ${wing} wing modifies expression
- The tri-type combination ${likelyTritype} and what it reveals
- Instinctual variant (make a reasonable assessment based on pattern)
- Integration path (growth direction)
- Specific, actionable growth practices for this type

Note: The second-highest type (${typeRanking[1]?.type || 'N/A'}) may represent the wing or a stress/integration influence.

Respond as JSON.`,
        },
      ],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    let analysisResult
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {}
      analysisResult = { ...parsed, enneagram_scores: scores, core_type: coreType, wing, tri_type: likelyTritype }
    } catch {
      analysisResult = { summary: responseText, traits: [], enneagram_scores: scores, core_type: coreType, methodology_note: 'Enneagram analysis.' }
    }

    const { error: saveError } = await supabase
      .from('lens_inputs')
      .update({
        input_data: { answers, scores, core_type: coreType, wing, tri_type: likelyTritype },
        analysis_result: analysisResult,
      })
      .eq('id', lens_input_id)
      .eq('profile_id', profile_id)

    if (saveError) throw saveError

    return NextResponse.json({ success: true, analysis: analysisResult })
  } catch (error) {
    console.error('Enneagram analysis error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Analysis failed' }, { status: 500 })
  }
}
