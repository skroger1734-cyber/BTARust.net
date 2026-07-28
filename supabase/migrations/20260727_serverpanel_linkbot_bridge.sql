create or replace function public.bta_linkbot_authorized(p_secret text)
returns boolean
language sql
immutable
set search_path = public, extensions, pg_temp
as $$
  select encode(extensions.digest(coalesce(p_secret, ''), 'sha256'), 'hex')
    = 'a03640adb2562e727a1ccc2f7cf0a6fbb02d4c899f82fd75165611c90489607d';
$$;

create or replace function public.bta_linkbot_list_links(p_secret text)
returns table (
  id uuid,
  steam_id text,
  discord_id text,
  discord_username text,
  discord_global_name text,
  discord_avatar text,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
begin
  if not public.bta_linkbot_authorized(p_secret) then
    raise exception 'unauthorized';
  end if;

  return query
    select
      linked_accounts.id,
      linked_accounts.steam_id,
      linked_accounts.discord_id,
      linked_accounts.discord_username,
      linked_accounts.discord_global_name,
      linked_accounts.discord_avatar,
      linked_accounts.updated_at
    from public.linked_accounts
    where linked_accounts.steam_id is not null
      and linked_accounts.discord_id is not null;
end;
$$;

create or replace function public.bta_linkbot_upsert_link(
  p_secret text,
  p_steam_id text,
  p_discord_id text,
  p_discord_name text default null,
  p_discord_avatar text default null
)
returns void
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  existing_row public.linked_accounts%rowtype;
begin
  if not public.bta_linkbot_authorized(p_secret) then
    raise exception 'unauthorized';
  end if;
  if p_steam_id !~ '^7656119[0-9]{10}$' or p_discord_id !~ '^[0-9]{17,20}$' then
    raise exception 'invalid account identifiers';
  end if;

  select *
    into existing_row
    from public.linked_accounts
    where steam_id = p_steam_id or discord_id = p_discord_id
    order by case when steam_id = p_steam_id then 0 else 1 end
    limit 1;

  if found then
    if (existing_row.steam_id is not null and existing_row.steam_id <> p_steam_id)
      or (existing_row.discord_id is not null and existing_row.discord_id <> p_discord_id) then
      raise exception 'account already linked elsewhere';
    end if;

    update public.linked_accounts
      set steam_id = p_steam_id,
          discord_id = p_discord_id,
          discord_username = coalesce(p_discord_name, discord_username),
          discord_global_name = coalesce(p_discord_name, discord_global_name),
          discord_avatar = coalesce(p_discord_avatar, discord_avatar),
          updated_at = now()
      where id = existing_row.id;
  else
    insert into public.linked_accounts (
      link_key,
      steam_id,
      discord_id,
      discord_username,
      discord_global_name,
      discord_avatar,
      updated_at
    ) values (
      'serverpanel:' || p_steam_id,
      p_steam_id,
      p_discord_id,
      p_discord_name,
      p_discord_name,
      p_discord_avatar,
      now()
    );
  end if;
end;
$$;

create or replace function public.bta_linkbot_delete_link(
  p_secret text,
  p_steam_id text
)
returns void
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
begin
  if not public.bta_linkbot_authorized(p_secret) then
    raise exception 'unauthorized';
  end if;
  delete from public.linked_accounts where steam_id = p_steam_id;
end;
$$;

revoke all on function public.bta_linkbot_authorized(text) from public;
revoke all on function public.bta_linkbot_list_links(text) from public;
revoke all on function public.bta_linkbot_upsert_link(text, text, text, text, text) from public;
revoke all on function public.bta_linkbot_delete_link(text, text) from public;

grant execute on function public.bta_linkbot_list_links(text) to anon;
grant execute on function public.bta_linkbot_upsert_link(text, text, text, text, text) to anon;
grant execute on function public.bta_linkbot_delete_link(text, text) to anon;
