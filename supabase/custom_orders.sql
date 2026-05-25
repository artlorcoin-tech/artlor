-- ╔══════════════════════════════════════════════════════════╗
-- ║  Artlor — Supabase Custom Orders Table                 ║
-- ║                                                         ║
-- ║  Run in Supabase: SQL Editor → New query → Paste → Run ║
-- ╚══════════════════════════════════════════════════════════╝

create table if not exists public.custom_orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  from_name text not null,
  art_style text not null,
  artwork_size text not null,
  order_type text not null default 'custom',

  city text,
  pincode text,
  area text,
  lane text,
  phone text,
  email text
);

-- Enable Row Level Security
alter table public.custom_orders enable row level security;

-- Allow anonymous inserts (the storefront uses the anon key)
create policy "Allow anonymous inserts for custom_orders"
  on public.custom_orders
  for insert
  to anon
  with check (true);

-- Allow anonymous reads so the dashboard can list custom orders
create policy "Allow anonymous reads for custom_orders"
  on public.custom_orders
  for select
  to anon
  using (true);
