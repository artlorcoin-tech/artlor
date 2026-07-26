-- ==============================================================================
-- Artlor Supabase Migration: gallery_paintings Table & Initial Seed
-- ==============================================================================
-- Run this script in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- 1. Create gallery_paintings table
CREATE TABLE IF NOT EXISTS public.gallery_paintings (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    style TEXT NOT NULL,                  -- Category e.g. Calligraphy, Sceneries, Abstract, Still Life, etc.
    artist TEXT NOT NULL,
    image TEXT NOT NULL,                  -- Relative asset path or storage URL
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.gallery_paintings ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
DROP POLICY IF EXISTS "Allow public read access to gallery_paintings" ON public.gallery_paintings;
CREATE POLICY "Allow public read access to gallery_paintings"
ON public.gallery_paintings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert/update/delete to gallery_paintings" ON public.gallery_paintings;
CREATE POLICY "Allow insert/update/delete to gallery_paintings"
ON public.gallery_paintings FOR ALL USING (true);

-- 4. Seed initial 8 gallery paintings if table is empty
INSERT INTO public.gallery_paintings (id, title, style, artist, image)
SELECT * FROM (VALUES
  (1, 'Luminous Name', 'Calligraphy', 'Maryam', 'gallery/calligraphy-allah-maryam.png'),
  (2, 'Gilded Script', 'Calligraphy', 'Muntaza', 'gallery/calligraphy-gold-muntaza.png'),
  (3, 'Marbled Letter', 'Calligraphy', 'Muntaza', 'gallery/calligraphy-custom-pour-muntaza.png'),
  (4, 'Verse & Vows', 'Calligraphy', 'Muntaza', 'gallery/calligraphy-nikah-board-muntaza.png'),
  (5, 'Stone & Stream', 'Sceneries', 'Hammad', 'gallery/landscape-bridge-hammad.png'),
  (6, 'Teal Road, Autumn Hills', 'Sceneries', 'Hammad', 'gallery/landscape-vintage-hammad.png'),
  (7, 'Monochrome Flow', 'Abstract', 'Muntaza', 'gallery/abstract-monochrome-muntaza.png'),
  (8, 'Florals in Bloom', 'Still Life', 'Seebah', 'gallery/still-life-florals-seebah.png')
) AS t(id, title, style, artist, image)
WHERE NOT EXISTS (SELECT 1 FROM public.gallery_paintings);

-- Adjust sequence ID generator so new inserts start after 8
SELECT setval('gallery_paintings_id_seq', (SELECT MAX(id) FROM public.gallery_paintings));
