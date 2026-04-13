import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Starfield from '@/components/stars/Starfield'
import AppNav from '@/components/layout/AppNav'
import Link from 'next/link'
import AcceptInviteClient from './AcceptInviteClient'

export default async function AcceptInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Look up invite
  const { data: invite } = await supabase
    .from('comparison_invites')
    .select('*, personality_profiles(profile_name)')
    .eq('invite_token', token)
    .single()

  const isExpired = invite && new Date(invite.expires_at) < new Date()
  const isValid = invite && !isExpired

  if (!user) {
    // Redirect to signup with redirect_to
    redirect(`/auth/signup?redirectTo=/compare/invite/${token}`)
  }

  // Get user's profiles for selection
  const { data: myProfiles } = await supabase
    .from('personality_profiles')
    .select('id, profile_name')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="relative min-h-screen cosmic-bg">
      <Starfield />
      <div className="relative z-10">
        <AppNav />
        <main className="max-w-2xl mx-auto px-6 py-16 text-center">
          {!isValid ? (
            <div className="glass-card p-10">
              <div className="text-4xl mb-4">✦</div>
              <h1 className="font-serif text-3xl text-white mb-3">
                {!invite ? 'Invite Not Found' : 'Invite Expired'}
              </h1>
              <p className="text-soft-silver/60 mb-6">
                {!invite
                  ? 'This invite link doesn\'t exist or has already been used.'
                  : 'This invite expired. Ask the person who shared it to generate a new one.'}
              </p>
              <Link href="/dashboard" className="btn-outline-gold px-6 py-3 rounded-lg">
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <AcceptInviteClient
              token={token}
              inviterProfileName={(invite as { personality_profiles?: { profile_name?: string } })?.personality_profiles?.profile_name || 'Someone'}
              inviterProfileId={invite.inviter_profile_id}
              myProfiles={myProfiles || []}
            />
          )}
        </main>
      </div>
    </div>
  )
}
