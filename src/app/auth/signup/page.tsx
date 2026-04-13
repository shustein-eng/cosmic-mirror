'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Starfield from '@/components/stars/Starfield'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="relative min-h-screen cosmic-bg flex items-center justify-center px-6">
        <Starfield />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 glass-card p-10 max-w-md w-full text-center"
        >
          <div className="text-5xl mb-4">✦</div>
          <h2 className="font-serif text-3xl text-white mb-3">Check your email</h2>
          <p className="text-soft-silver/70 text-sm leading-relaxed">
            We sent a confirmation link to <strong className="text-celestial-gold">{email}</strong>.
            Click it to activate your account and begin your journey.
          </p>
          <Link href="/auth/login" className="inline-block mt-6 text-sm text-celestial-gold hover:opacity-80 transition-opacity">
            ← Back to Sign In
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen cosmic-bg flex items-center justify-center px-6">
      <Starfield />
      <div className="relative z-10 w-full flex justify-center">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glass-card p-8"
          >
            <div className="text-center mb-8">
              <Link href="/" className="inline-block">
                <h1 className="font-serif text-3xl gold-text mb-1">Cosmic Mirror</h1>
              </Link>
              <p className="text-soft-silver/50 text-sm">Begin your journey of self-discovery</p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-900/20 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleGoogleSignup}
              disabled={loading}
              className="btn-outline-gold w-full flex items-center justify-center gap-3 mb-6 disabled:opacity-50"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div className="mb-6 flex items-center gap-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-soft-silver/40">or with email</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <form onSubmit={handleSignup} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs text-soft-silver/60 mb-1.5">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="cosmic-input"
                  placeholder="How shall we call you?"
                  required
                  autoComplete="name"
                />
              </div>
              <div>
                <label className="block text-xs text-soft-silver/60 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="cosmic-input"
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="block text-xs text-soft-silver/60 mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="cosmic-input"
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-gold w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Create Free Account'}
              </button>
            </form>

            <p className="text-center text-xs text-soft-silver/40 mt-4 leading-relaxed">
              By creating an account, you agree to our{' '}
              <Link href="/about" className="text-celestial-gold/60 hover:text-celestial-gold underline">
                methodology & privacy policy
              </Link>
            </p>

            <p className="text-center text-sm text-soft-silver/50 mt-4">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-celestial-gold hover:text-celestial-gold/80 transition-colors">
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
