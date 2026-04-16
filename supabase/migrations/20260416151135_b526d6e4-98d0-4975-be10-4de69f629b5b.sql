-- Add missing columns
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS domain text;
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS cluster text;
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS ai_feature_label text;
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT false;

-- Add unique constraint on slug
ALTER TABLE public.sites ADD CONSTRAINT sites_slug_unique UNIQUE (slug);