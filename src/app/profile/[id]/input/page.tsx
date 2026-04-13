import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LensInputFlow from './LensInputFlow'

export default async function InputPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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

  const { data: lensInputs } = await supabase
    .from('lens_inputs')
    .select('*')
    .eq('profile_id', id)
    .order('created_at', { ascending: true })

  return <LensInputFlow profile={profile} lensInputs={lensInputs || []} />
}
