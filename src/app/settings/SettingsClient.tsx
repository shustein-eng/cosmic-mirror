'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface SettingsClientProps {
  userEmail: string
  displayName: string
  subscriptionTier: string
  hasStripeCustomer: boolean
}

export default function SettingsClient({ userEmail, displayName, subscriptionTier, hasStripeCustomer }: SettingsClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [name, setName] = useState(displayName)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSaveName = async () => {
    setSaving(true)
    setError(null)
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ display_name: name })
        .eq('id', (await supabase.auth.getUser()).data.user?.id || '')
      if (updateError) throw updateError
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleManageBilling = async () => {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else setError(data.error || 'Could not open billing portal')
    } catch {
      setError('Billing portal unavailable')
    } finally {
      setPortalLoading(false)
    }
  }

  const tierBadge = {
    free: { label: 'Free', color: 'text-soft-silver border-white/20' },
    premium: { label: 'Premium ✦', color: 'text-celestial-gold border-celestial-gold/40' },
    lifetime: { label: 'Lifetime ✦', color: 'text-celestial-gold border-celestial-gold/40' },
  }[subscriptionTier] || { label: 'Free', color: 'text-soft-silver border-white/20' }

  return (
    <div className="space-y-6">
      {/* Account */}
      <div className="glass-card p-6">
        <h2 className="font-serif text-xl text-white mb-5">Account</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-soft-silver/60 text-sm mb-2">Email</label>
            <p className="text-white/60 bg-white/5 rounded-lg px-4 py-3 text-sm">{userEmail}</p>
          </div>
          <div>
            <label className="block text-soft-silver/60 text-sm mb-2">Display Name</label>
            <div className="flex gap-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 bg-white/5 border border-white/20 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-celestial-gold/60 transition-colors"
                placeholder="Your name"
              />
              <button
                onClick={handleSaveName}
                disabled={saving}
                className="btn-outline-gold px-4 py-2.5 rounded-lg text-sm disabled:opacity-50"
              >
                {saved ? '✓ Saved' : saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
        {error && <p className="mt-3 text-red-400 text-sm">{error}</p>}
      </div>

      {/* Subscription */}
      <div className="glass-card p-6">
        <h2 className="font-serif text-xl text-white mb-5">Subscription</h2>
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-soft-silver/60 text-sm mb-1">Current Plan</p>
            <span className={`text-sm px-3 py-1 rounded-full border ${tierBadge.color}`}>
              {tierBadge.label}
            </span>
          </div>
          {subscriptionTier === 'free' && (
            <Link href="/pricing" className="btn-gold px-5 py-2 rounded-lg text-sm">
              Upgrade →
            </Link>
          )}
        </div>
        {subscriptionTier !== 'free' && hasStripeCustomer && (
          <button
            onClick={handleManageBilling}
            disabled={portalLoading}
            className="btn-outline-gold px-5 py-2 rounded-lg text-sm disabled:opacity-50"
          >
            {portalLoading ? 'Opening...' : 'Manage Billing & Subscription'}
          </button>
        )}
      </div>

      {/* Sign out */}
      <div className="glass-card p-6">
        <h2 className="font-serif text-xl text-white mb-4">Account Actions</h2>
        <motion.button
          onClick={handleSignOut}
          className="btn-outline-gold px-5 py-2.5 rounded-lg text-sm text-red-400 border-red-400/30 hover:bg-red-400/5"
          whileHover={{ scale: 1.01 }}
        >
          Sign Out
        </motion.button>
      </div>
    </div>
  )
}
