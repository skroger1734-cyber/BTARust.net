create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.demo_renderer_auth (
  singleton boolean primary key default true check (singleton),
  secret_hash text not null
);

insert into private.demo_renderer_auth (singleton, secret_hash)
values (
  true,
  '4ad7d4cf3c7e4077dd4dc42f62f544341c3c5e25db647158101decef26a50f48'
)
on conflict (singleton) do update set secret_hash = excluded.secret_hash;

create or replace function private.verify_demo_renderer_secret(p_secret text)
returns boolean
language sql
stable
security definer
set search_path = private, extensions
as $$
  select exists (
    select 1
    from private.demo_renderer_auth
    where secret_hash =
      encode(extensions.digest(coalesce(p_secret, ''), 'sha256'), 'hex')
  );
$$;

create or replace function public.claim_demo_render_job(p_secret text)
returns setof public.demo_recordings
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if not private.verify_demo_renderer_secret(p_secret) then
    raise insufficient_privilege using message = 'Invalid renderer secret';
  end if;

  return query
  with candidate as (
    select id
    from public.demo_recordings
    where status = 'ready'
      and video_status in ('pending', 'failed')
      and video_render_attempts < 3
    order by
      case when video_status = 'failed' then 0 else 1 end,
      started_at asc,
      created_at asc
    for update skip locked
    limit 1
  )
  update public.demo_recordings as recording
  set
    video_status = 'rendering',
    video_error = null,
    video_render_started_at = now(),
    video_render_attempts = recording.video_render_attempts + 1
  from candidate
  where recording.id = candidate.id
  returning recording.*;
end;
$$;

create or replace function public.demo_render_siblings(
  p_secret text,
  p_capture_id text,
  p_steam_id text
)
returns table (file_name text, ended_at timestamptz)
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if not private.verify_demo_renderer_secret(p_secret) then
    raise insufficient_privilege using message = 'Invalid renderer secret';
  end if;

  return query
  select recording.file_name, recording.ended_at
  from public.demo_recordings as recording
  where recording.capture_id = p_capture_id
    and recording.steam_id is not distinct from p_steam_id
  order by recording.file_name;
end;
$$;

create or replace function public.complete_demo_render_job(
  p_secret text,
  p_id uuid,
  p_storage_path text,
  p_video_url text,
  p_size_bytes bigint
)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if not private.verify_demo_renderer_secret(p_secret) then
    raise insufficient_privilege using message = 'Invalid renderer secret';
  end if;

  update public.demo_recordings
  set
    video_status = 'ready',
    video_storage_path = p_storage_path,
    video_url = p_video_url,
    video_size_bytes = p_size_bytes,
    video_error = null,
    video_rendered_at = now()
  where id = p_id and video_status = 'rendering';
end;
$$;

create or replace function public.fail_demo_render_job(
  p_secret text,
  p_id uuid,
  p_error text
)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if not private.verify_demo_renderer_secret(p_secret) then
    raise insufficient_privilege using message = 'Invalid renderer secret';
  end if;

  update public.demo_recordings
  set
    video_status = 'failed',
    video_error = left(p_error, 1000)
  where id = p_id and video_status = 'rendering';
end;
$$;

revoke all on function public.claim_demo_render_job(text) from public;
revoke all on function public.demo_render_siblings(text, text, text) from public;
revoke all on function public.complete_demo_render_job(
  text, uuid, text, text, bigint
) from public;
revoke all on function public.fail_demo_render_job(text, uuid, text)
  from public;

grant execute on function public.claim_demo_render_job(text)
  to anon, authenticated;
grant execute on function public.demo_render_siblings(text, text, text)
  to anon, authenticated;
grant execute on function public.complete_demo_render_job(
  text, uuid, text, text, bigint
) to anon, authenticated;
grant execute on function public.fail_demo_render_job(text, uuid, text)
  to anon, authenticated;

drop policy if exists "BTA renderer can insert MP4 videos"
  on storage.objects;
create policy "BTA renderer can insert MP4 videos"
  on storage.objects
  for insert
  to anon, authenticated
  with check (
    bucket_id = 'bta-demo-videos'
    and private.verify_demo_renderer_secret(
      current_setting('request.headers', true)::jsonb
        ->> 'x-bta-renderer-secret'
    )
  );

drop policy if exists "BTA renderer can update MP4 videos"
  on storage.objects;
create policy "BTA renderer can update MP4 videos"
  on storage.objects
  for update
  to anon, authenticated
  using (
    bucket_id = 'bta-demo-videos'
    and private.verify_demo_renderer_secret(
      current_setting('request.headers', true)::jsonb
        ->> 'x-bta-renderer-secret'
    )
  )
  with check (
    bucket_id = 'bta-demo-videos'
    and private.verify_demo_renderer_secret(
      current_setting('request.headers', true)::jsonb
        ->> 'x-bta-renderer-secret'
    )
  );
