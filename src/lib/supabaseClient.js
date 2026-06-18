import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kuwqtzynfdvqtjqurqsv.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON || 'sb_publishable_OO6b1C_yy5URFdj6wvYtUg_iqXeMmHL'

// Ensure we pass the base URL to createClient, stripping the postgrest subpath if present
const cleanUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '')

export const supabase = createClient(cleanUrl, supabaseAnonKey)
