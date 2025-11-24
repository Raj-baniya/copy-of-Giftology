-- Add addresses column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS addresses JSONB DEFAULT '[]';
