'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Starfield from '@/components/stars/Starfield'
import AppNav from '@/components/layout/AppNav'

const FREE_FEATURES = [
  '1 profile',
  'Up to 4 lenses',
  'Full Cosmic Profile report',
  'Gematria, Natal Chart, Middos & Color Psychology lenses',
]

const PREMIUM_FEATURES = [
  'Unlimited profiles',
  'All 10 lenses (Phase 2+)',
  'All 7 report types',
  'Profile comparison (coming in Phase 5)',
  'PDF export',
  'Shareable profile cards',
  'Priority analysis processing',
  'Re-analysis on demand',
]

const LIFETIME_FEATURES = [
  'Everything in Premium, forever',
  'Early access to new lenses',
  'One-time payment — no subscription',
]

export default function PricingPage() {
  return (
    <div className="relative min-h-screen cosmic-bg">
      <Starfield />
      <div className="relative z-10">
        <AppNav />
        <main className="max-w-5xl mx-auto px-6 py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
            <h1 className="font-serif text-5xl text-white mb-4">
              Choose Your <em className="gold-text not-italic">Path</em>
            </h1>
            <p className="text-soft-silver/60 max-w-xl mx-auto">
              Begin for free. Unlock the full depth of your Cosmic Mirror with Premium.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-7 flex flex-col">
              <p className="text-soft-silver/50 text-xs uppercase tracking-wider mb-2">Free</p>
              <div className="font-serif text-5xl text-white mb-1">$0</div>
              <p className="text-soft-silver/50 text-sm mb-6">Forever free</p>
              <ul className="flex flex-col gap-2 mb-8 flex-1">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex gap-2 text-sm text-soft-silver/70">
                    <span className="text-celestial-gold/60">·</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup" className="btn-outline-gold text-center py-3 rounded-lg">
                Get Started Free
              </Link>
            </motion.div>

            {/* Premium */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-7 flex flex-col border-celestial-gold/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-celestial-gold text-midnight text-xs font-bold px-3 py-1 rounded-bl-lg">
                MOST POPULAR
              </div>
              <p className="text-celestial-gold/80 text-xs uppercase tracking-wider mb-2">Premium</p>
              <div className="font-serif text-5xl gold-text mb-1">$9.99</div>
              <p className="text-soft-silver/50 text-sm mb-1">/month</p>
              <p className="text-soft-silver/40 text-xs mb-6">or $79.99/year (save 33%)</p>
              <ul className="flex flex-col gap-2 mb-8 flex-1">
                {PREMIUM_FEATURES.map((f) => (
                  <li key={f} className="flex gap-2 text-sm text-soft-silver/70">
                    <span className="text-celestial-gold">·</span> {f}
                  </li>
                ))}
              </ul>
              <button className="btn-gold py-3 rounded-lg opacity-70 cursor-not-allowed" disabled>
                Coming Soon
              </button>
            </motion.div>

            {/* Lifetime */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-7 flex flex-col">
              <p className="text-soft-silver/50 text-xs uppercase tracking-wider mb-2">Lifetime</p>
              <div className="font-serif text-5xl text-white mb-1">$199</div>
              <p className="text-soft-silver/50 text-sm mb-6">one-time payment</p>
              <ul className="flex flex-col gap-2 mb-8 flex-1">
                {LIFETIME_FEATURES.map((f) => (
                  <li key={f} className="flex gap-2 text-sm text-soft-silver/70">
                    <span className="text-celestial-gold/60">·</span> {f}
                  </li>
                ))}
              </ul>
              <button className="btn-outline-gold py-3 rounded-lg opacity-70 cursor-not-allowed" disabled>
                Coming Soon
              </button>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}
