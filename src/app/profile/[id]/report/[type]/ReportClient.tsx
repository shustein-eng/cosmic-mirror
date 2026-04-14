'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Starfield from '@/components/stars/Starfield'
import AppNav from '@/components/layout/AppNav'
import { LENS_CARDS } from '@/types'
import type { ReportContent, ReportSection, Strength, GrowthOpportunity } from '@/types'

interface ReportClientProps {
  profile: { id: string; profile_name: string }
  report: {
    id: string
    report_type: string
    lenses_used: string[]
    report_content: ReportContent
    created_at: string
  } | null
  reportType: string
}

export default function ReportClient({ profile, report, reportType }: ReportClientProps) {
  if (!report) {
    return (
      <div className="relative min-h-screen cosmic-bg">
        <Starfield />
        <div className="relative z-10">
          <AppNav />
          <div className="max-w-2xl mx-auto px-6 py-20 text-center">
            <h2 className="font-serif text-3xl text-white mb-4">Report not found</h2>
            <p className="text-soft-silver/60 mb-6">
              This report hasn&apos;t been generated yet.
            </p>
            <Link href={`/profile/${profile.id}/processing`} className="btn-gold px-8 py-3">
              Generate Report
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const content = report.report_content

  const handlePrint = () => window.print()

  return (
    <div className="relative min-h-screen cosmic-bg">
      <style>{`
        @media print {
          body { background: #0A0E27 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .glass-card { background: rgba(255,255,255,0.05) !important; border: 1px solid rgba(201,168,76,0.2) !important; border-radius: 12px !important; }
          .cosmic-bg { background: #0A0E27 !important; }
          canvas { display: none !important; }
        }
      `}</style>
      <Starfield />
      <div className="relative z-10">
        <div className="no-print"><AppNav /></div>

        <main className="max-w-4xl mx-auto px-6 py-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <p className="text-xs tracking-widest text-celestial-gold/60 uppercase mb-3">
              {profile.profile_name} · Full Cosmic Profile
            </p>
            <h1 className="font-serif text-4xl sm:text-6xl text-white mb-6 leading-tight">
              {content.title || 'Your Cosmic Mirror'}
            </h1>

            {/* Cosmic signature */}
            <div className="glass-card p-6 max-w-2xl mx-auto">
              <p className="text-xs text-soft-silver/50 mb-3 tracking-widest uppercase">Your Cosmic Signature</p>
              <p className="font-serif text-xl sm:text-2xl text-celestial-gold italic leading-relaxed">
                &ldquo;{content.cosmic_signature}&rdquo;
              </p>
            </div>
          </motion.div>

          {/* Lenses used */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-2 justify-center mb-12"
          >
            {report.lenses_used.map((lt) => {
              const card = LENS_CARDS.find((c) => c.type === lt)
              return (
                <span
                  key={lt}
                  className="text-xs px-3 py-1 rounded-full border border-celestial-gold/25 text-celestial-gold/70"
                >
                  {card?.icon} {card?.name || lt}
                </span>
              )
            })}
          </motion.div>

          {/* Top strengths */}
          {content.top_strengths?.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-12"
            >
              <h2 className="font-serif text-3xl text-white mb-6 text-center">
                Your Defining <em className="gold-text not-italic">Strengths</em>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {content.top_strengths.map((strength: Strength, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + i * 0.08 }}
                    className="glass-card p-5"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-celestial-gold animate-pulse-gold" />
                      <h3 className="font-serif text-lg text-celestial-gold">{strength.name}</h3>
                    </div>
                    <p className="text-soft-silver/70 text-sm leading-relaxed">{strength.description}</p>
                    {strength.evidence_from?.length > 0 && (
                      <p className="text-xs text-soft-silver/40 mt-3">
                        Confirmed by: {strength.evidence_from.join(', ')}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Main sections */}
          {content.sections?.map((section: ReportSection, i: number) => (
            <motion.section
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="glass-card p-8 mb-6"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <h2 className="font-serif text-2xl text-white">{section.heading}</h2>
                {section.convergence_score !== undefined && (
                  <div className="flex-shrink-0 text-right">
                    <div className="h-1.5 w-20 rounded-full bg-white/10 overflow-hidden mt-1">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-celestial-gold to-yellow-300"
                        style={{ width: `${Math.round(section.convergence_score * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-soft-silver/40 mt-1">
                      {Math.round(section.convergence_score * 100)}% convergence
                    </p>
                  </div>
                )}
              </div>

              <p className="text-soft-silver/75 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                {section.content}
              </p>

              {section.key_insight && (
                <div className="mt-5 pl-4 border-l-2 border-celestial-gold/40">
                  <p className="text-xs text-soft-silver/50 mb-1">Key Insight</p>
                  <p className="text-celestial-gold/90 text-sm font-light italic">{section.key_insight}</p>
                </div>
              )}

              {section.contributing_lenses?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {section.contributing_lenses.map((lt: string) => {
                    const card = LENS_CARDS.find((c) => c.type === lt)
                    return (
                      <span key={lt} className="text-xs text-soft-silver/40 px-2 py-0.5 rounded border border-white/10">
                        {card?.icon} {card?.name || lt}
                      </span>
                    )
                  })}
                </div>
              )}
            </motion.section>
          ))}

          {/* Growth opportunities */}
          {content.growth_opportunities?.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="font-serif text-3xl text-white mb-6 text-center">
                Growth <em className="gold-text not-italic">Edges</em>
              </h2>
              <div className="flex flex-col gap-5">
                {content.growth_opportunities.map((opp: GrowthOpportunity, i: number) => (
                  <div key={i} className="glass-card p-6">
                    <h3 className="font-serif text-xl text-white mb-3">{opp.area}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-soft-silver/50 mb-1">Current Pattern</p>
                        <p className="text-soft-silver/70 text-sm">{opp.current_state}</p>
                      </div>
                      <div>
                        <p className="text-xs text-celestial-gold/60 mb-1">Growth Direction</p>
                        <p className="text-soft-silver/70 text-sm">{opp.growth_direction}</p>
                      </div>
                    </div>
                    {opp.practical_steps?.length > 0 && (
                      <div>
                        <p className="text-xs text-soft-silver/50 mb-2">Practical Steps</p>
                        <ul className="flex flex-col gap-1">
                          {opp.practical_steps.map((step: string, j: number) => (
                            <li key={j} className="flex gap-2 text-sm text-soft-silver/65">
                              <span className="text-celestial-gold/50 flex-shrink-0">·</span>
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Closing reflection */}
          {content.closing_reflection && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-10 text-center mb-12"
            >
              <div className="text-3xl mb-4">✦</div>
              <p className="font-serif text-xl sm:text-2xl text-white/90 italic leading-relaxed max-w-2xl mx-auto">
                {content.closing_reflection}
              </p>
            </motion.section>
          )}

          {/* Disclaimer */}
          <div className="text-center pb-12 no-print">
            <p className="text-xs text-soft-silver/30 max-w-xl mx-auto leading-relaxed">
              This profile is a tool for self-reflection and should complement — not replace — your own
              judgment, the guidance of trusted mentors, and professional advice where applicable.
            </p>
            <div className="flex justify-center gap-4 mt-5 flex-wrap">
              <button
                onClick={handlePrint}
                className="btn-gold text-sm px-6 py-2.5 rounded-lg"
              >
                ↓ Download PDF
              </button>
              <Link href="/dashboard" className="btn-outline-gold text-sm px-5 py-2.5 rounded-lg">
                ← Dashboard
              </Link>
              <Link href={`/profile/${profile.id}/input`} className="text-xs text-soft-silver/40 hover:text-soft-silver/70 transition-colors self-center">
                Edit Inputs
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
