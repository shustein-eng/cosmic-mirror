'use client'

import ImageLensInput from './ImageLensInput'

interface HandwritingInputProps {
  lensInputId: string
  profileId: string
  initialData: Record<string, unknown>
  onComplete: () => void
}

export default function HandwritingInput({ lensInputId, profileId, onComplete }: HandwritingInputProps) {
  return (
    <div className="space-y-4">
      {/* Sample prompt */}
      <div className="glass-card p-5 max-w-2xl mx-auto border-celestial-gold/20">
        <h3 className="font-serif text-white mb-2">Writing Sample Prompt</h3>
        <p className="text-soft-silver/60 text-sm mb-3">
          Write this passage naturally on unlined paper, then photograph it:
        </p>
        <blockquote className="border-l-2 border-celestial-gold/40 pl-4 text-soft-silver italic text-sm leading-relaxed">
          "The most important thing in life is to know yourself truly — your strengths, your tendencies,
          the ways you naturally think and feel. Self-knowledge is the foundation of all wisdom.
          When we understand our own nature, we can make better choices, build deeper connections,
          and walk a path that is genuinely our own. Write freely about something you care about."
        </blockquote>
      </div>

      <ImageLensInput
        lensInputId={lensInputId}
        profileId={profileId}
        uploadType="handwriting"
        analyzeEndpoint="/api/analyze/handwriting"
        title="Handwriting Analysis"
        subtitle="Graphology reveals your personality through your natural writing style"
        icon="✍"
        instructions={[
          'Write at least one paragraph (ideally 5-10 sentences) on blank, unlined paper',
          'Write naturally — do not try to improve your handwriting',
          'Use your normal pen or pencil; avoid typing or printing',
          'Include your signature at the bottom if comfortable',
          'Photograph the page flat, with even lighting and no shadows',
        ]}
        privacyNote="Your handwriting image is used only for analysis. It is stored securely and never shared."
        onComplete={onComplete}
      />
    </div>
  )
}
