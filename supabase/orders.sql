-- Run in Supabase: SQL Editor → New query → Paste → Run

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  from_name text not null,
  art_style text not null,
  artwork_size text not null,
  city text not null,
  pincode text not null,
  area text not null,
  lane text not null,
  phone text not null,
  email text not null,
  order_type text not null check (order_type in ('custom', 'quick')),
  painting_id integer,
  painting_title text
);

alter table public.orders enable row level security;

create policy "Allow anonymous inserts for orders"
  on public.orders
  for insert
  to anon
  with check (true);
