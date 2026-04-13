'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Starfield from '@/components/stars/Starfield'
import AppNav from '@/components/layout/AppNav'
import { LENS_CARDS } from '@/types'
import type { Profile } from '@/types'
import { formatDate } from '@/lib/utils'

interface PersonalityProfileWithData {
  id: string
  profile_name: string
  is_primary: boolean
  created_at: string
  lens_inputs: Array<{ lens_type: string; analysis_result: unknown }>
  reports: Array<{ id: string; report_type: string; created_at: string }>
}

interface DashboardClientProps {
  profile: Profile | null
  personalityProfiles: PersonalityProfileWithData[]
}

export default function DashboardClient({ profile, personalityProfiles }: DashboardClientProps) {
  const displayName = profile?.display_name || 'Cosmic Explorer'
  const isFirstTime = personalityProfiles.length === 0

  return (
    <div className="relative min-h-screen cosmic-bg">
      <Starfield />
      <div className="relative z-10">
        <AppNav userName={displayName} />

        <main className="max-w-7xl mx-auto px-6 py-10">
          {/* Welcome header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <p className="text-soft-silver/50 text-sm mb-1">Welcome back</p>
            <h1 className="font-serif text-4xl text-white">
              {displayName}
            </h1>
            <p className="text-soft-silver/60 text-sm mt-1">
              {profile?.subscription_tier === 'free'
                ? 'Free tier · Up to 4 lenses per profile'
                : `${profile?.subscription_tier} · All lenses unlocked`}
            </p>
          </motion.div>

          {isFirstTime ? (
            /* First-time experience */
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center text-center py-16"
            >
              <div className="text-6xl mb-6 animate-float">✦</div>
              <h2 className="font-serif text-3xl text-white mb-4">
                Your cosmic journey begins
              </h2>
              <p className="text-soft-silver/60 max-w-md mb-8 leading-relaxed">
                Create your first personality profile by selecting the lenses you&apos;d like to
                explore. Each lens illuminates a different dimension of who you are.
              </p>
              <Link href="/profile/new" className="btn-gold text-lg px-10 py-4 rounded-lg">
                Build Your First Profile
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profiles list */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-serif text-2xl text-white">Your Profiles</h2>
                  <Link href="/profile/new" className="btn-gold text-sm px-4 py-2 rounded-lg">
                    + New Profile
                  </Link>
                </div>

                <div className="flex flex-col gap-4">
                  {personalityProfiles.map((pp, i) => {
                    const completedLenses = pp.lens_inputs.filter((l) => l.analysis_result).length
                    const totalLenses = pp.lens_inputs.length
                    const hasReport = pp.reports.length > 0

                    return (
                      <motion.div
                        key={pp.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card p-6"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-serif text-xl text-white">{pp.profile_name}</h3>
                              {pp.is_primary && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-celestial-gold/20 text-celestial-gold">
                                  Primary
                                </span>
                              )}
                            </div>
                            <p className="text-soft-silver/50 text-xs">
                              Created {formatDate(pp.created_at)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-soft-silver/60 text-xs mb-1">
                              {completedLenses}/{totalLenses} lenses analyzed
                            </p>
                            {hasReport && (
                              <span className="text-xs text-celestial-gold">
                                {pp.reports.length} report{pp.reports.length !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Lens chips */}
                        {pp.lens_inputs.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            {pp.lens_inputs.map((li) => {
                              const card = LENS_CARDS.find((c) => c.type === li.lens_type)
                              return (
                                <span
                                  key={li.lens_type}
                                  className={`text-xs px-2 py-1 rounded-full border ${
                                    li.analysis_result
                                      ? 'border-celestial-gold/30 text-celestial-gold/70 bg-celestial-gold/5'
                                      : 'border-white/10 text-soft-silver/40'
                                  }`}
                                >
                                  {card?.icon} {card?.name || li.lens_type}
                                </span>
                              )
                            })}
                          </div>
                        )}

                        <div className="flex gap-3 mt-5">
                          <Link
                            href={`/profile/${pp.id}/input`}
                            className="btn-outline-gold text-xs px-4 py-2 rounded-lg"
                          >
                            {totalLenses === 0 ? 'Start Inputs' : 'Continue'}
                          </Link>
                          {hasReport && (
                            <Link
                              href={`/profile/${pp.id}/report/full_cosmic`}
                              className="btn-gold text-xs px-4 py-2 rounded-lg"
                            >
                              View Report
                            </Link>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* Right sidebar — quick stats */}
              <div>
                <h2 className="font-serif text-2xl text-white mb-5">Quick Stats</h2>
                <div className="flex flex-col gap-4">
                  <div className="glass-card p-5">
                    <p className="text-soft-silver/50 text-xs mb-1">Profiles Created</p>
                    <p className="font-serif text-4xl gold-text">{personalityProfiles.length}</p>
                  </div>
                  <div className="glass-card p-5">
                    <p className="text-soft-silver/50 text-xs mb-1">Total Reports</p>
                    <p className="font-serif text-4xl gold-text">
                      {personalityProfiles.reduce((acc, pp) => acc + pp.reports.length, 0)}
                    </p>
                  </div>
                  <div className="glass-card p-5">
                    <p className="text-soft-silver/50 text-xs mb-2">Your Tier</p>
                    <p className="text-celestial-gold capitalize font-medium">
                      {profile?.subscription_tier || 'free'}
                    </p>
                    {profile?.subscription_tier === 'free' && (
                      <Link href="/pricing" className="text-xs text-soft-silver/40 hover:text-celestial-gold transition-colors mt-2 block">
                        Upgrade to Premium →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
