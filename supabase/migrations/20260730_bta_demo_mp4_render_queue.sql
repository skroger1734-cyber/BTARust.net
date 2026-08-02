alter table public.demo_recordings
  add column if not exists video_status text not null default 'pending',
  add column if not exists video_storage_path text,
  add column if not exists video_url text,
  add column if not exists video_size_bytes bigint,
  add column if not exists video_error text,
  add column if not exists video_render_started_at timestamptz,
  add column if not exists video_rendered_at timestamptz,
  add column if not exists video_render_attempts integer not null default 0;

alter table public.demo_recordings
  drop constraint if exists demo_recordings_video_status_check;
alter table public.demo_recordings
  add constraint demo_recordings_video_status_check
  check (video_status in ('pending', 'rendering', 'ready', 'failed'));

create index if not exists demo_recordings_video_queue_idx
  on public.demo_recordings (video_status, started_at)
  where status = 'ready';

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'bta-demo-videos',
  'bta-demo-videos',
  true,
  1073741824,
  array['video/mp4']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
