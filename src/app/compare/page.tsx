import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Starfield from '@/components/stars/Starfield'
import AppNav from '@/components/layout/AppNav'
import CompareClient from './CompareClient'
import Link from 'next/link'

export default async function ComparePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: userProfile } = await supabase.from('profiles').select('subscription_tier').eq('id', user.id).single()
  const isPremium = userProfile?.subscription_tier !== 'free'

  const { data: myProfiles } = await supabase
    .from('personality_profiles')
    .select('id, profile_name')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const { data: comparisons } = await supabase
    .from('profile_comparisons')
    .select('id, comparison_type, created_at, profile_a_id, profile_b_id')
    .eq('requester_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="relative min-h-screen cosmic-bg">
      <Starfield />
      <div className="relative z-10">
        <AppNav />
        <main className="max-w-4xl mx-auto px-6 py-12">
          <h1 className="font-serif text-4xl text-white mb-2">Profile Comparison</h1>
          <p className="text-soft-silver/50 mb-8">Discover how two personalities relate, complement, and challenge each other.</p>

          {!isPremium ? (
            <div className="glass-card p-8 text-center border-celestial-gold/20">
              <div className="text-4xl mb-4">✦</div>
              <h2 className="font-serif text-2xl text-white mb-3">Premium Feature</h2>
              <p className="text-soft-silver/60 mb-6 max-w-md mx-auto">
                Profile comparison is available on Premium. Generate an invite link, share it with anyone,
                and compare your personality profiles in depth.
              </p>
              <Link href="/pricing" className="btn-gold px-8 py-3 rounded-lg">
                Upgrade to Premium →
              </Link>
            </div>
          ) : (
            <CompareClient
              myProfiles={myProfiles || []}
              recentComparisons={comparisons || []}
            />
          )}
        </main>
      </div>
    </div>
  )
}
