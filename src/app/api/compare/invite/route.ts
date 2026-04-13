import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify premium
    const { data: profile } = await supabase.from('profiles').select('subscription_tier').eq('id', user.id).single()
    if (!profile || profile.subscription_tier === 'free') {
      return NextResponse.json({ error: 'Premium required for comparison invites', upgrade_required: true }, { status: 403 })
    }

    const { profile_id } = await req.json()

    // Verify profile belongs to user
    const { data: personalityProfile } = await supabase
      .from('personality_profiles')
      .select('id')
      .eq('id', profile_id)
      .eq('user_id', user.id)
      .single()
    if (!personalityProfile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    const token = randomBytes(16).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days

    const { data: invite, error: insertError } = await supabase
      .from('comparison_invites')
      .insert({ inviter_profile_id: profile_id, invite_token: token, expires_at: expiresAt })
      .select()
      .single()

    if (insertError) throw insertError

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005'
    return NextResponse.json({ token, invite_url: `${appUrl}/compare/invite/${token}`, expires_at: expiresAt })
  } catch (error) {
    console.error('Invite creation error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Invite failed' }, { status: 500 })
  }
}
