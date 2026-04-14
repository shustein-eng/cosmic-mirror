import Starfield from '@/components/stars/Starfield'
import AppNav from '@/components/layout/AppNav'
import { LENS_CARDS } from '@/types'

const METHODOLOGY = [
  {
    tier: 'Scholarly Foundation',
    colorClass: 'border-celestial-gold/40',
    dotClass: 'bg-celestial-gold',
    textClass: 'text-celestial-gold',
    lenses: ['natal_chart', 'enneagram'],
    description: 'Systems with centuries of documented scholarly tradition and/or peer-reviewed modern research.',
    sources: [
      'Claudius Ptolemy (Tetrabiblos) — foundational Western astrology',
      'Liz Greene & Stephen Arroyo — psychological astrology frameworks',
      'Don Richard Riso & Russ Hudson — The Wisdom of the Enneagram (gold standard text)',
    ],
  },
  {
    tier: 'Established Practice',
    colorClass: 'border-blue-400/30',
    dotClass: 'bg-blue-300',
    textClass: 'text-blue-300',
    lenses: ['middos_assessment', 'color_psychology', 'handwriting'],
    description: 'Systems with published practitioners, documented methodologies, and some academic study.',
    sources: [
      'Ramchal (Mesillas Yesharim) & Rabbi Shlomo Wolbe (Alei Shur) — mussar tradition',
      'Dr. Max Lüscher (The Lüscher Color Test) — clinically tested color psychology since 1947',
      'Angela Wright (Color Affects system) — used in corporate design worldwide',
      'Andrea McNichol & Bart Baggett — graphology trait-stroke method',
    ],
  },
  {
    tier: 'Cultural Tradition',
    colorClass: 'border-purple-400/30',
    dotClass: 'bg-purple-300',
    textClass: 'text-purple-300',
    lenses: ['palm', 'face_reading', 'iridology', 'biorhythm', 'chinese_zodiac'],
    description: 'Longstanding cultural traditions valued for their rich frameworks and metaphorical insight.',
    sources: [
      "Cheiro / Count Louis Hamon (Cheiro's Palmistry, 1897) — chirology foundation",
      'Jean Haner (The Wisdom of Your Face) — Chinese physiognomy for modern audiences',
      'Bernard Jensen (The Science and Practice of Iridology, 1952) — foundational zone mapping',
      'Denny Ray Johnson — Rayid Method constitutional iris typing',
      'Wilhelm Fliess & Hermann Swoboda — biorhythm mathematical theory',
      'Theodora Lau (The Handbook of Chinese Horoscopes) — Chinese zodiac personality frameworks',
    ],
  },
]

export default function AboutPage() {
  const lensCards = LENS_CARDS

  return (
    <div className="relative min-h-screen cosmic-bg">
      <Starfield />
      <div className="relative z-10">
        <AppNav />
        <main className="max-w-4xl mx-auto px-6 py-12">

          {/* Hero */}
          <div className="text-center mb-14">
            <div className="text-5xl mb-4">✦</div>
            <h1 className="font-serif text-5xl text-white mb-4">How Cosmic Mirror Works</h1>
            <p className="text-soft-silver/60 max-w-2xl mx-auto leading-relaxed text-lg">
              Cosmic Mirror draws on the Jewish principle of{' '}
              <span className="text-celestial-gold font-serif">דע את עצמך</span>{' '}
              — &ldquo;Know Yourself.&rdquo; Every lens is a different angle of light illuminating who you are.
            </p>
          </div>

          {/* Philosophy */}
          <div className="glass-card p-8 mb-8 border-celestial-gold/20">
            <h2 className="font-serif text-2xl text-white mb-4">Our Philosophy</h2>
            <p className="text-soft-silver/70 leading-relaxed mb-4">
              These systems are tools for self-reflection. They offer frameworks for understanding personality
              patterns — not scientific diagnoses or predictions. We encourage you to take what resonates,
              reflect on what surprises you, and use these insights as starting points for genuine self-knowledge.
            </p>
            <p className="text-soft-silver/70 leading-relaxed">
              We do not predict the future. We do not make medical claims. We do not treat personality as destiny.
              Every insight is framed as a tendency, a pattern, a possibility — never a fixed truth about who you must be.
            </p>
          </div>

          {/* Convergence engine */}
          <div className="glass-card p-8 mb-10">
            <h2 className="font-serif text-2xl text-white mb-4">The Convergence Engine</h2>
            <p className="text-soft-silver/70 leading-relaxed mb-5">
              The real power of Cosmic Mirror lies in convergence. When multiple lenses — drawn from completely
              different traditions — agree on the same personality trait, that agreement carries weight independent
              of any single system&apos;s credibility.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Data-Driven', desc: 'Birth chart, biorhythm — precisely calculated factual inputs', icon: '◈' },
                { label: 'Image Analysis', desc: 'Palm, handwriting, face, iridology — interpretive insights via Claude Vision AI', icon: '◉' },
                { label: 'Self-Report', desc: 'Middos, Enneagram, color — your conscious self-perception', icon: '∿' },
              ].map((cat) => (
                <div key={cat.label} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="text-xl mb-2 text-celestial-gold">{cat.icon}</div>
                  <h3 className="text-white font-medium mb-1 text-sm">{cat.label}</h3>
                  <p className="text-soft-silver/50 text-xs leading-relaxed">{cat.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Methodology tiers */}
          <h2 className="font-serif text-3xl text-white mb-6">Our Methodology Tiers</h2>
          <div className="space-y-5 mb-12">
            {METHODOLOGY.map((tier) => {
              const tierLenses = lensCards.filter((l) => tier.lenses.includes(l.type))
              return (
                <div key={tier.tier} className={`glass-card p-6 border ${tier.colorClass}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-3 h-3 rounded-full ${tier.dotClass}`} />
                    <h3 className={`font-serif text-xl ${tier.textClass}`}>{tier.tier}</h3>
                  </div>
                  <p className="text-soft-silver/60 text-sm mb-4">{tier.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tierLenses.map((l) => (
                      <span key={l.type} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-soft-silver/70">
                        {l.icon} {l.name}
                      </span>
                    ))}
                  </div>
                  <div>
                    <p className="text-soft-silver/40 text-xs mb-2 uppercase tracking-wider">Primary Sources</p>
                    <ul className="space-y-1">
                      {tier.sources.map((s) => (
                        <li key={s} className="text-soft-silver/50 text-xs flex items-start gap-2">
                          <span className="text-celestial-gold/60 mt-0.5 flex-shrink-0">·</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            })}
          </div>

          {/* All 10 lenses */}
          <h2 className="font-serif text-3xl text-white mb-6">The 10 Lenses</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
            {lensCards.map((lens) => (
              <div key={lens.type} className="glass-card p-5">
                <div className="flex items-start gap-4">
                  <span className="text-2xl flex-shrink-0 mt-0.5">{lens.icon}</span>
                  <div>
                    <h3 className="font-serif text-white mb-0.5">{lens.name}</h3>
                    {lens.hebrewName && <p className="text-celestial-gold/60 text-sm mb-1">{lens.hebrewName}</p>}
                    <p className="text-soft-silver/50 text-sm leading-relaxed mb-2">{lens.description}</p>
                    <div className="flex gap-2 flex-wrap">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                        lens.tier === 1 ? 'border-celestial-gold/30 text-celestial-gold/70' :
                        lens.tier === 2 ? 'border-blue-400/30 text-blue-300/70' :
                        'border-purple-400/30 text-purple-300/70'
                      }`}>
                        {lens.tierLabel}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-soft-silver/40 capitalize">
                        {lens.inputType}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Ethics */}
          <div className="glass-card p-8 border-celestial-gold/20">
            <h2 className="font-serif text-2xl text-white mb-6 text-center">Our Ethical Commitments</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                { icon: '◈', label: 'No Future Prediction', desc: 'We never use language like "you will" — only "you tend to" and "your profile suggests"' },
                { icon: '◉', label: 'No Medical Claims', desc: 'Personality analysis cannot diagnose or treat any condition, and we never suggest it can' },
                { icon: '∿', label: 'No Determinism', desc: 'These are tendencies, not destiny. You have the wiring for something — not you are permanently defined by it' },
                { icon: '✦', label: 'Privacy First', desc: 'Face images are deleted after analysis by default. Reports belong to you. We never sell your data' },
              ].map((c) => (
                <div key={c.label} className="flex items-start gap-3">
                  <span className="text-celestial-gold mt-0.5 flex-shrink-0 text-lg">{c.icon}</span>
                  <div>
                    <p className="text-white text-sm font-medium mb-0.5">{c.label}</p>
                    <p className="text-soft-silver/50 text-xs leading-relaxed">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}
