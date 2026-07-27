create extension if not exists pgcrypto;

create table if not exists public.linked_accounts (
  id uuid primary key default gen_random_uuid(),
  link_key text unique not null,
  steam_id text unique,
  discord_id text unique,
  steam_persona text,
  steam_avatar text,
  discord_username text,
  discord_global_name text,
  discord_avatar text,
  tebex_username text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.linked_accounts
  add column if not exists link_key text;

create unique index if not exists linked_accounts_link_key_unique
  on public.linked_accounts (link_key);

alter table public.linked_accounts enable row level security;

revoke all on table public.linked_accounts from anon, authenticated;
grant select, insert, update, delete on table public.linked_accounts to service_role;
