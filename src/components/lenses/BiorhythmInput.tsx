'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface BiorhythmInputProps {
  lensInputId: string
  profileId: string
  initialData: Record<string, unknown>
  onComplete: () => void
}

export default function BiorhythmInput({ lensInputId, profileId, initialData, onComplete }: BiorhythmInputProps) {
  const [dateOfBirth, setDateOfBirth] = useState((initialData.date_of_birth as string) || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dateOfBirth) { setError('Please enter your date of birth.'); return }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/analyze/biorhythm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lens_input_id: lensInputId, profile_id: profileId, date_of_birth: dateOfBirth }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Analysis failed') }
      onComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-card p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-royal-purple/40 border border-celestial-gold/30 flex items-center justify-center text-2xl">
          ∿
        </div>
        <div>
          <h2 className="font-serif text-2xl text-white">Biorhythm Cycles</h2>
          <p className="text-soft-silver/60 text-sm">Mathematical cycles from your birth date reveal your natural rhythms</p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Physical', period: '23 days', color: 'text-red-400', desc: 'Energy, strength, endurance' },
          { label: 'Emotional', period: '28 days', color: 'text-blue-400', desc: 'Mood, creativity, empathy' },
          { label: 'Intellectual', period: '33 days', color: 'text-green-400', desc: 'Thinking, learning, memory' },
        ].map((cycle) => (
          <div key={cycle.label} className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
            <p className={`font-serif text-lg ${cycle.color}`}>{cycle.label}</p>
            <p className="text-celestial-gold/80 text-sm">{cycle.period}</p>
            <p className="text-soft-silver/50 text-xs mt-1">{cycle.desc}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-soft-silver/70 text-sm mb-2">Date of Birth</label>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-celestial-gold/60 transition-colors"
            required
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <motion.button
          type="submit"
          disabled={!dateOfBirth || loading}
          className="btn-gold w-full py-3 rounded-lg disabled:opacity-40"
          whileHover={!dateOfBirth || loading ? {} : { scale: 1.01 }}
        >
          {loading ? 'Calculating your cycles...' : 'Calculate My Biorhythms →'}
        </motion.button>
      </form>
    </div>
  )
}
