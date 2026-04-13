import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ReportClient from './ReportClient'

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string; type: string }>
}) {
  const { id, type } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('personality_profiles')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/dashboard')

  const { data: report } = await supabase
    .from('reports')
    .select('*')
    .eq('profile_id', id)
    .eq('report_type', type)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return <ReportClient profile={profile} report={report} reportType={type} />
}
