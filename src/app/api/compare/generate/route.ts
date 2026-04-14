import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { COMPARISON_SYSTEM_PROMPT } from '@/lib/claude/prompts'
import { LENS_CARDS } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify premium
    const { data: userProfile } = await supabase.from('profiles').select('subscription_tier').eq('id', user.id).single()
    if (!userProfile || userProfile.subscription_tier === 'free') {
      return NextResponse.json({ error: 'Premium subscription required for profile comparison', upgrade_required: true }, { status: 403 })
    }

    const { profile_a_id, profile_b_id, comparison_type = 'compatibility', invite_token } = await req.json()

    // Verify ownership of profile A
    const { data: profileA } = await supabase
      .from('personality_profiles')
      .select('*')
      .eq('id', profile_a_id)
      .eq('user_id', user.id)
      .single()
    if (!profileA) return NextResponse.json({ error: 'Profile A not found' }, { status: 404 })

    // Profile B requires a valid invite token unless B also belongs to this user
    const { data: profileB_own } = await supabase
      .from('personality_profiles')
      .select('id')
      .eq('id', profile_b_id)
      .eq('user_id', user.id)
      .single()

    if (!profileB_own) {
      // Verify invite token grants access to profile_b_id
      if (!invite_token) {
        return NextResponse.json({ error: 'An invite token is required to compare with another user\'s profile' }, { status: 403 })
      }
      const { data: invite } = await supabase
        .from('comparison_invites')
        .select('inviter_profile_id, expires_at, used_at')
        .eq('invite_token', invite_token)
        .eq('inviter_profile_id', profile_b_id)
        .single()
      if (!invite) return NextResponse.json({ error: 'Invalid invite token' }, { status: 403 })
      if (new Date(invite.expires_at) < new Date()) return NextResponse.json({ error: 'Invite token has expired' }, { status: 403 })
    }

    // Fetch profile B data
    const { data: profileB } = await supabase
      .from('personality_profiles')
      .select('*')
      .eq('id', profile_b_id)
      .single()
    if (!profileB) return NextResponse.json({ error: 'Profile B not found' }, { status: 404 })

    // Fetch analyzed lenses for both profiles
    const [{ data: lensesA }, { data: lensesB }] = await Promise.all([
      supabase.from('lens_inputs').select('*').eq('profile_id', profile_a_id).not('analysis_result', 'is', null),
      supabase.from('lens_inputs').select('*').eq('profile_id', profile_b_id).not('analysis_result', 'is', null),
    ])

    if (!lensesA?.length || !lensesB?.length) {
      return NextResponse.json({ error: 'Both profiles need analyzed lenses for comparison' }, { status: 400 })
    }

    const formatLenses = (lenses: typeof lensesA) => lenses!.map((li) => {
      const card = LENS_CARDS.find((c) => c.type === li.lens_type)
      const result = li.analysis_result as Record<string, unknown>
      return { lens: li.lens_type, lens_name: card?.name, summary: result?.summary, traits: result?.traits }
    })

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 6000,
      system: COMPARISON_SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Compare these two personality profiles for a ${comparison_type} analysis.

PROFILE A: ${profileA.profile_name}
${JSON.stringify(formatLenses(lensesA), null, 2)}

PROFILE B: ${profileB.profile_name}
${JSON.stringify(formatLenses(lensesB), null, 2)}

COMPARISON TYPE: ${comparison_type}

Synthesize both profiles to reveal: complementary strengths, natural synergies, potential friction points, and a practical collaboration/communication guide. Be specific, warm, and grounded in the actual personality data from both profiles. Respond as JSON.`,
      }],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    let comparisonResult
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      comparisonResult = jsonMatch ? JSON.parse(jsonMatch[0]) : { overview: responseText, sections: [] }
    } catch {
      comparisonResult = { overview: responseText, sections: [] }
    }

    const { data: savedComparison, error: saveError } = await supabase
      .from('profile_comparisons')
      .insert({
        requester_id: user.id,
        profile_a_id,
        profile_b_id,
        comparison_type,
        comparison_result: comparisonResult,
      })
      .select()
      .single()

    if (saveError) throw saveError

    return NextResponse.json({ success: true, comparison: savedComparison })
  } catch (error) {
    console.error('Comparison generation error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Comparison failed' }, { status: 500 })
  }
}
