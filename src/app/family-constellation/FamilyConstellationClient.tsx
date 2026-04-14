'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface Profile {
  id: string
  profile_name: string
}

interface ConstellationResult {
  family_archetype: string
  family_archetype_description: string
  member_roles: Array<{
    profile_name: string
    role: string
    role_description: string
    gift_to_family: string
  }>
  dynamic_pairs: Array<{
    member_a: string
    member_b: string
    dynamic_type: string
    description: string
  }>
  family_strengths: string[]
  family_tensions: Array<{
    tension: string
    description: string
  }>
  growth_edges: Array<{
    profile_name: string
    needs_from_family: string
    offers_to_family: string
  }>
  closing_reflection: string
}

const DYNAMIC_LABELS: Record<string, string> = {
  complementary: 'Complementary',
  mirroring: 'Mirroring',
  challenging: 'Challenging',
  energizing: 'Energizing',
  stabilizing: 'Stabilizing',
}

const DYNAMIC_COLORS: Record<string, string> = {
  complementary: 'text-celestial-gold border-celestial-gold/30',
  mirroring: 'text-blue-300 border-blue-300/30',
  challenging: 'text-orange-400 border-orange-400/30',
  energizing: 'text-green-400 border-green-400/30',
  stabilizing: 'text-purple-400 border-purple-400/30',
}

export default function FamilyConstellationClient({ profiles }: { profiles: Profile[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ConstellationResult | null>(null)

  const toggleProfile = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : prev.length < 8 ? [...prev, id] : prev
    )
  }

  const handleGenerate = async () => {
    if (selectedIds.length < 2) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/family-constellation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_ids: selectedIds }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setResult(data.constellation)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {!result && (
        <>
          <div className="glass-card p-6 mb-6">
            <h2 className="font-serif text-white text-lg mb-1">Select Family Members</h2>
            <p className="text-soft-silver/50 text-xs mb-4">
              Choose 2–8 profiles. Each profile should represent a different family member with at least one analyzed lens.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {profiles.map((p) => {
                const selected = selectedIds.includes(p.id)
                return (
                  <button
                    key={p.id}
                    onClick={() => toggleProfile(p.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selected
                        ? 'border-celestial-gold/60 bg-celestial-gold/5 text-white'
                        : 'border-white/10 text-soft-silver/60 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-serif flex-shrink-0 ${selected ? 'bg-celestial-gold text-midnight' : 'bg-white/5 text-soft-silver/40'}`}>
                        {selected ? '✓' : p.profile_name[0]}
                      </div>
                      <p className="font-medium text-sm truncate">{p.profile_name}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center gap-4">
            <button
              onClick={handleGenerate}
              disabled={selectedIds.length < 2 || loading}
              className="btn-gold px-8 py-3 rounded-lg text-sm font-medium disabled:opacity-40"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-midnight/30 border-t-midnight rounded-full animate-spin" />
                  Analyzing constellation...
                </span>
              ) : `Analyze ${selectedIds.length < 2 ? '(select 2+)' : selectedIds.length + ' profiles'}`}
            </button>
            {selectedIds.length > 0 && (
              <button onClick={() => setSelectedIds([])} className="text-sm text-soft-silver/40 hover:text-soft-silver/70">
                Clear
              </button>
            )}
          </div>
        </>
      )}

      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Family archetype hero */}
          <div className="glass-card p-8 text-center border-celestial-gold/30">
            <p className="text-xs tracking-widest text-celestial-gold/60 uppercase mb-2">Family Archetype</p>
            <h2 className="font-serif text-3xl text-white mb-3">{result.family_archetype}</h2>
            <p className="text-soft-silver/60 max-w-lg mx-auto text-sm leading-relaxed">{result.family_archetype_description}</p>
          </div>

          {/* Member roles */}
          <div>
            <h3 className="font-serif text-xl text-white mb-4">Family Roles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {result.member_roles?.map((member, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="glass-card p-5"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-celestial-gold/10 border border-celestial-gold/25 flex items-center justify-center text-celestial-gold font-serif text-sm">
                      {member.profile_name?.[0]}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{member.profile_name}</p>
                      <p className="text-celestial-gold/70 text-xs">{member.role}</p>
                    </div>
                  </div>
                  <p className="text-soft-silver/60 text-xs mb-2 leading-relaxed">{member.role_description}</p>
                  <p className="text-soft-silver/40 text-xs"><span className="text-celestial-gold/50">Gift:</span> {member.gift_to_family}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Dynamic pairs */}
          {result.dynamic_pairs?.length > 0 && (
            <div>
              <h3 className="font-serif text-xl text-white mb-4">Relational Dynamics</h3>
              <div className="space-y-3">
                {result.dynamic_pairs.map((pair, i) => {
                  const colorClass = DYNAMIC_COLORS[pair.dynamic_type] || 'text-soft-silver/60 border-white/10'
                  return (
                    <div key={i} className="glass-card p-5">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-white text-sm font-medium">{pair.member_a}</span>
                        <span className="text-soft-silver/30">↔</span>
                        <span className="text-white text-sm font-medium">{pair.member_b}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${colorClass}`}>
                          {DYNAMIC_LABELS[pair.dynamic_type] || pair.dynamic_type}
                        </span>
                      </div>
                      <p className="text-soft-silver/60 text-xs leading-relaxed">{pair.description}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Strengths + tensions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {result.family_strengths?.length > 0 && (
              <div className="glass-card p-5">
                <h3 className="font-serif text-white text-lg mb-3">Family Strengths</h3>
                <ul className="space-y-2">
                  {result.family_strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-soft-silver/60 text-xs">
                      <span className="text-celestial-gold mt-0.5">✦</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.family_tensions?.length > 0 && (
              <div className="glass-card p-5">
                <h3 className="font-serif text-white text-lg mb-3">Family Tensions</h3>
                <div className="space-y-3">
                  {result.family_tensions.map((t, i) => (
                    <div key={i}>
                      <p className="text-orange-400/80 text-xs font-medium mb-1">{t.tension}</p>
                      <p className="text-soft-silver/50 text-xs leading-relaxed">{t.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Growth edges */}
          {result.growth_edges?.length > 0 && (
            <div>
              <h3 className="font-serif text-xl text-white mb-4">Growth Edges</h3>
              <div className="space-y-3">
                {result.growth_edges.map((g, i) => (
                  <div key={i} className="glass-card p-5">
                    <p className="text-white text-sm font-medium mb-2">{g.profile_name}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-soft-silver/40 text-[10px] uppercase tracking-wider mb-1">Needs from family</p>
                        <p className="text-soft-silver/60 text-xs">{g.needs_from_family}</p>
                      </div>
                      <div>
                        <p className="text-soft-silver/40 text-[10px] uppercase tracking-wider mb-1">Offers to family</p>
                        <p className="text-soft-silver/60 text-xs">{g.offers_to_family}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Closing reflection */}
          {result.closing_reflection && (
            <div className="glass-card p-7 border-celestial-gold/20">
              <p className="text-xs tracking-widest text-celestial-gold/50 uppercase mb-3">Closing Reflection</p>
              <p className="text-soft-silver/70 leading-relaxed text-sm">{result.closing_reflection}</p>
            </div>
          )}

          <div className="flex gap-4 mt-2">
            <button
              onClick={() => setResult(null)}
              className="btn-outline-gold px-5 py-2.5 rounded-lg text-sm"
            >
              ← Regenerate
            </button>
            <Link href="/dashboard" className="text-sm text-soft-silver/40 hover:text-soft-silver/70 transition-colors self-center">
              Dashboard
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  )
}
