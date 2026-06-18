-- ╔═══════════════════════════════════════════════════════════════════════╗
-- ║                                                                       ║
-- ║   A R T L O R  —  Complete Consolidated Supabase Setup SQL            ║
-- ║                                                                       ║
-- ║   Consolidated schema setting up profiles, custom orders, quick        ║
-- ║   orders, contact inquiries, and Google OAuth triggers.                 ║
-- ║                                                                       ║
-- ║   Run in Supabase: SQL Editor → New Query → Paste → Run              ║
-- ║                                                                       ║
-- ╚═══════════════════════════════════════════════════════════════════════╝

-- ═══════════════════════════════════════════════════════════════════════
-- 1. EXTENSIONS
-- ═══════════════════════════════════════════════════════════════════════
create extension if not exists "pgcrypto";      -- For gen_random_uuid()
create extension if not exists "postgis";       -- Geography/geometry tools
create extension if not exists "pg_trgm";       -- Fuzzy search extensions


-- ═══════════════════════════════════════════════════════════════════════
-- 2. ENUMS & ROLES
-- ═══════════════════════════════════════════════════════════════════════
do $$ begin
  create type user_role as enum ('customer', 'artist', 'admin');
exception when duplicate_object then null;
end $$;


-- ═══════════════════════════════════════════════════════════════════════
-- 3. PROFILES (Linked with Supabase auth.users)
-- ═══════════════════════════════════════════════════════════════════════
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text not null default '',
  avatar_url    text default '',
  phone         text default '',
  email         text default '',
  role          user_role not null default 'customer',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Row Level Security (RLS) for Profiles
alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);


-- ═══════════════════════════════════════════════════════════════════════
-- 4. GOOGLE AUTH SIGNUP TRIGGER (Syncs Google details to profiles)
-- ═══════════════════════════════════════════════════════════════════════
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture', '')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Bind the trigger to auth.users table
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'auth' and table_name = 'users') then
    drop trigger if exists on_auth_user_created on auth.users;
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute function public.handle_new_user();
  end if;
end $$;


-- ═══════════════════════════════════════════════════════════════════════
-- 5. CUSTOM ORDERS TABLE
-- ═══════════════════════════════════════════════════════════════════════
create table if not exists public.custom_orders (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  from_name     text not null,
  art_style     text not null,
  artwork_size  text not null,
  order_type    text not null default 'custom',
  city          text,
  pincode       text,
  area          text,
  lane          text,
  phone         text,
  email         text
);

-- RLS for Custom Orders
alter table public.custom_orders enable row level security;

drop policy if exists "Allow anonymous inserts for custom_orders" on public.custom_orders;
create policy "Allow anonymous inserts for custom_orders"
  on public.custom_orders for insert
  to anon
  with check (true);

drop policy if exists "Allow anonymous reads for custom_orders" on public.custom_orders;
create policy "Allow anonymous reads for custom_orders"
  on public.custom_orders for select
  to anon
  using (true);

drop policy if exists "Allow authenticated select for custom_orders" on public.custom_orders;
create policy "Allow authenticated select for custom_orders"
  on public.custom_orders for select
  to authenticated
  using (true);


-- ═══════════════════════════════════════════════════════════════════════
-- 6. QUICK ORDERS TABLE
-- ═══════════════════════════════════════════════════════════════════════
create table if not exists public.quick_orders (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  from_name       text not null,
  art_style       text not null,
  artwork_size    text not null,
  order_type      text not null default 'quick',
  city            text,
  pincode         text,
  area            text,
  lane            text,
  phone           text,
  email           text,
  painting_id     integer,
  painting_title  text,
  painting_image  text
);

-- RLS for Quick Orders
alter table public.quick_orders enable row level security;

drop policy if exists "Allow anonymous inserts for quick_orders" on public.quick_orders;
create policy "Allow anonymous inserts for quick_orders"
  on public.quick_orders for insert
  to anon
  with check (true);

drop policy if exists "Allow anonymous reads for quick_orders" on public.quick_orders;
create policy "Allow anonymous reads for quick_orders"
  on public.quick_orders for select
  to anon
  using (true);

drop policy if exists "Allow authenticated select for quick_orders" on public.quick_orders;
create policy "Allow authenticated select for quick_orders"
  on public.quick_orders for select
  to authenticated
  using (true);


-- ═══════════════════════════════════════════════════════════════════════
-- 7. CONTACT INQUIRIES TABLE
-- ═══════════════════════════════════════════════════════════════════════
create table if not exists public.contact_inquiries (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  name          text not null,
  email         text not null,
  subject       text default '',
  message       text not null
);

-- RLS for Contact Inquiries
alter table public.contact_inquiries enable row level security;

drop policy if exists "Anyone can insert contact inquiries" on public.contact_inquiries;
create policy "Anyone can insert contact inquiries"
  on public.contact_inquiries for insert
  to public
  with check (true);

drop policy if exists "Anyone can view contact inquiries" on public.contact_inquiries;
create policy "Anyone can view contact inquiries"
  on public.contact_inquiries for select
  to public
  using (true);


-- ═══════════════════════════════════════════════════════════════════════
-- 8. HELPER TRIGGERS (Auto updated_at columns)
-- ═══════════════════════════════════════════════════════════════════════
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
begin
  drop trigger if exists set_updated_at on public.profiles;
  create trigger set_updated_at
    before update on public.profiles
    for each row execute function public.set_updated_at();
end $$;
