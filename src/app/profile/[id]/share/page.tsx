'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Starfield from '@/components/stars/Starfield'
import AppNav from '@/components/layout/AppNav'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SharePage() {
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(false)
  const [cardDataUrl, setCardDataUrl] = useState<string | null>(null)
  const [cosmicSignature, setCosmicSignature] = useState('')
  const [topStrengths, setTopStrengths] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isPremium, setIsPremium] = useState<boolean | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setIsPremium(false); return }
      const { data } = await supabase.from('profiles').select('subscription_tier').eq('id', user.id).single()
      const premium = data?.subscription_tier !== 'free'
      setIsPremium(premium)
      if (premium) generateCard()
    })
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const generateCard = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/share/generate-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_id: id, report_type: 'full_cosmic' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate card')
      setCardDataUrl(data.card_data_url)
      setCosmicSignature(data.cosmic_signature)
      setTopStrengths(data.top_strengths || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const downloadCard = () => {
    if (!cardDataUrl) return
    const a = document.createElement('a')
    a.href = cardDataUrl
    a.download = 'cosmic-mirror-profile.svg'
    a.click()
  }

  const shareProfile = async () => {
    const url = window.location.origin + `/profile/${id}`
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My Cosmic Mirror Profile',
          text: cosmicSignature || 'Discover your multi-dimensional personality profile',
          url,
        })
      } else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="relative min-h-screen cosmic-bg">
      <Starfield />
      <div className="relative z-10">
        <AppNav />
        <main className="max-w-3xl mx-auto px-6 py-12">
          <div className="mb-6">
            <Link href={`/profile/${id}`} className="text-soft-silver/40 text-sm hover:text-soft-silver/70 transition-colors">
              ← Back to Profile
            </Link>
          </div>

          <h1 className="font-serif text-4xl text-white mb-2">Share Your Profile</h1>
          <p className="text-soft-silver/50 mb-8">Generate a beautiful profile card to share with the world.</p>

          {isPremium === false && (
            <div className="glass-card p-8 text-center border-celestial-gold/25 bg-celestial-gold/5">
              <div className="text-4xl mb-4">✦</div>
              <h2 className="font-serif text-2xl text-white mb-2">Premium Feature</h2>
              <p className="text-soft-silver/60 mb-6">Shareable profile cards are available on Premium and Lifetime plans.</p>
              <Link href="/pricing" className="btn-gold px-8 py-3 rounded-lg">
                Upgrade to Premium →
              </Link>
            </div>
          )}

          {isPremium === null && (
            <div className="glass-card p-12 text-center">
              <div className="text-3xl mb-4 animate-pulse">✦</div>
              <p className="text-soft-silver/60">Loading...</p>
            </div>
          )}

          {isPremium && loading && (
            <div className="glass-card p-12 text-center">
              <div className="text-3xl mb-4 animate-pulse">✦</div>
              <p className="text-soft-silver/60">Generating your cosmic profile card...</p>
            </div>
          )}

          {isPremium && error && (
            <div className="glass-card p-6 text-center border-red-500/20">
              <p className="text-red-400 mb-4">{error}</p>
              {error.includes('report') && (
                <Link href={`/profile/${id}/processing`} className="btn-gold px-5 py-2.5 rounded-lg">
                  Generate Report First →
                </Link>
              )}
            </div>
          )}

          {isPremium && cardDataUrl && !loading && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Card preview */}
              <div className="glass-card p-4">
                <img
                  src={cardDataUrl}
                  alt="Profile card"
                  className="w-full rounded-lg"
                />
              </div>

              {/* Cosmic signature */}
              {cosmicSignature && (
                <div className="glass-card p-5 border-celestial-gold/20">
                  <p className="text-soft-silver/50 text-xs mb-2">Your Cosmic Signature</p>
                  <p className="text-white font-serif italic">&ldquo;{cosmicSignature}&rdquo;</p>
                </div>
              )}

              {/* Top strengths */}
              {topStrengths.length > 0 && (
                <div className="glass-card p-5">
                  <p className="text-soft-silver/50 text-xs mb-3">Top Strengths</p>
                  <div className="flex flex-wrap gap-2">
                    {topStrengths.map((s, i) => (
                      <span key={i} className="text-sm px-3 py-1 rounded-full border border-celestial-gold/30 text-celestial-gold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 flex-wrap">
                <button onClick={downloadCard} className="btn-gold px-5 py-3 rounded-lg flex-1 text-center">
                  Download Card (SVG)
                </button>
                <button onClick={shareProfile} className="btn-outline-gold px-5 py-3 rounded-lg flex-1 text-center">
                  {copied ? '✓ Copied Link!' : 'Share Profile Link'}
                </button>
              </div>

              <button
                onClick={generateCard}
                className="text-soft-silver/40 text-sm hover:text-soft-silver/60 transition-colors"
              >
                Regenerate card
              </button>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  )
}
