-- Create storage bucket for profile assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-assets', 'profile-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public to view profile assets
CREATE POLICY "Public can view profile assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-assets');

-- Allow admins to upload profile assets
CREATE POLICY "Admins can upload profile assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-assets' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to update profile assets
CREATE POLICY "Admins can update profile assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-assets' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to delete profile assets
CREATE POLICY "Admins can delete profile assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-assets' 
  AND has_role(auth.uid(), 'admin'::app_role)
);