import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { TANACH_FIGURE_SYSTEM_PROMPT, TANACH_FIGURE_REPORT_PROMPT_BUILDER } from '@/lib/claude/prompts'
import { LENS_CARDS } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Premium only
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()
    if (!userProfile || userProfile.subscription_tier === 'free') {
      return NextResponse.json({ error: 'Premium subscription required', upgrade_required: true }, { status: 403 })
    }

    const { profile_id } = await req.json()

    // Verify ownership
    const { data: profile } = await supabase
      .from('personality_profiles')
      .select('*')
      .eq('id', profile_id)
      .eq('user_id', user.id)
      .single()
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    // Fetch analyzed lenses
    const { data: lensInputs } = await supabase
      .from('lens_inputs')
      .select('*')
      .eq('profile_id', profile_id)
      .not('analysis_result', 'is', null)

    if (!lensInputs || lensInputs.length === 0) {
      return NextResponse.json({ error: 'Complete at least one lens before generating a Tanach figure match.' }, { status: 400 })
    }

    // Build compact personality summary from lens data
    const lensData = lensInputs.map((li) => {
      const card = LENS_CARDS.find((c) => c.type === li.lens_type)
      const result = li.analysis_result as Record<string, unknown>
      const traits = (result?.traits as Array<{ trait_name: string; confidence: string; category: string }>) || []
      return `${card?.name || li.lens_type}:\n  Summary: ${result?.summary || ''}\n  Top traits: ${traits.slice(0, 4).map((t) => `${t.trait_name} (${t.confidence})`).join(', ')}\n  Notable: ${(result?.notable_features as string[] || []).slice(0, 2).join(', ')}`
    }).join('\n\n')

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: TANACH_FIGURE_SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: TANACH_FIGURE_REPORT_PROMPT_BUILDER(profile.profile_name, lensData),
      }],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    let figureResult
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      figureResult = jsonMatch ? JSON.parse(jsonMatch[0]) : { figure_name: 'Unknown', core_parallel: responseText }
    } catch {
      figureResult = { figure_name: 'Unknown', core_parallel: responseText }
    }

    // Upsert — one tanach figure per profile
    const { data: saved, error: saveError } = await supabase
      .from('tanach_figures')
      .upsert({
        profile_id,
        figure_data: figureResult,
        generated_at: new Date().toISOString(),
      }, { onConflict: 'profile_id' })
      .select()
      .single()

    if (saveError) throw saveError

    return NextResponse.json({ success: true, figure: figureResult })
  } catch (error) {
    console.error('Tanach figure error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Generation failed' }, { status: 500 })
  }
}
