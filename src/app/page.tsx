'use client'

export const dynamic = 'force-dynamic'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Starfield from '@/components/stars/Starfield'
import { LENS_CARDS } from '@/types'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
}

const stagger = {
  show: { transition: { staggerChildren: 0.12 } },
}

export default function LandingPage() {
  const phase1Lenses = LENS_CARDS.filter((l) => l.phase === 1)

  return (
    <div className="relative min-h-screen cosmic-bg overflow-hidden">
      <Starfield />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-serif gold-text tracking-wide">Cosmic Mirror</span>
          <span className="text-xs text-soft-silver/50 mt-1 hidden sm:block">דע את עצמך</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="text-soft-silver/70 hover:text-soft-silver text-sm transition-colors">
            Sign In
          </Link>
          <Link href="/auth/signup" className="btn-gold text-sm px-5 py-2 rounded-lg">
            Begin Your Journey
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-16 pb-24 max-w-5xl mx-auto">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center gap-6"
        >
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-2">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-celestial-gold/50" />
            <span className="text-xs tracking-[0.3em] text-celestial-gold/80 uppercase font-light">
              Da es atzmecha · דע את עצמך
            </span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-celestial-gold/50" />
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="font-serif text-5xl sm:text-7xl font-light text-white leading-tight"
          >
            Discover{' '}
            <em className="gold-text not-italic">who you truly are</em>
            <br />
            through every lens
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="max-w-2xl text-soft-silver/70 text-lg sm:text-xl leading-relaxed font-light"
          >
            Cosmic Mirror combines natal charts, Enneagram, and character assessment
            with color psychology and more — building the deepest personality
            profile you&apos;ve ever seen.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-4 mt-4">
            <Link href="/auth/signup" className="btn-gold text-base px-8 py-3 rounded-lg">
              Build Your Profile — Free
            </Link>
            <a
              href="#lenses"
              className="btn-outline-gold text-base px-8 py-3 rounded-lg"
            >
              Explore the Lenses
            </a>
          </motion.div>

          <motion.p variants={fadeUp} className="text-soft-silver/40 text-xs mt-2">
            No credit card required · Free tier includes 4 lenses
          </motion.p>
        </motion.div>

        {/* Floating cosmic orb decoration */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 top-32 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(74, 27, 140, 0.15) 0%, rgba(27, 42, 107, 0.08) 40%, transparent 70%)',
          }}
          animate={{ scale: [1, 1.05, 1], opacity: [0.6, 0.8, 0.6] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </section>

      {/* Lenses section */}
      <section id="lenses" className="relative z-10 px-6 pb-24 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-3xl sm:text-5xl text-white font-light mb-4">
            The <em className="gold-text not-italic">Four Lenses</em> of Phase 1
          </h2>
          <p className="text-soft-silver/60 max-w-xl mx-auto">
            Each lens illuminates a different dimension of who you are. The more lenses you
            activate, the more complete your Cosmic Mirror becomes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {phase1Lenses.map((lens, i) => (
            <motion.div
              key={lens.type}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 flex flex-col gap-4 hover:border-celestial-gold/40 transition-all duration-300 group"
            >
              <div className="text-3xl">{lens.icon}</div>
              <div>
                <h3 className="font-serif text-xl text-white mb-1 group-hover:text-celestial-gold transition-colors">
                  {lens.name}
                </h3>
                {lens.hebrewName && (
                  <p className="text-xs text-celestial-gold/60 mb-2 font-light">{lens.hebrewName}</p>
                )}
                <p className="text-soft-silver/60 text-sm leading-relaxed">{lens.description}</p>
              </div>
              <div className="mt-auto">
                <span className="inline-block text-xs px-2 py-1 rounded-full border border-celestial-gold/20 text-celestial-gold/60">
                  {lens.tierLabel}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 px-6 pb-24 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-3xl sm:text-5xl text-white font-light mb-4">
            How <em className="gold-text not-italic">Cosmic Mirror</em> Works
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: 'Choose Your Lenses',
              desc: 'Select which analytical systems to include. Each lens you activate adds depth and nuance to your profile.',
            },
            {
              step: '02',
              title: 'Provide Your Inputs',
              desc: 'Answer questions, enter your birth details, explore color selections — each lens has its own beautifully designed input flow.',
            },
            {
              step: '03',
              title: 'Receive Your Mirror',
              desc: 'Our convergence engine finds where lenses agree, creating a multi-dimensional profile more insightful than any single system could produce.',
            },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center"
            >
              <div className="font-serif text-6xl font-light gold-text mb-4">{item.step}</div>
              <h3 className="font-serif text-xl text-white mb-3">{item.title}</h3>
              <p className="text-soft-silver/60 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Methodology note */}
      <section className="relative z-10 px-6 pb-24 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-8 text-center"
        >
          <p className="text-soft-silver/50 text-xs tracking-widest uppercase mb-4">Our Philosophy</p>
          <p className="font-serif text-2xl sm:text-3xl text-white/90 font-light leading-relaxed mb-4">
            "These systems are tools for self-reflection. They offer frameworks for
            understanding personality patterns — not scientific diagnoses or predictions."
          </p>
          <p className="text-soft-silver/50 text-sm">
            We draw on the Jewish principle of <em className="text-celestial-gold">Da es atzmecha</em> — Know Yourself.
            Every lens is framed as personality insight, never divination or fortune-telling.
          </p>
          <div className="mt-6">
            <Link href="/about" className="text-xs text-celestial-gold/70 hover:text-celestial-gold underline transition-colors">
              Read about our methodology →
            </Link>
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 pb-32 max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center gap-6"
        >
          <h2 className="font-serif text-4xl sm:text-5xl text-white font-light">
            Ready to see your <em className="gold-text not-italic">Cosmic Mirror?</em>
          </h2>
          <p className="text-soft-silver/60 max-w-lg">
            Join thousands discovering themselves through the convergence of ancient wisdom
            and modern personality science.
          </p>
          <Link href="/auth/signup" className="btn-gold text-lg px-10 py-4 rounded-lg">
            Begin Your Journey — Free
          </Link>
          <p className="text-soft-silver/30 text-xs">
            Free tier · No credit card required · Up to 4 lenses
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-6 py-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-serif text-lg gold-text">Cosmic Mirror</span>
          <div className="flex gap-6 text-xs text-soft-silver/40">
            <Link href="/about" className="hover:text-soft-silver/70 transition-colors">About</Link>
            <Link href="/pricing" className="hover:text-soft-silver/70 transition-colors">Pricing</Link>
            <Link href="/auth/login" className="hover:text-soft-silver/70 transition-colors">Sign In</Link>
          </div>
          <p className="text-xs text-soft-silver/30">
            © {new Date().getFullYear()} Cosmic Mirror · דע את עצמך
          </p>
        </div>
      </footer>
    </div>
  )
}
