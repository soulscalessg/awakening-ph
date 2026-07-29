create extension if not exists pgcrypto;

create table if not exists public.awakening_contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  organization text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.awakening_documents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  file_url text,
  category text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.awakening_galleries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  venue text,
  cover_url text,
  photo_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.awakening_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  organization text,
  source text,
  stage text not null default 'new',
  value numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.awakening_registrations (
  id uuid primary key default gen_random_uuid(),
  code text unique default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)),
  name text not null,
  email text not null,
  phone text not null,
  event_date text not null,
  quantity integer not null default 1 check (quantity > 0),
  total_amount numeric(12, 2) not null default 0,
  payment_method text,
  payment_reference text,
  payment_proof_name text,
  status text not null default 'for_confirmation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.awakening_schedules (
  id uuid primary key default gen_random_uuid(),
  event_at timestamptz not null,
  venue text not null,
  city text,
  capacity integer,
  status text not null default 'scheduled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.awakening_organization_applications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  business_name text,
  industry text,
  employee_count integer,
  discovery_source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.awakening_staffing_applications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  facebook_url text,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.awakening_sponsorship_applications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  business_name text,
  industry text,
  products text,
  discovery_source text,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.awakening_contacts enable row level security;
alter table public.awakening_documents enable row level security;
alter table public.awakening_galleries enable row level security;
alter table public.awakening_leads enable row level security;
alter table public.awakening_registrations enable row level security;
alter table public.awakening_schedules enable row level security;
alter table public.awakening_organization_applications enable row level security;
alter table public.awakening_staffing_applications enable row level security;
alter table public.awakening_sponsorship_applications enable row level security;

revoke all on table public.awakening_contacts from anon, authenticated;
revoke all on table public.awakening_documents from anon, authenticated;
revoke all on table public.awakening_galleries from anon, authenticated;
revoke all on table public.awakening_leads from anon, authenticated;
revoke all on table public.awakening_registrations from anon, authenticated;
revoke all on table public.awakening_schedules from anon, authenticated;
revoke all on table public.awakening_organization_applications from anon, authenticated;
revoke all on table public.awakening_staffing_applications from anon, authenticated;
revoke all on table public.awakening_sponsorship_applications from anon, authenticated;

grant all on table public.awakening_contacts to service_role;
grant all on table public.awakening_documents to service_role;
grant all on table public.awakening_galleries to service_role;
grant all on table public.awakening_leads to service_role;
grant all on table public.awakening_registrations to service_role;
grant all on table public.awakening_schedules to service_role;
grant all on table public.awakening_organization_applications to service_role;
grant all on table public.awakening_staffing_applications to service_role;
grant all on table public.awakening_sponsorship_applications to service_role;

create index if not exists awakening_contacts_name_idx on public.awakening_contacts (name);
create index if not exists awakening_leads_stage_idx on public.awakening_leads (stage);
create index if not exists awakening_registrations_status_idx on public.awakening_registrations (status);
create index if not exists awakening_registrations_created_at_idx on public.awakening_registrations (created_at desc);
create unique index if not exists awakening_schedules_event_venue_idx on public.awakening_schedules (event_at, venue);

insert into public.awakening_registrations
  (code, name, email, phone, event_date, quantity, total_amount, payment_method, status)
values
  ('DNFHO2', 'Jerold Mark Villafuerte', 'normingh@atarashiitechnologies.co', '09952603643', 'August 15 (Manila)', 1, 1499, 'gcash', 'for_confirmation'),
  ('OVCOHL', 'Jean Francia', 'jeanfrancia0695@gmail.com', '+63 994 644 1071', 'July 26 (Manila)', 1, 1499, 'gcash', 'paid'),
  ('L8V6Y7', 'Mark Ysrael Ilagan', 'markysrael06@gmail.com', '+63 626 273 271', 'July 26 (Manila)', 1, 1499, 'bank', 'paid')
on conflict (code) do nothing;

insert into public.awakening_schedules (event_at, venue, city, status)
values
  ('2026-05-30 09:00:00+08', 'Davao', 'Davao', 'scheduled'),
  ('2026-05-31 09:00:00+08', 'General Santos', 'General Santos', 'scheduled'),
  ('2026-06-20 09:00:00+08', 'House of Transformation, Ayala the 30th, Pasig', 'Pasig', 'scheduled'),
  ('2026-07-18 09:00:00+08', 'House of Transformation, Ayala the 30th, Pasig', 'Pasig', 'scheduled'),
  ('2026-07-27 09:00:00+08', 'Cebu', 'Cebu', 'scheduled'),
  ('2026-08-15 09:00:00+08', 'House of Transformation, Ayala the 30th, Pasig', 'Pasig', 'scheduled')
on conflict do nothing;
