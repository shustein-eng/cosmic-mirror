'use client'

import ImageLensInput from './ImageLensInput'

interface IridologyInputProps {
  lensInputId: string
  profileId: string
  initialData: Record<string, unknown>
  onComplete: () => void
}

export default function IridologyInput({ lensInputId, profileId, onComplete }: IridologyInputProps) {
  return (
    <ImageLensInput
      lensInputId={lensInputId}
      profileId={profileId}
      uploadType="iridology"
      analyzeEndpoint="/api/analyze/iridology"
      title="Iridology"
      subtitle="Iris personality analysis · Cultural Tradition"
      icon="👁"
      instructions={[
        'Use your dominant eye (right eye for right-handed people)',
        'Hold your camera 6–10 cm from the eye in good natural or ring-flash lighting',
        'Keep the eye wide open and look straight ahead',
        'A smartphone macro or portrait mode works well — fill the frame with the iris',
        'Make sure the iris fiber structure is clearly visible and in focus',
      ]}
      showDeleteOption={true}
      privacyNote="Your iris image is processed securely and deleted immediately after analysis by default. No health claims are made — this is personality insight only."
      onComplete={onComplete}
    />
  )
}
