-- Migration to add foreign key constraint for reporter_user_id
-- This script adds the foreign key relationship between reports and users tables

-- First, add the reporter_user_id column if it doesn't exist
ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS reporter_user_id text;

-- Add the foreign key constraint
ALTER TABLE public.reports 
ADD CONSTRAINT fk_reports_reporter_user_id 
FOREIGN KEY (reporter_user_id) REFERENCES public.users(user_id);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_reports_reporter_user_id ON public.reports(reporter_user_id);

-- Add the new columns if they don't exist
ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium';

ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS assigned_to text;

ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS resolution_notes text;

ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS resolved_at timestamptz;

ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_reports_updated_at ON public.reports;
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_priority ON public.reports(priority);
CREATE INDEX IF NOT EXISTS idx_reports_assigned_to ON public.reports(assigned_to);
CREATE INDEX IF NOT EXISTS idx_reports_resolved_at ON public.reports(resolved_at);
CREATE INDEX IF NOT EXISTS idx_reports_updated_at ON public.reports(updated_at);
