-- ============================================================
-- Cosmic Mirror — Initial Schema
-- ============================================================

-- Users profile (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'lifetime')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Each personality profile a user creates
CREATE TABLE IF NOT EXISTS personality_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  profile_name TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Raw input data and analysis for each lens
CREATE TABLE IF NOT EXISTS lens_inputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES personality_profiles(id) ON DELETE CASCADE NOT NULL,
  lens_type TEXT NOT NULL CHECK (lens_type IN (
    'palm', 'natal_chart', 'gematria', 'handwriting', 'face_reading',
    'color_psychology', 'middos_assessment', 'biorhythm', 'chinese_zodiac', 'enneagram'
  )),
  input_data JSONB NOT NULL DEFAULT '{}',
  image_path TEXT,
  analysis_result JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Generated reports
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES personality_profiles(id) ON DELETE CASCADE NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN (
    'full_cosmic', 'career', 'relationships', 'growth', 'creative', 'wellness', 'leadership'
  )),
  lenses_used TEXT[] NOT NULL,
  report_content JSONB NOT NULL DEFAULT '{}',
  convergence_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Profile comparisons (premium feature — Phase 5)
CREATE TABLE IF NOT EXISTS profile_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  profile_a_id UUID REFERENCES personality_profiles(id) ON DELETE CASCADE,
  profile_b_id UUID REFERENCES personality_profiles(id) ON DELETE CASCADE,
  comparison_type TEXT NOT NULL,
  comparison_result JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Comparison share tokens
CREATE TABLE IF NOT EXISTS comparison_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_profile_id UUID REFERENCES personality_profiles(id) ON DELETE CASCADE,
  invite_token TEXT UNIQUE NOT NULL,
  accepted_by UUID REFERENCES profiles(id),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE personality_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lens_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparison_invites ENABLE ROW LEVEL SECURITY;

-- profiles: users can only read/write their own
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- personality_profiles: users can only access their own
CREATE POLICY "personality_profiles_select_own" ON personality_profiles
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "personality_profiles_insert_own" ON personality_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "personality_profiles_update_own" ON personality_profiles
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "personality_profiles_delete_own" ON personality_profiles
  FOR DELETE USING (user_id = auth.uid());

-- lens_inputs: users can only access lens inputs for their profiles
CREATE POLICY "lens_inputs_select_own" ON lens_inputs
  FOR SELECT USING (
    profile_id IN (SELECT id FROM personality_profiles WHERE user_id = auth.uid())
  );
CREATE POLICY "lens_inputs_insert_own" ON lens_inputs
  FOR INSERT WITH CHECK (
    profile_id IN (SELECT id FROM personality_profiles WHERE user_id = auth.uid())
  );
CREATE POLICY "lens_inputs_update_own" ON lens_inputs
  FOR UPDATE USING (
    profile_id IN (SELECT id FROM personality_profiles WHERE user_id = auth.uid())
  );
CREATE POLICY "lens_inputs_delete_own" ON lens_inputs
  FOR DELETE USING (
    profile_id IN (SELECT id FROM personality_profiles WHERE user_id = auth.uid())
  );

-- reports: users can only access their own reports
CREATE POLICY "reports_select_own" ON reports
  FOR SELECT USING (
    profile_id IN (SELECT id FROM personality_profiles WHERE user_id = auth.uid())
  );
CREATE POLICY "reports_insert_own" ON reports
  FOR INSERT WITH CHECK (
    profile_id IN (SELECT id FROM personality_profiles WHERE user_id = auth.uid())
  );
CREATE POLICY "reports_delete_own" ON reports
  FOR DELETE USING (
    profile_id IN (SELECT id FROM personality_profiles WHERE user_id = auth.uid())
  );

-- comparison_invites: publicly readable by token
CREATE POLICY "comparison_invites_select_token" ON comparison_invites
  FOR SELECT USING (true);
CREATE POLICY "comparison_invites_insert_own" ON comparison_invites
  FOR INSERT WITH CHECK (
    inviter_profile_id IN (SELECT id FROM personality_profiles WHERE user_id = auth.uid())
  );

-- profile_comparisons: requester can access
CREATE POLICY "profile_comparisons_select_own" ON profile_comparisons
  FOR SELECT USING (requester_id = auth.uid());
CREATE POLICY "profile_comparisons_insert_own" ON profile_comparisons
  FOR INSERT WITH CHECK (requester_id = auth.uid());

-- ============================================================
-- Auto-create profile on user signup
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    new.email
  );
  RETURN new;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- ============================================================
-- Updated_at trigger
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER personality_profiles_updated_at
  BEFORE UPDATE ON personality_profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
