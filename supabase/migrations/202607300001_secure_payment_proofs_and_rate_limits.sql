alter table public.awakening_registrations
  add column if not exists payment_proof_path text,
  add column if not exists payment_proof_mime_type text;

create index if not exists awakening_registrations_payment_proof_path_idx
  on public.awakening_registrations (payment_proof_path)
  where payment_proof_path is not null;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'payment-proofs',
  'payment-proofs',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.awakening_rate_limits (
  scope text not null,
  client_key text not null,
  window_started_at timestamptz not null,
  hit_count integer not null default 1 check (hit_count > 0),
  updated_at timestamptz not null default now(),
  primary key (scope, client_key, window_started_at)
);

alter table public.awakening_rate_limits enable row level security;
revoke all on table public.awakening_rate_limits from anon, authenticated;
grant all on table public.awakening_rate_limits to service_role;

create or replace function public.awakening_take_rate_limit(
  p_scope text,
  p_client_key text,
  p_limit integer,
  p_window_seconds integer
)
returns table (allowed boolean, remaining integer, retry_after_seconds integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_window timestamptz;
  current_count integer;
begin
  if p_limit < 1 or p_window_seconds < 1 then
    raise exception 'Invalid rate limit configuration';
  end if;

  current_window := to_timestamp(
    floor(extract(epoch from clock_timestamp()) / p_window_seconds) * p_window_seconds
  );

  insert into public.awakening_rate_limits
    (scope, client_key, window_started_at, hit_count, updated_at)
  values
    (left(p_scope, 80), left(p_client_key, 128), current_window, 1, clock_timestamp())
  on conflict (scope, client_key, window_started_at)
  do update set
    hit_count = public.awakening_rate_limits.hit_count + 1,
    updated_at = clock_timestamp()
  returning hit_count into current_count;

  return query select
    current_count <= p_limit,
    greatest(p_limit - current_count, 0),
    greatest(
      ceil(extract(epoch from (current_window + make_interval(secs => p_window_seconds) - clock_timestamp())))::integer,
      1
    );
end;
$$;

revoke all on function public.awakening_take_rate_limit(text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.awakening_take_rate_limit(text, text, integer, integer) to service_role;
