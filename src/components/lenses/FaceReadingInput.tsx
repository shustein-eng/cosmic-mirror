'use client'

import ImageLensInput from './ImageLensInput'

interface FaceReadingInputProps {
  lensInputId: string
  profileId: string
  initialData: Record<string, unknown>
  onComplete: () => void
}

export default function FaceReadingInput({ lensInputId, profileId, onComplete }: FaceReadingInputProps) {
  return (
    <div className="space-y-4">
      {/* Privacy callout */}
      <div className="glass-card p-5 max-w-2xl mx-auto border-white/10">
        <div className="flex items-start gap-3">
          <span className="text-celestial-gold text-lg mt-0.5">◎</span>
          <div>
            <h3 className="text-white font-medium mb-1">This lens is completely optional</h3>
            <p className="text-soft-silver/60 text-sm">
              Face reading is the most interpretive lens and draws on ancient cultural traditions.
              Your photo is automatically deleted after analysis. You can skip this lens without affecting your profile.
            </p>
          </div>
        </div>
      </div>

      <ImageLensInput
        lensInputId={lensInputId}
        profileId={profileId}
        uploadType="face_reading"
        analyzeEndpoint="/api/analyze/face_reading"
        title="Face Reading"
        subtitle="Ancient physiognomy draws personality insights from facial structure"
        icon="◎"
        instructions={[
          'Use a clear, front-facing photo in natural light',
          'Keep your expression neutral — relaxed and natural',
          'Pull hair back if possible so facial structure is visible',
          'Avoid heavy filters or dramatically edited photos',
          'Your photo will be automatically deleted after analysis',
        ]}
        showDeleteOption={true}
        privacyNote="Face photos are analyzed immediately and deleted by default. This analysis is the most interpretive — findings are cultural associations, not diagnoses."
        onComplete={onComplete}
      />
    </div>
  )
}
