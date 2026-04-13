import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Starfield from '@/components/stars/Starfield'
import AppNav from '@/components/layout/AppNav'
import { LENS_CARDS } from '@/types'

const REPORT_TYPES = [
  { type: 'full_cosmic', name: 'Full Cosmic Profile', icon: '✦', premium: false, description: 'Complete personality portrait across all dimensions' },
  { type: 'career', name: 'Career & Vocation', icon: '◈', premium: true, description: 'Work style, ideal paths, leadership, and professional growth' },
  { type: 'relationships', name: 'Relationships', icon: '◉', premium: true, description: 'Attachment style, love language, communication patterns' },
  { type: 'growth', name: 'Personal Growth', icon: '∿', premium: true, description: '12-month growth roadmap with specific practices' },
  { type: 'creative', name: 'Creative Expression', icon: '✍', premium: true, description: 'Creative modalities, process style, and projects to try' },
  { type: 'wellness', name: 'Wellness & Stress', icon: '◎', premium: true, description: 'Energy patterns, recharge strategies, emotional regulation' },
  { type: 'leadership', name: 'Leadership Style', icon: '⬡', premium: true, description: 'Leadership archetype, decision-making, and team dynamics' },
]

export default async function ProfileOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: profile }, { data: userProfile }] = await Promise.all([
    supabase.from('personality_profiles').select('*').eq('id', id).eq('user_id', user.id).single(),
    supabase.from('profiles').select('subscription_tier').eq('id', user.id).single(),
  ])

  if (!profile) redirect('/dashboard')

  const { data: lensInputs } = await supabase.from('lens_inputs').select('*').eq('profile_id', id)
  const { data: reports } = await supabase
    .from('reports')
    .select('id, report_type, created_at')
    .eq('profile_id', id)
    .order('created_at', { ascending: false })

  const completedLenses = lensInputs?.filter((li) => li.analysis_result) || []
  const isPremium = userProfile?.subscription_tier !== 'free'
  const generatedReportTypes = new Set(reports?.map((r) => r.report_type) || [])

  return (
    <div className="relative min-h-screen cosmic-bg">
      <Starfield />
      <div className="relative z-10">
        <AppNav />
        <main className="max-w-5xl mx-auto px-6 py-10">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-serif text-4xl text-white mb-1">{profile.profile_name}</h1>
              <p className="text-soft-silver/50 text-sm">
                {completedLenses.length} of {lensInputs?.length || 0} lenses analyzed
              </p>
            </div>
            <div className="flex gap-3">
              <Link href={`/profile/${id}/input`} className="btn-outline-gold px-5 py-2.5 text-sm rounded-lg">
                {completedLenses.length === 0 ? 'Start Inputs' : 'Continue Inputs'}
              </Link>
              {completedLenses.length > 0 && (
                <Link href={`/profile/${id}/processing`} className="btn-gold px-5 py-2.5 text-sm rounded-lg">
                  {generatedReportTypes.size === 0 ? 'Generate Report →' : 'Regenerate →'}
                </Link>
              )}
            </div>
          </div>

          {/* Lens grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-10">
            {lensInputs?.map((li) => {
              const card = LENS_CARDS.find((c) => c.type === li.lens_type)
              const isDone = !!li.analysis_result
              return (
                <div key={li.id} className={`glass-card p-4 text-center ${isDone ? 'border-celestial-gold/30' : ''}`}>
                  <div className="text-2xl mb-2">{card?.icon}</div>
                  <p className="text-white text-xs font-medium leading-tight">{card?.name}</p>
                  <span className={`mt-2 inline-block text-[10px] px-2 py-0.5 rounded-full border ${isDone ? 'border-celestial-gold/40 text-celestial-gold' : 'border-white/10 text-soft-silver/40'}`}>
                    {isDone ? '✓ Done' : 'Pending'}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Reports */}
          {completedLenses.length > 0 && (
            <div>
              <h2 className="font-serif text-2xl text-white mb-4">Reports</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {REPORT_TYPES.map((rt) => {
                  const isGenerated = generatedReportTypes.has(rt.type)
                  const isLocked = rt.premium && !isPremium

                  return (
                    <div key={rt.type} className={`glass-card p-5 relative ${isGenerated ? 'border-celestial-gold/30' : ''} ${isLocked ? 'opacity-60' : ''}`}>
                      {isLocked && (
                        <div className="absolute top-3 right-3">
                          <span className="text-celestial-gold/60 text-xs border border-celestial-gold/30 rounded-full px-2 py-0.5">Premium</span>
                        </div>
                      )}
                      <div className="flex items-start gap-3 mb-3">
                        <span className="text-xl">{rt.icon}</span>
                        <div>
                          <h3 className="font-serif text-white text-base">{rt.name}</h3>
                          <p className="text-soft-silver/50 text-xs mt-0.5">{rt.description}</p>
                        </div>
                      </div>
                      {isLocked ? (
                        <Link href="/pricing" className="btn-outline-gold text-xs px-3 py-1.5 rounded-lg block text-center">
                          Upgrade to Unlock →
                        </Link>
                      ) : isGenerated ? (
                        <Link href={`/profile/${id}/report/${rt.type}`} className="btn-gold text-xs px-3 py-1.5 rounded-lg block text-center">
                          View Report →
                        </Link>
                      ) : (
                        <Link href={`/profile/${id}/processing?type=${rt.type}`} className="btn-outline-gold text-xs px-3 py-1.5 rounded-lg block text-center">
                          Generate →
                        </Link>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Share link */}
          {completedLenses.length > 0 && isPremium && (
            <div className="mt-8">
              <Link href={`/profile/${id}/share`} className="btn-outline-gold text-sm px-5 py-2.5 rounded-lg">
                ✦ Generate Shareable Card
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
