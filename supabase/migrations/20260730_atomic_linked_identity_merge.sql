create or replace function public.bta_save_linked_identity(
  p_link_key text,
  p_identity_column text,
  p_identity_value text,
  p_values jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_row public.linked_accounts%rowtype;
  identity_row public.linked_accounts%rowtype;
  target_row public.linked_accounts%rowtype;
  next_steam_id text;
  next_discord_id text;
begin
  if nullif(trim(p_link_key), '') is null
    or nullif(trim(p_identity_value), '') is null then
    raise exception 'missing link key or verified account identity';
  end if;

  if p_identity_column not in ('steam_id', 'discord_id') then
    raise exception 'unsupported linked-account identity column';
  end if;

  if p_identity_column = 'steam_id'
    and p_identity_value !~ '^7656119[0-9]{10}$' then
    raise exception 'invalid Steam account identifier';
  end if;

  if p_identity_column = 'discord_id'
    and p_identity_value !~ '^[0-9]{17,20}$' then
    raise exception 'invalid Discord account identifier';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('bta-link:' || p_link_key, 0));
  perform pg_advisory_xact_lock(
    hashtextextended('bta-identity:' || p_identity_column || ':' || p_identity_value, 0)
  );

  select *
    into current_row
    from public.linked_accounts
    where link_key = p_link_key
    for update;

  if p_identity_column = 'steam_id' then
    select *
      into identity_row
      from public.linked_accounts
      where steam_id = p_identity_value
      for update;
  else
    select *
      into identity_row
      from public.linked_accounts
      where discord_id = p_identity_value
      for update;
  end if;

  if identity_row.id is not null
    and current_row.id is not null
    and identity_row.id <> current_row.id then
    if identity_row.steam_id is not null
      and current_row.steam_id is not null
      and identity_row.steam_id <> current_row.steam_id then
      raise exception 'this browser session is linked to a different Steam account';
    end if;

    if identity_row.discord_id is not null
      and current_row.discord_id is not null
      and identity_row.discord_id <> current_row.discord_id then
      raise exception 'this browser session is linked to a different Discord account';
    end if;

    delete from public.linked_accounts where id = current_row.id;
    target_row := identity_row;
  elsif identity_row.id is not null then
    target_row := identity_row;
  elsif current_row.id is not null then
    target_row := current_row;
  end if;

  next_steam_id := case
    when p_identity_column = 'steam_id' then p_identity_value
    else coalesce(p_values->>'steam_id', target_row.steam_id)
  end;
  next_discord_id := case
    when p_identity_column = 'discord_id' then p_identity_value
    else coalesce(p_values->>'discord_id', target_row.discord_id)
  end;

  if target_row.id is not null then
    update public.linked_accounts
      set link_key = p_link_key,
          steam_id = next_steam_id,
          steam_persona = coalesce(p_values->>'steam_persona', target_row.steam_persona),
          steam_avatar = coalesce(p_values->>'steam_avatar', target_row.steam_avatar),
          discord_id = next_discord_id,
          discord_username = coalesce(p_values->>'discord_username', target_row.discord_username),
          discord_global_name = coalesce(p_values->>'discord_global_name', target_row.discord_global_name),
          discord_avatar = coalesce(p_values->>'discord_avatar', target_row.discord_avatar),
          updated_at = now()
      where id = target_row.id;
  else
    insert into public.linked_accounts (
      link_key,
      steam_id,
      steam_persona,
      steam_avatar,
      discord_id,
      discord_username,
      discord_global_name,
      discord_avatar,
      updated_at
    ) values (
      p_link_key,
      next_steam_id,
      p_values->>'steam_persona',
      p_values->>'steam_avatar',
      next_discord_id,
      p_values->>'discord_username',
      p_values->>'discord_global_name',
      p_values->>'discord_avatar',
      now()
    );
  end if;
end;
$$;

revoke all on function public.bta_save_linked_identity(text, text, text, jsonb) from public;
revoke all on function public.bta_save_linked_identity(text, text, text, jsonb) from anon;
revoke all on function public.bta_save_linked_identity(text, text, text, jsonb) from authenticated;
grant execute on function public.bta_save_linked_identity(text, text, text, jsonb) to service_role;
