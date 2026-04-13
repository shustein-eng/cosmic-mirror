'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ColorPsychologyInputProps {
  lensInputId: string
  profileId: string
  initialData: Record<string, unknown>
  onComplete: () => void
}

const COLOR_PALETTE = [
  { name: 'Crimson', hex: '#DC143C', psychology: 'passion, intensity, drive' },
  { name: 'Scarlet', hex: '#FF2400', psychology: 'energy, urgency, power' },
  { name: 'Coral', hex: '#FF6B6B', psychology: 'warmth, playfulness, optimism' },
  { name: 'Amber', hex: '#FFBF00', psychology: 'creativity, warmth, confidence' },
  { name: 'Gold', hex: '#FFD700', psychology: 'success, wisdom, generosity' },
  { name: 'Lemon', hex: '#FFF44F', psychology: 'clarity, intellectual energy, spontaneity' },
  { name: 'Sage', hex: '#8FAF72', psychology: 'balance, growth, naturalness' },
  { name: 'Emerald', hex: '#50C878', psychology: 'harmony, healing, renewal' },
  { name: 'Forest', hex: '#228B22', psychology: 'stability, reliability, depth' },
  { name: 'Teal', hex: '#008080', psychology: 'clarity, calm, sophistication' },
  { name: 'Sky', hex: '#87CEEB', psychology: 'freedom, openness, idealism' },
  { name: 'Cobalt', hex: '#0047AB', psychology: 'trust, authority, intelligence' },
  { name: 'Navy', hex: '#1B2A6B', psychology: 'depth, loyalty, introspection' },
  { name: 'Indigo', hex: '#4B0082', psychology: 'intuition, mystery, perception' },
  { name: 'Violet', hex: '#8A2BE2', psychology: 'imagination, spirituality, wisdom' },
  { name: 'Lavender', hex: '#B57EDC', psychology: 'sensitivity, grace, nostalgia' },
  { name: 'Rose', hex: '#FF007F', psychology: 'love, nurturing, femininity' },
  { name: 'Ivory', hex: '#FFFFF0', psychology: 'purity, simplicity, refinement' },
  { name: 'Silver', hex: '#C0C0C0', psychology: 'precision, modernity, reflection' },
  { name: 'Charcoal', hex: '#36454F', psychology: 'groundedness, sophistication, reserve' },
  { name: 'Onyx', hex: '#353935', psychology: 'power, elegance, independence' },
  { name: 'Copper', hex: '#B87333', psychology: 'grounding, tradition, warmth' },
]

const SCENARIO_COLORS = [
  { question: 'What color is your ideal workspace?', key: 'workspace' },
  { question: 'What color represents your "safe place" — where you feel most yourself?', key: 'safe_place' },
  { question: 'What color is your energy when you\'re at your best?', key: 'peak_energy' },
  { question: 'What color represents the version of yourself you aspire to become?', key: 'aspirational_self' },
]

const RAPID_FIRE_PAIRS = [
  ['Crimson', 'Cobalt'],
  ['Emerald', 'Violet'],
  ['Gold', 'Silver'],
  ['Coral', 'Navy'],
  ['Lavender', 'Forest'],
  ['Amber', 'Teal'],
  ['Onyx', 'Sky'],
  ['Sage', 'Scarlet'],
  ['Indigo', 'Lemon'],
  ['Rose', 'Charcoal'],
]

type Step = 'favorites' | 'dislikes' | 'scenarios' | 'rapid_fire' | 'review'

export default function ColorPsychologyInput({ lensInputId, profileId, initialData, onComplete }: ColorPsychologyInputProps) {
  const [step, setStep] = useState<Step>('favorites')
  const [favorites, setFavorites] = useState<string[]>((initialData.favorites as string[]) || [])
  const [dislikes, setDislikes] = useState<string[]>((initialData.dislikes as string[]) || [])
  const [scenarios, setScenarios] = useState<Record<string, string>>((initialData.scenarios as Record<string, string>) || {})
  const [rapidFire, setRapidFire] = useState<Record<number, string>>((initialData.rapid_fire as Record<number, string>) || {})
  const [rapidIdx, setRapidIdx] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleFavorite = (name: string) => {
    setFavorites((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : prev.length < 3 ? [...prev, name] : prev
    )
  }

  const toggleDislike = (name: string) => {
    setDislikes((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : prev.length < 3 ? [...prev, name] : prev
    )
  }

  const handleRapidFire = (color: string) => {
    setRapidFire((prev) => ({ ...prev, [rapidIdx]: color }))
    if (rapidIdx < RAPID_FIRE_PAIRS.length - 1) {
      setTimeout(() => setRapidIdx((i) => i + 1), 200)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/analyze/color_psychology', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lens_input_id: lensInputId,
          profile_id: profileId,
          favorites,
          dislikes,
          scenarios,
          rapid_fire: rapidFire,
          color_palette: COLOR_PALETTE,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Analysis failed')
      }
      onComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  const steps: Step[] = ['favorites', 'dislikes', 'scenarios', 'rapid_fire', 'review']
  const stepIdx = steps.indexOf(step)

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <span className="text-4xl">◉</span>
        <div>
          <h2 className="font-serif text-2xl text-white">Color Psychology Profile</h2>
          <p className="text-xs text-celestial-gold/60">Lüscher Color Test · Angela Wright · Established Practice</p>
        </div>
      </div>

      {/* Step tabs */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {[
          { key: 'favorites', label: 'Drawn To' },
          { key: 'dislikes', label: 'Avoid' },
          { key: 'scenarios', label: 'Contexts' },
          { key: 'rapid_fire', label: 'Rapid Fire' },
          { key: 'review', label: 'Submit' },
        ].map(({ key, label }, i) => (
          <div
            key={key}
            className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
              step === key
                ? 'border-celestial-gold bg-celestial-gold/10 text-celestial-gold'
                : i < stepIdx
                ? 'border-celestial-gold/30 text-celestial-gold/50'
                : 'border-white/10 text-soft-silver/30'
            }`}
          >
            {i < stepIdx ? '✓ ' : ''}{label}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* FAVORITES */}
        {step === 'favorites' && (
          <motion.div key="favorites" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
            <div className="glass-card p-7 mb-5">
              <h3 className="font-serif text-xl text-white mb-2">Which colors call to you?</h3>
              <p className="text-soft-silver/50 text-sm mb-5">Select exactly 3 colors you feel most drawn to right now.</p>
              <div className="grid grid-cols-5 sm:grid-cols-7 gap-3">
                {COLOR_PALETTE.map((color) => (
                  <motion.button
                    key={color.name}
                    onClick={() => toggleFavorite(color.name)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="relative flex flex-col items-center gap-1.5"
                    title={`${color.name} — ${color.psychology}`}
                  >
                    <div
                      className="w-10 h-10 rounded-full border-2 transition-all"
                      style={{
                        backgroundColor: color.hex,
                        borderColor: favorites.includes(color.name) ? '#C9A84C' : 'transparent',
                        boxShadow: favorites.includes(color.name) ? `0 0 12px ${color.hex}88` : 'none',
                      }}
                    />
                    {favorites.includes(color.name) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-celestial-gold flex items-center justify-center"
                      >
                        <span className="text-midnight text-[10px] font-bold">✓</span>
                      </motion.div>
                    )}
                    <span className="text-[9px] text-soft-silver/40 hidden sm:block">{color.name}</span>
                  </motion.button>
                ))}
              </div>
              <p className="text-xs text-soft-silver/40 mt-4">{favorites.length}/3 selected</p>
            </div>
            <button
              onClick={() => setStep('dislikes')}
              disabled={favorites.length !== 3}
              className="btn-gold px-8 py-3 disabled:opacity-40"
            >
              Next: Colors You Avoid →
            </button>
          </motion.div>
        )}

        {/* DISLIKES */}
        {step === 'dislikes' && (
          <motion.div key="dislikes" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
            <div className="glass-card p-7 mb-5">
              <h3 className="font-serif text-xl text-white mb-2">Which colors do you avoid?</h3>
              <p className="text-soft-silver/50 text-sm mb-5">Select 3 colors you instinctively dislike or find off-putting.</p>
              <div className="grid grid-cols-5 sm:grid-cols-7 gap-3">
                {COLOR_PALETTE.map((color) => (
                  <motion.button
                    key={color.name}
                    onClick={() => toggleDislike(color.name)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="relative flex flex-col items-center gap-1.5"
                  >
                    <div
                      className="w-10 h-10 rounded-full border-2 transition-all"
                      style={{
                        backgroundColor: color.hex,
                        borderColor: dislikes.includes(color.name) ? '#FF4444' : 'transparent',
                        opacity: dislikes.includes(color.name) ? 1 : 0.6,
                      }}
                    />
                    {dislikes.includes(color.name) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center"
                      >
                        <span className="text-white text-[10px] font-bold">✗</span>
                      </motion.div>
                    )}
                    <span className="text-[9px] text-soft-silver/40 hidden sm:block">{color.name}</span>
                  </motion.button>
                ))}
              </div>
              <p className="text-xs text-soft-silver/40 mt-4">{dislikes.length}/3 selected</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep('favorites')} className="btn-outline-gold px-6 py-3">← Back</button>
              <button onClick={() => setStep('scenarios')} disabled={dislikes.length !== 3} className="btn-gold px-8 py-3 disabled:opacity-40">
                Next: Context Colors →
              </button>
            </div>
          </motion.div>
        )}

        {/* SCENARIOS */}
        {step === 'scenarios' && (
          <motion.div key="scenarios" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
            <div className="glass-card p-7 mb-5">
              <h3 className="font-serif text-xl text-white mb-2">Colors across contexts</h3>
              <p className="text-soft-silver/50 text-sm mb-5">Select a color for each scenario — go with your gut, not your head.</p>
              <div className="flex flex-col gap-6">
                {SCENARIO_COLORS.map(({ question, key }) => (
                  <div key={key}>
                    <p className="text-white text-sm mb-3">{question}</p>
                    <div className="flex flex-wrap gap-2">
                      {COLOR_PALETTE.map((color) => (
                        <motion.button
                          key={color.name}
                          onClick={() => setScenarios((prev) => ({ ...prev, [key]: color.name }))}
                          whileHover={{ scale: 1.12 }}
                          whileTap={{ scale: 0.92 }}
                          className="relative"
                          title={color.name}
                        >
                          <div
                            className="w-8 h-8 rounded-full border-2 transition-all"
                            style={{
                              backgroundColor: color.hex,
                              borderColor: scenarios[key] === color.name ? '#C9A84C' : 'transparent',
                              boxShadow: scenarios[key] === color.name ? `0 0 10px ${color.hex}88` : 'none',
                            }}
                          />
                        </motion.button>
                      ))}
                    </div>
                    {scenarios[key] && (
                      <p className="text-xs text-celestial-gold/70 mt-2">
                        ✓ {scenarios[key]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep('dislikes')} className="btn-outline-gold px-6 py-3">← Back</button>
              <button
                onClick={() => setStep('rapid_fire')}
                disabled={Object.keys(scenarios).length < SCENARIO_COLORS.length}
                className="btn-gold px-8 py-3 disabled:opacity-40"
              >
                Next: Rapid Fire →
              </button>
            </div>
          </motion.div>
        )}

        {/* RAPID FIRE */}
        {step === 'rapid_fire' && (
          <motion.div key="rapid_fire" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
            <div className="glass-card p-7 mb-5">
              <h3 className="font-serif text-xl text-white mb-2">Rapid Fire — pick instantly</h3>
              <p className="text-soft-silver/50 text-sm mb-1">Don't think. Just pick the one that feels right.</p>
              <p className="text-xs text-soft-silver/40 mb-6">{Object.keys(rapidFire).length}/{RAPID_FIRE_PAIRS.length} completed</p>

              {rapidIdx < RAPID_FIRE_PAIRS.length ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={rapidIdx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center justify-center gap-10"
                  >
                    {RAPID_FIRE_PAIRS[rapidIdx].map((colorName) => {
                      const color = COLOR_PALETTE.find((c) => c.name === colorName)!
                      return (
                        <motion.button
                          key={colorName}
                          onClick={() => handleRapidFire(colorName)}
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.92 }}
                          className="flex flex-col items-center gap-3"
                        >
                          <div
                            className="w-24 h-24 rounded-full border-2 border-white/10 shadow-lg"
                            style={{
                              backgroundColor: color.hex,
                              boxShadow: `0 0 30px ${color.hex}44`,
                            }}
                          />
                          <span className="text-sm text-soft-silver/70">{colorName}</span>
                        </motion.button>
                      )
                    })}
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">✦</div>
                  <p className="text-white font-serif text-xl">All pairs complete!</p>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep('scenarios')} className="btn-outline-gold px-6 py-3">← Back</button>
              {Object.keys(rapidFire).length === RAPID_FIRE_PAIRS.length && (
                <button onClick={() => setStep('review')} className="btn-gold px-8 py-3">
                  Review & Submit →
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* REVIEW */}
        {step === 'review' && (
          <motion.div key="review" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
            <div className="glass-card p-7 mb-5">
              <h3 className="font-serif text-xl text-white mb-5">Your Color Profile Summary</h3>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <p className="text-xs text-soft-silver/50 mb-2">Colors You Love</p>
                  <div className="flex gap-2">
                    {favorites.map((name) => {
                      const c = COLOR_PALETTE.find((x) => x.name === name)!
                      return <div key={name} className="w-8 h-8 rounded-full" style={{ backgroundColor: c.hex }} title={name} />
                    })}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-soft-silver/50 mb-2">Colors You Avoid</p>
                  <div className="flex gap-2">
                    {dislikes.map((name) => {
                      const c = COLOR_PALETTE.find((x) => x.name === name)!
                      return <div key={name} className="w-8 h-8 rounded-full opacity-50" style={{ backgroundColor: c.hex }} title={name} />
                    })}
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 rounded-lg bg-red-900/20 border border-red-500/30 text-red-400 text-sm">{error}</div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep('rapid_fire')} className="btn-outline-gold px-6 py-3">← Back</button>
              <motion.button
                onClick={handleSubmit}
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="btn-gold px-10 py-3 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 border-2 border-midnight/30 border-t-midnight rounded-full animate-spin" />
                    Analyzing your color profile...
                  </span>
                ) : (
                  'Analyze My Color Psychology →'
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
