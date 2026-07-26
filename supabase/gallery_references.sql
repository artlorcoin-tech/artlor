-- ==============================================================================
-- Artlor Supabase Migration: gallery_references Table & Storage Bucket Setup
-- ==============================================================================
-- Copy & paste this entire script into your Supabase SQL Editor and run it.
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

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.gallery_references ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
-- Allow anyone (public) to view reference images
DROP POLICY IF EXISTS "Allow public read access to gallery_references" ON public.gallery_references;
CREATE POLICY "Allow public read access to gallery_references"
ON public.gallery_references FOR SELECT
USING (true);

-- Allow anonymous / authenticated users to insert reference images (Admin Panel)
DROP POLICY IF EXISTS "Allow insert to gallery_references" ON public.gallery_references;
CREATE POLICY "Allow insert to gallery_references"
ON public.gallery_references FOR INSERT
WITH CHECK (true);

-- Allow anonymous / authenticated users to delete reference images (Admin Panel)
DROP POLICY IF EXISTS "Allow delete to gallery_references" ON public.gallery_references;
CREATE POLICY "Allow delete to gallery_references"
ON public.gallery_references FOR DELETE
USING (true);

-- ==============================================================================
-- STORAGE BUCKET INSTRUCTIONS:
-- 1. Go to Supabase Dashboard -> Storage -> Buckets
-- 2. Click "New Bucket", name it: gallery-references
-- 3. Toggle "Public Bucket" to ON so reference images can be publicly viewed.
-- 4. Under Storage Policies for 'gallery-references', allow SELECT, INSERT, and DELETE for public/anon roles.
-- ==============================================================================
