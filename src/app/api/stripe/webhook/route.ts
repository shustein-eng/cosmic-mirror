import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!stripeSecretKey || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const Stripe = (await import('stripe')).default
  const stripe = new Stripe(stripeSecretKey, { apiVersion: '2026-03-25.dahlia' })

  const sig = req.headers.get('stripe-signature')
  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 })

  const body = await req.text()
  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as {
      metadata?: { user_id?: string; plan?: string; type?: string; gift_code?: string }
      subscription?: string
      id: string
    }
    const userId = session.metadata?.user_id
    const plan = session.metadata?.plan
    const isGift = session.metadata?.type === 'gift'
    const giftCode = session.metadata?.gift_code

    if (isGift && giftCode) {
      // Activate the gift code — mark it paid, ready to redeem
      await supabase
        .from('gift_codes')
        .update({ status: 'active' })
        .eq('code', giftCode)
        .eq('stripe_session_id', session.id)
    } else if (userId) {
      const tier = plan === 'lifetime' ? 'lifetime' : 'premium'
      await supabase
        .from('profiles')
        .update({
          subscription_tier: tier,
          stripe_subscription_id: session.subscription || null,
        })
        .eq('id', userId)
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as { metadata?: { user_id?: string }; customer?: string }
    // Find user by stripe_customer_id
    const customerId = subscription.customer
    if (customerId) {
      await supabase
        .from('profiles')
        .update({ subscription_tier: 'free', stripe_subscription_id: null })
        .eq('stripe_customer_id', customerId)
    }
  }

  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as { status?: string; customer?: string }
    const customerId = subscription.customer
    if (customerId && subscription.status === 'active') {
      await supabase
        .from('profiles')
        .update({ subscription_tier: 'premium' })
        .eq('stripe_customer_id', customerId)
    }
  }

  return NextResponse.json({ received: true })
}
