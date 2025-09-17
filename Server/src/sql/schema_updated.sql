-- Updated Users table
create table if not exists public.users (
  id bigserial primary key,
  user_id text unique not null,
  full_name text not null,
  email text unique not null,
  mobile text,
  language text default 'English',
  password_hash text not null,
  created_at timestamptz default now()
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

-- Trigger to automatically update updated_at
create trigger update_reports_updated_at
  before update on public.reports
  for each row
  execute function public.update_updated_at_column();

-- Indexes for better performance
create index if not exists idx_reports_category on public.reports(category);
create index if not exists idx_reports_department on public.reports(department);
create index if not exists idx_reports_status on public.reports(status);
create index if not exists idx_reports_created_at on public.reports(created_at);
create index if not exists idx_reports_location on public.reports using gist(point(longitude, latitude));
