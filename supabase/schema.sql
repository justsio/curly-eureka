-- Run in Supabase SQL Editor (once)
-- Tables: participants, winners, shares

create extension if not exists "pgcrypto";

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  phone_number text not null,
  entry_code text not null,
  otp_code text,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  ip_address text,
  user_agent text,
  constraint participants_phone_unique unique (phone_number)
);

create index if not exists idx_participants_verified on public.participants (verified);
create index if not exists idx_participants_created on public.participants (created_at desc);

create table if not exists public.winners (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  phone_masked text not null,
  prize_amount text not null,
  campaign_name text not null default 'Grand Concours'
);

create index if not exists idx_winners_campaign on public.winners (campaign_name);

create table if not exists public.shares (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants (id) on delete cascade,
  platform text not null,
  shared_at timestamptz not null default now()
);

create index if not exists idx_shares_participant on public.shares (participant_id);
create index if not exists idx_shares_platform on public.shares (platform);
