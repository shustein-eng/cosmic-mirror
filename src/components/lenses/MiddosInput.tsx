'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MIDDOS_QUESTIONS } from '@/lib/middos/questions'

interface MiddosInputProps {
  lensInputId: string
  profileId: string
  initialData: Record<string, unknown>
  onComplete: () => void
}

export default function MiddosInput({ lensInputId, profileId, initialData, onComplete }: MiddosInputProps) {
  const [answers, setAnswers] = useState<Record<number, string | number>>(
    (initialData.answers as Record<number, string | number>) || {}
  )
  const [currentIdx, setCurrentIdx] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const total = MIDDOS_QUESTIONS.length
  const current = MIDDOS_QUESTIONS[currentIdx]
  const progress = Math.round((Object.keys(answers).length / total) * 100)
  const allAnswered = Object.keys(answers).length === total

  const handleAnswer = (value: string | number) => {
    setAnswers((prev) => ({ ...prev, [current.id]: value }))
    if (currentIdx < total - 1) {
      setTimeout(() => setCurrentIdx((i) => i + 1), 300)
    }
  }

  const handleSubmit = async () => {
    if (!allAnswered) {
      setError('Please answer all questions before submitting.')
      return
    }
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/analyze/middos_assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lens_input_id: lensInputId,
          profile_id: profileId,
          answers,
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

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <span className="text-4xl">◈</span>
        <div>
          <h2 className="font-serif text-2xl text-white">Middos Assessment</h2>
          <p className="text-xs text-celestial-gold/60">מידות · Established Practice · 40 Questions</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-soft-silver/50 mb-2">
          <span>{Object.keys(answers).length} of {total} answered</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-celestial-gold to-yellow-300"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Question navigator dots */}
      <div className="flex flex-wrap gap-1 mb-6">
        {MIDDOS_QUESTIONS.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setCurrentIdx(i)}
            className={`w-4 h-4 rounded-full transition-all ${
              answers[q.id] !== undefined
                ? 'bg-celestial-gold'
                : i === currentIdx
                ? 'bg-white/40'
                : 'bg-white/10'
            }`}
            title={`Question ${i + 1}`}
          />
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-900/20 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Current question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="glass-card p-7"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs px-2 py-0.5 rounded-full border border-celestial-gold/30 text-celestial-gold/70">
              {current.middah} · {current.hebrewMiddah}
            </span>
            <span className="text-xs text-soft-silver/40">Q{currentIdx + 1}</span>
          </div>

          <p className="text-white text-base leading-relaxed mb-6 font-light">{current.question}</p>

          {current.type === 'multiple_choice' && current.options && (
            <div className="flex flex-col gap-3">
              {current.options.map((opt, i) => (
                <motion.button
                  key={i}
                  onClick={() => handleAnswer(opt)}
                  whileHover={{ scale: 1.005 }}
                  whileTap={{ scale: 0.995 }}
                  className={`text-left px-4 py-3 rounded-lg border text-sm transition-all ${
                    answers[current.id] === opt
                      ? 'border-celestial-gold bg-celestial-gold/10 text-celestial-gold'
                      : 'border-white/10 text-soft-silver/70 hover:border-white/30 hover:text-white'
                  }`}
                >
                  <span className="text-xs text-soft-silver/40 mr-2 font-mono">
                    {['A', 'B', 'C', 'D'][i]}.
                  </span>
                  {opt}
                </motion.button>
              ))}
            </div>
          )}

          {current.type === 'scale' && current.scaleLabels && (
            <div>
              <div className="flex justify-between text-xs text-soft-silver/50 mb-3">
                <span className="max-w-[45%]">{current.scaleLabels[0]}</span>
                <span className="max-w-[45%] text-right">{current.scaleLabels[1]}</span>
              </div>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5, 6, 7].map((v) => (
                  <motion.button
                    key={v}
                    onClick={() => handleAnswer(v)}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    className={`w-10 h-10 rounded-full border text-sm font-medium transition-all ${
                      answers[current.id] === v
                        ? 'border-celestial-gold bg-celestial-gold text-midnight'
                        : 'border-white/20 text-soft-silver/60 hover:border-celestial-gold/50 hover:text-white'
                    }`}
                  >
                    {v}
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3 mt-5">
        <button
          onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
          disabled={currentIdx === 0}
          className="btn-outline-gold px-4 py-2 text-sm disabled:opacity-30"
        >
          ← Prev
        </button>
        {currentIdx < total - 1 ? (
          <button
            onClick={() => setCurrentIdx((i) => i + 1)}
            className="btn-outline-gold px-4 py-2 text-sm"
          >
            Next →
          </button>
        ) : null}
        {allAnswered && (
          <motion.button
            onClick={handleSubmit}
            disabled={loading}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="btn-gold px-6 py-2 text-sm ml-auto disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-midnight/30 border-t-midnight rounded-full animate-spin" />
                Analyzing...
              </span>
            ) : (
              'Submit & Analyze →'
            )}
          </motion.button>
        )}
      </div>
    </div>
  )
}
