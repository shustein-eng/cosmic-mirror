import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import IlluminatedPrintClient from './IlluminatedPrintClient'

const PREMIUM_REPORT_TYPES = ['career', 'relationships', 'growth', 'creative', 'wellness', 'leadership']

export default async function IlluminatedPrintPage({
  params,
}: {
  params: Promise<{ id: string; type: string }>
}) {
  const { id, type } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: profile }, { data: userProfile }] = await Promise.all([
    supabase.from('personality_profiles').select('*').eq('id', id).eq('user_id', user.id).single(),
    supabase.from('profiles').select('subscription_tier').eq('id', user.id).single(),
  ])

  if (!profile) redirect('/dashboard')

  const isPremium = userProfile?.subscription_tier !== 'free'
  if (PREMIUM_REPORT_TYPES.includes(type) && !isPremium) redirect('/pricing')

  const { data: report } = await supabase
    .from('reports')
    .select('*')
    .eq('profile_id', id)
    .eq('report_type', type)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!report) redirect(`/profile/${id}/report/${type}`)

  return <IlluminatedPrintClient profile={profile} report={report} reportType={type} />
}
