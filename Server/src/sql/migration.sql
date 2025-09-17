-- Migration script to update existing reports table
-- Run this in your Supabase SQL editor

-- Add new columns to existing reports table
ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS reporter_user_id text REFERENCES public.users(user_id),
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS assigned_to text,
ADD COLUMN IF NOT EXISTS resolution_notes text,
ADD COLUMN IF NOT EXISTS resolved_at timestamptz,
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Update existing records to have default values
UPDATE public.reports 
SET status = 'pending', priority = 'medium', updated_at = now() 
WHERE status IS NULL OR priority IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reports_category ON public.reports(category);
CREATE INDEX IF NOT EXISTS idx_reports_department ON public.reports(department);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at);
CREATE INDEX IF NOT EXISTS idx_reports_location ON public.reports USING gist(point(longitude, latitude));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_reports_updated_at ON public.reports;
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
