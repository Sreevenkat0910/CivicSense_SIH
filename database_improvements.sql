-- =========================
-- MINOR IMPROVEMENTS FOR CIVICSENSE DATABASE
-- =========================

-- =========================
-- 1. ADD VOICE NOTE SUPPORT TO ATTACHMENTS
-- =========================
-- Your server code expects voice_note_url but your schema uses separate attachments table
-- This is actually BETTER, but let's ensure voice notes are properly supported

-- Update attachments table to handle voice notes better
ALTER TABLE public.attachments 
ADD CONSTRAINT valid_file_type_extended 
CHECK (file_type IN ('photo', 'voice', 'document'));

-- =========================
-- 2. ADD MISSING FIELDS FOR COMPATIBILITY
-- =========================
-- Add fields that your server code might expect

-- Add voice_note_url to reports table for backward compatibility
ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS voice_note_url TEXT;

-- Add photos JSONB field for backward compatibility (though attachments table is better)
ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]'::jsonb;

-- =========================
-- 3. IMPROVE REPORT ID GENERATION
-- =========================
-- Your current function is good, but let's make it more robust

CREATE OR REPLACE FUNCTION public.generate_report_id(dept_code VARCHAR(4))
RETURNS VARCHAR(50) AS $$
DECLARE
  year_part VARCHAR(4);
  seq_num BIGINT;
BEGIN
  year_part := EXTRACT(YEAR FROM now())::VARCHAR;

  -- Use the report_sequences table for proper sequencing
  INSERT INTO public.report_sequences (department_code, year, sequence_number)
  VALUES (dept_code, year_part, 1)
  ON CONFLICT (department_code, year)
  DO UPDATE SET sequence_number = report_sequences.sequence_number + 1
  RETURNING sequence_number INTO seq_num;

  RETURN dept_code || '-' || year_part || '-' || LPAD(seq_num::VARCHAR, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- =========================
-- 4. ADD NOTIFICATION SYSTEM TABLES
-- =========================
-- Your admin dashboard has notifications, so let's add proper tables

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(user_id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info', -- info, warning, error, success
  is_read BOOLEAN DEFAULT false,
  related_report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_notification_type CHECK (type IN ('info', 'warning', 'error', 'success'))
);

-- Index for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (user_id = (SELECT auth.uid())::uuid);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (user_id = (SELECT auth.uid())::uuid);

-- =========================
-- 5. ADD ANALYTICS/STATISTICS TABLES
-- =========================
-- For dashboard analytics

CREATE TABLE IF NOT EXISTS public.report_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  department VARCHAR(100) NOT NULL,
  mandal_area VARCHAR(100),
  category VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL,
  priority VARCHAR(20) NOT NULL,
  count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(date, department, mandal_area, category, status, priority)
);

-- Index for analytics
CREATE INDEX IF NOT EXISTS idx_report_statistics_date ON public.report_statistics(date);
CREATE INDEX IF NOT EXISTS idx_report_statistics_department ON public.report_statistics(department);
CREATE INDEX IF NOT EXISTS idx_report_statistics_mandal_area ON public.report_statistics(mandal_area);

-- =========================
-- 6. ADD SCHEDULE/MANAGEMENT TABLES
-- =========================
-- Your admin dashboard has schedule management

CREATE TABLE IF NOT EXISTS public.schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(user_id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location VARCHAR(200),
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern VARCHAR(50), -- daily, weekly, monthly
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_end_after_start CHECK (end_time > start_time)
);

-- Index for schedules
CREATE INDEX IF NOT EXISTS idx_schedules_user_id ON public.schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_schedules_start_time ON public.schedules(start_time);

-- RLS for schedules
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own schedules" ON public.schedules
  FOR SELECT USING (user_id = (SELECT auth.uid())::uuid);

CREATE POLICY "Users can manage own schedules" ON public.schedules
  FOR ALL USING (user_id = (SELECT auth.uid())::uuid);

-- =========================
-- 7. ADD AUDIT LOG TABLE
-- =========================
-- For tracking important system changes

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

-- Index for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

-- =========================
-- 8. IMPROVE EXISTING CONSTRAINTS
-- =========================
-- Add some additional constraints for data integrity

-- Ensure report status values are valid
ALTER TABLE public.reports 
ADD CONSTRAINT IF NOT EXISTS valid_report_status 
CHECK (status IN ('submitted', 'triaged', 'assigned', 'in_progress', 'resolved', 'rejected', 'closed'));

-- Ensure priority values are valid
ALTER TABLE public.reports 
ADD CONSTRAINT IF NOT EXISTS valid_priority 
CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- =========================
-- 9. ADD HELPFUL VIEWS
-- =========================
-- Create views for common queries

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
-- 10. ADD SAMPLE DATA FOR NEW TABLES
-- =========================

-- Sample notifications
INSERT INTO public.notifications (user_id, title, message, type, related_report_id) VALUES
('99999999-9999-9999-9999-999999999999', 'Report Submitted', 'Your report PUBW-2024-000001 has been submitted successfully.', 'success', (SELECT id FROM public.reports WHERE report_id = 'PUBW-2024-000001')),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Report Status Update', 'Your report WATR-2024-000001 status has been updated to In Progress.', 'info', (SELECT id FROM public.reports WHERE report_id = 'WATR-2024-000001')),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Report Resolved', 'Your report SANI-2024-000001 has been resolved.', 'success', (SELECT id FROM public.reports WHERE report_id = 'SANI-2024-000001'));

-- Sample schedules
INSERT INTO public.schedules (user_id, title, description, start_time, end_time, location) VALUES
('33333333-3333-3333-3333-333333333333', 'Department Meeting', 'Weekly department review meeting', '2024-01-20 10:00:00+05:30', '2024-01-20 11:00:00+05:30', 'Conference Room A'),
('44444444-4444-4444-4444-444444444444', 'Field Inspection', 'Water main inspection in North Zone', '2024-01-21 09:00:00+05:30', '2024-01-21 12:00:00+05:30', 'North Zone'),
('55555555-5555-5555-5555-555555555555', 'Sanitation Review', 'Monthly sanitation department review', '2024-01-22 14:00:00+05:30', '2024-01-22 16:00:00+05:30', 'Department Office');

-- =========================
-- VERIFICATION QUERIES
-- =========================
-- Uncomment to verify all tables exist

-- SELECT 'Tables Created' as status, COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public'
-- UNION ALL
-- SELECT 'User Types', COUNT(*) FROM public.user_types
-- UNION ALL
-- SELECT 'Users', COUNT(*) FROM public.users
-- UNION ALL
-- SELECT 'Reports', COUNT(*) FROM public.reports
-- UNION ALL
-- SELECT 'Attachments', COUNT(*) FROM public.attachments
-- UNION ALL
-- SELECT 'Notifications', COUNT(*) FROM public.notifications
-- UNION ALL
-- SELECT 'Schedules', COUNT(*) FROM public.schedules
-- UNION ALL
-- SELECT 'Audit Logs', COUNT(*) FROM public.audit_logs;
