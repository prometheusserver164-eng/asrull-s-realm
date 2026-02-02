-- Add icon_scale column to tech_stack table for custom logo sizing
ALTER TABLE public.tech_stack 
ADD COLUMN icon_scale integer DEFAULT 100;

-- Add comment for documentation
COMMENT ON COLUMN public.tech_stack.icon_scale IS 'Scale percentage for the icon (50-150, default 100)';