-- 1. Create the table if it doesn't exist
create table if not exists public.contact_inquiries (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  subject     text default '',
  message     text not null,
  created_at  timestamptz not null default now()
);

comment on table public.contact_inquiries is 'Stores customer messages and support requests submitted via the Contact Us form.';

-- 2. Enable Row Level Security (RLS)
alter table public.contact_inquiries enable row level security;

-- 3. Drop existing policies if they exist (prevents duplication errors when re-running)
drop policy if exists "Anyone can insert contact inquiries" on public.contact_inquiries;
drop policy if exists "Anyone can view contact inquiries" on public.contact_inquiries;

-- 4. Create policies using "to public" (works on both Supabase and standard PostgreSQL)
create policy "Anyone can insert contact inquiries"
  on public.contact_inquiries for insert
  to public
  with check (true);

create policy "Anyone can view contact inquiries"
  on public.contact_inquiries for select
  to public
  using (true);
