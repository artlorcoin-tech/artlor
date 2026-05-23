-- ╔══════════════════════════════════════════════════════════╗
-- ║  Artlor — Supabase Orders Table                        ║
-- ║                                                         ║
-- ║  Run in Supabase: SQL Editor → New query → Paste → Run ║
-- ╚══════════════════════════════════════════════════════════╝

-- Drop existing table if you want a clean slate (CAUTION: removes data)
-- drop table if exists public.orders;

-- 1) Create the orders table
--    Supports three order types:
--      • 'custom'      — full custom order from OrderForm
--      • 'quick'       — gallery quick-order from QuickOrder
--      • 'find_artist' — geo-matching from FindArtist
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Common fields
  from_name text not null,
  art_style text not null,
  artwork_size text not null,
  order_type text not null check (order_type in ('custom', 'quick', 'find_artist')),

  -- Address fields (required for custom/quick, null for find_artist)
  city text,
  pincode text,
  area text,
  lane text,
  phone text,
  email text,

  -- Gallery quick-order fields
  painting_id integer,
  painting_title text,

  -- Find-artist geo-matching fields
  latitude double precision,
  longitude double precision,
  description text,
  status text default 'pending'
);

-- 2) Enable Row Level Security
alter table public.orders enable row level security;

-- 3) Allow anonymous inserts (the storefront uses the anon key)
create policy "Allow anonymous inserts for orders"
  on public.orders
  for insert
  to anon
  with check (true);

-- 4) Allow anonymous reads so the admin/dashboard can list orders
create policy "Allow anonymous reads for orders"
  on public.orders
  for select
  to anon
  using (true);
