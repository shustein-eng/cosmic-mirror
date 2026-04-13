'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Starfield from '@/components/stars/Starfield'
import AppNav from '@/components/layout/AppNav'
import { LENS_CARDS } from '@/types'
import { cn } from '@/lib/utils'
import GematriaInput from '@/components/lenses/GematriaInput'
import NatalChartInput from '@/components/lenses/NatalChartInput'
import MiddosInput from '@/components/lenses/MiddosInput'
import ColorPsychologyInput from '@/components/lenses/ColorPsychologyInput'
import PalmInput from '@/components/lenses/PalmInput'
import HandwritingInput from '@/components/lenses/HandwritingInput'
import FaceReadingInput from '@/components/lenses/FaceReadingInput'
import BiorhythmInput from '@/components/lenses/BiorhythmInput'
import ChineseZodiacInput from '@/components/lenses/ChineseZodiacInput'
import EnneagramInput from '@/components/lenses/EnneagramInput'

interface LensInput {
  id: string
  lens_type: string
  input_data: Record<string, unknown>
  analysis_result: unknown
}

interface LensInputFlowProps {
  profile: { id: string; profile_name: string }
  lensInputs: LensInput[]
}

export default function LensInputFlow({ profile, lensInputs }: LensInputFlowProps) {
  const router = useRouter()
  const [currentLensIdx, setCurrentLensIdx] = useState(0)
  const [completedLenses, setCompletedLenses] = useState<Set<string>>(
    new Set(lensInputs.filter((l) => l.analysis_result).map((l) => l.lens_type))
  )

  const lensCards = lensInputs
    .map((li) => LENS_CARDS.find((c) => c.type === li.lens_type))
    .filter(Boolean)

  const currentLensInput = lensInputs[currentLensIdx]
  const currentCard = lensCards[currentLensIdx]
  const allDone = completedLenses.size === lensInputs.length

  const handleLensComplete = (lensType: string) => {
    setCompletedLenses((prev) => new Set([...prev, lensType]))
    if (currentLensIdx < lensInputs.length - 1) {
      setCurrentLensIdx((prev) => prev + 1)
    }
  }

  if (allDone) {
    return (
      <div className="relative min-h-screen cosmic-bg">
        <Starfield />
        <div className="relative z-10">
          <AppNav />
          <div className="max-w-2xl mx-auto px-6 py-20 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="text-6xl animate-float">✦</div>
              <h2 className="font-serif text-4xl text-white">All lenses complete!</h2>
              <p className="text-soft-silver/60 max-w-md">
                Your inputs have been analyzed. Now let&apos;s generate your Full Cosmic Profile report.
              </p>
              <button
                onClick={() => router.push(`/profile/${profile.id}/processing`)}
                className="btn-gold text-lg px-10 py-4 rounded-lg"
              >
                Generate My Cosmic Profile →
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen cosmic-bg">
      <Starfield />
      <div className="relative z-10">
        <AppNav />

        <main className="max-w-5xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <p className="text-soft-silver/50 text-sm mb-1">{profile.profile_name}</p>
            <h1 className="font-serif text-3xl text-white">Complete Your Lenses</h1>
          </div>

          {/* Lens progress tabs */}
          <div className="flex gap-2 mb-8 flex-wrap">
            {lensInputs.map((li, i) => {
              const card = LENS_CARDS.find((c) => c.type === li.lens_type)
              const isDone = completedLenses.has(li.lens_type)
              const isCurrent = i === currentLensIdx
              return (
                <button
                  key={li.lens_type}
                  onClick={() => setCurrentLensIdx(i)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all',
                    isDone
                      ? 'border-celestial-gold/50 bg-celestial-gold/10 text-celestial-gold'
                      : isCurrent
                      ? 'border-white/30 bg-white/10 text-white'
                      : 'border-white/10 text-soft-silver/40'
                  )}
                >
                  <span>{card?.icon}</span>
                  <span className="hidden sm:block">{card?.name}</span>
                  {isDone && <span className="text-xs">✓</span>}
                </button>
              )
            })}
          </div>

          {/* Current lens input */}
          <AnimatePresence mode="wait">
            {currentCard && currentLensInput && (
              <motion.div
                key={currentLensInput.lens_type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Phase 1 */}
                {currentCard.type === 'gematria' && (
                  <GematriaInput lensInputId={currentLensInput.id} profileId={profile.id} initialData={currentLensInput.input_data} onComplete={() => handleLensComplete('gematria')} />
                )}
                {currentCard.type === 'natal_chart' && (
                  <NatalChartInput lensInputId={currentLensInput.id} profileId={profile.id} initialData={currentLensInput.input_data} onComplete={() => handleLensComplete('natal_chart')} />
                )}
                {currentCard.type === 'middos_assessment' && (
                  <MiddosInput lensInputId={currentLensInput.id} profileId={profile.id} initialData={currentLensInput.input_data} onComplete={() => handleLensComplete('middos_assessment')} />
                )}
                {currentCard.type === 'color_psychology' && (
                  <ColorPsychologyInput lensInputId={currentLensInput.id} profileId={profile.id} initialData={currentLensInput.input_data} onComplete={() => handleLensComplete('color_psychology')} />
                )}

                {/* Phase 2 — Image lenses */}
                {currentCard.type === 'palm' && (
                  <PalmInput lensInputId={currentLensInput.id} profileId={profile.id} initialData={currentLensInput.input_data} onComplete={() => handleLensComplete('palm')} />
                )}
                {currentCard.type === 'handwriting' && (
                  <HandwritingInput lensInputId={currentLensInput.id} profileId={profile.id} initialData={currentLensInput.input_data} onComplete={() => handleLensComplete('handwriting')} />
                )}
                {currentCard.type === 'face_reading' && (
                  <FaceReadingInput lensInputId={currentLensInput.id} profileId={profile.id} initialData={currentLensInput.input_data} onComplete={() => handleLensComplete('face_reading')} />
                )}

                {/* Phase 3 — Remaining lenses */}
                {currentCard.type === 'biorhythm' && (
                  <BiorhythmInput lensInputId={currentLensInput.id} profileId={profile.id} initialData={currentLensInput.input_data} onComplete={() => handleLensComplete('biorhythm')} />
                )}
                {currentCard.type === 'chinese_zodiac' && (
                  <ChineseZodiacInput lensInputId={currentLensInput.id} profileId={profile.id} initialData={currentLensInput.input_data} onComplete={() => handleLensComplete('chinese_zodiac')} />
                )}
                {currentCard.type === 'enneagram' && (
                  <EnneagramInput lensInputId={currentLensInput.id} profileId={profile.id} initialData={currentLensInput.input_data} onComplete={() => handleLensComplete('enneagram')} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
