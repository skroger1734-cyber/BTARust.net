-- A player may win a catalog prize only once per giveaway month, even when
-- the wins come from different games. Voided tickets do not consume it.
create unique index if not exists giveaway_rewards_player_catalog_month_unique
  on public.giveaway_rewards (discord_id, reward_id, attempt_month)
  where status <> 'void' and reward_id is not null;
