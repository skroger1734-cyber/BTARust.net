create table if not exists public.demo_recordings (
  id uuid primary key default gen_random_uuid(),
  capture_id text not null,
  server_code text not null check (server_code in ('US', 'EU', 'TEST')),
  event_type text not null,
  event_name text not null,
  trigger_source text not null,
  started_at timestamptz not null,
  ended_at timestamptz,
  steam_id text,
  player_name text,
  storage_path text not null unique,
  public_url text not null,
  file_name text not null,
  file_size_bytes bigint not null check (file_size_bytes >= 0),
  sha256 text,
  status text not null default 'ready'
    check (status in ('ready', 'uploading', 'failed')),
  metadata jsonb not null default '{}'::jsonb,
  discord_message_id text,
  created_at timestamptz not null default now()
);

create index if not exists demo_recordings_started_at_idx
  on public.demo_recordings (started_at desc);
create index if not exists demo_recordings_event_idx
  on public.demo_recordings (server_code, event_type, started_at desc);

alter table public.demo_recordings enable row level security;

grant select on public.demo_recordings to anon, authenticated;
revoke insert, update, delete
  on public.demo_recordings from anon, authenticated;

drop policy if exists "Public can view ready BTA demos"
  on public.demo_recordings;
create policy "Public can view ready BTA demos"
  on public.demo_recordings
  for select
  to anon, authenticated
  using (status = 'ready');

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'bta-demos',
  'bta-demos',
  true,
  52428800,
  array[
    'application/octet-stream',
    'application/x-rust-demo'
  ]::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- A public bucket does not need a broad storage.objects SELECT policy.
-- Keeping that policy absent prevents anonymous object listing.
drop policy if exists "Public can download BTA demos"
  on storage.objects;
