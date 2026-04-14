import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { COUPLES_SYSTEM_PROMPT, COUPLES_PROMPT_BUILDER } from '@/lib/claude/prompts'
import { LENS_CARDS } from '@/types'

// POST /api/couples
// body: { profile_a_id: string, profile_b_id: string, invite_token?: string }
// Both profiles must be owned by user, OR profile_b may be accessed via an invite_token

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

    const { profile_a_id, profile_b_id, invite_token } = await req.json()

    // Verify ownership of profile A
    const { data: profileA } = await supabase
      .from('personality_profiles')
      .select('id, profile_name')
      .eq('id', profile_a_id)
      .eq('user_id', user.id)
      .single()
    if (!profileA) return NextResponse.json({ error: 'Profile A not found or not owned by you.' }, { status: 403 })

    // Verify profile B — own or via invite token
    let profileBName: string
    const { data: profileB_own } = await supabase
      .from('personality_profiles')
      .select('id, profile_name')
      .eq('id', profile_b_id)
      .eq('user_id', user.id)
      .single()

    if (!profileB_own) {
      if (!invite_token) {
        return NextResponse.json({ error: 'An invite token is required to access another user\'s profile.' }, { status: 403 })
      }
      const { data: invite } = await supabase
        .from('comparison_invites')
        .select('inviter_profile_id, expires_at')
        .eq('invite_token', invite_token)
        .eq('inviter_profile_id', profile_b_id)
        .single()
      if (!invite) return NextResponse.json({ error: 'Invalid invite token.' }, { status: 403 })
      if (new Date(invite.expires_at) < new Date()) return NextResponse.json({ error: 'Invite token has expired.' }, { status: 403 })

      const { data: profileB_invited } = await supabase
        .from('personality_profiles')
        .select('profile_name')
        .eq('id', profile_b_id)
        .single()
      profileBName = profileB_invited?.profile_name || 'Partner'
    } else {
      profileBName = profileB_own.profile_name
    }

    // Fetch lens data for both profiles
    const { data: lensInputsA } = await supabase
      .from('lens_inputs')
      .select('*')
      .eq('profile_id', profile_a_id)
      .not('analysis_result', 'is', null)

    const { data: lensInputsB } = await supabase
      .from('lens_inputs')
      .select('*')
      .eq('profile_id', profile_b_id)
      .not('analysis_result', 'is', null)

    const buildSummary = (lensInputs: typeof lensInputsA) => {
      if (!lensInputs || lensInputs.length === 0) return '(No analyzed lenses yet)'
      return lensInputs.map((li) => {
        const card = LENS_CARDS.find((c) => c.type === li.lens_type)
        const result = li.analysis_result as Record<string, unknown>
        const traits = (result?.traits as Array<{ trait_name: string; confidence: string }>) || []
        return `${card?.name || li.lens_type}: ${result?.summary || ''} | Traits: ${traits.slice(0, 5).map((t) => t.trait_name).join(', ')}`
      }).join('\n')
    }

    const summaryA = buildSummary(lensInputsA)
    const summaryB = buildSummary(lensInputsB)

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      system: COUPLES_SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: COUPLES_PROMPT_BUILDER(profileA.profile_name, summaryA, profileBName, summaryB),
      }],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    let coupleResult
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      coupleResult = jsonMatch ? JSON.parse(jsonMatch[0]) : { relationship_archetype: 'Unknown', closing_reflection: responseText }
    } catch {
      coupleResult = { relationship_archetype: 'Unknown', closing_reflection: responseText }
    }

    return NextResponse.json({ success: true, report: coupleResult, names: { a: profileA.profile_name, b: profileBName } })
  } catch (error) {
    console.error('Couples report error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Generation failed' }, { status: 500 })
  }
}
