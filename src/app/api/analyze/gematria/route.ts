import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { calculateAll } from '@/lib/gematria/calculator'
import { GEMATRIA_SYSTEM_PROMPT } from '@/lib/claude/prompts'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { lens_input_id, profile_id, hebrew_name, english_name, date_of_birth } = await req.json()

    if (!hebrew_name || !date_of_birth) {
      return NextResponse.json({ error: 'Hebrew name and date of birth required' }, { status: 400 })
    }

    // Compute all gematria results server-side
    const gematriaResults = calculateAll(
      hebrew_name,
      english_name || '',
      date_of_birth
    )

    // Save input data
    await supabase
      .from('lens_inputs')
      .update({
        input_data: {
          hebrew_name,
          english_name,
          date_of_birth,
        },
      })
      .eq('id', lens_input_id)

    // Call Claude for interpretation only
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: GEMATRIA_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Please interpret the following pre-computed gematria results for personality analysis:

${JSON.stringify(gematriaResults, null, 2)}

Identify the 3-5 most distinctive and meaningful patterns, and provide a rich personality interpretation grounded in the source traditions named in your instructions.`,
        },
      ],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

    // Parse Claude's JSON response
    let analysisResult
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      analysisResult = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: responseText, traits: [] }
    } catch {
      analysisResult = { summary: responseText, traits: [] }
    }

    // Attach the computed numbers to the result
    analysisResult.computed_values = gematriaResults

    // Save analysis result
    await supabase
      .from('lens_inputs')
      .update({ analysis_result: analysisResult })
      .eq('id', lens_input_id)

    return NextResponse.json({ success: true, analysis: analysisResult })
  } catch (error) {
    console.error('Gematria analysis error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    )
  }
}
