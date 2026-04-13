'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface NatalChartInputProps {
  lensInputId: string
  profileId: string
  initialData: Record<string, unknown>
  onComplete: () => void
}

export default function NatalChartInput({ lensInputId, profileId, initialData, onComplete }: NatalChartInputProps) {
  const [dateOfBirth, setDateOfBirth] = useState((initialData.date_of_birth as string) || '')
  const [timeOfBirth, setTimeOfBirth] = useState((initialData.time_of_birth as string) || '')
  const [city, setCity] = useState((initialData.city as string) || '')
  const [latitude, setLatitude] = useState((initialData.latitude as string) || '')
  const [longitude, setLongitude] = useState((initialData.longitude as string) || '')
  const [unknownTime, setUnknownTime] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dateOfBirth) {
      setError('Date of birth is required.')
      return
    }
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/analyze/natal_chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lens_input_id: lensInputId,
          profile_id: profileId,
          date_of_birth: dateOfBirth,
          time_of_birth: unknownTime ? '12:00' : timeOfBirth,
          city,
          latitude: parseFloat(latitude) || 32.0853,   // default: Jerusalem
          longitude: parseFloat(longitude) || 34.7818,
          time_unknown: unknownTime,
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
        <span className="text-4xl">✦</span>
        <div>
          <h2 className="font-serif text-2xl text-white">Natal Birth Chart</h2>
          <p className="text-xs text-celestial-gold/60">מפת המזל · Scholarly Foundation</p>
        </div>
      </div>

      <p className="text-soft-silver/60 text-sm mb-6 leading-relaxed">
        Your precise planetary positions at birth — Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn,
        Rising sign, houses, and major aspects — interpreted through psychological astrology
        (Ptolemy, Liz Greene, Stephen Arroyo framework). The Talmud (Shabbat 156a) notes that
        planetary influences shape character; this is your <em className="text-celestial-gold">mazal map</em>.
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-900/20 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-xs text-soft-silver/60 mb-1.5">Date of Birth *</label>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="cosmic-input"
            required
          />
        </div>

        <div>
          <label className="block text-xs text-soft-silver/60 mb-1.5">
            Time of Birth
            <span className="text-soft-silver/40 ml-2">(as precise as possible — affects Rising sign)</span>
          </label>
          <input
            type="time"
            value={timeOfBirth}
            onChange={(e) => setTimeOfBirth(e.target.value)}
            className="cosmic-input"
            disabled={unknownTime}
          />
          <label className="flex items-center gap-2 mt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={unknownTime}
              onChange={(e) => setUnknownTime(e.target.checked)}
              className="accent-celestial-gold"
            />
            <span className="text-xs text-soft-silver/50">I don&apos;t know my birth time (noon will be used)</span>
          </label>
        </div>

        <div>
          <label className="block text-xs text-soft-silver/60 mb-1.5">
            City of Birth *
            <span className="text-soft-silver/40 ml-2">(for accurate house placements)</span>
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="cosmic-input"
            placeholder="New York, Jerusalem, London..."
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-soft-silver/60 mb-1.5">Latitude</label>
            <input
              type="number"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="cosmic-input"
              placeholder="40.7128"
              step="0.0001"
            />
          </div>
          <div>
            <label className="block text-xs text-soft-silver/60 mb-1.5">Longitude</label>
            <input
              type="number"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="cosmic-input"
              placeholder="-74.0060"
              step="0.0001"
            />
          </div>
        </div>
        <p className="text-xs text-soft-silver/40 -mt-3">
          Enter the latitude/longitude for your birth city (find on maps.google.com)
        </p>

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
              Calculating planetary positions and analyzing...
            </span>
          ) : (
            'Calculate My Birth Chart →'
          )}
        </motion.button>
      </form>
    </div>
  )
}
