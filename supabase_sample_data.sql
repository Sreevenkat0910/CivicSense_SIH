-- =========================
-- SAMPLE DATA FOR CIVICSENSE PROJECT
-- =========================

-- =========================
-- ADD MANDAL NAME COLUMN TO USERS TABLE
-- =========================
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS mandal_name VARCHAR(100);

-- Add constraint to ensure MANDAL_ADMIN users have mandal_name
ALTER TABLE public.users ADD CONSTRAINT check_mandal_admin_has_mandal_name 
CHECK (
  (user_type_id NOT IN (SELECT id FROM public.user_types WHERE type_code = 'MANDAL_ADMIN')) 
  OR 
  (user_type_id IN (SELECT id FROM public.user_types WHERE type_code = 'MANDAL_ADMIN') AND mandal_name IS NOT NULL)
);

-- Add index for mandal_name
CREATE INDEX IF NOT EXISTS idx_users_mandal_name ON public.users(mandal_name);

-- =========================
-- MANDAL STRUCTURE EXPLANATION
-- =========================
-- Each MANDAL_ADMIN is responsible for a specific mandal (administrative division)
-- Mandal names correspond to their mandal_area zones:
-- - Central Mandal -> Central Zone
-- - North Mandal -> North Zone  
-- - South Mandal -> South Zone
-- - East Mandal -> East Zone
-- - West Mandal -> West Zone
-- 
-- MANDAL_ADMIN users can view and manage reports across all departments
-- within their assigned mandal area.

-- =========================
INSERT INTO public.user_types (type_code, type_name, description, permissions, is_active) VALUES
('CITIZEN', 'Citizen', 'Regular citizens who can report issues', '{"can_report": true, "can_view_own_reports": true}', true),
('DEPT_USER', 'Department User', 'Department employees who handle reports', '{"can_view_dept_reports": true, "can_update_status": true}', true),
('DEPT_ADMIN', 'Department Admin', 'Department administrators with full department access', '{"can_view_dept_reports": true, "can_assign_reports": true, "can_update_status": true, "can_manage_users": true}', true),
('MANDAL_ADMIN', 'Mandal Admin', 'Mandal administrators with cross-department access', '{"can_view_all_reports": true, "can_assign_reports": true, "can_update_status": true, "can_manage_departments": true}', true),
('SYSTEM_ADMIN', 'System Admin', 'System administrators with full access', '{"can_view_all_reports": true, "can_assign_reports": true, "can_update_status": true, "can_manage_users": true, "can_manage_departments": true, "can_manage_system": true}', true);

-- =========================
-- MANDALS
-- =========================
CREATE TABLE IF NOT EXISTS public.mandals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandal_code VARCHAR(20) UNIQUE NOT NULL,
  mandal_name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO public.mandals (mandal_code, mandal_name, description, is_active) VALUES
('CENT', 'Central Zone', 'Central administrative zone covering downtown and business districts', true),
('NORT', 'North Zone', 'Northern zone covering residential and industrial areas', true),
('SOUT', 'South Zone', 'Southern zone with mixed residential and commercial areas', true),
('EAST', 'East Zone', 'Eastern zone with growing residential developments', true),
('WEST', 'West Zone', 'Western zone with parks and recreational areas', true);

-- =========================
-- DEPARTMENTS
-- =========================
INSERT INTO public.departments (department_code, department_name, description, is_active) VALUES
('PUBW', 'Public Works', 'Handles infrastructure, roads, and public facilities', true),
('WATR', 'Water Department', 'Manages water supply, distribution, and quality', true),
('SANI', 'Sanitation Department', 'Handles waste management and sanitation services', true),
('TRFC', 'Traffic Department', 'Manages traffic signals, signs, and traffic flow', true),
('PARK', 'Parks & Recreation', 'Maintains parks, playgrounds, and recreational facilities', true),
('HLTH', 'Health Department', 'Public health services and health-related issues', true),
('EDUC', 'Education Department', 'Educational facilities and school-related issues', true),
('ADMN', 'Administration', 'General administrative and coordination services', true);

-- =========================
-- CATEGORIES
-- =========================
INSERT INTO public.categories (category_code, category_name, description, icon_name, is_active) VALUES
('INFRA', 'Infrastructure', 'General infrastructure issues and maintenance', 'build', true),
('WATER', 'Water', 'Water supply, quality, and distribution issues', 'water_drop', true),
('ROADS', 'Roads', 'Road conditions, potholes, and street maintenance', 'terrain', true),
('SANIT', 'Sanitation', 'Waste management and sanitation services', 'cleaning_services', true),
('TRAFF', 'Traffic', 'Traffic signals, signs, and traffic management', 'traffic', true),
('PARKS', 'Parks', 'Parks, playgrounds, and recreational areas', 'park', true),
('HEALTH', 'Health', 'Public health and health facility issues', 'local_hospital', true),
('EDUCA', 'Education', 'Schools and educational facility issues', 'school', true),
('OTHER', 'Other', 'Miscellaneous issues not covered by other categories', 'more_horiz', true);

-- =========================
-- SAMPLE USERS
-- =========================
-- Note: These are sample users with hashed passwords (using bcrypt hash for 'password123')
-- In production, use proper password hashing
INSERT INTO public.users (user_id, full_name, email, mobile, language, password_hash, user_type_id, department, mandal_area, mandal_name, is_active) VALUES
-- System Admin
('11111111-1111-1111-1111-111111111111', 'System Administrator', 'admin@civicsense.com', '+91-9876543210', 'English', '$2b$10$rQZ8K9L2mN3oP4qR5sT6uO7vW8xY9zA0bC1dE2fG3hI4jK5lM6nO7pQ8rS9tU', 
 (SELECT id FROM public.user_types WHERE type_code = 'SYSTEM_ADMIN'), 'ADMN', 'All Zones', NULL, true),

-- Mandal Admins
('22222222-2222-2222-2222-222222222222', 'Rajesh Mandal Admin', 'mandal@civicsense.com', '+91-9876543211', 'English', '$2b$10$rQZ8K9L2mN3oP4qR5sT6uO7vW8xY9zA0bC1dE2fG3hI4jK5lM6nO7pQ8rS9tU',
 (SELECT id FROM public.user_types WHERE type_code = 'MANDAL_ADMIN'), 'ADMN', 'Central Zone', 'Central Mandal', true),

('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Priya Mandal Admin', 'priya.mandal@civicsense.com', '+91-9876543223', 'English', '$2b$10$rQZ8K9L2mN3oP4qR5sT6uO7vW8xY9zA0bC1dE2fG3hI4jK5lM6nO7pQ8rS9tU',
 (SELECT id FROM public.user_types WHERE type_code = 'MANDAL_ADMIN'), 'ADMN', 'North Zone', 'North Mandal', true),

('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Amit Mandal Admin', 'amit.mandal@civicsense.com', '+91-9876543224', 'English', '$2b$10$rQZ8K9L2mN3oP4qR5sT6uO7vW8xY9zA0bC1dE2fG3hI4jK5lM6nO7pQ8rS9tU',
 (SELECT id FROM public.user_types WHERE type_code = 'MANDAL_ADMIN'), 'ADMN', 'South Zone', 'South Mandal', true),

('gggggggg-gggg-gggg-gggg-gggggggggggg', 'Sunita Mandal Admin', 'sunita.mandal@civicsense.com', '+91-9876543225', 'English', '$2b$10$rQZ8K9L2mN3oP4qR5sT6uO7vW8xY9zA0bC1dE2fG3hI4jK5lM6nO7pQ8rS9tU',
 (SELECT id FROM public.user_types WHERE type_code = 'MANDAL_ADMIN'), 'ADMN', 'East Zone', 'East Mandal', true),

('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'Vikram Mandal Admin', 'vikram.mandal@civicsense.com', '+91-9876543226', 'English', '$2b$10$rQZ8K9L2mN3oP4qR5sT6uO7vW8xY9zA0bC1dE2fG3hI4jK5lM6nO7pQ8rS9tU',
 (SELECT id FROM public.user_types WHERE type_code = 'MANDAL_ADMIN'), 'ADMN', 'West Zone', 'West Mandal', true),

-- Department Admins
('33333333-3333-3333-3333-333333333333', 'Priya Sharma', 'priya@civicsense.com', '+91-9876543212', 'English', '$2b$10$rQZ8K9L2mN3oP4qR5sT6uO7vW8xY9zA0bC1dE2fG3hI4jK5lM6nO7pQ8rS9tU',
 (SELECT id FROM public.user_types WHERE type_code = 'DEPT_ADMIN'), 'PUBW', 'Central Zone', NULL, true),

('44444444-4444-4444-4444-444444444444', 'Amit Kumar', 'amit@civicsense.com', '+91-9876543213', 'English', '$2b$10$rQZ8K9L2mN3oP4qR5sT6uO7vW8xY9zA0bC1dE2fG3hI4jK5lM6nO7pQ8rS9tU',
 (SELECT id FROM public.user_types WHERE type_code = 'DEPT_ADMIN'), 'WATR', 'North Zone', NULL, true),

('55555555-5555-5555-5555-555555555555', 'Rajesh Singh', 'rajesh@civicsense.com', '+91-9876543214', 'English', '$2b$10$rQZ8K9L2mN3oP4qR5sT6uO7vW8xY9zA0bC1dE2fG3hI4jK5lM6nO7pQ8rS9tU',
 (SELECT id FROM public.user_types WHERE type_code = 'DEPT_ADMIN'), 'SANI', 'South Zone', NULL, true),

-- Department Users
('66666666-6666-6666-6666-666666666666', 'Sneha Patel', 'sneha@civicsense.com', '+91-9876543215', 'English', '$2b$10$rQZ8K9L2mN3oP4qR5sT6uO7vW8xY9zA0bC1dE2fG3hI4jK5lM6nO7pQ8rS9tU',
 (SELECT id FROM public.user_types WHERE type_code = 'DEPT_USER'), 'PUBW', 'Central Zone', NULL, true),

('77777777-7777-7777-7777-777777777777', 'Vikram Reddy', 'vikram@civicsense.com', '+91-9876543216', 'English', '$2b$10$rQZ8K9L2mN3oP4qR5sT6uO7vW8xY9zA0bC1dE2fG3hI4jK5lM6nO7pQ8rS9tU',
 (SELECT id FROM public.user_types WHERE type_code = 'DEPT_USER'), 'WATR', 'North Zone', NULL, true),

('88888888-8888-8888-8888-888888888888', 'Anita Desai', 'anita@civicsense.com', '+91-9876543217', 'English', '$2b$10$rQZ8K9L2mN3oP4qR5sT6uO7vW8xY9zA0bC1dE2fG3hI4jK5lM6nO7pQ8rS9tU',
 (SELECT id FROM public.user_types WHERE type_code = 'DEPT_USER'), 'SANI', 'South Zone', NULL, true),

-- Citizens
('99999999-9999-9999-9999-999999999999', 'Ravi Kumar', 'citizen@civicsense.com', '+91-9876543218', 'English', '$2b$10$rQZ8K9L2mN3oP4qR5sT6uO7vW8xY9zA0bC1dE2fG3hI4jK5lM6nO7pQ8rS9tU',
 (SELECT id FROM public.user_types WHERE type_code = 'CITIZEN'), NULL, 'Central Zone', NULL, true),

('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Sunita Devi', 'sunita@civicsense.com', '+91-9876543219', 'Hindi', '$2b$10$rQZ8K9L2mN3oP4qR5sT6uO7vW8xY9zA0bC1dE2fG3hI4jK5lM6nO7pQ8rS9tU',
 (SELECT id FROM public.user_types WHERE type_code = 'CITIZEN'), NULL, 'North Zone', NULL, true),

('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Mohammed Ali', 'mohammed@civicsense.com', '+91-9876543220', 'English', '$2b$10$rQZ8K9L2mN3oP4qR5sT6uO7vW8xY9zA0bC1dE2fG3hI4jK5lM6nO7pQ8rS9tU',
 (SELECT id FROM public.user_types WHERE type_code = 'CITIZEN'), NULL, 'South Zone', NULL, true),

('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Priya Iyer', 'priya.citizen@civicsense.com', '+91-9876543221', 'English', '$2b$10$rQZ8K9L2mN3oP4qR5sT6uO7vW8xY9zA0bC1dE2fG3hI4jK5lM6nO7pQ8rS9tU',
 (SELECT id FROM public.user_types WHERE type_code = 'CITIZEN'), NULL, 'East Zone', NULL, true),

('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Arjun Singh', 'arjun@civicsense.com', '+91-9876543222', 'English', '$2b$10$rQZ8K9L2mN3oP4qR5sT6uO7vW8xY9zA0bC1dE2fG3hI4jK5lM6nO7pQ8rS9tU',
 (SELECT id FROM public.user_types WHERE type_code = 'CITIZEN'), NULL, 'West Zone', NULL, true);

-- =========================
-- SAMPLE REPORTS
-- =========================
INSERT INTO public.reports (report_id, title, category, description, location_text, latitude, longitude, department, reporter_user_id, reporter_email, reporter_name, reporter_mobile, status, priority, assigned_to_user_id, assigned_to_department, resolution_notes, resolved_at) VALUES
-- High Priority Infrastructure Issue
('PUBW-2024-000001', 'Large Pothole on Main Street', 'Roads', 'There is a large pothole on Main Street near the intersection with Park Road. It is causing traffic congestion and vehicle damage. The pothole is approximately 2 feet wide and 6 inches deep.', 'Main Street, Near Park Road Intersection, Central Zone', 28.6139, 77.2090, 'PUBW', '99999999-9999-9999-9999-999999999999', 'citizen@civicsense.com', 'Ravi Kumar', '+91-9876543218', 'assigned', 'high', '66666666-6666-6666-6666-666666666666', 'PUBW', NULL, NULL),

-- Water Supply Issue
('WATR-2024-000001', 'No Water Supply for 3 Days', 'Water', 'Our area has been without water supply for the past 3 days. This is affecting daily activities and hygiene. Please investigate and restore water supply immediately.', 'Block A, Sector 15, North Zone', 28.7041, 77.1025, 'WATR', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'sunita@civicsense.com', 'Sunita Devi', '+91-9876543219', 'in_progress', 'high', '77777777-7777-7777-7777-777777777777', 'WATR', 'Water main repair in progress. Expected completion by tomorrow evening.', NULL),

-- Sanitation Issue
('SANI-2024-000001', 'Garbage Not Collected for a Week', 'Sanitation', 'Garbage collection has been irregular in our locality. The bins are overflowing and creating health hazards. Please ensure regular collection.', 'Street 5, Green Park, South Zone', 28.5355, 77.3910, 'SANI', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'mohammed@civicsense.com', 'Mohammed Ali', '+91-9876543220', 'resolved', 'medium', '88888888-8888-8888-8888-888888888888', 'SANI', 'Garbage collection schedule has been updated. Additional collection vehicle assigned to this area.', '2024-01-15 14:30:00+05:30'),

-- Traffic Signal Issue
('TRFC-2024-000001', 'Traffic Signal Not Working', 'Traffic', 'The traffic signal at the busy intersection of MG Road and Station Road has been malfunctioning for 2 days. This is causing traffic chaos and safety concerns.', 'MG Road and Station Road Intersection, East Zone', 28.6280, 77.2060, 'TRFC', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'priya.citizen@civicsense.com', 'Priya Iyer', '+91-9876543221', 'submitted', 'high', NULL, 'TRFC', NULL, NULL),

-- Park Maintenance Issue
('PARK-2024-000001', 'Broken Playground Equipment', 'Parks', 'The swing set in the children''s playground at Central Park is broken and poses a safety risk to children. One swing is completely detached and another is loose.', 'Central Park Playground, West Zone', 28.4595, 77.0266, 'PARK', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'arjun@civicsense.com', 'Arjun Singh', '+91-9876543222', 'triaged', 'medium', NULL, 'PARK', NULL, NULL),

-- Street Light Issue
('PUBW-2024-000002', 'Street Lights Not Working', 'Infrastructure', 'Several street lights on Gandhi Marg are not working, making the area unsafe for pedestrians and vehicles at night. This has been an issue for over a week.', 'Gandhi Marg, Central Zone', 28.6139, 77.2090, 'PUBW', '99999999-9999-9999-9999-999999999999', 'citizen@civicsense.com', 'Ravi Kumar', '+91-9876543218', 'assigned', 'medium', '66666666-6666-6666-6666-666666666666', 'PUBW', NULL, NULL),

-- Water Quality Issue
('WATR-2024-000002', 'Water Quality Concerns', 'Water', 'The tap water in our area has a strange smell and taste. Several residents have reported similar issues. Please test the water quality.', 'Block B, Sector 12, North Zone', 28.7041, 77.1025, 'WATR', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'sunita@civicsense.com', 'Sunita Devi', '+91-9876543219', 'submitted', 'high', NULL, 'WATR', NULL, NULL),

-- Road Repair Needed
('PUBW-2024-000003', 'Road Surface Damaged', 'Roads', 'The road surface on Market Street has deteriorated significantly. There are multiple cracks and uneven patches that need immediate attention.', 'Market Street, South Zone', 28.5355, 77.3910, 'PUBW', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'mohammed@civicsense.com', 'Mohammed Ali', '+91-9876543220', 'in_progress', 'medium', '66666666-6666-6666-6666-666666666666', 'PUBW', 'Road repair work scheduled for next week. Temporary patches applied.', NULL);

-- =========================
-- SAMPLE ATTACHMENTS
-- =========================
INSERT INTO public.attachments (report_id, file_type, file_url, storage_path, file_name, mime_type, file_size_bytes, uploader_user_id) VALUES
-- Photos for pothole report
((SELECT id FROM public.reports WHERE report_id = 'PUBW-2024-000001'), 'photo', 'https://storage.supabase.co/bucket/photos/pothole_1.jpg', 'photos/pothole_1.jpg', 'pothole_main_street.jpg', 'image/jpeg', 245760, '99999999-9999-9999-9999-999999999999'),
((SELECT id FROM public.reports WHERE report_id = 'PUBW-2024-000001'), 'photo', 'https://storage.supabase.co/bucket/photos/pothole_2.jpg', 'photos/pothole_2.jpg', 'pothole_close_up.jpg', 'image/jpeg', 198432, '99999999-9999-9999-9999-999999999999'),

-- Photo for water issue
((SELECT id FROM public.reports WHERE report_id = 'WATR-2024-000001'), 'photo', 'https://storage.supabase.co/bucket/photos/water_issue.jpg', 'photos/water_issue.jpg', 'no_water_supply.jpg', 'image/jpeg', 312456, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),

-- Photos for garbage issue
((SELECT id FROM public.reports WHERE report_id = 'SANI-2024-000001'), 'photo', 'https://storage.supabase.co/bucket/photos/garbage_1.jpg', 'photos/garbage_1.jpg', 'overflowing_bins.jpg', 'image/jpeg', 278901, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
((SELECT id FROM public.reports WHERE report_id = 'SANI-2024-000001'), 'photo', 'https://storage.supabase.co/bucket/photos/garbage_2.jpg', 'photos/garbage_2.jpg', 'garbage_pile.jpg', 'image/jpeg', 234567, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),

-- Photo for traffic signal
((SELECT id FROM public.reports WHERE report_id = 'TRFC-2024-000001'), 'photo', 'https://storage.supabase.co/bucket/photos/traffic_signal.jpg', 'photos/traffic_signal.jpg', 'broken_traffic_signal.jpg', 'image/jpeg', 189234, 'cccccccc-cccc-cccc-cccc-cccccccccccc'),

-- Photo for playground equipment
((SELECT id FROM public.reports WHERE report_id = 'PARK-2024-000001'), 'photo', 'https://storage.supabase.co/bucket/photos/playground.jpg', 'photos/playground.jpg', 'broken_swing.jpg', 'image/jpeg', 256789, 'dddddddd-dddd-dddd-dddd-dddddddddddd');

-- =========================
-- SAMPLE REPORT STATUS HISTORY
-- =========================
INSERT INTO public.report_status_history (report_id, old_status, new_status, changed_by_user_id, change_reason) VALUES
-- Water supply issue status changes
((SELECT id FROM public.reports WHERE report_id = 'WATR-2024-000001'), 'submitted', 'triaged', '44444444-4444-4444-4444-444444444444', 'Issue triaged and assigned to water department'),
((SELECT id FROM public.reports WHERE report_id = 'WATR-2024-000001'), 'triaged', 'assigned', '44444444-4444-4444-4444-444444444444', 'Assigned to field engineer for investigation'),
((SELECT id FROM public.reports WHERE report_id = 'WATR-2024-000001'), 'assigned', 'in_progress', '77777777-7777-7777-7777-777777777777', 'Field investigation started, water main issue identified'),

-- Sanitation issue status changes
((SELECT id FROM public.reports WHERE report_id = 'SANI-2024-000001'), 'submitted', 'triaged', '55555555-5555-5555-5555-555555555555', 'Issue triaged and assigned to sanitation department'),
((SELECT id FROM public.reports WHERE report_id = 'SANI-2024-000001'), 'triaged', 'assigned', '55555555-5555-5555-5555-555555555555', 'Assigned to sanitation supervisor'),
((SELECT id FROM public.reports WHERE report_id = 'SANI-2024-000001'), 'assigned', 'in_progress', '88888888-8888-8888-8888-888888888888', 'Collection schedule updated, additional vehicle assigned'),
((SELECT id FROM public.reports WHERE report_id = 'SANI-2024-000001'), 'in_progress', 'resolved', '88888888-8888-8888-8888-888888888888', 'Issue resolved, regular collection restored'),

-- Pothole report status changes
((SELECT id FROM public.reports WHERE report_id = 'PUBW-2024-000001'), 'submitted', 'triaged', '33333333-3333-3333-3333-333333333333', 'High priority issue triaged immediately'),
((SELECT id FROM public.reports WHERE report_id = 'PUBW-2024-000001'), 'triaged', 'assigned', '33333333-3333-3333-3333-333333333333', 'Assigned to road maintenance team'),

-- Street light issue status changes
((SELECT id FROM public.reports WHERE report_id = 'PUBW-2024-000002'), 'submitted', 'triaged', '33333333-3333-3333-3333-333333333333', 'Issue triaged and assigned to electrical maintenance'),
((SELECT id FROM public.reports WHERE report_id = 'PUBW-2024-000002'), 'triaged', 'assigned', '33333333-3333-3333-3333-333333333333', 'Assigned to electrical technician'),

-- Road repair status changes
((SELECT id FROM public.reports WHERE report_id = 'PUBW-2024-000003'), 'submitted', 'triaged', '33333333-3333-3333-3333-333333333333', 'Issue triaged and assigned to road maintenance'),
((SELECT id FROM public.reports WHERE report_id = 'PUBW-2024-000003'), 'triaged', 'assigned', '33333333-3333-3333-3333-333333333333', 'Assigned to road repair team'),
((SELECT id FROM public.reports WHERE report_id = 'PUBW-2024-000003'), 'assigned', 'in_progress', '66666666-6666-6666-6666-666666666666', 'Road repair work started, temporary patches applied');

-- =========================
-- SAMPLE REPORT COMMENTS
-- =========================
INSERT INTO public.report_comments (report_id, commenter_user_id, comment_text, is_internal) VALUES
-- Comments on water supply issue
((SELECT id FROM public.reports WHERE report_id = 'WATR-2024-000001'), '77777777-7777-7777-7777-777777777777', 'Investigation completed. Found a broken water main valve. Repair work will begin tomorrow morning.', false),
((SELECT id FROM public.reports WHERE report_id = 'WATR-2024-000001'), '44444444-4444-4444-4444-444444444444', 'Please coordinate with the electrical department for any power requirements during repair.', true),

-- Comments on sanitation issue
((SELECT id FROM public.reports WHERE report_id = 'SANI-2024-000001'), '88888888-8888-8888-8888-888888888888', 'Additional collection vehicle has been assigned to this area. Collection will resume from tomorrow.', false),
((SELECT id FROM public.reports WHERE report_id = 'SANI-2024-000001'), '55555555-5555-5555-5555-555555555555', 'Please ensure proper coordination with the waste disposal site for increased volume.', true),

-- Comments on pothole report
((SELECT id FROM public.reports WHERE report_id = 'PUBW-2024-000001'), '66666666-6666-6666-6666-666666666666', 'Site inspection completed. Will begin repair work within 2 days. Temporary warning signs will be placed.', false),
((SELECT id FROM public.reports WHERE report_id = 'PUBW-2024-000001'), '33333333-3333-3333-3333-333333333333', 'Ensure proper traffic management during repair work.', true),

-- Comments on traffic signal
((SELECT id FROM public.reports WHERE report_id = 'TRFC-2024-000001'), '22222222-2222-2222-2222-222222222222', 'This is a high priority issue affecting traffic flow. Please expedite the repair.', true),

-- Comments on playground equipment
((SELECT id FROM public.reports WHERE report_id = 'PARK-2024-000001'), '22222222-2222-2222-2222-222222222222', 'Safety is our priority. Please ensure the playground is secured until repairs are complete.', true),

-- Comments on street light issue
((SELECT id FROM public.reports WHERE report_id = 'PUBW-2024-000002'), '66666666-6666-6666-6666-666666666666', 'Electrical inspection scheduled for tomorrow. Will identify the root cause of the outage.', false),

-- Comments on road repair
((SELECT id FROM public.reports WHERE report_id = 'PUBW-2024-000003'), '66666666-6666-6666-6666-666666666666', 'Temporary patches have been applied. Full road resurfacing scheduled for next week.', false),
((SELECT id FROM public.reports WHERE report_id = 'PUBW-2024-000003'), '33333333-3333-3333-3333-333333333333', 'Coordinate with traffic department for road closure during resurfacing work.', true);

-- =========================
-- SAMPLE REPORT SEQUENCES (for ID generation)
-- =========================
INSERT INTO public.report_sequences (department_code, year, sequence_number) VALUES
('PUBW', '2024', 3),
('WATR', '2024', 2),
('SANI', '2024', 1),
('TRFC', '2024', 1),
('PARK', '2024', 1),
('HLTH', '2024', 0),
('EDUC', '2024', 0),
('ADMN', '2024', 0);

-- =========================
-- VERIFICATION QUERIES
-- =========================
-- Uncomment these to verify the data was inserted correctly

-- SELECT 'User Types' as table_name, COUNT(*) as count FROM public.user_types
-- UNION ALL
-- SELECT 'Mandals', COUNT(*) FROM public.mandals
-- UNION ALL
-- SELECT 'Departments', COUNT(*) FROM public.departments
-- UNION ALL
-- SELECT 'Categories', COUNT(*) FROM public.categories
-- UNION ALL
-- SELECT 'Users', COUNT(*) FROM public.users
-- UNION ALL
-- SELECT 'Reports', COUNT(*) FROM public.reports
-- UNION ALL
-- SELECT 'Attachments', COUNT(*) FROM public.attachments
-- UNION ALL
-- SELECT 'Status History', COUNT(*) FROM public.report_status_history
-- UNION ALL
-- SELECT 'Comments', COUNT(*) FROM public.report_comments
-- UNION ALL
-- SELECT 'Sequences', COUNT(*) FROM public.report_sequences;
