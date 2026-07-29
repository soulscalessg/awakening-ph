update public.awakening_schedules duplicate
set status = 'draft'
where duplicate.event_at = '2026-12-05 09:00:00+08'::timestamptz
  and duplicate.venue = 'Manila 🇵🇭'
  and exists (
    select 1
    from public.awakening_schedules canonical
    where canonical.event_at = duplicate.event_at
      and canonical.id <> duplicate.id
      and lower(coalesce(canonical.city, canonical.venue)) = 'manila'
      and canonical.status = 'scheduled'
  );
