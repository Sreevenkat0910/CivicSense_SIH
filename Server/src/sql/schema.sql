-- Users table
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

-- Reports table
create table if not exists public.reports (
  id bigserial primary key,
  report_id text unique not null,
  title text not null,
  category text not null,
  description text not null,
  location_text text,
  latitude double precision,
  longitude double precision,
  photos jsonb default '[]'::jsonb,
  voice_note_url text,
  department text not null,
  reporter_email text,
  created_at timestamptz default now()
);

-- Sequence table to mimic counters
create table if not exists public.counters (
  key text primary key,
  seq bigint not null default 0
);

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


