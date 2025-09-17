-- User Types table
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

-- Updated Users table with user type foreign key
create table if not exists public.users (
  id bigserial primary key,
  user_id text unique not null,
  full_name text not null,
  email text unique not null,
  mobile text,
  language text default 'English',
  password_hash text not null,
  usertype_id text references public.usertype(usertype_id),
  department text, -- Department for department users
  mandal_area text, -- Mandal area for mandal admins
  is_active boolean default true,
  last_login timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Updated Reports table with proper field types for all form fields
create table if not exists public.reports (
  id bigserial primary key,
  report_id text unique not null,
  title text not null,
  category text not null,
  description text not null,
  location_text text,
  latitude double precision,
  longitude double precision,
  photos jsonb default '[]'::jsonb, -- Array of photo objects with url, caption, etc.
  voice_note_url text, -- URL to the audio file
  department text not null,
  reporter_email text,
  reporter_user_id text references public.users(user_id), -- Link to user who created the report
  status text default 'pending', -- pending, in_progress, resolved, closed
  priority text default 'medium', -- low, medium, high, urgent
  assigned_to text, -- Department or person assigned
  resolution_notes text,
  resolved_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Sequence table to mimic counters
create table if not exists public.counters (
  key text primary key,
  seq bigint not null default 0
);

-- Function to generate next sequence number
create or replace function public.next_seq(counter_key text)
returns bigint as $$
declare new_seq bigint;
begin
  insert into public.counters as c(key, seq)
  values(counter_key, 1)
  on conflict (key) do update set seq = c.seq + 1
  returning seq into new_seq;
  return new_seq;
end;
$$ language plpgsql;

-- Function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers to automatically update updated_at
create trigger update_usertype_updated_at
  before update on public.usertype
  for each row
  execute function public.update_updated_at_column();

create trigger update_users_updated_at
  before update on public.users
  for each row
  execute function public.update_updated_at_column();

create trigger update_reports_updated_at
  before update on public.reports
  for each row
  execute function public.update_updated_at_column();

-- Indexes for better performance
create index if not exists idx_usertype_usertype_id on public.usertype(usertype_id);
create index if not exists idx_usertype_type_name on public.usertype(type_name);
create index if not exists idx_usertype_is_active on public.usertype(is_active);

create index if not exists idx_users_user_id on public.users(user_id);
create index if not exists idx_users_email on public.users(email);
create index if not exists idx_users_usertype_id on public.users(usertype_id);
create index if not exists idx_users_department on public.users(department);
create index if not exists idx_users_mandal_area on public.users(mandal_area);
create index if not exists idx_users_is_active on public.users(is_active);

create index if not exists idx_reports_category on public.reports(category);
create index if not exists idx_reports_department on public.reports(department);
create index if not exists idx_reports_status on public.reports(status);
create index if not exists idx_reports_priority on public.reports(priority);
create index if not exists idx_reports_created_at on public.reports(created_at);
create index if not exists idx_reports_reporter_user_id on public.reports(reporter_user_id);
create index if not exists idx_reports_location on public.reports using gist(point(longitude, latitude));
