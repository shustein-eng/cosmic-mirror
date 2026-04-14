'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Starfield from '@/components/stars/Starfield'
import AppNav from '@/components/layout/AppNav'

const GIFT_PLANS = [
  {
    id: 'premium_monthly',
    name: 'Premium Gift',
    price: '$9',
    description: 'One month of full cosmic access',
    features: [
      'All 10 lenses unlocked',
      'All 7 specialized reports',
      'Profile comparison & sharing',
      'Cosmic Twins access',
    ],
  },
  {
    id: 'lifetime',
    name: 'Lifetime Gift',
    price: '$149',
    description: 'A gift that lasts forever',
    features: [
      'Everything in Premium',
      'Lifetime access — never expires',
      'All future features included',
      'The ultimate cosmic gift',
    ],
  },
]

export default function GiftPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<string>('premium_monthly')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePurchase = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/gift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/auth/login?redirectTo=/gift')
          return
        }
        if (res.status === 503) {
          setError('Payments are not yet configured. Check back soon!')
          return
        }
        throw new Error(data.error || 'Checkout failed')
      }
      if (data.url) window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen cosmic-bg">
      <Starfield />
      <div className="relative z-10">
        <AppNav />
        <main className="max-w-3xl mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <p className="text-xs tracking-widest text-celestial-gold/60 uppercase mb-3">Gift a Reading</p>
            <h1 className="font-serif text-4xl sm:text-5xl text-white mb-3">Share the Cosmos</h1>
            <p className="text-soft-silver/50 text-base max-w-md mx-auto">
              Give someone the gift of deep self-knowledge. They receive a code to redeem on their own account.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
            {GIFT_PLANS.map((plan, i) => (
              <motion.button
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedPlan(plan.id)}
                className={`glass-card p-6 text-left transition-all ${
                  selectedPlan === plan.id
                    ? 'border-celestial-gold/60 bg-celestial-gold/5'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-serif text-white text-xl">{plan.name}</h3>
                    <p className="text-soft-silver/50 text-xs mt-0.5">{plan.description}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-serif text-2xl ${selectedPlan === plan.id ? 'text-celestial-gold' : 'text-white'}`}>
                      {plan.price}
                    </p>
                  </div>
                </div>
                <ul className="space-y-1.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-soft-silver/60">
                      <span className="text-celestial-gold/60 mt-0.5 flex-shrink-0">✦</span>
                      {f}
                    </li>
                  ))}
                </ul>
                {selectedPlan === plan.id && (
                  <div className="mt-4 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-celestial-gold flex-shrink-0" />
                    <span className="text-celestial-gold text-xs font-medium">Selected</span>
                  </div>
                )}
              </motion.button>
            ))}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-center text-sm">
              {error}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 mb-6"
          >
            <h3 className="font-serif text-white text-lg mb-3">How it works</h3>
            <ol className="space-y-2 text-soft-silver/60 text-sm list-decimal list-inside">
              <li>Complete checkout — you pay, not them</li>
              <li>You receive a unique 6-character gift code</li>
              <li>Share the code with your recipient however you like</li>
              <li>They redeem it at <span className="text-celestial-gold/70">cosmicmirror.app/gift/redeem</span></li>
              <li>Their account upgrades instantly — no credit card needed on their end</li>
            </ol>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <button
              onClick={handlePurchase}
              disabled={loading}
              className="btn-gold w-full sm:w-auto px-10 py-3.5 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {loading ? 'Redirecting...' : 'Purchase Gift →'}
            </button>
            <Link href="/gift/redeem" className="text-sm text-soft-silver/40 hover:text-soft-silver/70 transition-colors">
              Already have a code? Redeem it →
            </Link>
          </div>
        </main>
      </div>
    </div>
  )
}
