'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Starfield from '@/components/stars/Starfield'
import { LENS_CARDS } from '@/types'

const TIER_DESCRIPTIONS = {
  1: { label: 'Scholarly Foundation', color: 'text-celestial-gold border-celestial-gold/30' },
  2: { label: 'Established Practice', color: 'text-blue-300 border-blue-400/30' },
  3: { label: 'Cultural Tradition', color: 'text-purple-300 border-purple-400/30' },
}

export default function AboutPage() {
  return (
    <div className="relative min-h-screen cosmic-bg">
      <Starfield />
      <div className="relative z-10">
        <nav className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
          <Link href="/" className="font-serif text-xl gold-text">Cosmic Mirror</Link>
          <Link href="/auth/signup" className="btn-gold text-sm px-5 py-2 rounded-lg">Begin Your Journey</Link>
        </nav>

        <main className="max-w-4xl mx-auto px-6 py-10 pb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
            <h1 className="font-serif text-5xl text-white mb-4">
              Our <em className="gold-text not-italic">Methodology</em>
            </h1>
            <p className="text-soft-silver/60 max-w-2xl mx-auto leading-relaxed">
              Cosmic Mirror draws on the Jewish principle of{' '}
              <em className="text-celestial-gold">Da es atzmecha</em> — Know Yourself.
              Every lens is framed as personality insight and self-discovery —
              never divination, fortune-telling, or scientific diagnosis.
            </p>
          </motion.div>

          <div className="glass-card p-8 mb-10">
            <h2 className="font-serif text-2xl text-white mb-4">Our Philosophy</h2>
            <p className="text-soft-silver/70 leading-relaxed mb-4">
              These systems are tools for self-reflection. They offer frameworks for understanding
              personality patterns — not scientific diagnoses or predictions. We encourage you to
              take what resonates, reflect on what surprises you, and use these insights as starting
              points for genuine self-knowledge.
            </p>
            <p className="text-soft-silver/70 leading-relaxed">
              We categorize each lens into one of three tiers based on its scholarly and evidential
              foundation. This transparency helps you calibrate how to weigh each system&apos;s insights.
            </p>
          </div>

          {/* Tier legend */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {([1, 2, 3] as const).map((tier) => (
              <div key={tier} className="glass-card p-5">
                <span className={`inline-block text-xs px-2 py-1 rounded-full border mb-3 ${TIER_DESCRIPTIONS[tier].color}`}>
                  {TIER_DESCRIPTIONS[tier].label}
                </span>
                <p className="text-soft-silver/60 text-sm">
                  {tier === 1 && 'Centuries of documented scholarly tradition and/or peer-reviewed modern research.'}
                  {tier === 2 && 'Published practitioners, documented methodologies, and some academic study — results are meaningful but debated in mainstream science.'}
                  {tier === 3 && 'Longstanding cultural traditions valued for their frameworks and metaphorical insight — limited modern scientific validation.'}
                </p>
              </div>
            ))}
          </div>

          {/* Lens methodology cards */}
          <h2 className="font-serif text-3xl text-white mb-6">The Ten Lenses</h2>
          <div className="flex flex-col gap-5">
            {LENS_CARDS.map((lens, i) => (
              <motion.div
                key={lens.type}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="glass-card p-6"
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl flex-shrink-0">{lens.icon}</span>
                  <div>
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <h3 className="font-serif text-xl text-white">{lens.name}</h3>
                      {lens.hebrewName && (
                        <span className="text-sm text-celestial-gold/60">{lens.hebrewName}</span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${TIER_DESCRIPTIONS[lens.tier].color}`}>
                        {lens.tierLabel}
                      </span>
                      {lens.phase > 1 && (
                        <span className="text-xs text-soft-silver/30 border border-white/10 px-2 py-0.5 rounded-full">
                          Phase {lens.phase}
                        </span>
                      )}
                    </div>
                    <p className="text-soft-silver/65 text-sm leading-relaxed">{lens.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="glass-card p-8 mt-10 text-center">
            <p className="text-soft-silver/40 text-xs leading-relaxed max-w-xl mx-auto">
              This profile is a tool for self-reflection and should complement — not replace —
              your own judgment, the guidance of trusted mentors, and professional advice where applicable.
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
