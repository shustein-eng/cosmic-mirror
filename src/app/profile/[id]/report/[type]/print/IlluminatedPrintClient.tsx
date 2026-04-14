'use client'

import { useEffect } from 'react'
import type { ReportContent, ReportSection, Strength, GrowthOpportunity } from '@/types'
import { LENS_CARDS } from '@/types'

interface Props {
  profile: { id: string; profile_name: string }
  report: {
    id: string
    report_type: string
    lenses_used: string[]
    report_content: ReportContent
    created_at: string
  }
  reportType: string
}

const REPORT_TYPE_LABELS: Record<string, string> = {
  full_cosmic: 'Full Cosmic Profile',
  career: 'Career & Vocation',
  relationships: 'Relationships',
  growth: 'Personal Growth',
  creative: 'Creative Expression',
  wellness: 'Wellness & Stress',
  leadership: 'Leadership Style',
}

// Decorative SVG corner ornament
function CornerOrnament({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M2 2 L30 2 L2 30 Z" fill="none" stroke="#C9A84C" strokeWidth="1" opacity="0.5" />
      <path d="M2 2 L15 2" stroke="#C9A84C" strokeWidth="1.5" opacity="0.8" />
      <path d="M2 2 L2 15" stroke="#C9A84C" strokeWidth="1.5" opacity="0.8" />
      <circle cx="2" cy="2" r="2" fill="#C9A84C" opacity="0.7" />
      <circle cx="20" cy="2" r="1" fill="#C9A84C" opacity="0.4" />
      <circle cx="2" cy="20" r="1" fill="#C9A84C" opacity="0.4" />
      <path d="M10 10 Q20 5 30 10 Q25 20 10 10" fill="none" stroke="#C9A84C" strokeWidth="0.7" opacity="0.3" />
    </svg>
  )
}

// Decorative divider
function OrnamentalDivider() {
  return (
    <div className="flex items-center gap-3 my-8 print-show">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-yellow-400/40" />
      <span className="text-yellow-400/60 text-xs tracking-widest">✦ ◎ ✦</span>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-yellow-400/40" />
    </div>
  )
}

// Star motif
function StarMotif() {
  return (
    <div className="text-center my-4 text-yellow-400/30 text-lg tracking-widest">
      · · · ✦ · · ·
    </div>
  )
}

export default function IlluminatedPrintClient({ profile, report, reportType }: Props) {
  const content = report.report_content

  useEffect(() => {
    // Auto-trigger print dialog after a short delay for the CSS to apply
    const timer = setTimeout(() => window.print(), 800)
    return () => clearTimeout(timer)
  }, [])

  const generatedDate = new Date(report.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #0A0E1F;
          color: #D4C4A0;
          font-family: 'Georgia', serif;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        @media print {
          body { background: #0A0E1F !important; }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
          @page {
            margin: 1.5cm;
            size: A4;
          }
        }

        .illuminated-page {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 48px;
        }

        .gold { color: #C9A84C; }
        .gold-dim { color: #C9A84C; opacity: 0.6; }
        .silver { color: #B8C4D4; }
        .silver-dim { color: #B8C4D4; opacity: 0.55; }

        .font-serif { font-family: 'Cormorant Garamond', 'Georgia', serif; }

        /* Title page */
        .title-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          position: relative;
          padding: 60px 40px;
          border: 1px solid rgba(201,168,76,0.2);
          background: rgba(255,255,255,0.02);
          border-radius: 4px;
          margin-bottom: 40px;
        }

        .title-page .corner {
          position: absolute;
          width: 80px;
          height: 80px;
        }
        .corner-tl { top: 12px; left: 12px; }
        .corner-tr { top: 12px; right: 12px; transform: scaleX(-1); }
        .corner-bl { bottom: 12px; left: 12px; transform: scaleY(-1); }
        .corner-br { bottom: 12px; right: 12px; transform: scale(-1); }

        .report-title { font-size: 48px; font-weight: 300; color: #fff; line-height: 1.2; margin-bottom: 8px; }
        .report-subtitle { font-size: 14px; letter-spacing: 0.25em; color: #C9A84C; opacity: 0.8; margin-bottom: 24px; }
        .profile-name { font-size: 22px; color: #C9A84C; margin: 24px 0 8px; }
        .generated-date { font-size: 12px; color: rgba(180,180,180,0.45); letter-spacing: 0.1em; }

        .cosmic-sig-box {
          margin: 32px auto;
          max-width: 480px;
          border: 1px solid rgba(201,168,76,0.25);
          border-radius: 8px;
          padding: 20px 24px;
          background: rgba(201,168,76,0.04);
        }
        .cosmic-sig-label { font-size: 10px; letter-spacing: 0.2em; color: rgba(201,168,76,0.5); margin-bottom: 8px; text-transform: uppercase; }
        .cosmic-sig-text { font-size: 18px; font-style: italic; color: #C9A84C; line-height: 1.5; }

        .lenses-row { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin: 16px 0; }
        .lens-chip { font-size: 10px; padding: 3px 10px; border: 1px solid rgba(201,168,76,0.25); border-radius: 20px; color: rgba(201,168,76,0.7); letter-spacing: 0.08em; }

        /* Content sections */
        .section-card {
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px;
          padding: 28px 32px;
          margin-bottom: 24px;
          background: rgba(255,255,255,0.025);
          position: relative;
        }
        .section-heading { font-size: 24px; font-weight: 400; color: #fff; margin-bottom: 12px; }
        .section-body { font-size: 13.5px; line-height: 1.8; color: rgba(184,196,212,0.8); white-space: pre-line; }
        .key-insight-bar {
          margin-top: 16px;
          padding-left: 16px;
          border-left: 2px solid rgba(201,168,76,0.4);
        }
        .key-insight-label { font-size: 10px; color: rgba(201,168,76,0.5); text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 4px; }
        .key-insight-text { font-size: 13px; color: rgba(201,168,76,0.85); font-style: italic; }
        .convergence-bar-wrap { height: 4px; background: rgba(255,255,255,0.08); border-radius: 2px; width: 80px; margin-top: 2px; }
        .convergence-bar-fill { height: 100%; border-radius: 2px; background: linear-gradient(to right, rgba(201,168,76,0.6), #C9A84C); }

        /* Strengths grid */
        .strengths-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
        .strength-card {
          border: 1px solid rgba(201,168,76,0.15);
          border-radius: 8px;
          padding: 16px;
          background: rgba(201,168,76,0.03);
        }
        .strength-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #C9A84C; margin-right: 8px; vertical-align: middle; }
        .strength-name { font-size: 15px; color: #C9A84C; margin-bottom: 6px; display: inline; vertical-align: middle; }
        .strength-desc { font-size: 12px; line-height: 1.6; color: rgba(184,196,212,0.7); }
        .strength-evidence { font-size: 10px; color: rgba(184,196,212,0.4); margin-top: 8px; }

        /* Growth */
        .growth-card {
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px;
          padding: 20px 24px;
          margin-bottom: 16px;
          background: rgba(255,255,255,0.02);
        }
        .growth-area { font-size: 18px; color: #fff; margin-bottom: 10px; }
        .growth-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 12px; }
        .growth-label { font-size: 10px; color: rgba(201,168,76,0.5); text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 4px; }
        .growth-text { font-size: 12.5px; line-height: 1.6; color: rgba(184,196,212,0.7); }
        .step-item { font-size: 12px; color: rgba(184,196,212,0.65); margin-left: 16px; margin-bottom: 3px; }

        /* Closing */
        .closing-box {
          border: 1px solid rgba(201,168,76,0.2);
          border-radius: 8px;
          padding: 36px 40px;
          text-align: center;
          background: rgba(201,168,76,0.03);
          margin-top: 32px;
        }
        .closing-star { font-size: 28px; color: rgba(201,168,76,0.4); margin-bottom: 16px; }
        .closing-text { font-size: 18px; font-style: italic; color: rgba(255,255,255,0.88); line-height: 1.7; }

        /* Footer */
        .print-footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid rgba(201,168,76,0.15);
          text-align: center;
          font-size: 10px;
          color: rgba(180,180,180,0.35);
          letter-spacing: 0.1em;
        }

        /* Print button */
        .print-btn {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background: #C9A84C;
          color: #0A0E1F;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          z-index: 100;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 20px rgba(201,168,76,0.3);
        }
        .print-btn:hover { background: #d4b55c; }

        @media print {
          .print-btn { display: none !important; }
        }
      `}</style>

      {/* Print button — only visible on screen */}
      <button className="print-btn no-print" onClick={() => window.print()}>
        ↓ Save as PDF
      </button>

      <div className="illuminated-page">
        {/* ═══════════════ TITLE PAGE ═══════════════ */}
        <div className="title-page">
          <CornerOrnament className="corner corner-tl" />
          <CornerOrnament className="corner corner-tr" />
          <CornerOrnament className="corner corner-bl" />
          <CornerOrnament className="corner corner-br" />

          <div className="report-subtitle">
            Cosmic Mirror · Illuminated Report
          </div>

          <h1 className="font-serif report-title">
            {content.title || REPORT_TYPE_LABELS[reportType] || 'Your Cosmic Profile'}
          </h1>

          <div className="profile-name font-serif">
            {profile.profile_name}
          </div>

          {content.cosmic_signature && (
            <div className="cosmic-sig-box">
              <div className="cosmic-sig-label">Your Cosmic Signature</div>
              <div className="font-serif cosmic-sig-text">
                &ldquo;{content.cosmic_signature}&rdquo;
              </div>
            </div>
          )}

          {report.lenses_used?.length > 0 && (
            <div className="lenses-row">
              {report.lenses_used.map((lt) => {
                const card = LENS_CARDS.find((c) => c.type === lt)
                return (
                  <span key={lt} className="lens-chip">
                    {card?.icon} {card?.name || lt}
                  </span>
                )
              })}
            </div>
          )}

          <div className="generated-date">Generated {generatedDate}</div>
        </div>

        {/* ═══════════════ STRENGTHS ═══════════════ */}
        {content.top_strengths?.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h2 className="font-serif" style={{ fontSize: '28px', color: '#fff', fontWeight: 400 }}>
                Your Defining <em style={{ color: '#C9A84C' }}>Strengths</em>
              </h2>
            </div>
            <div className="strengths-grid">
              {content.top_strengths.map((strength: Strength, i: number) => (
                <div key={i} className="strength-card">
                  <div style={{ marginBottom: '6px' }}>
                    <span className="strength-dot" />
                    <span className="font-serif strength-name">{strength.name}</span>
                  </div>
                  <p className="strength-desc">{strength.description}</p>
                  {strength.evidence_from?.length > 0 && (
                    <p className="strength-evidence">Confirmed by: {strength.evidence_from.join(', ')}</p>
                  )}
                </div>
              ))}
            </div>
            <OrnamentalDivider />
          </div>
        )}

        {/* ═══════════════ SECTIONS ═══════════════ */}
        {content.sections?.map((section: ReportSection, i: number) => (
          <div key={i}>
            <div className="section-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h2 className="font-serif section-heading">{section.heading}</h2>
                {section.convergence_score !== undefined && (
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div className="convergence-bar-wrap">
                      <div className="convergence-bar-fill" style={{ width: `${Math.round(section.convergence_score * 100)}%` }} />
                    </div>
                    <div style={{ fontSize: '10px', color: 'rgba(180,180,180,0.4)', marginTop: '3px' }}>
                      {Math.round(section.convergence_score * 100)}% convergence
                    </div>
                  </div>
                )}
              </div>
              <p className="section-body">{section.content}</p>
              {section.key_insight && (
                <div className="key-insight-bar">
                  <div className="key-insight-label">Key Insight</div>
                  <p className="key-insight-text">{section.key_insight}</p>
                </div>
              )}
              {section.contributing_lenses?.length > 0 && (
                <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {section.contributing_lenses.map((lt: string) => {
                    const card = LENS_CARDS.find((c) => c.type === lt)
                    return (
                      <span key={lt} className="lens-chip">
                        {card?.icon} {card?.name || lt}
                      </span>
                    )
                  })}
                </div>
              )}
            </div>
            {i < (content.sections?.length ?? 0) - 1 && <StarMotif />}
          </div>
        ))}

        {/* ═══════════════ GROWTH ═══════════════ */}
        {content.growth_opportunities?.length > 0 && (
          <div style={{ marginTop: '32px' }}>
            <OrnamentalDivider />
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h2 className="font-serif" style={{ fontSize: '28px', color: '#fff', fontWeight: 400 }}>
                Growth <em style={{ color: '#C9A84C' }}>Edges</em>
              </h2>
            </div>
            {content.growth_opportunities.map((opp: GrowthOpportunity, i: number) => (
              <div key={i} className="growth-card">
                <h3 className="font-serif growth-area">{opp.area}</h3>
                <div className="growth-grid">
                  <div>
                    <div className="growth-label">Current Pattern</div>
                    <p className="growth-text">{opp.current_state}</p>
                  </div>
                  <div>
                    <div className="growth-label" style={{ color: 'rgba(201,168,76,0.6)' }}>Growth Direction</div>
                    <p className="growth-text">{opp.growth_direction}</p>
                  </div>
                </div>
                {opp.practical_steps?.length > 0 && (
                  <div>
                    <div className="growth-label">Practical Steps</div>
                    <ul style={{ marginTop: '6px' }}>
                      {opp.practical_steps.map((step: string, j: number) => (
                        <li key={j} className="step-item">· {step}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ═══════════════ CLOSING ═══════════════ */}
        {content.closing_reflection && (
          <div className="closing-box">
            <div className="closing-star">✦</div>
            <p className="font-serif closing-text">
              {content.closing_reflection}
            </p>
          </div>
        )}

        {/* ═══════════════ FOOTER ═══════════════ */}
        <div className="print-footer">
          <p>Cosmic Mirror · cosmicmirror.app · {profile.profile_name} · {generatedDate}</p>
          <p style={{ marginTop: '4px' }}>
            This profile is a tool for self-reflection. It should complement — not replace — your own judgment and trusted guidance.
          </p>
        </div>
      </div>
    </>
  )
}
