-- Add custom_icon_url column to tech_stack table for custom uploaded logos
ALTER TABLE public.tech_stack ADD COLUMN IF NOT EXISTS custom_icon_url TEXT;