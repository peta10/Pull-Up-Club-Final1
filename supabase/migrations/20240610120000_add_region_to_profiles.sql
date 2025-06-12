-- Add region column to profiles table for region dropdown support
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS region text; 