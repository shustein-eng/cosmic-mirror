import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Starfield from '@/components/stars/Starfield'
import AppNav from '@/components/layout/AppNav'
import Link from 'next/link'

export default async function ComparisonReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: comparison } = await supabase
    .from('profile_comparisons')
    .select('*')
    .eq('id', id)
    .eq('requester_id', user.id)
    .single()

  if (!comparison) redirect('/compare')

  const result = comparison.comparison_result as Record<string, unknown>
  const sections = (result?.sections as Array<{ heading: string; content: string; insight?: string }>) || []
  const strengths = (result?.complementary_strengths as string[]) || []
  const synergies = (result?.natural_synergies as string[]) || []
  const growthEdges = (result?.growth_edges as string[]) || []
  const commGuide = result?.communication_guide as Record<string, unknown>
  const playbook = (result?.collaboration_playbook as string[]) || []

  return (
    <div className="relative min-h-screen cosmic-bg">
      <Starfield />
      <div className="relative z-10">
        <AppNav />
        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="mb-8">
            <Link href="/compare" className="text-soft-silver/40 text-sm hover:text-soft-silver/70 transition-colors">
              ← Back to Compare
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="text-4xl mb-4">✦</div>
            <h1 className="font-serif text-4xl text-white mb-3">
              {(result?.title as string) || 'Comparison Report'}
            </h1>
            {typeof result?.overview === 'string' && (
              <p className="text-soft-silver/60 max-w-xl mx-auto leading-relaxed">
                {result.overview}
              </p>
            )}
            {typeof result?.compatibility_score === 'number' && (
              <div className="mt-5 inline-flex items-center gap-3 glass-card px-6 py-3">
                <span className="text-soft-silver/50 text-sm">Synergy Score</span>
                <span className="font-serif text-3xl text-celestial-gold">{result.compatibility_score}</span>
                <span className="text-soft-silver/40 text-sm">/100</span>
              </div>
            )}
          </div>

          {/* Sections */}
          {sections.map((section, i) => (
            <div key={i} className="glass-card p-6 mb-6">
              <h2 className="font-serif text-xl text-white mb-3">{section.heading}</h2>
              <p className="text-soft-silver/70 leading-relaxed">{section.content}</p>
              {section.insight && (
                <div className="mt-4 p-3 bg-celestial-gold/5 border border-celestial-gold/20 rounded-lg">
                  <p className="text-celestial-gold text-sm font-medium">Key Insight: {section.insight}</p>
                </div>
              )}
            </div>
          ))}

          {/* Complementary strengths */}
          {strengths.length > 0 && (
            <div className="glass-card p-6 mb-6">
              <h2 className="font-serif text-xl text-white mb-4">Complementary Strengths</h2>
              <ul className="space-y-2">
                {strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 text-soft-silver/70 text-sm">
                    <span className="text-celestial-gold mt-0.5">✦</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Synergies & Growth */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {synergies.length > 0 && (
              <div className="glass-card p-5">
                <h3 className="font-serif text-lg text-white mb-3">Natural Synergies</h3>
                <ul className="space-y-2">
                  {synergies.map((s, i) => (
                    <li key={i} className="text-soft-silver/60 text-sm flex items-start gap-2">
                      <span className="text-green-400/70 mt-0.5">◉</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {growthEdges.length > 0 && (
              <div className="glass-card p-5">
                <h3 className="font-serif text-lg text-white mb-3">Growth Edges</h3>
                <ul className="space-y-2">
                  {growthEdges.map((s, i) => (
                    <li key={i} className="text-soft-silver/60 text-sm flex items-start gap-2">
                      <span className="text-amber-400/70 mt-0.5">∿</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Communication guide */}
          {commGuide && (
            <div className="glass-card p-6 mb-6">
              <h2 className="font-serif text-xl text-white mb-4">Communication Guide</h2>
              {typeof commGuide.how_A_communicates_with_B === 'string' && (
                <div className="mb-3"><p className="text-soft-silver/50 text-xs mb-1">How to communicate with Profile A:</p><p className="text-soft-silver/70 text-sm">{commGuide.how_A_communicates_with_B}</p></div>
              )}
              {typeof commGuide.how_B_communicates_with_A === 'string' && (
                <div className="mb-3"><p className="text-soft-silver/50 text-xs mb-1">How to communicate with Profile B:</p><p className="text-soft-silver/70 text-sm">{commGuide.how_B_communicates_with_A}</p></div>
              )}
            </div>
          )}

          {/* Playbook */}
          {playbook.length > 0 && (
            <div className="glass-card p-6">
              <h2 className="font-serif text-xl text-white mb-4">Collaboration Playbook</h2>
              <ul className="space-y-3">
                {playbook.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full border border-celestial-gold/40 text-celestial-gold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-soft-silver/70 text-sm">{step}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
