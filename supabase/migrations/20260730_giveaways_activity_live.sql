create table if not exists public.giveaway_sessions (
  id uuid primary key,
  discord_id text not null,
  game_id text not null,
  state jsonb not null,
  outcome text not null default 'playing',
  started_at timestamptz not null default now(),
  expires_at timestamptz not null,
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.giveaway_attempts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.giveaway_sessions(id) on delete cascade,
  discord_id text not null,
  discord_username text,
  steam_id text not null,
  game_id text not null,
  attempt_day date not null default (now() at time zone 'utc')::date,
  attempt_month text not null,
  outcome text not null default 'playing',
  source text not null default 'discord_activity',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  reward_id uuid
);

create unique index if not exists giveaway_attempts_daily_unique
  on public.giveaway_attempts (discord_id, game_id, attempt_day);

create index if not exists giveaway_attempts_user_month_idx
  on public.giveaway_attempts (discord_id, attempt_month, started_at desc);

create table if not exists public.giveaway_rewards (
  id uuid primary key default gen_random_uuid(),
  discord_id text not null,
  steam_id text not null,
  game_id text not null,
  reward_id text,
  name text not null,
  type text not null,
  quantity integer,
  permission text,
  duration_days integer,
  attempt_month text not null,
  status text not null default 'pending',
  secret text,
  tebex_coupon_id text,
  fulfillment_group text,
  fulfillment_servers jsonb,
  awarded_at timestamptz not null default now(),
  delivered_at timestamptz,
  expires_at timestamptz,
  dm_status text,
  dm_sent_at timestamptz,
  fulfillment_error text
);

create unique index if not exists giveaway_rewards_monthly_game_unique
  on public.giveaway_rewards (discord_id, game_id, attempt_month);

create index if not exists giveaway_rewards_stock_idx
  on public.giveaway_rewards (attempt_month, reward_id, status);

create index if not exists giveaway_rewards_expiry_idx
  on public.giveaway_rewards (status, expires_at)
  where type = 'kit';

create table if not exists public.giveaway_audit (
  id uuid primary key default gen_random_uuid(),
  discord_id text,
  event text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists giveaway_audit_created_idx
  on public.giveaway_audit (created_at desc);

alter table public.giveaway_sessions enable row level security;
alter table public.giveaway_attempts enable row level security;
alter table public.giveaway_rewards enable row level security;
alter table public.giveaway_audit enable row level security;

revoke all on table public.giveaway_sessions from anon, authenticated;
revoke all on table public.giveaway_attempts from anon, authenticated;
revoke all on table public.giveaway_rewards from anon, authenticated;
revoke all on table public.giveaway_audit from anon, authenticated;

grant select, insert, update, delete on table public.giveaway_sessions to service_role;
grant select, insert, update, delete on table public.giveaway_attempts to service_role;
grant select, insert, update, delete on table public.giveaway_rewards to service_role;
grant select, insert, update, delete on table public.giveaway_audit to service_role;
