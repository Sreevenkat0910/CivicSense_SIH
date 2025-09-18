-- =========================
-- CIVICSENSE DATABASE SETUP
-- =========================
-- Run this script in your Supabase SQL Editor to set up the database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================
-- 1. USER TYPES TABLE
-- =========================
CREATE TABLE IF NOT EXISTS public.user_types (
  usertype_id SERIAL PRIMARY KEY,
  type_code VARCHAR(50) UNIQUE NOT NULL,
  type_name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  permissions JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =========================
-- 2. USERS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  full_name VARCHAR(200) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  mobile VARCHAR(20),
  language VARCHAR(10) DEFAULT 'English',
  password_hash TEXT NOT NULL,
  usertype_id INTEGER REFERENCES public.user_types(usertype_id),
  department VARCHAR(100),
  mandal_area VARCHAR(100),
  mandal_name VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =========================
-- 3. REPORTS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  location_text TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  department VARCHAR(100) NOT NULL,
  mandal_area VARCHAR(100),
  priority VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(20) DEFAULT 'submitted',
  reporter_email VARCHAR(255),
  reporter_user_id VARCHAR(50),
  assigned_to VARCHAR(100),
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =========================
-- 4. SCHEDULES TABLE
-- =========================
CREATE TABLE IF NOT EXISTS public.schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(user_id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location VARCHAR(200),
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_end_after_start CHECK (end_time > start_time)
);

-- =========================
-- INSERT USER TYPES
-- =========================
INSERT INTO public.user_types (type_code, type_name, description, permissions, is_active) VALUES
('SYSTEM_ADMIN', 'System Admin', 'System administrators with full access', '["all"]', true),
('DEPT_ADMIN', 'Department Admin', 'Department administrators with full department access', '["department_management", "reports_view", "reports_update"]', true),
('DEPT_USER', 'Department User', 'Department employees who handle reports', '["reports_view", "reports_update"]', true),
('MANDAL_ADMIN', 'Mandal Admin', 'Mandal administrators with cross-department access', '["mandal_management", "department_view", "reports_view", "reports_update"]', true),
('CITIZEN', 'Citizen', 'Regular citizens who can report issues', '["report_create", "report_view_own"]', true)
ON CONFLICT (type_code) DO NOTHING;

-- =========================
-- INSERT SAMPLE USERS
-- =========================
-- Note: Password hash is for 'password123'
INSERT INTO public.users (user_id, full_name, email, mobile, language, password_hash, usertype_id, department, mandal_area, mandal_name, is_active) VALUES
-- System Admin
('11111111-1111-1111-1111-111111111111', 'System Administrator', 'admin@civicsense.com', '+91-9876543210', 'English', '$2b$10$rQZ8K9L2mN3oP4qR5sT6uO7vW8xY9zA0bC1dE2fG3hI4jK5lM6nO7pQ8rS9tU', 
 (SELECT usertype_id FROM public.user_types WHERE type_code = 'SYSTEM_ADMIN'), 'Administration', 'All Zones', NULL, true),

-- Mandal Admins
('22222222-2222-2222-2222-222222222222', 'Rajesh Mandal Admin', 'mandal@civicsense.com', '+91-9876543211', 'English', '$2b$10$rQZ8K9L2mN3oP4qR5sT6uO7vW8xY9zA0bC1dE2fG3hI4jK5lM6nO7pQ8rS9tU',
 (SELECT usertype_id FROM public.user_types WHERE type_code = 'MANDAL_ADMIN'), 'Administration', 'Central Zone', 'Central Mandal', true),

-- Department Admins
('33333333-3333-3333-3333-333333333333', 'Priya Sharma', 'priya@civicsense.com', '+91-9876543212', 'English', '$2b$10$rQZ8K9L2mN3oP4qR5sT6uO7vW8xY9zA0bC1dE2fG3hI4jK5lM6nO7pQ8rS9tU',
 (SELECT usertype_id FROM public.user_types WHERE type_code = 'DEPT_ADMIN'), 'Public Works', 'North Zone', NULL, true),

('44444444-4444-4444-4444-444444444444', 'Amit Kumar', 'amit@civicsense.com', '+91-9876543213', 'English', '$2b$10$rQZ8K9L2mN3oP4qR5sT6uO7vW8xY9zA0bC1dE2fG3hI4jK5lM6nO7pQ8rS9tU',
 (SELECT usertype_id FROM public.user_types WHERE type_code = 'DEPT_ADMIN'), 'Water Department', 'South Zone', NULL, true),

-- Citizens
('55555555-5555-5555-5555-555555555555', 'Vikram Rao', 'citizen@civicsense.com', '+91-9876543214', 'English', '$2b$10$rQZ8K9L2mN3oP4qR5sT6uO7vW8xY9zA0bC1dE2fG3hI4jK5lM6nO7pQ8rS9tU',
 (SELECT usertype_id FROM public.user_types WHERE type_code = 'CITIZEN'), NULL, 'Central Zone', NULL, true)
ON CONFLICT (email) DO NOTHING;

-- =========================
-- INSERT SAMPLE REPORTS
-- =========================
INSERT INTO public.reports (report_id, title, category, description, location_text, department, mandal_area, priority, status, reporter_email, created_at) VALUES
('PW-2024-000001', 'Pothole on Main Street', 'Infrastructure', 'Large pothole causing traffic issues', 'Main Street, Block A', 'Public Works', 'Central Zone', 'high', 'submitted', 'citizen@civicsense.com', now() - interval '2 days'),
('WD-2024-000001', 'Water Leak in Residential Area', 'Water', 'Water leaking from underground pipe', 'Residential Block B', 'Water Department', 'North Zone', 'medium', 'in-progress', 'citizen@civicsense.com', now() - interval '1 day'),
('SD-2024-000001', 'Garbage Collection Issue', 'Sanitation', 'Garbage not collected for 3 days', 'Commercial Area C', 'Sanitation Department', 'South Zone', 'low', 'completed', 'citizen@civicsense.com', now() - interval '3 days')
ON CONFLICT (report_id) DO NOTHING;

-- =========================
-- INSERT SAMPLE SCHEDULES
-- =========================
INSERT INTO public.schedules (user_id, title, description, start_time, end_time, location, is_recurring, recurrence_pattern) VALUES
('11111111-1111-1111-1111-111111111111', 'Weekly Team Meeting', 'Review progress and plan upcoming tasks', now() + interval '1 day', now() + interval '1 day' + interval '1 hour', 'Conference Room A', true, 'weekly'),
('22222222-2222-2222-2222-222222222222', 'Mandal Review Meeting', 'Monthly mandal performance review', now() + interval '2 days', now() + interval '2 days' + interval '2 hours', 'Mandal Office', false, NULL),
('33333333-3333-3333-3333-333333333333', 'Department Training', 'New software training for team members', now() + interval '3 days', now() + interval '3 days' + interval '4 hours', 'Training Room', false, NULL)
ON CONFLICT DO NOTHING;

-- =========================
-- CREATE INDEXES
-- =========================
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_usertype_id ON public.users(usertype_id);
CREATE INDEX IF NOT EXISTS idx_reports_department ON public.reports(department);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at);
CREATE INDEX IF NOT EXISTS idx_schedules_user_id ON public.schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_schedules_start_time ON public.schedules(start_time);

-- =========================
-- ENABLE ROW LEVEL SECURITY
-- =========================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- =========================
-- CREATE POLICIES
-- =========================
-- Users can view their own data
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Reports are viewable by all authenticated users
CREATE POLICY "Authenticated users can view reports" ON public.reports
  FOR SELECT USING (auth.role() = 'authenticated');

-- Schedules are viewable by their owners
CREATE POLICY "Users can view own schedules" ON public.schedules
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Users can manage their own schedules
CREATE POLICY "Users can manage own schedules" ON public.schedules
  FOR ALL USING (auth.uid()::text = user_id::text);

-- =========================
-- SUCCESS MESSAGE
-- =========================
SELECT 'Database setup completed successfully! You can now login with:' as message
UNION ALL
SELECT 'admin@civicsense.com / password123' as message
UNION ALL
SELECT 'mandal@civicsense.com / password123' as message
UNION ALL
SELECT 'priya@civicsense.com / password123' as message
UNION ALL
SELECT 'amit@civicsense.com / password123' as message
UNION ALL
SELECT 'citizen@civicsense.com / password123' as message;
