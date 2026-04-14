'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Starfield from '@/components/stars/Starfield'
import AppNav from '@/components/layout/AppNav'
import { createClient } from '@/lib/supabase/client'

interface TanachFigure {
  figure_name: string
  figure_name_hebrew: string
  figure_source: string
  tanach_section: string
  match_strength: string
  core_parallel: string
  specific_parallels: Array<{ trait: string; figure_expression: string; verse_reference: string }>
  key_difference: string
  growth_lesson: string
  secondary_figure: string
  secondary_reason: string
  closing_insight: string
}

export default function TanachFigurePage() {
  const { id } = useParams<{ id: string }>()
  const supabase = createClient()

  const [figure, setFigure] = useState<TanachFigure | null>(null)
  const [profileName, setProfileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [isPremium, setIsPremium] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: profile }, { data: userProfile }, { data: saved }] = await Promise.all([
        supabase.from('personality_profiles').select('profile_name').eq('id', id).single(),
        supabase.from('profiles').select('subscription_tier').eq('id', user.id).single(),
        supabase.from('tanach_figures').select('figure_data').eq('profile_id', id).maybeSingle(),
      ])

      if (profile) setProfileName(profile.profile_name)
      if (userProfile) setIsPremium(userProfile.subscription_tier !== 'free')
      if (saved?.figure_data) setFigure(saved.figure_data as TanachFigure)
      setFetching(false)
    }
    init()
  }, [id])

  const generate = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/tanach-figure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_id: id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setFigure(data.figure)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const sectionColor: Record<string, string> = {
    'Torah': 'text-celestial-gold',
    "Nevi'im": 'text-blue-300',
    'Ketuvim': 'text-purple-300',
  }

  if (fetching) {
    return (
      <div className="relative min-h-screen cosmic-bg flex items-center justify-center">
        <Starfield />
        <div className="relative z-10 w-8 h-8 border-2 border-celestial-gold/30 border-t-celestial-gold rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen cosmic-bg">
      <Starfield />
      <div className="relative z-10">
        <AppNav />
        <main className="max-w-3xl mx-auto px-6 py-10">

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <p className="text-xs tracking-widest text-celestial-gold/60 uppercase mb-3">{profileName} · Tanach Mirror</p>
            <h1 className="font-serif text-4xl sm:text-5xl text-white mb-3">Which Tanach Figure Are You?</h1>
            <p className="text-soft-silver/50 text-sm max-w-lg mx-auto">
              Based on your personality profile, we match you to the figure from Torah, Nevi&apos;im, or Ketuvim
              whose inner world most closely mirrors your own.
            </p>
          </motion.div>

          {!isPremium && (
            <div className="glass-card p-8 text-center mb-8 border border-celestial-gold/25">
              <div className="text-3xl mb-3">✦</div>
              <h2 className="font-serif text-2xl text-white mb-2">Premium Feature</h2>
              <p className="text-soft-silver/60 text-sm mb-5">Unlock your Tanach figure match and all premium reports.</p>
              <Link href="/pricing" className="btn-gold px-8 py-3 rounded-lg">Unlock Premium →</Link>
            </div>
          )}

          {isPremium && !figure && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-10 text-center">
              <div className="text-5xl mb-4">📖</div>
              <h2 className="font-serif text-2xl text-white mb-3">Ready to Find Your Mirror?</h2>
              <p className="text-soft-silver/60 text-sm mb-6 max-w-md mx-auto">
                We&apos;ll analyze your personality profile and match you to the Tanach figure whose
                challenges, strengths, and core motivations resonate most deeply with yours.
              </p>
              {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
              <button
                onClick={generate}
                disabled={loading}
                className="btn-gold px-10 py-4 rounded-lg disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-3">
                    <span className="w-4 h-4 border-2 border-midnight/30 border-t-midnight rounded-full animate-spin" />
                    Searching the Tanach...
                  </span>
                ) : 'Find My Tanach Figure →'}
              </button>
            </motion.div>
          )}

          {figure && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

              {/* Hero card */}
              <div className="glass-card p-8 text-center border border-celestial-gold/30">
                <p className={`text-xs tracking-widest uppercase mb-2 ${sectionColor[figure.tanach_section] || 'text-celestial-gold/60'}`}>
                  {figure.tanach_section} · {figure.figure_source}
                </p>
                <h2 className="font-serif text-5xl text-white mb-1">{figure.figure_name}</h2>
                <p className="font-serif text-2xl text-celestial-gold/80 mb-4" dir="rtl">{figure.figure_name_hebrew}</p>
                <div className="inline-block px-3 py-1 rounded-full border border-white/15 text-xs text-soft-silver/50 mb-5">
                  {figure.match_strength} match
                </div>
                <p className="text-soft-silver/75 leading-relaxed max-w-xl mx-auto">{figure.core_parallel}</p>
              </div>

              {/* Specific parallels */}
              {figure.specific_parallels?.length > 0 && (
                <div>
                  <h3 className="font-serif text-xl text-white mb-4">The Parallels</h3>
                  <div className="space-y-4">
                    {figure.specific_parallels.map((p, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card p-5"
                      >
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <p className="text-celestial-gold text-sm font-medium">{p.trait}</p>
                          <span className="text-xs text-soft-silver/40 flex-shrink-0 font-serif">{p.verse_reference}</span>
                        </div>
                        <p className="text-soft-silver/70 text-sm leading-relaxed">{p.figure_expression}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key difference + Growth lesson */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="glass-card p-6">
                  <p className="text-xs text-soft-silver/50 mb-2 tracking-wider uppercase">Where You Differ</p>
                  <p className="text-soft-silver/75 text-sm leading-relaxed">{figure.key_difference}</p>
                </div>
                <div className="glass-card p-6 border border-celestial-gold/20">
                  <p className="text-xs text-celestial-gold/60 mb-2 tracking-wider uppercase">Growth Lesson</p>
                  <p className="text-soft-silver/75 text-sm leading-relaxed">{figure.growth_lesson}</p>
                </div>
              </div>

              {/* Secondary figure */}
              {figure.secondary_figure && (
                <div className="glass-card p-5 flex items-start gap-4">
                  <div className="text-2xl flex-shrink-0">◎</div>
                  <div>
                    <p className="text-xs text-soft-silver/50 mb-1">Secondary Resonance</p>
                    <p className="text-white font-serif text-lg mb-1">{figure.secondary_figure}</p>
                    <p className="text-soft-silver/60 text-sm">{figure.secondary_reason}</p>
                  </div>
                </div>
              )}

              {/* Closing */}
              {figure.closing_insight && (
                <div className="glass-card p-8 text-center">
                  <div className="text-2xl mb-3">✦</div>
                  <p className="font-serif text-lg text-white/90 italic leading-relaxed">{figure.closing_insight}</p>
                </div>
              )}

              {/* Regenerate */}
              <div className="text-center pt-4">
                <button onClick={generate} disabled={loading} className="text-xs text-soft-silver/40 hover:text-soft-silver/70 transition-colors">
                  {loading ? 'Regenerating...' : '↺ Regenerate with current lens data'}
                </button>
              </div>
            </motion.div>
          )}

          <div className="mt-8 text-center">
            <Link href={`/profile/${id}`} className="text-xs text-soft-silver/40 hover:text-soft-silver/70 transition-colors">
              ← Back to Profile
            </Link>
          </div>
        </main>
      </div>
    </div>
  )
}
