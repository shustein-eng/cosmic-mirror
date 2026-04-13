import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Starfield from '@/components/stars/Starfield'
import AppNav from '@/components/layout/AppNav'
import { LENS_CARDS } from '@/types'

export default async function ProfileOverviewPage({ params }: { params: Promise<{ id: string }> }) {
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

  const { data: reports } = await supabase
    .from('reports')
    .select('id, report_type, created_at')
    .eq('profile_id', id)
    .order('created_at', { ascending: false })

  const completedLenses = lensInputs?.filter((li) => li.analysis_result) || []
  const hasReport = reports && reports.length > 0

  return (
    <div className="relative min-h-screen cosmic-bg">
      <Starfield />
      <div className="relative z-10">
        <AppNav />
        <main className="max-w-4xl mx-auto px-6 py-10">
          <div className="mb-8">
            <h1 className="font-serif text-4xl text-white mb-1">{profile.profile_name}</h1>
            <p className="text-soft-silver/50 text-sm">
              {completedLenses.length} of {lensInputs?.length || 0} lenses analyzed
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {lensInputs?.map((li) => {
              const card = LENS_CARDS.find((c) => c.type === li.lens_type)
              const isDone = !!li.analysis_result
              return (
                <div key={li.id} className={`glass-card p-5 ${isDone ? 'border-celestial-gold/30' : ''}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{card?.icon}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${isDone ? 'border-celestial-gold/40 text-celestial-gold' : 'border-white/10 text-soft-silver/40'}`}>
                      {isDone ? '✓ Analyzed' : 'Pending'}
                    </span>
                  </div>
                  <h3 className="font-serif text-base text-white">{card?.name}</h3>
                </div>
              )
            })}
          </div>

          <div className="flex gap-4 flex-wrap">
            <Link href={`/profile/${id}/input`} className="btn-outline-gold px-6 py-3">
              {completedLenses.length === 0 ? 'Start Inputs' : 'Continue Inputs'}
            </Link>
            {completedLenses.length > 0 && (
              <Link href={`/profile/${id}/processing`} className="btn-gold px-6 py-3">
                {hasReport ? 'Regenerate Report' : 'Generate Report →'}
              </Link>
            )}
            {hasReport && (
              <Link href={`/profile/${id}/report/full_cosmic`} className="btn-gold px-6 py-3">
                View Report →
              </Link>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
