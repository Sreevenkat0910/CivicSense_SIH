-- Complete CivicSense Database Setup
-- Run this script in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================
-- 1. USER TYPES TABLE
-- =========================
CREATE TABLE IF NOT EXISTS public.user_types (
  usertype_id SERIAL PRIMARY KEY,
  type_name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =========================
-- 2. USERS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  mobile VARCHAR(20),
  language VARCHAR(10) DEFAULT 'English',
  password_hash TEXT NOT NULL,
  usertype_id INTEGER REFERENCES public.user_types(usertype_id),
  department VARCHAR(100),
  mandal_area VARCHAR(100),
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
  photos JSONB DEFAULT '[]'::jsonb,
  voice_note_url TEXT,
  department VARCHAR(100) NOT NULL,
  mandal_area VARCHAR(100),
  priority VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(50) DEFAULT 'submitted',
  reporter_email VARCHAR(255),
  reporter_user_id UUID REFERENCES public.users(user_id),
  assigned_to VARCHAR(200),
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_report_status CHECK (status IN ('submitted', 'triaged', 'assigned', 'in_progress', 'resolved', 'rejected', 'closed')),
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent'))
);

-- =========================
-- 4. ATTACHMENTS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS public.attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100),
  uploaded_by UUID REFERENCES public.users(user_id),
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_file_type CHECK (file_type IN ('photo', 'voice', 'document'))
);

-- =========================
-- 5. REPORT COMMENTS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS public.report_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(user_id),
  comment TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =========================
-- 6. NOTIFICATIONS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(user_id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  related_report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_notification_type CHECK (type IN ('info', 'warning', 'error', 'success'))
);

-- =========================
-- 7. SCHEDULES TABLE
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
-- 8. REPORT SEQUENCES TABLE
-- =========================
CREATE TABLE IF NOT EXISTS public.report_sequences (
  department_code VARCHAR(4) NOT NULL,
  year VARCHAR(4) NOT NULL,
  sequence_number BIGINT DEFAULT 1,
  PRIMARY KEY (department_code, year)
);

-- =========================
-- 9. AUDIT LOGS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(user_id),
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =========================
-- 10. INDEXES
-- =========================
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_usertype ON public.users(usertype_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_department ON public.reports(department);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at);
CREATE INDEX IF NOT EXISTS idx_reports_location ON public.reports(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_attachments_report_id ON public.attachments(report_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_schedules_user_id ON public.schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_schedules_start_time ON public.schedules(start_time);

-- =========================
-- 11. ROW LEVEL SECURITY
-- =========================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- Users can view their own data
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (user_id = (SELECT auth.uid())::text);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (user_id = (SELECT auth.uid())::text);

-- Reports policies
CREATE POLICY "Users can view reports" ON public.reports
  FOR SELECT USING (true);

CREATE POLICY "Users can create reports" ON public.reports
  FOR INSERT WITH CHECK (true);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (user_id = (SELECT auth.uid())::uuid);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (user_id = (SELECT auth.uid())::uuid);

-- Schedules policies
CREATE POLICY "Users can view own schedules" ON public.schedules
  FOR SELECT USING (user_id = (SELECT auth.uid())::uuid);

CREATE POLICY "Users can manage own schedules" ON public.schedules
  FOR ALL USING (user_id = (SELECT auth.uid())::uuid);

-- =========================
-- 12. FUNCTIONS
-- =========================
-- Generate report ID function
CREATE OR REPLACE FUNCTION public.generate_report_id(dept_code VARCHAR(4))
RETURNS VARCHAR(50) AS $$
DECLARE
  year_part VARCHAR(4);
  seq_num BIGINT;
BEGIN
  year_part := EXTRACT(YEAR FROM now())::VARCHAR;

  INSERT INTO public.report_sequences (department_code, year, sequence_number)
  VALUES (dept_code, year_part, 1)
  ON CONFLICT (department_code, year)
  DO UPDATE SET sequence_number = report_sequences.sequence_number + 1
  RETURNING sequence_number INTO seq_num;

  RETURN dept_code || '-' || year_part || '-' || LPAD(seq_num::VARCHAR, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- =========================
-- 13. SAMPLE DATA
-- =========================

-- Insert user types
INSERT INTO public.user_types (usertype_id, type_name, description, permissions) VALUES
(1, 'admin', 'System Administrator', '["all"]'),
(2, 'department', 'Department Head', '["department_management", "reports_view", "reports_update"]'),
(3, 'mandal-admin', 'Mandal Administrator', '["mandal_management", "department_view", "reports_view", "reports_update"]'),
(4, 'citizen', 'Citizen', '["report_create", "report_view_own"]')
ON CONFLICT (usertype_id) DO NOTHING;

-- Insert sample users
INSERT INTO public.users (user_id, full_name, email, mobile, language, password_hash, usertype_id, department, mandal_area, is_active) VALUES
('admin-001', 'System Administrator', 'admin@civicsense.com', '+91 9876543210', 'English', '$2b$10$rQZ8K9vL2mN3pO4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 1, 'Administration', 'All Zones', true),
('dept-001', 'Priya Sharma', 'priya@civicsense.com', '+91 9876543211', 'English', '$2b$10$rQZ8K9vL2mN3pO4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 2, 'Public Works', 'North Zone', true),
('dept-002', 'Amit Patel', 'amit@civicsense.com', '+91 9876543212', 'English', '$2b$10$rQZ8K9vL2mN3pO4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 2, 'Water Department', 'South Zone', true),
('mandal-001', 'Sunita Reddy', 'mandal@civicsense.com', '+91 9876543213', 'English', '$2b$10$rQZ8K9vL2mN3pO4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 3, 'Administration', 'All Zones', true),
('citizen-001', 'Vikram Rao', 'citizen@civicsense.com', '+91 9876543214', 'English', '$2b$10$rQZ8K9vL2mN3pO4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 4, null, 'Central Zone', true)
ON CONFLICT (user_id) DO NOTHING;

-- Insert sample reports
INSERT INTO public.reports (report_id, title, category, description, location_text, latitude, longitude, department, mandal_area, priority, status, reporter_email, reporter_user_id, assigned_to, resolution_notes) VALUES
('PUBW-2024-000001', 'Broken Street Light', 'Infrastructure', 'Street light on Main Road near Central Park is not working for the past 3 days', 'Main Road, Central Park', 18.4361, 79.1282, 'Public Works', 'Central Zone', 'medium', 'pending', 'citizen@civicsense.com', 'citizen-001', null, null),
('WATR-2024-000001', 'Water Leakage', 'Water', 'Water pipe leakage causing water wastage and road damage', 'Gandhi Nagar, Block A', 18.4361, 79.1282, 'Water Department', 'North Zone', 'high', 'in_progress', 'citizen@civicsense.com', 'citizen-001', 'Water Department Team', 'Team dispatched, repair work in progress'),
('PUBW-2024-000002', 'Pothole on Highway', 'Roads', 'Large pothole on National Highway causing traffic issues', 'NH-44, Near Toll Plaza', 18.4361, 79.1282, 'Public Works', 'South Zone', 'high', 'completed', 'citizen@civicsense.com', 'citizen-001', 'Road Maintenance Team', 'Pothole filled and road resurfaced'),
('SANI-2024-000001', 'Garbage Collection Issue', 'Sanitation', 'Garbage not being collected regularly in residential area', 'Residential Colony, Sector 5', 18.4361, 79.1282, 'Sanitation Department', 'East Zone', 'medium', 'pending', 'citizen@civicsense.com', 'citizen-001', null, null)
ON CONFLICT (report_id) DO NOTHING;

-- Insert sample notifications
INSERT INTO public.notifications (user_id, title, message, type, related_report_id) VALUES
('citizen-001', 'Report Submitted', 'Your report PUBW-2024-000001 has been submitted successfully.', 'success', (SELECT id FROM public.reports WHERE report_id = 'PUBW-2024-000001')),
('citizen-001', 'Report Status Update', 'Your report WATR-2024-000001 status has been updated to In Progress.', 'info', (SELECT id FROM public.reports WHERE report_id = 'WATR-2024-000001')),
('citizen-001', 'Report Resolved', 'Your report PUBW-2024-000002 has been resolved.', 'success', (SELECT id FROM public.reports WHERE report_id = 'PUBW-2024-000002'))
ON CONFLICT DO NOTHING;

-- Insert sample schedules
INSERT INTO public.schedules (user_id, title, description, start_time, end_time, location) VALUES
('dept-001', 'Department Meeting', 'Weekly department review meeting', '2024-01-20 10:00:00+05:30', '2024-01-20 11:00:00+05:30', 'Conference Room A'),
('dept-002', 'Field Inspection', 'Water main inspection in North Zone', '2024-01-21 09:00:00+05:30', '2024-01-21 12:00:00+05:30', 'North Zone'),
('mandal-001', 'Sanitation Review', 'Monthly sanitation department review', '2024-01-22 14:00:00+05:30', '2024-01-22 16:00:00+05:30', 'Department Office')
ON CONFLICT DO NOTHING;

-- =========================
-- 14. VIEWS
-- =========================
CREATE OR REPLACE VIEW public.report_summary AS
SELECT 
  r.id,
  r.report_id,
  r.title,
  r.category,
  r.status,
  r.priority,
  r.department,
  r.created_at,
  u.full_name as reporter_name,
  u.email as reporter_email,
  COUNT(a.id) as attachment_count,
  COUNT(c.id) as comment_count
FROM public.reports r
LEFT JOIN public.users u ON r.reporter_user_id = u.user_id
LEFT JOIN public.attachments a ON r.id = a.report_id AND a.is_deleted = false
LEFT JOIN public.report_comments c ON r.id = c.report_id
GROUP BY r.id, r.report_id, r.title, r.category, r.status, r.priority, r.department, r.created_at, u.full_name, u.email;

-- =========================
-- VERIFICATION
-- =========================
-- Check if all tables are created
SELECT 'Tables Created' as status, COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public'
UNION ALL
SELECT 'User Types', COUNT(*) FROM public.user_types
UNION ALL
SELECT 'Users', COUNT(*) FROM public.users
UNION ALL
SELECT 'Reports', COUNT(*) FROM public.reports
UNION ALL
SELECT 'Notifications', COUNT(*) FROM public.notifications
UNION ALL
SELECT 'Schedules', COUNT(*) FROM public.schedules;
