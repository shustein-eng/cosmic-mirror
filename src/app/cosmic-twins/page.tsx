'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Starfield from '@/components/stars/Starfield'
import AppNav from '@/components/layout/AppNav'

interface Twin {
  profile_name: string
  similarity_score: number
  shared_traits: string[]
}

export default function CosmicTwinsPage() {
  const [optedIn, setOptedIn] = useState<boolean | null>(null)
  const [matches, setMatches] = useState<Twin[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    fetch('/api/cosmic-twins')
      .then((r) => r.json())
      .then((data) => {
        setOptedIn(data.opted_in ?? false)
        setMatches(data.matches || [])
        setMessage(data.message || '')
      })
      .finally(() => setLoading(false))
  }, [])

  const toggleOptIn = async () => {
    setToggling(true)
    const res = await fetch('/api/cosmic-twins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ opt_in: !optedIn }),
    })
    const data = await res.json()
    if (data.success) {
      setOptedIn(data.opted_in)
      if (data.opted_in) {
        // Refetch matches
        const r = await fetch('/api/cosmic-twins').then((r) => r.json())
        setMatches(r.matches || [])
        setMessage(r.message || '')
      } else {
        setMatches([])
      }
    }
    setToggling(false)
  }

  return (
    <div className="relative min-h-screen cosmic-bg">
      <Starfield />
      <div className="relative z-10">
        <AppNav />
        <main className="max-w-3xl mx-auto px-6 py-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <p className="text-xs tracking-widest text-celestial-gold/60 uppercase mb-3">Community · Premium</p>
            <h1 className="font-serif text-4xl sm:text-5xl text-white mb-3">Cosmic Twins</h1>
            <p className="text-soft-silver/50 text-sm max-w-lg mx-auto">
              Opt in to find other users whose personality profiles overlap significantly with yours.
              Identities stay anonymous — only cosmic signatures are shared.
            </p>
          </motion.div>

          {/* Opt-in toggle */}
          <div className="glass-card p-6 mb-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-white font-medium mb-1">Allow Cosmic Twin Matching</h3>
                <p className="text-soft-silver/50 text-xs">
                  Your profile traits (not your name or identity) are compared anonymously with other opted-in users.
                </p>
              </div>
              <button
                onClick={toggleOptIn}
                disabled={toggling || loading}
                className={`relative w-14 h-7 rounded-full transition-colors flex-shrink-0 ${optedIn ? 'bg-celestial-gold' : 'bg-white/10'} disabled:opacity-50`}
              >
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform shadow ${optedIn ? 'translate-x-8' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-celestial-gold/30 border-t-celestial-gold rounded-full animate-spin mx-auto" />
            </div>
          )}

          {!loading && !optedIn && (
            <div className="glass-card p-10 text-center">
              <div className="text-4xl mb-4">✦</div>
              <h2 className="font-serif text-2xl text-white mb-2">Opt in to discover your twins</h2>
              <p className="text-soft-silver/50 text-sm mb-5 max-w-sm mx-auto">
                Enable matching above to see who shares your constellation of traits. You can opt out at any time.
              </p>
            </div>
          )}

          {!loading && optedIn && message && matches.length === 0 && (
            <div className="glass-card p-8 text-center">
              <div className="text-3xl mb-3">◎</div>
              <p className="text-soft-silver/60">{message}</p>
              {message.includes('report') && (
                <Link href="/dashboard" className="mt-4 inline-block text-sm text-celestial-gold hover:opacity-80">
                  → Go generate your first report
                </Link>
              )}
            </div>
          )}

          {!loading && optedIn && matches.length > 0 && (
            <div>
              <p className="text-soft-silver/50 text-xs mb-4">
                Found {matches.length} user{matches.length !== 1 ? 's' : ''} with significant trait overlap. Names are anonymized.
              </p>
              <div className="space-y-4">
                {matches.map((twin, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="glass-card p-5"
                  >
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-celestial-gold/10 border border-celestial-gold/25 flex items-center justify-center text-celestial-gold font-serif">
                          {String.fromCharCode(65 + i)}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">Twin {String.fromCharCode(65 + i)}</p>
                          <p className="text-soft-silver/40 text-xs">Anonymous user</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-celestial-gold font-serif text-xl">{twin.similarity_score}%</p>
                        <p className="text-soft-silver/40 text-xs">similarity</p>
                      </div>
                    </div>

                    {/* Similarity bar */}
                    <div className="h-1 rounded-full bg-white/10 mb-3">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-celestial-gold/60 to-celestial-gold"
                        style={{ width: `${twin.similarity_score}%` }}
                      />
                    </div>

                    {twin.shared_traits.length > 0 && (
                      <div>
                        <p className="text-xs text-soft-silver/40 mb-2">Shared traits:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {twin.shared_traits.map((t) => (
                            <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-celestial-gold/10 border border-celestial-gold/20 text-celestial-gold/70">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link href="/dashboard" className="text-xs text-soft-silver/40 hover:text-soft-silver/70 transition-colors">← Dashboard</Link>
          </div>
        </main>
      </div>
    </div>
  )
}
