'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Profile { id: string; profile_name: string }

interface AcceptInviteClientProps {
  token: string
  inviterProfileName: string
  inviterProfileId: string
  myProfiles: Profile[]
}

export default function AcceptInviteClient({ inviterProfileName, inviterProfileId, myProfiles }: AcceptInviteClientProps) {
  const router = useRouter()
  const [selectedProfile, setSelectedProfile] = useState('')
  const [comparisonType, setComparisonType] = useState('compatibility')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCompare = async () => {
    if (!selectedProfile) { setError('Select a profile to compare.'); return }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/compare/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_a_id: inviterProfileId,
          profile_b_id: selectedProfile,
          comparison_type: comparisonType,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Comparison failed')
      router.push(`/compare/${data.comparison.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-8 text-left"
    >
      <div className="text-center mb-6">
        <div className="text-4xl mb-3">✦</div>
        <h1 className="font-serif text-3xl text-white mb-2">You&apos;ve Been Invited</h1>
        <p className="text-soft-silver/60">
          <span className="text-celestial-gold">{inviterProfileName}</span> wants to compare personality profiles with you.
        </p>
      </div>

      {myProfiles.length === 0 ? (
        <div className="text-center">
          <p className="text-soft-silver/60 mb-5">You need to create a profile first to compare.</p>
          <Link href="/profile/new" className="btn-gold px-6 py-3 rounded-lg">
            Create My Profile →
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          <div>
            <label className="block text-soft-silver/60 text-sm mb-2">Select your profile to compare</label>
            <select
              value={selectedProfile}
              onChange={(e) => setSelectedProfile(e.target.value)}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-celestial-gold/60"
            >
              <option value="">Choose a profile...</option>
              {myProfiles.map((p) => (
                <option key={p.id} value={p.id}>{p.profile_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-soft-silver/60 text-sm mb-2">Comparison focus</label>
            <select
              value={comparisonType}
              onChange={(e) => setComparisonType(e.target.value)}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-celestial-gold/60"
            >
              <option value="compatibility">Romantic Compatibility</option>
              <option value="business">Business Partner</option>
              <option value="team">Team Dynamics</option>
              <option value="parent_child">Parent & Child</option>
              <option value="friendship">Friendship Deepening</option>
            </select>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={handleCompare}
            disabled={!selectedProfile || loading}
            className="btn-gold w-full py-3 rounded-lg disabled:opacity-40"
          >
            {loading ? 'Generating comparison...' : 'Generate Our Comparison Report →'}
          </button>
        </div>
      )}
    </motion.div>
  )
}
