'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface Profile { id: string; profile_name: string }
interface Comparison { id: string; comparison_type: string; created_at: string }

interface CompareClientProps {
  myProfiles: Profile[]
  recentComparisons: Comparison[]
}

const COMPARISON_TYPES = [
  { id: 'compatibility', label: 'Romantic Compatibility', icon: '◉' },
  { id: 'business', label: 'Business Partner', icon: '◈' },
  { id: 'team', label: 'Team Dynamics', icon: '⬡' },
  { id: 'parent_child', label: 'Parent & Child', icon: '∿' },
  { id: 'friendship', label: 'Friendship Deepening', icon: '✦' },
]

export default function CompareClient({ myProfiles, recentComparisons }: CompareClientProps) {
  const router = useRouter()
  const [selectedProfile, setSelectedProfile] = useState('')
  const [comparisonType, setComparisonType] = useState('compatibility')
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleGenerateInvite = async () => {
    if (!selectedProfile) { setError('Select a profile first'); return }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/compare/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_id: selectedProfile }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate invite')
      setInviteUrl(data.invite_url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }

  const copyInvite = async () => {
    if (!inviteUrl) return
    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-8">
      {/* Create comparison */}
      <div className="glass-card p-6">
        <h2 className="font-serif text-xl text-white mb-5">Start a New Comparison</h2>

        <div className="space-y-5">
          <div>
            <label className="block text-soft-silver/60 text-sm mb-2">Your Profile</label>
            <select
              value={selectedProfile}
              onChange={(e) => setSelectedProfile(e.target.value)}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-celestial-gold/60"
            >
              <option value="">Select your profile...</option>
              {myProfiles.map((p) => (
                <option key={p.id} value={p.id}>{p.profile_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-soft-silver/60 text-sm mb-2">Comparison Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COMPARISON_TYPES.map((ct) => (
                <button
                  key={ct.id}
                  onClick={() => setComparisonType(ct.id)}
                  className={`p-3 rounded-lg border text-left text-sm transition-all ${
                    comparisonType === ct.id
                      ? 'border-celestial-gold/50 bg-celestial-gold/10 text-white'
                      : 'border-white/10 text-soft-silver/60 hover:border-white/20'
                  }`}
                >
                  <span className="block text-lg mb-1">{ct.icon}</span>
                  {ct.label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={handleGenerateInvite}
            disabled={!selectedProfile || loading}
            className="btn-gold px-6 py-3 rounded-lg disabled:opacity-40"
          >
            {loading ? 'Generating invite...' : 'Generate Invite Link'}
          </button>
        </div>

        {inviteUrl && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 p-4 bg-celestial-gold/10 border border-celestial-gold/30 rounded-xl"
          >
            <p className="text-soft-silver/60 text-xs mb-2">Share this link — valid for 7 days:</p>
            <div className="flex gap-3">
              <code className="flex-1 text-celestial-gold text-xs break-all bg-black/20 rounded px-3 py-2">
                {inviteUrl}
              </code>
              <button onClick={copyInvite} className="btn-outline-gold px-3 py-2 rounded-lg text-xs flex-shrink-0">
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Recent comparisons */}
      {recentComparisons.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="font-serif text-xl text-white mb-4">Recent Comparisons</h2>
          <div className="space-y-3">
            {recentComparisons.map((c) => (
              <button
                key={c.id}
                onClick={() => router.push(`/compare/${c.id}`)}
                className="w-full flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:border-celestial-gold/30 transition-all text-left"
              >
                <div>
                  <p className="text-white text-sm capitalize">{c.comparison_type} Comparison</p>
                  <p className="text-soft-silver/40 text-xs">{new Date(c.created_at).toLocaleDateString()}</p>
                </div>
                <span className="text-celestial-gold text-sm">View →</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
