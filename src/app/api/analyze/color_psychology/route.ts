import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { COLOR_PSYCHOLOGY_SYSTEM_PROMPT } from '@/lib/claude/prompts'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { lens_input_id, favorites, dislikes, scenarios, rapid_fire, color_palette } = await req.json()

    await supabase
      .from('lens_inputs')
      .update({
        input_data: { favorites, dislikes, scenarios, rapid_fire },
      })
      .eq('id', lens_input_id)

    // Build a structured summary for Claude
    const paletteMap: Record<string, { hex: string; psychology: string }> = {}
    for (const c of (color_palette || [])) {
      paletteMap[c.name] = { hex: c.hex, psychology: c.psychology }
    }

    const rapidFireSummary: Record<string, number> = {}
    for (const color of Object.values(rapid_fire || {})) {
      rapidFireSummary[String(color)] = (rapidFireSummary[String(color)] || 0) + 1
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: COLOR_PSYCHOLOGY_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Please interpret the following Color Psychology Profile results:

FAVORITE COLORS (3 chosen, drawn to):
${favorites.map((name: string) => `- ${name}: ${paletteMap[name]?.psychology || ''}`).join('\n')}

DISLIKED COLORS (3 chosen, averse to):
${dislikes.map((name: string) => `- ${name}: ${paletteMap[name]?.psychology || ''}`).join('\n')}

CONTEXTUAL COLOR CHOICES:
${Object.entries(scenarios || {}).map(([ctx, color]) => `- ${ctx}: ${color} (${paletteMap[String(color)]?.psychology || ''})`).join('\n')}

RAPID FIRE PREFERENCES (instinctive choices from pairs):
${Object.entries(rapidFireSummary).map(([color, count]) => `- ${color}: chosen ${count} time(s)`).join('\n')}

Please analyze what these color preferences reveal about this person's personality, emotional needs, and inner world. Draw connections between the chosen and rejected colors. The rapid-fire choices reveal the most unconscious preferences.`,
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

    await supabase
      .from('lens_inputs')
      .update({ analysis_result: analysisResult })
      .eq('id', lens_input_id)

    return NextResponse.json({ success: true, analysis: analysisResult })
  } catch (error) {
    console.error('Color psychology analysis error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    )
  }
}
