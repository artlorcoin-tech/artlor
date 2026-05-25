-- ╔══════════════════════════════════════════════════════════╗
-- ║  Artlor — Supabase Quick Orders Table                  ║
-- ║                                                         ║
-- ║  Run in Supabase: SQL Editor → New query → Paste → Run ║
-- ╚══════════════════════════════════════════════════════════╝

create table if not exists public.quick_orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  from_name text not null,
  art_style text not null,
  artwork_size text not null,
  order_type text not null default 'quick',

  city text,
  pincode text,
  area text,
  lane text,
  phone text,
  email text,

  -- Quick-order details
  painting_id integer,
  painting_title text,
  painting_image text
);

-- Enable Row Level Security
alter table public.quick_orders enable row level security;

-- Allow anonymous inserts (the storefront uses the anon key)
create policy "Allow anonymous inserts for quick_orders"
  on public.quick_orders
  for insert
  to anon
  with check (true);

-- Allow anonymous reads so the dashboard can list quick orders
create policy "Allow anonymous reads for quick_orders"
  on public.quick_orders
  for select
  to anon
  using (true);
