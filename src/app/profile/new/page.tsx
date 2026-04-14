'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Starfield from '@/components/stars/Starfield'
import AppNav from '@/components/layout/AppNav'
import { LENS_CARDS, type LensType } from '@/types'
import { cn } from '@/lib/utils'

const FREE_TIER_LIMIT = 4

export default function NewProfilePage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<'name' | 'lenses'>('name')
  const [profileName, setProfileName] = useState('')
  const [selectedLenses, setSelectedLenses] = useState<LensType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPremium, setIsPremium] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase.from('profiles').select('subscription_tier').eq('id', user.id).single()
      setIsPremium(data?.subscription_tier !== 'free')
    })
  }, [])

  const lensLimit = isPremium ? LENS_CARDS.length : FREE_TIER_LIMIT

  const toggleLens = (type: LensType, phase: number) => {
    if (phase > 1 && !isPremium) return
    setSelectedLenses((prev) => {
      if (prev.includes(type)) return prev.filter((t) => t !== type)
      if (prev.length >= lensLimit) return prev
      return [...prev, type]
    })
  }

  const profileDepth = Math.round((selectedLenses.length / lensLimit) * 100)

  const handleCreate = async () => {
    if (selectedLenses.length < 1) {
      setError('Please select at least 1 lens to continue.')
      return
    }
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    // Create personality profile
    const { data: profile, error: profileError } = await supabase
      .from('personality_profiles')
      .insert({ user_id: user.id, profile_name: profileName || 'My Profile' })
      .select()
      .single()

    if (profileError || !profile) {
      setError('Failed to create profile. Please try again.')
      setLoading(false)
      return
    }

    // Create lens_input placeholders for selected lenses
    const lensInserts = selectedLenses.map((lens) => ({
      profile_id: profile.id,
      lens_type: lens,
      input_data: {},
    }))

    await supabase.from('lens_inputs').insert(lensInserts)

    router.push(`/profile/${profile.id}/input`)
  }

  return (
    <div className="relative min-h-screen cosmic-bg">
      <Starfield />
      <div className="relative z-10">
        <AppNav />

        <main className="max-w-5xl mx-auto px-6 py-10">
          {/* Progress indicator */}
          <div className="flex items-center gap-3 mb-8">
            <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm border', step === 'name' || step === 'lenses' ? 'border-celestial-gold bg-celestial-gold/20 text-celestial-gold' : 'border-white/20 text-soft-silver/40')}>1</div>
            <div className="h-px w-12 bg-celestial-gold/30" />
            <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm border', step === 'lenses' ? 'border-celestial-gold bg-celestial-gold/20 text-celestial-gold' : 'border-white/20 text-soft-silver/40')}>2</div>
          </div>

          <AnimatePresence mode="wait">
            {step === 'name' && (
              <motion.div
                key="name"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="max-w-xl"
              >
                <h1 className="font-serif text-4xl text-white mb-3">Name your profile</h1>
                <p className="text-soft-silver/60 mb-8 leading-relaxed">
                  You can create multiple profiles — for yourself, or to explore someone else&apos;s
                  profile with their permission.
                </p>

                <div className="glass-card p-8">
                  <label className="block text-xs text-soft-silver/60 mb-2">Profile Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="cosmic-input text-lg mb-6"
                    placeholder="My Profile"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && setStep('lenses')}
                  />
                  <button
                    onClick={() => setStep('lenses')}
                    className="btn-gold w-full"
                  >
                    Choose Your Lenses →
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'lenses' && (
              <motion.div
                key="lenses"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h1 className="font-serif text-4xl text-white mb-1">Choose your lenses</h1>
                    <p className="text-soft-silver/60 text-sm">
                      {isPremium ? 'All 10 lenses available — select as many as you like' : 'Select up to 4 lenses (free tier)'}
                    </p>
                  </div>

                  {/* Depth meter */}
                  <div className="glass-card px-5 py-3 min-w-[180px]">
                    <p className="text-xs text-soft-silver/50 mb-2">Profile Depth</p>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-1">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-celestial-gold to-yellow-300"
                        animate={{ width: `${profileDepth}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <p className="text-xs text-celestial-gold">{selectedLenses.length}/{lensLimit} selected</p>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-900/20 border border-red-500/30 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {LENS_CARDS.map((lens) => {
                    const isSelected = selectedLenses.includes(lens.type)
                    const isLocked = lens.phase > 1 && !isPremium
                    const isDisabled = !isSelected && selectedLenses.length >= lensLimit

                    return (
                      <motion.button
                        key={lens.type}
                        onClick={() => toggleLens(lens.type, lens.phase)}
                        disabled={isLocked || (isDisabled && !isSelected)}
                        whileHover={!isLocked ? { scale: 1.01 } : {}}
                        whileTap={!isLocked ? { scale: 0.99 } : {}}
                        className={cn(
                          'glass-card p-5 text-left transition-all duration-200 relative overflow-hidden',
                          isSelected && 'border-celestial-gold/60 bg-celestial-gold/5',
                          isLocked && 'opacity-50 cursor-not-allowed',
                          isDisabled && !isSelected && 'opacity-40 cursor-not-allowed',
                          !isLocked && !isDisabled && 'hover:border-celestial-gold/30 cursor-pointer'
                        )}
                      >
                        {isLocked && (
                          <div className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full bg-celestial-gold/10 text-celestial-gold/50 border border-celestial-gold/20">
                            Premium
                          </div>
                        )}
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-celestial-gold flex items-center justify-center">
                            <span className="text-midnight text-xs font-bold">✓</span>
                          </div>
                        )}

                        <div className="text-2xl mb-3">{lens.icon}</div>
                        <h3 className={cn('font-serif text-lg mb-1', isSelected ? 'text-celestial-gold' : 'text-white')}>
                          {lens.name}
                        </h3>
                        {lens.hebrewName && (
                          <p className="text-xs text-celestial-gold/50 mb-2">{lens.hebrewName}</p>
                        )}
                        <p className="text-soft-silver/50 text-xs leading-relaxed">{lens.description}</p>
                        <div className="mt-3">
                          <span className={cn(
                            'inline-block text-xs px-2 py-0.5 rounded-full border',
                            lens.tier === 1 ? 'border-celestial-gold/30 text-celestial-gold/60' :
                            lens.tier === 2 ? 'border-blue-400/30 text-blue-300/60' :
                            'border-purple-400/30 text-purple-300/60'
                          )}>
                            {lens.tierLabel}
                          </span>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setStep('name')} className="btn-outline-gold px-6 py-3">
                    ← Back
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={loading || selectedLenses.length === 0}
                    className="btn-gold px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none"
                  >
                    {loading ? 'Creating...' : `Begin with ${selectedLenses.length} lens${selectedLenses.length !== 1 ? 'es' : ''} →`}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
