alter table public.awakening_schedules
  add column if not exists ends_at timestamptz,
  add column if not exists timezone text not null default 'Asia/Manila',
  add column if not exists country_code text not null default 'PH';

alter table public.awakening_registrations
  add column if not exists schedule_id uuid references public.awakening_schedules(id) on delete set null;

create index if not exists awakening_registrations_schedule_id_idx
  on public.awakening_registrations (schedule_id);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'awakening_schedules_valid_range'
  ) then
    alter table public.awakening_schedules
      add constraint awakening_schedules_valid_range
      check (ends_at is null or ends_at >= event_at);
  end if;
end
$$;

update public.awakening_schedules
set venue = 'La Union', city = 'La Union', timezone = 'Asia/Manila', country_code = 'PH'
where event_at = '2026-09-06 09:00:00+08'::timestamptz
  and (lower(coalesce(city, '')) = 'manila' or lower(venue) like '%la union%');

update public.awakening_schedules
set venue = 'Tarlac', city = 'Tarlac', timezone = 'Asia/Manila', country_code = 'PH'
where event_at = '2026-10-03 09:00:00+08'::timestamptz
  and lower(venue) like '%tarlac%';

update public.awakening_schedules
set venue = 'Tagaytay', city = 'Tagaytay', timezone = 'Asia/Manila', country_code = 'PH'
where event_at = '2026-11-01 09:00:00+08'::timestamptz
  and lower(venue) like '%tagaytay%';

update public.awakening_schedules
set venue = 'Manila', city = 'Manila', timezone = 'Asia/Manila', country_code = 'PH'
where event_at = '2026-08-22 09:00:00+08'::timestamptz
  and lower(venue) like 'manila%';

with desired(event_at, ends_at, venue, city, timezone, country_code) as (
  values
    ('2026-08-22 09:00:00+08'::timestamptz, null::timestamptz, 'Manila', 'Manila', 'Asia/Manila', 'PH'),
    ('2026-08-22 09:00:00+08'::timestamptz, null::timestamptz, 'Olongapo', 'Olongapo', 'Asia/Manila', 'PH'),
    ('2026-09-06 09:00:00+08'::timestamptz, null::timestamptz, 'La Union', 'La Union', 'Asia/Manila', 'PH'),
    ('2026-09-12 09:00:00+08'::timestamptz, null::timestamptz, 'Rizal', 'Rizal', 'Asia/Manila', 'PH'),
    ('2026-09-20 09:00:00+08'::timestamptz, null::timestamptz, 'Manila', 'Manila', 'Asia/Manila', 'PH'),
    ('2026-09-26 09:00:00+08'::timestamptz, null::timestamptz, 'Pampanga', 'Pampanga', 'Asia/Manila', 'PH'),
    ('2026-10-03 09:00:00+08'::timestamptz, null::timestamptz, 'Tarlac', 'Tarlac', 'Asia/Manila', 'PH'),
    ('2026-10-03 09:00:00+08'::timestamptz, null::timestamptz, 'Manila', 'Manila', 'Asia/Manila', 'PH'),
    ('2026-10-11 09:00:00+01'::timestamptz, null::timestamptz, 'United Kingdom', 'United Kingdom', 'Europe/London', 'GB'),
    ('2026-10-17 09:00:00+08'::timestamptz, null::timestamptz, 'Laguna', 'Laguna', 'Asia/Manila', 'PH'),
    ('2026-10-26 09:00:00+08'::timestamptz, '2026-10-31 17:00:00+08'::timestamptz, 'Koronadal', 'Koronadal', 'Asia/Manila', 'PH'),
    ('2026-11-01 09:00:00+08'::timestamptz, null::timestamptz, 'Tagaytay', 'Tagaytay', 'Asia/Manila', 'PH'),
    ('2026-11-07 09:00:00+08'::timestamptz, null::timestamptz, 'Marikina', 'Marikina', 'Asia/Manila', 'PH'),
    ('2026-11-20 09:00:00+08'::timestamptz, '2026-11-23 17:00:00+08'::timestamptz, 'Singapore', 'Singapore', 'Asia/Singapore', 'SG'),
    ('2026-11-21 09:00:00+08'::timestamptz, null::timestamptz, 'Manila', 'Manila', 'Asia/Manila', 'PH'),
    ('2026-11-28 09:00:00+08'::timestamptz, null::timestamptz, 'Quezon', 'Quezon', 'Asia/Manila', 'PH'),
    ('2026-12-05 09:00:00+08'::timestamptz, null::timestamptz, 'Manila', 'Manila', 'Asia/Manila', 'PH')
)
insert into public.awakening_schedules
  (event_at, ends_at, venue, city, status, timezone, country_code)
select d.event_at, d.ends_at, d.venue, d.city, 'scheduled', d.timezone, d.country_code
from desired d
where not exists (
  select 1
  from public.awakening_schedules s
  where s.event_at = d.event_at
    and lower(coalesce(s.city, s.venue)) = lower(d.city)
);
