'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface Profile {
  id: string
  profile_name: string
}

interface CouplesReport {
  compatibility_score: number
  compatibility_summary: string
  relationship_archetype: string
  core_alignments: string[]
  growth_dynamics: Array<{ direction: string; description: string }>
  communication: {
    flow_areas: string[]
    friction_areas: string[]
    repair_style: string
  }
  intimacy_style: string
  long_term: {
    deepens: string[]
    requires_attention: string[]
  }
  strengths: string[]
  challenges: Array<{ pattern: string; description: string; navigation: string }>
  closing_reflection: string
}

export default function CouplesClient({ myProfiles }: { myProfiles: Profile[] }) {
  const [profileA, setProfileA] = useState<string>('')
  const [profileB, setProfileB] = useState<string>('')
  const [inviteToken, setInviteToken] = useState<string>('')
  const [useInvite, setUseInvite] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<CouplesReport | null>(null)
  const [names, setNames] = useState<{ a: string; b: string } | null>(null)

  const handleGenerate = async () => {
    if (!profileA || (!profileB && !useInvite)) return
    setLoading(true)
    setError(null)
    setReport(null)
    try {
      const body: Record<string, string> = { profile_a_id: profileA }
      if (useInvite) {
        // profile_b_id would be from the invite; we'll handle this via a token lookup
        // For simplicity here, require both profile_b and token for cross-user
        body.invite_token = inviteToken
      } else {
        body.profile_b_id = profileB
      }
      const res = await fetch('/api/couples', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setReport(data.report)
      setNames(data.names)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (report && names) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Hero */}
        <div className="glass-card p-8 text-center border-celestial-gold/30">
          <p className="text-xs tracking-widest text-celestial-gold/60 uppercase mb-2">Couples Analysis</p>
          <h2 className="font-serif text-3xl text-white mb-1">{report.relationship_archetype}</h2>
          <div className="flex items-center justify-center gap-3 my-3">
            <span className="text-soft-silver/60 text-sm">{names.a}</span>
            <span className="text-celestial-gold/40">◉</span>
            <span className="text-soft-silver/60 text-sm">{names.b}</span>
          </div>
          {typeof report.compatibility_score === 'number' && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-celestial-gold/10 border border-celestial-gold/25 mt-1">
              <span className="font-serif text-celestial-gold text-2xl">{report.compatibility_score}%</span>
              <span className="text-soft-silver/50 text-xs">compatibility</span>
            </div>
          )}
          {report.compatibility_summary && (
            <p className="text-soft-silver/60 text-sm mt-4 max-w-lg mx-auto leading-relaxed">{report.compatibility_summary}</p>
          )}
        </div>

        {/* Core alignments + strengths */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {report.core_alignments?.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="font-serif text-white text-lg mb-3">Core Alignments</h3>
              <ul className="space-y-2">
                {report.core_alignments.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-soft-silver/60 text-xs">
                    <span className="text-celestial-gold mt-0.5">✦</span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {report.strengths?.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="font-serif text-white text-lg mb-3">Relationship Strengths</h3>
              <ul className="space-y-2">
                {report.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-soft-silver/60 text-xs">
                    <span className="text-celestial-gold mt-0.5">✦</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Communication */}
        {report.communication && (
          <div className="glass-card p-6">
            <h3 className="font-serif text-white text-lg mb-4">Communication</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-4">
              {report.communication.flow_areas?.length > 0 && (
                <div>
                  <p className="text-green-400/70 text-xs uppercase tracking-wider mb-2">Where You Flow</p>
                  <ul className="space-y-1.5">
                    {report.communication.flow_areas.map((f, i) => (
                      <li key={i} className="text-soft-silver/60 text-xs flex items-start gap-2">
                        <span className="text-green-400/50">◎</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {report.communication.friction_areas?.length > 0 && (
                <div>
                  <p className="text-orange-400/70 text-xs uppercase tracking-wider mb-2">Friction Points</p>
                  <ul className="space-y-1.5">
                    {report.communication.friction_areas.map((f, i) => (
                      <li key={i} className="text-soft-silver/60 text-xs flex items-start gap-2">
                        <span className="text-orange-400/50">◎</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {report.communication.repair_style && (
              <div>
                <p className="text-soft-silver/40 text-[10px] uppercase tracking-wider mb-1">Repair Style</p>
                <p className="text-soft-silver/60 text-xs">{report.communication.repair_style}</p>
              </div>
            )}
          </div>
        )}

        {/* Growth dynamics */}
        {report.growth_dynamics?.length > 0 && (
          <div>
            <h3 className="font-serif text-white text-xl mb-4">Growth Dynamics</h3>
            <div className="space-y-3">
              {report.growth_dynamics.map((g, i) => (
                <div key={i} className="glass-card p-4">
                  <p className="text-celestial-gold/60 text-[10px] uppercase tracking-wider mb-1">
                    {g.direction === 'A_challenges_B' ? `${names.a} challenges ${names.b}` :
                     g.direction === 'B_challenges_A' ? `${names.b} challenges ${names.a}` : 'Mutual growth'}
                  </p>
                  <p className="text-soft-silver/60 text-xs leading-relaxed">{g.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Intimacy + long term */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {report.intimacy_style && (
            <div className="glass-card p-5">
              <h3 className="font-serif text-white text-lg mb-2">Intimacy Style</h3>
              <p className="text-soft-silver/60 text-xs leading-relaxed">{report.intimacy_style}</p>
            </div>
          )}
          {report.long_term && (
            <div className="glass-card p-5">
              <h3 className="font-serif text-white text-lg mb-3">Long Term</h3>
              {report.long_term.deepens?.length > 0 && (
                <div className="mb-3">
                  <p className="text-celestial-gold/60 text-[10px] uppercase tracking-wider mb-1.5">Deepens with time</p>
                  <ul className="space-y-1">
                    {report.long_term.deepens.map((d, i) => (
                      <li key={i} className="text-soft-silver/60 text-xs flex items-start gap-2">
                        <span className="text-celestial-gold/40">↑</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {report.long_term.requires_attention?.length > 0 && (
                <div>
                  <p className="text-orange-400/60 text-[10px] uppercase tracking-wider mb-1.5">Needs ongoing attention</p>
                  <ul className="space-y-1">
                    {report.long_term.requires_attention.map((r, i) => (
                      <li key={i} className="text-soft-silver/60 text-xs flex items-start gap-2">
                        <span className="text-orange-400/40">↻</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Challenges */}
        {report.challenges?.length > 0 && (
          <div>
            <h3 className="font-serif text-white text-xl mb-4">Challenges to Navigate</h3>
            <div className="space-y-3">
              {report.challenges.map((c, i) => (
                <div key={i} className="glass-card p-5">
                  <p className="text-orange-400/80 text-sm font-medium mb-1">{c.pattern}</p>
                  <p className="text-soft-silver/60 text-xs mb-2 leading-relaxed">{c.description}</p>
                  {c.navigation && (
                    <p className="text-celestial-gold/60 text-xs"><span className="text-celestial-gold/40">→</span> {c.navigation}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Closing */}
        {report.closing_reflection && (
          <div className="glass-card p-7 border-celestial-gold/20">
            <p className="text-xs tracking-widest text-celestial-gold/50 uppercase mb-3">Closing Reflection</p>
            <p className="text-soft-silver/70 leading-relaxed text-sm">{report.closing_reflection}</p>
          </div>
        )}

        <div className="flex gap-4 mt-2">
          <button onClick={() => { setReport(null); setNames(null) }} className="btn-outline-gold px-5 py-2.5 rounded-lg text-sm">
            ← New Analysis
          </button>
          <Link href="/dashboard" className="text-sm text-soft-silver/40 hover:text-soft-silver/70 transition-colors self-center">
            Dashboard
          </Link>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="glass-card p-6">
        <h2 className="font-serif text-white text-lg mb-4">Select Two Profiles</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
          <div>
            <label className="block text-soft-silver/50 text-xs uppercase tracking-wider mb-2">Profile A (you)</label>
            <select
              value={profileA}
              onChange={(e) => setProfileA(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-celestial-gold/40"
            >
              <option value="" className="bg-midnight">Select a profile</option>
              {myProfiles.map((p) => (
                <option key={p.id} value={p.id} className="bg-midnight">{p.profile_name}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-soft-silver/50 text-xs uppercase tracking-wider">Profile B</label>
              {myProfiles.length > 1 && (
                <button
                  onClick={() => setUseInvite((v) => !v)}
                  className="text-xs text-celestial-gold/60 hover:text-celestial-gold underline"
                >
                  {useInvite ? 'Use my profile' : 'Use partner invite'}
                </button>
              )}
            </div>
            {!useInvite ? (
              <select
                value={profileB}
                onChange={(e) => setProfileB(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-celestial-gold/40"
              >
                <option value="" className="bg-midnight">Select a profile</option>
                {myProfiles.filter((p) => p.id !== profileA).map((p) => (
                  <option key={p.id} value={p.id} className="bg-midnight">{p.profile_name}</option>
                ))}
              </select>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Partner's profile ID"
                  value={profileB}
                  onChange={(e) => setProfileB(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-celestial-gold/40"
                />
                <input
                  type="text"
                  placeholder="Invite token"
                  value={inviteToken}
                  onChange={(e) => setInviteToken(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-celestial-gold/40"
                />
                <p className="text-soft-silver/30 text-xs">
                  Have your partner share their profile ID and generate a comparison invite from{' '}
                  <Link href="/compare" className="text-celestial-gold/60 underline">the compare page</Link>.
                </p>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading || !profileA || (!profileB)}
          className="btn-gold px-8 py-3 rounded-lg text-sm font-medium disabled:opacity-40"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-midnight/30 border-t-midnight rounded-full animate-spin" />
              Generating couples analysis...
            </span>
          ) : 'Generate Couples Analysis →'}
        </button>
      </div>
    </div>
  )
}
