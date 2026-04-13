'use client'

import ImageLensInput from './ImageLensInput'

interface PalmInputProps {
  lensInputId: string
  profileId: string
  initialData: Record<string, unknown>
  onComplete: () => void
}

export default function PalmInput({ lensInputId, profileId, onComplete }: PalmInputProps) {
  return (
    <ImageLensInput
      lensInputId={lensInputId}
      profileId={profileId}
      uploadType="palm"
      analyzeEndpoint="/api/analyze/palm"
      title="Palm Reading"
      subtitle="Chirology analysis of your dominant hand"
      icon="✋"
      instructions={[
        'Use your dominant hand (right hand for right-handed people)',
        'Hold your palm flat, fingers together, facing the camera',
        'Ensure good lighting — your lines should be clearly visible',
        'Take the photo from directly above, filling the frame with your palm',
        'A clear, in-focus photo gives the most accurate analysis',
      ]}
      showDeleteOption={true}
      privacyNote="Your palm image is used only for analysis and is never shared. You can choose to delete it immediately after analysis."
      onComplete={onComplete}
    />
  )
}
