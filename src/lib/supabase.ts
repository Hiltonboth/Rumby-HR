import { createClient } from '@supabase/supabase-js';

// Sanitize inputs to prevent "Invalid path" errors caused by trailing slashes or spaces
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim().replace(/\/$/, '');
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

const isConfigured = supabaseUrl && supabaseUrl !== 'https://your-project-id.supabase.co' && supabaseAnonKey && supabaseAnonKey !== 'your-anon-key';

if (!isConfigured) {
  console.warn('Supabase credentials missing or using placeholders. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables in AI Studio settings.');
}

// We use a more robust initialization to handle the "Lock stolen" error common in iframes/web environments.
export const supabase = createClient(
  isConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isConfigured ? supabaseAnonKey : 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    }
  }
);

// Helper to check if supabase is ready for real requests
export const isSupabaseConfigured = () => isConfigured;
