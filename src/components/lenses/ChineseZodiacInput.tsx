'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface ChineseZodiacInputProps {
  lensInputId: string
  profileId: string
  initialData: Record<string, unknown>
  onComplete: () => void
}

const HOURS = Array.from({ length: 24 }, (_, i) => ({
  value: i,
  label: `${i.toString().padStart(2, '0')}:00 — ${i.toString().padStart(2, '0')}:59`,
}))

export default function ChineseZodiacInput({ lensInputId, profileId, initialData, onComplete }: ChineseZodiacInputProps) {
  const [dateOfBirth, setDateOfBirth] = useState((initialData.date_of_birth as string) || '')
  const [birthHour, setBirthHour] = useState<string>((initialData.birth_hour as string) ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dateOfBirth) { setError('Please enter your date of birth.'); return }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/analyze/chinese_zodiac', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lens_input_id: lensInputId,
          profile_id: profileId,
          date_of_birth: dateOfBirth,
          birth_hour: birthHour !== '' ? parseInt(birthHour) : undefined,
        }),
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
          ☯
        </div>
        <div>
          <h2 className="font-serif text-2xl text-white">Chinese Zodiac & Element</h2>
          <p className="text-soft-silver/60 text-sm">A 2,000-year tradition of personality archetypes and elemental nature</p>
        </div>
      </div>

      <div className="mb-6 bg-white/5 rounded-lg p-4 border border-white/10">
        <p className="text-soft-silver/60 text-sm">
          Your <span className="text-celestial-gold">animal sign</span> (birth year) reveals your core personality archetype.
          Your <span className="text-celestial-gold">element</span> (Wood, Fire, Earth, Metal, or Water) modifies that archetype significantly.
          Your <span className="text-celestial-gold">birth hour</span> (if known) reveals your secret inner self.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
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

        <div>
          <label className="block text-soft-silver/70 text-sm mb-2">
            Birth Hour <span className="text-soft-silver/40">(optional — reveals your secret animal)</span>
          </label>
          <select
            value={birthHour}
            onChange={(e) => setBirthHour(e.target.value)}
            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-celestial-gold/60 transition-colors"
          >
            <option value="">I don&apos;t know my birth hour</option>
            {HOURS.map((h) => (
              <option key={h.value} value={h.value}>{h.label}</option>
            ))}
          </select>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <motion.button
          type="submit"
          disabled={!dateOfBirth || loading}
          className="btn-gold w-full py-3 rounded-lg disabled:opacity-40"
          whileHover={!dateOfBirth || loading ? {} : { scale: 1.01 }}
        >
          {loading ? 'Calculating your zodiac profile...' : 'Reveal My Zodiac Profile →'}
        </motion.button>
      </form>
    </div>
  )
}
