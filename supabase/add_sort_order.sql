-- ==============================================================================
-- Artlor Supabase Migration: Add sort_order to gallery_paintings
-- ==============================================================================
-- Run this script in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- 1. Add sort_order column (default 0 = highest priority / first in list)
ALTER TABLE public.gallery_paintings 
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- 2. Initialize sort_order for existing paintings based on their current id order
-- This gives each existing row a sort_order of 1, 2, 3, etc.
UPDATE public.gallery_paintings 
SET sort_order = sub.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id ASC) AS row_num
  FROM public.gallery_paintings
) sub
WHERE public.gallery_paintings.id = sub.id
  AND public.gallery_paintings.sort_order = 0;
