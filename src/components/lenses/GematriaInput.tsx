'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface GematriaInputProps {
  lensInputId: string
  profileId: string
  initialData: Record<string, unknown>
  onComplete: () => void
}

export default function GematriaInput({ lensInputId, profileId, initialData, onComplete }: GematriaInputProps) {
  const [hebrewName, setHebrewName] = useState((initialData.hebrew_name as string) || '')
  const [fatherName, setFatherName] = useState((initialData.father_name as string) || '')
  const [englishName, setEnglishName] = useState((initialData.english_name as string) || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hebrewName) {
      setError('Please enter your Hebrew name.')
      return
    }
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/analyze/gematria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lens_input_id: lensInputId,
          profile_id: profileId,
          hebrew_name: hebrewName + (fatherName ? ` בן ${fatherName}` : ''),
          english_name: englishName,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Analysis failed')
      }

      onComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-card p-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <span className="text-4xl">✡</span>
        <div>
          <h2 className="font-serif text-2xl text-white">Gematria & Number Insights</h2>
          <p className="text-xs text-celestial-gold/60">חישוב תורני · Scholarly Foundation</p>
        </div>
      </div>

      <p className="text-soft-silver/60 text-sm mb-6 leading-relaxed">
        Our engine calculates 15+ classical gematria methods from your Hebrew name — standard,
        Gadol, Katan, Siduri, Meshulash, Atbash, Albam, Milui (Arizal), and more — then matches
        your values against a Chumash-sourced dictionary of significant words and concepts. Claude
        interprets the patterns that emerge.
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-900/20 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-xs text-soft-silver/60 mb-1.5">
            Hebrew First Name *
            <span className="text-soft-silver/40 ml-2">(as used for Torah honors)</span>
          </label>
          <input
            type="text"
            value={hebrewName}
            onChange={(e) => setHebrewName(e.target.value)}
            className="cosmic-input text-right text-lg"
            placeholder="משה"
            dir="rtl"
            required
            style={{ fontFamily: 'serif' }}
          />
        </div>

        <div>
          <label className="block text-xs text-soft-silver/60 mb-1.5">
            Father&apos;s Hebrew Name
            <span className="text-soft-silver/40 ml-2">(optional, for ben/bat analysis)</span>
          </label>
          <input
            type="text"
            value={fatherName}
            onChange={(e) => setFatherName(e.target.value)}
            className="cosmic-input text-right text-lg"
            placeholder="אברהם"
            dir="rtl"
            style={{ fontFamily: 'serif' }}
          />
        </div>

        <div>
          <label className="block text-xs text-soft-silver/60 mb-1.5">
            English Legal Name
            <span className="text-soft-silver/40 ml-2">(for Western numerology)</span>
          </label>
          <input
            type="text"
            value={englishName}
            onChange={(e) => setEnglishName(e.target.value)}
            className="cosmic-input"
            placeholder="Moses Abraham"
          />
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="btn-gold mt-2 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <span className="inline-block w-4 h-4 border-2 border-midnight/30 border-t-midnight rounded-full animate-spin" />
              Calculating all methods and analyzing...
            </span>
          ) : (
            'Calculate & Analyze My Name →'
          )}
        </motion.button>
      </form>

      <div className="mt-5 p-4 rounded-lg bg-white/5 border border-white/10">
        <p className="text-xs text-soft-silver/40 leading-relaxed">
          <strong className="text-soft-silver/60">Sources:</strong> Ba&apos;al HaTurim, Arizal milui traditions,
          Sefer Yetzirah, Ramban, Rashi cipher methods. Torah (Chumash) word matches only.
          All calculations are performed server-side; Claude provides interpretation only.
        </p>
      </div>
    </div>
  )
}
