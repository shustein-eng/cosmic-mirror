-- ============================================================
-- Supabase Storage Buckets (run in Supabase dashboard or via CLI)
-- ============================================================

-- Palm images (private, per-user)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'palm-images',
  'palm-images',
  false,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Handwriting samples (private, per-user)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'handwriting-samples',
  'handwriting-samples',
  false,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Face images (private, per-user, auto-delete after analysis)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'face-images',
  'face-images',
  false,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Generated shareable cards (public read)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-cards',
  'profile-cards',
  true,
  5242880, -- 5MB
  ARRAY['image/png', 'image/jpeg']
) ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies: users can only access their own files
CREATE POLICY "palm_images_user_access" ON storage.objects
  FOR ALL USING (
    bucket_id = 'palm-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "handwriting_samples_user_access" ON storage.objects
  FOR ALL USING (
    bucket_id = 'handwriting-samples' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "face_images_user_access" ON storage.objects
  FOR ALL USING (
    bucket_id = 'face-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "profile_cards_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-cards');

CREATE POLICY "profile_cards_user_write" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-cards' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
