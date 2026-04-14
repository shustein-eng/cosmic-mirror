export type SubscriptionTier = 'free' | 'premium' | 'lifetime'

export type LensType =
  | 'palm'
  | 'natal_chart'
  | 'iridology'
  | 'handwriting'
  | 'face_reading'
  | 'color_psychology'
  | 'middos_assessment'
  | 'biorhythm'
  | 'chinese_zodiac'
  | 'enneagram'

export type ReportType =
  | 'full_cosmic'
  | 'career'
  | 'relationships'
  | 'growth'
  | 'creative'
  | 'wellness'
  | 'leadership'

export interface Profile {
  id: string
  display_name: string | null
  email: string | null
  subscription_tier: SubscriptionTier
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  created_at: string
  updated_at: string
}

export interface PersonalityProfile {
  id: string
  user_id: string
  profile_name: string
  is_primary: boolean
  created_at: string
  updated_at: string
}

export interface LensInput {
  id: string
  profile_id: string
  lens_type: LensType
  input_data: Record<string, unknown>
  image_path: string | null
  analysis_result: LensAnalysisResult | null
  created_at: string
}

export interface LensAnalysisResult {
  traits: Trait[]
  summary: string
  notable_features: string[]
  growth_indicators: string[]
  methodology_note: string
}

export interface Trait {
  category: 'communication' | 'emotional' | 'intellectual' | 'social' | 'drive' | 'creativity' | 'leadership' | 'resilience'
  trait_name: string
  description: string
  confidence: 'high' | 'medium' | 'low'
  evidence: string
  source_tradition: string
}

export interface Report {
  id: string
  profile_id: string
  report_type: ReportType
  lenses_used: LensType[]
  report_content: ReportContent
  convergence_data: ConvergenceData | null
  created_at: string
}

export interface ReportContent {
  title: string
  cosmic_signature: string
  sections: ReportSection[]
  top_strengths: Strength[]
  growth_opportunities: GrowthOpportunity[]
  closing_reflection: string
}

export interface ReportSection {
  heading: string
  content: string
  convergence_score: number
  contributing_lenses: string[]
  key_insight: string
}

export interface Strength {
  name: string
  description: string
  evidence_from: string[]
}

export interface GrowthOpportunity {
  area: string
  current_state: string
  growth_direction: string
  practical_steps: string[]
}

export interface ConvergenceData {
  trait_convergence: Record<string, number>
  high_confidence_traits: string[]
  nuanced_areas: string[]
}

export interface LensCard {
  type: LensType
  name: string
  hebrewName?: string
  description: string
  icon: string
  tier: 1 | 2 | 3
  tierLabel: 'Scholarly Foundation' | 'Established Practice' | 'Cultural Tradition'
  phase: 1 | 2 | 3
  inputType: 'questionnaire' | 'calculation' | 'image' | 'interactive'
}

export const LENS_CARDS: LensCard[] = [
  {
    type: 'iridology',
    name: 'Iridology',
    description: 'Upload a close-up photo of your iris. The unique fiber structure, color patterns, rings, and pigmentation of your eye are interpreted for personality insights.',
    icon: '👁',
    tier: 3,
    tierLabel: 'Cultural Tradition',
    phase: 2,
    inputType: 'image',
  },
  {
    type: 'natal_chart',
    name: 'Natal Birth Chart',
    hebrewName: 'מפת המזל',
    description: 'The precise planetary positions at your birth moment reveal your core temperament, emotional nature, and life approach.',
    icon: '✦',
    tier: 1,
    tierLabel: 'Scholarly Foundation',
    phase: 1,
    inputType: 'calculation',
  },
  {
    type: 'middos_assessment',
    name: 'Middos Assessment',
    hebrewName: 'מידות',
    description: 'A 40-question scenario-based assessment mapping your character traits across the 13 classical middos categories.',
    icon: '◈',
    tier: 2,
    tierLabel: 'Established Practice',
    phase: 1,
    inputType: 'questionnaire',
  },
  {
    type: 'color_psychology',
    name: 'Color Psychology',
    description: 'An immersive color selection experience reveals your emotional landscape, energy states, and hidden personality dimensions.',
    icon: '◉',
    tier: 2,
    tierLabel: 'Established Practice',
    phase: 1,
    inputType: 'interactive',
  },
  {
    type: 'palm',
    name: 'Palm Reading',
    description: 'Upload a photo of your dominant hand for a detailed chirology analysis of your heart, head, life, and fate lines.',
    icon: '✋',
    tier: 3,
    tierLabel: 'Cultural Tradition',
    phase: 2,
    inputType: 'image',
  },
  {
    type: 'handwriting',
    name: 'Handwriting Analysis',
    description: 'Your natural handwriting reveals emotional responsiveness, energy levels, self-image, and communication style through graphology.',
    icon: '✍',
    tier: 2,
    tierLabel: 'Established Practice',
    phase: 2,
    inputType: 'image',
  },
  {
    type: 'face_reading',
    name: 'Face Reading',
    description: 'An optional facial physiognomy analysis drawing on ancient cross-cultural traditions of personality reading. Fully private.',
    icon: '◎',
    tier: 3,
    tierLabel: 'Cultural Tradition',
    phase: 2,
    inputType: 'image',
  },
  {
    type: 'biorhythm',
    name: 'Biorhythm Cycles',
    description: 'Mathematical cycles from your birth date reveal your natural rhythms of physical energy, emotion, and intellectual clarity.',
    icon: '∿',
    tier: 3,
    tierLabel: 'Cultural Tradition',
    phase: 3,
    inputType: 'calculation',
  },
  {
    type: 'chinese_zodiac',
    name: 'Chinese Zodiac & Element',
    description: 'Your birth year and hour reveal your animal archetype, elemental nature, inner self, and hidden self in this 2000-year tradition.',
    icon: '☯',
    tier: 3,
    tierLabel: 'Cultural Tradition',
    phase: 3,
    inputType: 'calculation',
  },
  {
    type: 'enneagram',
    name: 'Enneagram Deep Dive',
    description: 'A 36-question forced-choice assessment reveals your core Enneagram type, wing influence, tri-type, and growth path.',
    icon: '⬡',
    tier: 1,
    tierLabel: 'Scholarly Foundation',
    phase: 1,
    inputType: 'questionnaire',
  },
]
