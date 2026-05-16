select
  id,
  steam_id,
  steam_persona,
  steam_avatar,
  discord_id,
  discord_username,
  discord_global_name,
  discord_avatar,
  created_at,
  updated_at
from public.linked_accounts
order by updated_at desc;
