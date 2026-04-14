import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/gift/redeem — validate and redeem a gift code
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { code } = await req.json()
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Gift code is required' }, { status: 400 })
    }

    const normalizedCode = code.trim().toUpperCase()

    // Look up the gift code
    const { data: giftCode } = await supabase
      .from('gift_codes')
      .select('*')
      .eq('code', normalizedCode)
      .single()

    if (!giftCode) {
      return NextResponse.json({ error: 'Invalid gift code' }, { status: 404 })
    }

    if (giftCode.status !== 'active') {
      if (giftCode.status === 'pending') {
        return NextResponse.json({ error: 'This gift code has not been paid for yet' }, { status: 400 })
      }
      if (giftCode.status === 'redeemed') {
        return NextResponse.json({ error: 'This gift code has already been redeemed' }, { status: 400 })
      }
      return NextResponse.json({ error: 'This gift code is not valid' }, { status: 400 })
    }

    if (giftCode.expires_at && new Date(giftCode.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This gift code has expired' }, { status: 400 })
    }

    // Prevent gifter from redeeming their own code
    if (giftCode.gifter_user_id === user.id) {
      return NextResponse.json({ error: 'You cannot redeem a gift code you purchased' }, { status: 400 })
    }

    const tier = giftCode.plan === 'lifetime' ? 'lifetime' : 'premium'

    // Upgrade user and mark code as redeemed in a transaction-like sequence
    const { error: upgradeError } = await supabase
      .from('profiles')
      .update({ subscription_tier: tier })
      .eq('id', user.id)

    if (upgradeError) throw upgradeError

    const { error: redeemError } = await supabase
      .from('gift_codes')
      .update({
        status: 'redeemed',
        redeemed_by: user.id,
        redeemed_at: new Date().toISOString(),
      })
      .eq('code', normalizedCode)

    if (redeemError) throw redeemError

    return NextResponse.json({ success: true, tier })
  } catch (error) {
    console.error('Gift redeem error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Redemption failed' }, { status: 500 })
  }
}
