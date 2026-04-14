import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'

// POST /api/stripe/gift — create a Stripe checkout for a gift purchase
export async function POST(req: NextRequest) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { plan = 'premium_monthly' } = await req.json()

    const priceId = plan === 'lifetime'
      ? process.env.STRIPE_LIFETIME_PRICE_ID
      : process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID

    if (!priceId) return NextResponse.json({ error: 'Price not configured' }, { status: 503 })

    // Pre-generate gift code and store it (pending payment)
    const giftCode = randomBytes(6).toString('hex').toUpperCase() // e.g. A3F9B2
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year

    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2026-03-25.dahlia' })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005'

    const session = await stripe.checkout.sessions.create({
      mode: plan === 'lifetime' ? 'payment' : 'payment', // gift = one-time regardless
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/gift/success?code=${giftCode}`,
      cancel_url: `${appUrl}/pricing?cancelled=true`,
      metadata: {
        gift_code: giftCode,
        gifter_user_id: user.id,
        plan,
        type: 'gift',
      },
    })

    // Store gift code as pending (activated by webhook on payment success)
    await supabase.from('gift_codes').insert({
      code: giftCode,
      gifter_user_id: user.id,
      plan,
      status: 'pending',
      stripe_session_id: session.id,
      expires_at: expiresAt,
    })

    return NextResponse.json({ url: session.url, code: giftCode })
  } catch (error) {
    console.error('Gift checkout error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Gift checkout failed' }, { status: 500 })
  }
}
