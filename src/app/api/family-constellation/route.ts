import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import {
  FAMILY_CONSTELLATION_SYSTEM_PROMPT,
  FAMILY_CONSTELLATION_PROMPT_BUILDER,
} from '@/lib/claude/prompts'
import { LENS_CARDS } from '@/types'

// POST /api/family-constellation
// body: { profile_ids: string[] }
// Premium only. All profiles must belong to the requesting user.

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: userProfile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()
    if (!userProfile || userProfile.subscription_tier === 'free') {
      return NextResponse.json({ error: 'Premium subscription required', upgrade_required: true }, { status: 403 })
    }

    const { profile_ids } = await req.json()

    if (!Array.isArray(profile_ids) || profile_ids.length < 2 || profile_ids.length > 8) {
      return NextResponse.json({ error: 'Select between 2 and 8 profiles for a family constellation.' }, { status: 400 })
    }

    // Verify all profiles belong to this user
    const { data: profiles } = await supabase
      .from('personality_profiles')
      .select('id, profile_name')
      .in('id', profile_ids)
      .eq('user_id', user.id)

    if (!profiles || profiles.length !== profile_ids.length) {
      return NextResponse.json({ error: 'One or more profiles not found or not owned by you.' }, { status: 403 })
    }

    // Fetch lens inputs for all profiles
    const { data: allLensInputs } = await supabase
      .from('lens_inputs')
      .select('*')
      .in('profile_id', profile_ids)
      .not('analysis_result', 'is', null)

    // Build member summaries
    const members = profiles.map((p) => {
      const lensInputs = (allLensInputs || []).filter((li) => li.profile_id === p.id)
      if (lensInputs.length === 0) {
        return { name: p.profile_name, summary: '(No analyzed lenses yet)' }
      }
      const summary = lensInputs.map((li) => {
        const card = LENS_CARDS.find((c) => c.type === li.lens_type)
        const result = li.analysis_result as Record<string, unknown>
        const traits = (result?.traits as Array<{ trait_name: string; confidence: string }>) || []
        return `${card?.name || li.lens_type}: ${result?.summary || ''} | Top traits: ${traits.slice(0, 4).map((t) => t.trait_name).join(', ')}`
      }).join('\n')
      return { name: p.profile_name, summary }
    })

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      system: FAMILY_CONSTELLATION_SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: FAMILY_CONSTELLATION_PROMPT_BUILDER(members),
      }],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    let result
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : { family_archetype: 'Unknown', closing_reflection: responseText }
    } catch {
      result = { family_archetype: 'Unknown', closing_reflection: responseText }
    }

    return NextResponse.json({ success: true, constellation: result })
  } catch (error) {
    console.error('Family constellation error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Generation failed' }, { status: 500 })
  }
}
