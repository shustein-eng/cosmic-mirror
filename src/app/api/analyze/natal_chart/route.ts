import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { calculateNatalChart } from '@/lib/natal/calculator'
import { NATAL_CHART_SYSTEM_PROMPT } from '@/lib/claude/prompts'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { lens_input_id, date_of_birth, time_of_birth, city, latitude, longitude, time_unknown } = await req.json()

    if (!date_of_birth) {
      return NextResponse.json({ error: 'Date of birth required' }, { status: 400 })
    }

    // Calculate planetary positions server-side
    const chartData = calculateNatalChart(
      date_of_birth,
      time_of_birth || '12:00',
      latitude || 32.0853,
      longitude || 34.7818
    )

    await supabase
      .from('lens_inputs')
      .update({
        input_data: { date_of_birth, time_of_birth, city, latitude, longitude, time_unknown },
      })
      .eq('id', lens_input_id)

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1800,
      system: NATAL_CHART_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Please interpret the following calculated natal birth chart for personality analysis:

Birth Details:
- Date: ${date_of_birth}
- Time: ${time_unknown ? 'Unknown (noon used)' : time_of_birth}
- Location: ${city || 'Not provided'} (lat: ${latitude}, lon: ${longitude})

Calculated Chart:
${JSON.stringify(chartData, null, 2)}

Provide a rich personality interpretation using psychological astrology frameworks. Focus on the most significant placements and how they combine to reveal character.`,
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

    analysisResult.chart_data = chartData

    await supabase
      .from('lens_inputs')
      .update({ analysis_result: analysisResult })
      .eq('id', lens_input_id)

    return NextResponse.json({ success: true, analysis: analysisResult })
  } catch (error) {
    console.error('Natal chart analysis error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    )
  }
}
