import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Starfield from '@/components/stars/Starfield'
import AppNav from '@/components/layout/AppNav'
import SettingsClient from './SettingsClient'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="relative min-h-screen cosmic-bg">
      <Starfield />
      <div className="relative z-10">
        <AppNav />
        <main className="max-w-2xl mx-auto px-6 py-12">
          <h1 className="font-serif text-4xl text-white mb-8">Settings</h1>
          <SettingsClient
            userEmail={user.email || ''}
            displayName={profile?.display_name || ''}
            subscriptionTier={profile?.subscription_tier || 'free'}
            hasStripeCustomer={!!profile?.stripe_customer_id}
          />
        </main>
      </div>
    </div>
  )
}
