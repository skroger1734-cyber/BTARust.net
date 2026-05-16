create extension if not exists pgcrypto;

create table if not exists public.linked_accounts (
  id uuid primary key default gen_random_uuid(),
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
