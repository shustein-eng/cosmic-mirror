import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Starfield from '@/components/stars/Starfield'
import AppNav from '@/components/layout/AppNav'
import CouplesClient from './CouplesClient'

export default async function CouplesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: userProfile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single()

  const isPremium = userProfile?.subscription_tier !== 'free'

  const { data: profiles } = await supabase
    .from('personality_profiles')
    .select('id, profile_name')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  return (
    <div className="relative min-h-screen cosmic-bg">
      <Starfield />
      <div className="relative z-10">
        <AppNav />
        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="mb-8">
            <p className="text-xs tracking-widest text-celestial-gold/60 uppercase mb-2">Premium · Couples</p>
            <h1 className="font-serif text-4xl text-white mb-2">Couples Analysis</h1>
            <p className="text-soft-silver/50 text-sm max-w-xl">
              A deeper relational portrait than compatibility scoring alone — discover communication patterns, growth dynamics, intimacy style, and long-term forecast.
            </p>
          </div>

          {!isPremium ? (
            <div className="glass-card p-10 text-center border-celestial-gold/20">
              <div className="text-4xl mb-4">◉</div>
              <h2 className="font-serif text-2xl text-white mb-3">Premium Feature</h2>
              <p className="text-soft-silver/60 mb-6 max-w-md mx-auto">
                Deep couples analysis requires a Premium subscription.
              </p>
              <Link href="/pricing" className="btn-gold px-8 py-3 rounded-lg">
                Upgrade to Premium →
              </Link>
            </div>
          ) : !profiles || profiles.length < 1 ? (
            <div className="glass-card p-10 text-center">
              <p className="text-soft-silver/50 text-sm mb-5">
                Create at least one profile and analyze some lenses before generating a couples report.
              </p>
              <Link href="/dashboard" className="btn-outline-gold px-6 py-2.5 rounded-lg text-sm">
                → Create Profiles
              </Link>
            </div>
          ) : (
            <CouplesClient myProfiles={profiles} />
          )}
        </main>
      </div>
    </div>
  )
}
