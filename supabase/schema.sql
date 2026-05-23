-- ╔═══════════════════════════════════════════════════════════════════════╗
-- ║                                                                       ║
-- ║   A R T L O R  —  Complete Supabase Schema                            ║
-- ║                                                                       ║
-- ║   Art commission marketplace with Uber-style artist matching,         ║
-- ║   gallery quick-orders, and custom commissions.                       ║
-- ║                                                                       ║
-- ║   Run in Supabase: SQL Editor → New Query → Paste → Run              ║
-- ║                                                                       ║
-- ╚═══════════════════════════════════════════════════════════════════════╝

-- ═══════════════════════════════════════════════════════════════════════
-- 0. EXTENSIONS
-- ═══════════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";      -- gen_random_uuid()
create extension if not exists "postgis";       -- geography / geometry for geo queries
create extension if not exists "pg_trgm";       -- trigram fuzzy search on artist names


-- ═══════════════════════════════════════════════════════════════════════
-- 1. CUSTOM ENUMS
-- ═══════════════════════════════════════════════════════════════════════

do $$ begin
  create type art_category as enum (
    'Abstract',
    'Calligraphy',
    'Landscape',
    'Still Life',
    'Portrait',
    'Modern'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type order_type as enum (
    'custom',        -- full custom commission via OrderForm
    'quick'          -- gallery quick-order via QuickOrder
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type order_status as enum (
    'pending',       -- just placed
    'searching',     -- looking for an artist match
    'offered',       -- sent to a specific artist
    'accepted',      -- artist accepted
    'in_progress',   -- artist working on it
    'shipped',       -- artwork shipped to customer
    'completed',     -- delivered & confirmed
    'rejected',      -- all artists rejected / timed out
    'cancelled'      -- customer cancelled
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type user_role as enum (
    'customer',
    'artist',
    'admin'
  );
exception when duplicate_object then null;
end $$;


-- ═══════════════════════════════════════════════════════════════════════
-- 2. PROFILES
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists public.profiles (
  id            uuid primary key default gen_random_uuid(),
  full_name     text not null default '',
  avatar_url    text default '',
  phone         text default '',
  email         text default '',
  role          user_role not null default 'customer',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.profiles is 'User profiles. Can be linked to Supabase Auth when auth is enabled.';

-- Auto-create profile on signup (only if Supabase Auth is available)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.email, '')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Attach trigger only if auth.users exists
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
-- 3. ARTISTS
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists public.artists (
  id                uuid primary key default gen_random_uuid(),
  profile_id        uuid unique references public.profiles(id) on delete set null,

  -- Identity
  name              text not null,
  avatar_url        text default '',
  bio               text default '' check (char_length(bio) <= 500),

  -- Specialisations (stored as text[] for flexibility with the enum)
  categories        text[] not null default '{}',

  -- Geolocation (PostGIS geography for accurate distance in meters)
  location          geography(Point, 4326),
  city              text default '',

  -- Availability
  is_online         boolean not null default false,
  is_verified       boolean not null default false,

  -- Stats
  rating            numeric(2,1) not null default 4.5 check (rating between 1.0 and 5.0),
  total_reviews     integer not null default 0,
  completed_orders  integer not null default 0,

  -- Contact
  phone             text default '',
  email             text default '',

  -- Real-time
  socket_id         text default null,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table public.artists is 'Artist profiles with geo-location for the Uber-style matching engine.';

-- Indexes
create index if not exists idx_artists_location     on public.artists using gist (location);
create index if not exists idx_artists_categories   on public.artists using gin  (categories);
create index if not exists idx_artists_online       on public.artists (is_online) where is_online = true;
create index if not exists idx_artists_name_trgm    on public.artists using gin  (name gin_trgm_ops);
create index if not exists idx_artists_rating       on public.artists (rating desc);


-- ═══════════════════════════════════════════════════════════════════════
-- 4. GALLERY ARTWORKS  (the paintings shown in the gallery page)
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists public.artworks (
  id            serial primary key,
  title         text not null,
  style         text not null,                       -- matches art_category values
  artist_id     uuid references public.artists(id) on delete set null,
  artist_name   text not null default '',             -- denormalized for fast reads
  image_path    text not null,                        -- relative path in /public/gallery
  description   text default '',
  price         numeric(10,2) default null,           -- null = "contact for price"
  is_available  boolean not null default true,
  created_at    timestamptz not null default now()
);

comment on table public.artworks is 'Gallery artwork catalog. Each painting can be quick-ordered.';

create index if not exists idx_artworks_style     on public.artworks (style);
create index if not exists idx_artworks_artist    on public.artworks (artist_id);
create index if not exists idx_artworks_available on public.artworks (is_available) where is_available = true;


-- ═══════════════════════════════════════════════════════════════════════
-- 5. ORDERS  (the core transactional table)
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists public.orders (
  id                  uuid primary key default gen_random_uuid(),
  order_number        text unique not null default ('ART-' || upper(substr(gen_random_uuid()::text, 1, 8))),

  -- Who placed the order (nullable — anon orders allowed)
  customer_id         uuid references public.profiles(id) on delete set null,

  -- Customer info (always captured, even for anon)
  from_name           text not null,
  email               text default '',
  phone               text default '',

  -- What was ordered
  order_type          order_type not null default 'custom',
  art_style           text not null,
  artwork_size        text not null default 'Medium',
  description         text default '',

  -- Quick-order specifics (null for custom orders)
  painting_id         integer references public.artworks(id) on delete set null,
  painting_title      text default null,

  -- Delivery address
  city                text default '',
  pincode             text default '',
  area                text default '',
  lane                text default '',

  -- Matching engine state
  status              order_status not null default 'pending',
  assigned_artist_id  uuid references public.artists(id) on delete set null,
  current_offer_id    uuid references public.artists(id) on delete set null,
  offer_distance_km   numeric(8,2) default null,
  offer_sent_at       timestamptz default null,
  match_distance_km   numeric(8,2) default null,

  -- Geo for proximity matching
  latitude            double precision default null,
  longitude           double precision default null,

  -- Pricing
  quoted_price        numeric(10,2) default null,
  final_price         numeric(10,2) default null,
  currency            text not null default 'INR',

  -- Timestamps
  accepted_at         timestamptz default null,
  completed_at        timestamptz default null,
  cancelled_at        timestamptz default null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

comment on table public.orders is 'Art commission orders — supports custom and quick-order flows with artist matching lifecycle.';

-- Indexes
create index if not exists idx_orders_status       on public.orders (status);
create index if not exists idx_orders_customer     on public.orders (customer_id);
create index if not exists idx_orders_artist       on public.orders (assigned_artist_id);
create index if not exists idx_orders_type         on public.orders (order_type);
create index if not exists idx_orders_created      on public.orders (created_at desc);
create index if not exists idx_orders_number       on public.orders (order_number);


-- ═══════════════════════════════════════════════════════════════════════
-- 6. ORDER REJECTIONS  (artists who declined / timed out)
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists public.order_rejections (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  artist_id     uuid not null references public.artists(id) on delete cascade,
  reason        text default '',
  rejected_at   timestamptz not null default now()
);

comment on table public.order_rejections is 'Tracks which artists rejected or timed out on an order during matching.';

create index if not exists idx_rejections_order  on public.order_rejections (order_id);
create index if not exists idx_rejections_artist on public.order_rejections (artist_id);


-- ═══════════════════════════════════════════════════════════════════════
-- 7. REVIEWS
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists public.reviews (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid unique not null references public.orders(id) on delete cascade,
  artist_id     uuid not null references public.artists(id) on delete cascade,
  customer_id   uuid references public.profiles(id) on delete set null,
  rating        smallint not null check (rating between 1 and 5),
  comment       text default '',
  created_at    timestamptz not null default now()
);

comment on table public.reviews is 'Customer reviews after order completion. One review per order.';

create index if not exists idx_reviews_artist on public.reviews (artist_id);

-- Auto-update artist rating on new review
create or replace function public.update_artist_rating()
returns trigger as $$
begin
  update public.artists
  set
    rating        = (select round(avg(r.rating)::numeric, 1) from public.reviews r where r.artist_id = new.artist_id),
    total_reviews = (select count(*)                          from public.reviews r where r.artist_id = new.artist_id),
    updated_at    = now()
  where id = new.artist_id;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_review_created on public.reviews;
create trigger on_review_created
  after insert on public.reviews
  for each row execute function public.update_artist_rating();


-- ═══════════════════════════════════════════════════════════════════════
-- 8. NOTIFICATIONS
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists public.notifications (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  title         text not null,
  body          text default '',
  is_read       boolean not null default false,
  link          text default null,
  created_at    timestamptz not null default now()
);

comment on table public.notifications is 'In-app notifications for order updates, matching events, and announcements.';

create index if not exists idx_notifications_user   on public.notifications (user_id, is_read, created_at desc);


-- ═══════════════════════════════════════════════════════════════════════
-- 9. AUTO-UPDATE updated_at TRIGGER
-- ═══════════════════════════════════════════════════════════════════════

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply to all tables with updated_at
do $$
declare
  t text;
begin
  for t in select unnest(array['profiles', 'artists', 'orders']) loop
    execute format('
      drop trigger if exists set_updated_at on public.%I;
      create trigger set_updated_at
        before update on public.%I
        for each row execute function public.set_updated_at();
    ', t, t);
  end loop;
end $$;


-- ═══════════════════════════════════════════════════════════════════════
-- 10. ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════════

-- ── Profiles ──
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ── Artists (public read, self-edit) ──
alter table public.artists enable row level security;

create policy "Anyone can view artists"
  on public.artists for select
  to anon, authenticated
  using (true);

create policy "Artists can update own profile"
  on public.artists for update
  using (profile_id = auth.uid());

-- ── Artworks (public read) ──
alter table public.artworks enable row level security;

create policy "Anyone can view artworks"
  on public.artworks for select
  to anon, authenticated
  using (true);

-- ── Orders ──
alter table public.orders enable row level security;

create policy "Anon can insert orders"
  on public.orders for insert
  to anon
  with check (true);

create policy "Authenticated can insert orders"
  on public.orders for insert
  to authenticated
  with check (true);

create policy "Anon can read orders"
  on public.orders for select
  to anon
  using (true);

create policy "Customers can view own orders"
  on public.orders for select
  to authenticated
  using (customer_id = auth.uid());

create policy "Assigned artist can view order"
  on public.orders for select
  to authenticated
  using (
    assigned_artist_id in (
      select id from public.artists where profile_id = auth.uid()
    )
  );

-- ── Order Rejections ──
alter table public.order_rejections enable row level security;

create policy "Anon can read rejections"
  on public.order_rejections for select
  to anon
  using (true);

-- ── Reviews (public read, customer write) ──
alter table public.reviews enable row level security;

create policy "Anyone can view reviews"
  on public.reviews for select
  to anon, authenticated
  using (true);

create policy "Customers can create reviews"
  on public.reviews for insert
  to authenticated
  with check (customer_id = auth.uid());

-- ── Notifications (private) ──
alter table public.notifications enable row level security;

create policy "Users see own notifications"
  on public.notifications for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can mark own notifications read"
  on public.notifications for update
  to authenticated
  using (user_id = auth.uid());


-- ═══════════════════════════════════════════════════════════════════════
-- 11. HELPER VIEWS
-- ═══════════════════════════════════════════════════════════════════════

-- Dashboard summary for admin
create or replace view public.v_order_stats as
select
  count(*)                                                   as total_orders,
  count(*) filter (where status = 'pending')                 as pending,
  count(*) filter (where status = 'in_progress')             as in_progress,
  count(*) filter (where status = 'completed')               as completed,
  count(*) filter (where status = 'cancelled')               as cancelled,
  count(*) filter (where order_type = 'custom')              as custom_orders,
  count(*) filter (where order_type = 'quick')               as quick_orders,
  round(avg(final_price)::numeric, 2)                        as avg_order_value,
  count(*) filter (where created_at > now() - interval '7d') as last_7_days
from public.orders;

comment on view public.v_order_stats is 'Aggregated order statistics for the admin dashboard.';


-- ═══════════════════════════════════════════════════════════════════════
-- 12. SEED DATA  (Gallery Artworks)
-- ═══════════════════════════════════════════════════════════════════════

insert into public.artworks (id, title, style, artist_name, image_path) values
  (1, 'Luminous Name',            'Calligraphy', 'Maryam',  'gallery/calligraphy-allah-maryam.png'),
  (2, 'Gilded Script',            'Calligraphy', 'Muntaza', 'gallery/calligraphy-gold-muntaza.png'),
  (3, 'Marbled Letter',           'Calligraphy', 'Muntaza', 'gallery/calligraphy-custom-pour-muntaza.png'),
  (4, 'Verse & Vows',             'Calligraphy', 'Muntaza', 'gallery/calligraphy-nikah-board-muntaza.png'),
  (5, 'Stone & Stream',           'Landscape',   'Hammad',  'gallery/landscape-bridge-hammad.png'),
  (6, 'Teal Road, Autumn Hills',  'Landscape',   'Hammad',  'gallery/landscape-vintage-car-hammad.png'),
  (7, 'Monochrome Flow',          'Abstract',    'Muntaza', 'gallery/abstract-monochrome-muntaza.png'),
  (8, 'Florals in Bloom',         'Still Life',  'Seebah',  'gallery/still-life-florals-seebah.png')
on conflict (id) do nothing;


-- ═══════════════════════════════════════════════════════════════════════
-- Done! Your Artlor database is ready.
-- ═══════════════════════════════════════════════════════════════════════
