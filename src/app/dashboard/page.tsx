import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: personalityProfiles } = await supabase
    .from('personality_profiles')
    .select(`
      *,
      lens_inputs (lens_type, analysis_result),
      reports (id, report_type, created_at)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <DashboardClient
      profile={profile}
      personalityProfiles={personalityProfiles || []}
    />
  )
}
