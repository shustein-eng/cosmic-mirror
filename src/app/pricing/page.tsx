'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Starfield from '@/components/stars/Starfield'
import AppNav from '@/components/layout/AppNav'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Explore who you are',
    features: [
      'Up to 4 lenses per profile',
      'Full Cosmic Profile report',
      'Gematria, Natal Chart, Middos & Color Psychology',
      'Save and revisit your profile anytime',
    ],
    cta: 'Get Started Free',
    highlighted: false,
  },
  {
    id: 'premium_monthly',
    name: 'Premium',
    price: '$9',
    period: '/month',
    description: 'Unlock the full cosmos',
    features: [
      'All 10 lenses — including image lenses',
      'All 7 specialized reports',
      'Career, Relationships, Growth, Creative, Wellness & Leadership reports',
      'Profile comparison (invite anyone)',
      'Shareable profile cards',
      'PDF export of all reports',
      'Biorhythm calendar export',
    ],
    cta: 'Start Premium',
    highlighted: true,
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: '$149',
    period: 'one-time',
    description: 'Yours forever',
    features: [
      'Everything in Premium',
      'Lifetime access — pay once',
      'All future features included',
      'Priority Claude processing',
    ],
    cta: 'Get Lifetime Access',
    highlighted: false,
  },
]

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCheckout = async (plan: (typeof PLANS)[number]) => {
    if (plan.id === 'free') { router.push('/auth/signup'); return }

    setLoading(plan.id)
    setError(null)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: plan.id }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 503) {
          setError('Stripe payments are not yet configured. Check back soon!')
        } else if (res.status === 401) {
          router.push('/auth/login?redirectTo=/pricing')
        } else {
          throw new Error(data.error || 'Checkout failed')
        }
        return
      }
      if (data.url) window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="relative min-h-screen cosmic-bg">
      <Starfield />
      <div className="relative z-10">
        <AppNav />

        <main className="max-w-5xl mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-14"
          >
            <h1 className="font-serif text-5xl text-white mb-4">Choose Your Depth</h1>
            <p className="text-soft-silver/60 text-lg max-w-xl mx-auto">
              Start free and discover yourself. Upgrade when you&apos;re ready to go deeper.
            </p>
          </motion.div>

          {error && (
            <div className="max-w-md mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-center text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative glass-card p-8 flex flex-col ${plan.highlighted ? 'border-celestial-gold/50 bg-celestial-gold/5' : ''}`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-celestial-gold text-midnight text-xs font-bold px-4 py-1 rounded-full">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h2 className="font-serif text-2xl text-white mb-1">{plan.name}</h2>
                  <p className="text-soft-silver/50 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className={`font-serif text-4xl ${plan.highlighted ? 'text-celestial-gold' : 'text-white'}`}>
                      {plan.price}
                    </span>
                    <span className="text-soft-silver/40 text-sm">{plan.period}</span>
                  </div>
                </div>

                <ul className="flex-1 space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <span className="text-celestial-gold mt-0.5 flex-shrink-0">✦</span>
                      <span className="text-soft-silver/70 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleCheckout(plan)}
                  disabled={loading === plan.id}
                  className={`w-full py-3 rounded-lg font-medium transition-all disabled:opacity-50 ${
                    plan.highlighted ? 'btn-gold' : 'btn-outline-gold'
                  }`}
                >
                  {loading === plan.id ? 'Loading...' : plan.cta}
                </button>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-soft-silver/30 text-sm mt-10"
          >
            Cancel anytime. No hidden fees. Your data always remains yours.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 glass-card p-8 max-w-xl mx-auto text-center border-celestial-gold/20"
          >
            <div className="text-3xl mb-3">🎁</div>
            <h2 className="font-serif text-2xl text-white mb-2">Gift a Reading</h2>
            <p className="text-soft-silver/50 text-sm mb-5">
              Give someone the gift of deep self-knowledge. They receive a code to redeem on their own account — no subscription needed on their end.
            </p>
            <a href="/gift" className="btn-outline-gold text-sm px-8 py-3 rounded-lg inline-block">
              Gift a Reading →
            </a>
            <p className="text-xs text-soft-silver/30 mt-3">
              Already have a code?{' '}
              <a href="/gift/redeem" className="text-celestial-gold/60 hover:text-celestial-gold underline">Redeem it here</a>
            </p>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
