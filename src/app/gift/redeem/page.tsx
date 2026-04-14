'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Starfield from '@/components/stars/Starfield'
import AppNav from '@/components/layout/AppNav'

export default function GiftRedeemPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleRedeem = async () => {
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) { setError('Please enter a gift code.'); return }

    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/gift/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmed }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/auth/login?redirectTo=/gift/redeem&code=${trimmed}`)
          return
        }
        throw new Error(data.error || 'Redemption failed')
      }
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="relative min-h-screen cosmic-bg">
        <Starfield />
        <div className="relative z-10">
          <AppNav />
          <main className="max-w-xl mx-auto px-6 py-16 text-center">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="text-6xl mb-6">✦</div>
              <h1 className="font-serif text-4xl text-white mb-3">Gift Redeemed!</h1>
              <p className="text-soft-silver/60 mb-8">
                Your account has been upgraded to Premium. Explore your full cosmic profile.
              </p>
              <Link href="/dashboard" className="btn-gold px-8 py-3 rounded-lg text-sm font-medium">
                Go to Dashboard →
              </Link>
            </motion.div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen cosmic-bg">
      <Starfield />
      <div className="relative z-10">
        <AppNav />
        <main className="max-w-xl mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="text-5xl mb-4">🎁</div>
            <h1 className="font-serif text-4xl text-white mb-3">Redeem a Gift</h1>
            <p className="text-soft-silver/60 text-sm max-w-sm mx-auto">
              Enter the gift code you received to unlock Premium access on your account.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-8"
          >
            <label className="block text-soft-silver/60 text-xs uppercase tracking-widest mb-3">
              Gift Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleRedeem()}
              placeholder="e.g. A3F9B2"
              maxLength={6}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-2xl font-mono tracking-[0.3em] placeholder:text-white/20 focus:outline-none focus:border-celestial-gold/40 mb-5"
            />

            {error && (
              <p className="text-red-400 text-sm text-center mb-4">{error}</p>
            )}

            <button
              onClick={handleRedeem}
              disabled={loading || code.trim().length === 0}
              className="btn-gold w-full py-3 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {loading ? 'Redeeming...' : 'Redeem Gift'}
            </button>

            <p className="text-center text-soft-silver/30 text-xs mt-4">
              You must be logged in to redeem a gift. Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="text-celestial-gold/60 hover:text-celestial-gold underline">
                Sign up free
              </Link>
            </p>
          </motion.div>

          <div className="text-center mt-8">
            <Link href="/dashboard" className="text-xs text-soft-silver/40 hover:text-soft-silver/70 transition-colors">
              ← Back to Dashboard
            </Link>
          </div>
        </main>
      </div>
    </div>
  )
}
