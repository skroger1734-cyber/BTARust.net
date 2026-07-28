create extension if not exists pgcrypto;

create table if not exists public.tebex_webhook_events (
  event_id text primary key,
  event_type text not null,
  transaction_id text,
  status text not null default 'processing',
  error text,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

create table if not exists public.tebex_entitlements (
  id uuid primary key default gen_random_uuid(),
  transaction_id text not null,
  steam_id text not null,
  package_id text not null,
  package_name text,
  discord_role_id text,
  rust_group text,
  active boolean not null default true,
  source_event_id text references public.tebex_webhook_events(event_id) on delete set null,
  discord_sync_status text not null default 'pending',
  discord_synced_at timestamptz,
  discord_sync_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (transaction_id, steam_id, package_id)
);

create index if not exists tebex_entitlements_steam_active_idx
  on public.tebex_entitlements (steam_id, active);

create index if not exists tebex_entitlements_role_active_idx
  on public.tebex_entitlements (discord_role_id, active);

alter table public.tebex_webhook_events enable row level security;
alter table public.tebex_entitlements enable row level security;

revoke all on table public.tebex_webhook_events from anon, authenticated;
revoke all on table public.tebex_entitlements from anon, authenticated;

grant select, insert, update, delete on table public.tebex_webhook_events to service_role;
grant select, insert, update, delete on table public.tebex_entitlements to service_role;
