-- ============================================================
-- Cosmic Mirror — Batch Features Migration
-- Phase 2: Iridology, Tanach Figure, Cosmic Twins, Gift Codes,
--           Family Constellation, Couples Package
-- ============================================================

-- Update lens_inputs to support iridology (replaces gematria)
ALTER TABLE lens_inputs
  DROP CONSTRAINT IF EXISTS lens_inputs_lens_type_check;

ALTER TABLE lens_inputs
  ADD CONSTRAINT lens_inputs_lens_type_check
  CHECK (lens_type IN (
    'palm', 'natal_chart', 'iridology', 'handwriting', 'face_reading',
    'color_psychology', 'middos_assessment', 'biorhythm', 'chinese_zodiac', 'enneagram'
  ));

-- Tanach figure matches (one per profile — upserted on regenerate)
CREATE TABLE IF NOT EXISTS tanach_figures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES personality_profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  figure_data JSONB NOT NULL DEFAULT '{}',
  generated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for tanach_figures
ALTER TABLE tanach_figures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tanach figures"
  ON tanach_figures FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM personality_profiles
      WHERE personality_profiles.id = tanach_figures.profile_id
        AND personality_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own tanach figures"
  ON tanach_figures FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM personality_profiles
      WHERE personality_profiles.id = tanach_figures.profile_id
        AND personality_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own tanach figures"
  ON tanach_figures FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM personality_profiles
      WHERE personality_profiles.id = tanach_figures.profile_id
        AND personality_profiles.user_id = auth.uid()
    )
  );

-- Gift codes (purchased by one user, redeemed by another)
CREATE TABLE IF NOT EXISTS gift_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  gifter_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  plan TEXT NOT NULL DEFAULT 'premium_monthly',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'redeemed', 'expired')),
  stripe_session_id TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  redeemed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  redeemed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for gift_codes
ALTER TABLE gift_codes ENABLE ROW LEVEL SECURITY;

-- Gifters can see codes they purchased
CREATE POLICY "Gifters can view their gift codes"
  ON gift_codes FOR SELECT
  USING (gifter_user_id = auth.uid());

-- Anyone authenticated can read an active code to redeem it (validated in API)
CREATE POLICY "Authenticated users can lookup gift codes"
  ON gift_codes FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only service role inserts (via API routes)
CREATE POLICY "Service role can insert gift codes"
  ON gift_codes FOR INSERT
  WITH CHECK (auth.role() = 'service_role' OR gifter_user_id = auth.uid());

-- Service role manages updates (activation via webhook, redemption via API)
CREATE POLICY "Service role can update gift codes"
  ON gift_codes FOR UPDATE
  USING (auth.role() = 'service_role' OR auth.uid() IS NOT NULL);

-- Opt-in for Cosmic Twins matching
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS opt_in_cosmic_twins BOOLEAN DEFAULT FALSE;

-- Index for cosmic twins queries
CREATE INDEX IF NOT EXISTS idx_profiles_opt_in_cosmic_twins
  ON profiles (opt_in_cosmic_twins)
  WHERE opt_in_cosmic_twins = TRUE;

-- Index for tanach_figures profile lookup
CREATE INDEX IF NOT EXISTS idx_tanach_figures_profile_id
  ON tanach_figures (profile_id);

-- Index for gift code lookup by code
CREATE INDEX IF NOT EXISTS idx_gift_codes_code
  ON gift_codes (code);

-- Index for gift codes by gifter
CREATE INDEX IF NOT EXISTS idx_gift_codes_gifter
  ON gift_codes (gifter_user_id);
