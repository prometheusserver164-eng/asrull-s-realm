-- Create storage bucket for tech icons
INSERT INTO storage.buckets (id, name, public)
VALUES ('tech-icons', 'tech-icons', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public can view tech icons"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'tech-icons');

-- Allow admins to upload/delete
CREATE POLICY "Admins can upload tech icons"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tech-icons' AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete tech icons"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'tech-icons' AND public.has_role(auth.uid(), 'admin'::public.app_role));