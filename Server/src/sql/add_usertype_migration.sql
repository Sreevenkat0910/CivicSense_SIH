-- Migration to add usertype table and update users table
-- This script adds the usertype system to the existing database

-- Create User Types table
create table if not exists public.usertype (
  id bigserial primary key,
  usertype_id text unique not null,
  type_name text not null,
  description text,
  permissions jsonb default '{}'::jsonb, -- Store permissions as JSON
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Insert default user types
insert into public.usertype (usertype_id, type_name, description, permissions) values
('CITIZEN', 'Citizen', 'Regular citizen who can report issues', '{"can_report": true, "can_view_own_reports": true}'),
('DEPARTMENT_USER', 'Department User', 'Department staff member', '{"can_report": true, "can_view_own_reports": true, "can_view_department_reports": true, "can_update_status": true}'),
('DEPARTMENT_ADMIN', 'Department Admin', 'Department administrator', '{"can_report": true, "can_view_own_reports": true, "can_view_department_reports": true, "can_update_status": true, "can_assign_tasks": true, "can_view_analytics": true}'),
('MANDAL_ADMIN', 'Mandal Admin', 'Mandal level administrator', '{"can_report": true, "can_view_own_reports": true, "can_view_all_reports": true, "can_update_status": true, "can_assign_tasks": true, "can_view_analytics": true, "can_manage_departments": true, "can_manage_users": true}'),
('SYSTEM_ADMIN', 'System Admin', 'System administrator with full access', '{"can_report": true, "can_view_own_reports": true, "can_view_all_reports": true, "can_update_status": true, "can_assign_tasks": true, "can_view_analytics": true, "can_manage_departments": true, "can_manage_users": true, "can_manage_system": true}')
on conflict (usertype_id) do nothing;

-- Add new columns to users table if they don't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS usertype_id text;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS department text;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS mandal_area text;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS last_login timestamptz;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add foreign key constraint for usertype_id
ALTER TABLE public.users 
ADD CONSTRAINT fk_users_usertype_id 
FOREIGN KEY (usertype_id) REFERENCES public.usertype(usertype_id);

-- Set default usertype for existing users (assuming they are citizens)
UPDATE public.users 
SET usertype_id = 'CITIZEN' 
WHERE usertype_id IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_usertype_usertype_id ON public.usertype(usertype_id);
CREATE INDEX IF NOT EXISTS idx_usertype_type_name ON public.usertype(type_name);
CREATE INDEX IF NOT EXISTS idx_usertype_is_active ON public.usertype(is_active);

CREATE INDEX IF NOT EXISTS idx_users_usertype_id ON public.users(usertype_id);
CREATE INDEX IF NOT EXISTS idx_users_department ON public.users(department);
CREATE INDEX IF NOT EXISTS idx_users_mandal_area ON public.users(mandal_area);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);

-- Create trigger for updated_at on usertype table
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language plpgsql;

-- Drop triggers if they exist and recreate
DROP TRIGGER IF EXISTS update_usertype_updated_at ON public.usertype;
CREATE TRIGGER update_usertype_updated_at
  BEFORE UPDATE ON public.usertype
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
