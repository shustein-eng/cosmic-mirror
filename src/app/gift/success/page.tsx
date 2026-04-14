'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Starfield from '@/components/stars/Starfield'
import AppNav from '@/components/layout/AppNav'

function GiftSuccessContent() {
  const params = useSearchParams()
  const code = params.get('code') || ''
  const [copied, setCopied] = useState(false)

  const copyCode = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareText = `I got you a Cosmic Mirror reading! Redeem your gift code at cosmicmirror.app/gift/redeem\n\nYour code: ${code}`

  const canShare = typeof navigator !== 'undefined' && !!navigator.share

  const handleShare = () => {
    navigator.share({ title: 'Your Cosmic Mirror Gift', text: shareText })
  }

  return (
    <div className="relative min-h-screen cosmic-bg">
      <Starfield />
      <div className="relative z-10">
        <AppNav />
        <main className="max-w-2xl mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-10"
          >
            <div className="text-6xl mb-6">✦</div>
            <h1 className="font-serif text-4xl sm:text-5xl text-white mb-3">Gift Purchased!</h1>
            <p className="text-soft-silver/60 text-base max-w-md mx-auto">
              Your gift has been created. Share the code below with anyone — they&apos;ll use it to unlock their Cosmic Mirror reading.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card p-8 mb-6 text-center border-celestial-gold/30"
          >
            <p className="text-soft-silver/50 text-xs tracking-widest uppercase mb-3">Gift Code</p>
            <div className="font-mono text-4xl font-bold text-celestial-gold tracking-[0.3em] mb-6 select-all">
              {code}
            </div>
            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={copyCode}
                className="btn-gold px-6 py-2.5 rounded-lg text-sm font-medium"
              >
                {copied ? '✓ Copied!' : 'Copy Code'}
              </button>
              {canShare && (
                <button
                  onClick={handleShare}
                  className="btn-outline-gold px-6 py-2.5 rounded-lg text-sm font-medium"
                >
                  Share Gift
                </button>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card p-6 mb-8"
          >
            <h3 className="font-serif text-white text-lg mb-3">How to share</h3>
            <ol className="space-y-2 text-soft-silver/60 text-sm list-decimal list-inside">
              <li>Copy the code above</li>
              <li>Send it to your recipient however you like — email, text, WhatsApp, a card</li>
              <li>They visit <span className="text-celestial-gold/80">cosmicmirror.app/gift/redeem</span> and enter the code</li>
              <li>Their account is instantly upgraded to Premium</li>
            </ol>
          </motion.div>

          <div className="text-center">
            <Link href="/dashboard" className="text-sm text-soft-silver/40 hover:text-soft-silver/70 transition-colors">
              ← Back to Dashboard
            </Link>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function GiftSuccessPage() {
  return (
    <Suspense fallback={null}>
      <GiftSuccessContent />
    </Suspense>
  )
}
