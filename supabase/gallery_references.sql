-- ==============================================================================
-- Artlor Supabase Migration: gallery_references Table & Storage Bucket Setup
-- ==============================================================================
-- Copy & paste this entire script into your Supabase SQL Editor and click RUN:
-- SQL Editor URL: https://supabase.com/dashboard/project/_/sql

-- 1. Create gallery_references table
CREATE TABLE IF NOT EXISTS public.gallery_references (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    painting_id INTEGER NOT NULL,            -- ID of gallery painting (e.g. 1 to 8)
    painting_title TEXT,                     -- Title of painting (e.g. "Luminous Name")
    image_url TEXT NOT NULL,                  -- Storage URL or external image URL
    caption TEXT DEFAULT '',                 -- Description (e.g. "Framed customer photo")
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create index for fast lookups by painting_id
CREATE INDEX IF NOT EXISTS idx_gallery_references_painting_id 
ON public.gallery_references(painting_id);

-- 3. Enable Row Level Security (RLS) on gallery_references table
ALTER TABLE public.gallery_references ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for gallery_references table
DROP POLICY IF EXISTS "Allow public read access to gallery_references" ON public.gallery_references;
CREATE POLICY "Allow public read access to gallery_references"
ON public.gallery_references FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert to gallery_references" ON public.gallery_references;
CREATE POLICY "Allow insert to gallery_references"
ON public.gallery_references FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete to gallery_references" ON public.gallery_references;
CREATE POLICY "Allow delete to gallery_references"
ON public.gallery_references FOR DELETE USING (true);


-- ==============================================================================
-- AUTOMATIC STORAGE BUCKET CREATION & PERMISSIONS
-- ==============================================================================

-- 5. Create storage bucket 'gallery-references' automatically
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery-references', 'gallery-references', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 6. Enable public access & uploads on storage.objects for 'gallery-references'
DROP POLICY IF EXISTS "Public Read Objects gallery_references" ON storage.objects;
CREATE POLICY "Public Read Objects gallery_references"
ON storage.objects FOR SELECT USING (bucket_id = 'gallery-references');

DROP POLICY IF EXISTS "Public Insert Objects gallery_references" ON storage.objects;
CREATE POLICY "Public Insert Objects gallery_references"
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gallery-references');

DROP POLICY IF EXISTS "Public Delete Objects gallery_references" ON storage.objects;
CREATE POLICY "Public Delete Objects gallery_references"
ON storage.objects FOR DELETE USING (bucket_id = 'gallery-references');
