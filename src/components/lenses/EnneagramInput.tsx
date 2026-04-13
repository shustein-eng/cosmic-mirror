'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ENNEAGRAM_QUESTIONS } from '@/lib/enneagram/questions'

interface EnneagramInputProps {
  lensInputId: string
  profileId: string
  initialData: Record<string, unknown>
  onComplete: () => void
}

export default function EnneagramInput({ lensInputId, profileId, onComplete }: EnneagramInputProps) {
  const [answers, setAnswers] = useState<Record<number, 'A' | 'B'>>({})
  const [currentIdx, setCurrentIdx] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentQuestion = ENNEAGRAM_QUESTIONS[currentIdx]
  const progress = Object.keys(answers).length / ENNEAGRAM_QUESTIONS.length
  const allAnswered = Object.keys(answers).length === ENNEAGRAM_QUESTIONS.length

  const handleAnswer = (choice: 'A' | 'B') => {
    const newAnswers = { ...answers, [currentQuestion.id]: choice }
    setAnswers(newAnswers)
    if (currentIdx < ENNEAGRAM_QUESTIONS.length - 1) {
      setTimeout(() => setCurrentIdx((i) => i + 1), 300)
    }
  }

  const handleSubmit = async () => {
    if (!allAnswered) { setError('Please answer all questions.'); return }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/analyze/enneagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lens_input_id: lensInputId, profile_id: profileId, answers }),
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
          ⬡
        </div>
        <div>
          <h2 className="font-serif text-2xl text-white">Enneagram Deep Dive</h2>
          <p className="text-soft-silver/60 text-sm">36 forced-choice pairs — choose the one that feels more like you</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-soft-silver/40 mb-2">
          <span>{Object.keys(answers).length} of {ENNEAGRAM_QUESTIONS.length} answered</span>
          <span>{Math.round(progress * 100)}%</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-celestial-gold rounded-full"
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question navigator */}
      <div className="flex flex-wrap gap-1 mb-6">
        {ENNEAGRAM_QUESTIONS.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setCurrentIdx(i)}
            className={`w-7 h-7 rounded text-xs transition-all ${
              answers[q.id]
                ? 'bg-celestial-gold text-midnight font-bold'
                : i === currentIdx
                ? 'bg-white/20 text-white'
                : 'bg-white/5 text-soft-silver/30 hover:bg-white/10'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Current question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-3"
        >
          <p className="text-soft-silver/50 text-xs mb-3">Question {currentIdx + 1} of {ENNEAGRAM_QUESTIONS.length}</p>

          <button
            onClick={() => handleAnswer('A')}
            className={`w-full text-left p-5 rounded-xl border transition-all ${
              answers[currentQuestion.id] === 'A'
                ? 'border-celestial-gold bg-celestial-gold/10 text-white'
                : 'border-white/15 bg-white/5 text-soft-silver/80 hover:border-celestial-gold/30 hover:bg-white/8'
            }`}
          >
            <span className="inline-block w-6 h-6 rounded-full border border-current text-center text-xs leading-6 mr-3 flex-shrink-0 float-left">A</span>
            {currentQuestion.optionA}
          </button>

          <button
            onClick={() => handleAnswer('B')}
            className={`w-full text-left p-5 rounded-xl border transition-all ${
              answers[currentQuestion.id] === 'B'
                ? 'border-celestial-gold bg-celestial-gold/10 text-white'
                : 'border-white/15 bg-white/5 text-soft-silver/80 hover:border-celestial-gold/30 hover:bg-white/8'
            }`}
          >
            <span className="inline-block w-6 h-6 rounded-full border border-current text-center text-xs leading-6 mr-3 flex-shrink-0 float-left">B</span>
            {currentQuestion.optionB}
          </button>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3 mt-6">
        {currentIdx > 0 && (
          <button
            onClick={() => setCurrentIdx((i) => i - 1)}
            className="btn-outline-gold px-4 py-2 rounded-lg text-sm"
          >
            ← Previous
          </button>
        )}
        {currentIdx < ENNEAGRAM_QUESTIONS.length - 1 && answers[currentQuestion.id] && (
          <button
            onClick={() => setCurrentIdx((i) => i + 1)}
            className="btn-outline-gold px-4 py-2 rounded-lg text-sm ml-auto"
          >
            Next →
          </button>
        )}
      </div>

      {allAnswered && (
        <div className="mt-6">
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          <motion.button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-gold w-full py-3 rounded-lg disabled:opacity-40"
            whileHover={loading ? {} : { scale: 1.01 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {loading ? 'Analyzing your Enneagram profile...' : 'Reveal My Enneagram Type →'}
          </motion.button>
        </div>
      )}
    </div>
  )
}
