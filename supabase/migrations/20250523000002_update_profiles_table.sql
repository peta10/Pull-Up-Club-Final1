-- Add additional fields to the profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_profile_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS social_media text,
ADD COLUMN IF NOT EXISTS street_address text,
ADD COLUMN IF NOT EXISTS apartment text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS zip_code text,
ADD COLUMN IF NOT EXISTS country text; 