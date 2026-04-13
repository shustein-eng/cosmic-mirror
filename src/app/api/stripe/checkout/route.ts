import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { priceId: rawPriceId, plan } = await req.json()

    // Resolve price ID from plan name if not explicitly provided
    const priceId = rawPriceId || (
      plan === 'lifetime'
        ? process.env.STRIPE_LIFETIME_PRICE_ID
        : process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID
    )

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID not configured' }, { status: 503 })
    }

    // Dynamically import stripe to avoid build errors when key is missing
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2026-03-25.dahlia' })

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .single()

    let customerId = profile?.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || profile?.email || '',
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id
      await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005'

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: plan === 'lifetime' ? 'payment' : 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard?upgrade=success`,
      cancel_url: `${appUrl}/pricing?cancelled=true`,
      metadata: { user_id: user.id, plan },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Checkout failed' }, { status: 500 })
  }
}
