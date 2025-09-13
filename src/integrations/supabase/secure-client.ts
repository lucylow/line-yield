import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Frontend Supabase configuration - ONLY uses anon key
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create Supabase client with anon key only (safe for frontend)
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Security validation
export function validateSupabaseConfig(): void {
  // Check that we're not accidentally using service role key
  if (SUPABASE_ANON_KEY.includes('eyJ')) {
    const decoded = JSON.parse(atob(SUPABASE_ANON_KEY.split('.')[1]));
    if (decoded.role === 'service_role') {
      throw new Error('SECURITY ERROR: Service role key detected in frontend! This is a critical security issue.');
    }
  }

  // Validate URL format
  if (!SUPABASE_URL.startsWith('https://') || !SUPABASE_URL.includes('.supabase.co')) {
    throw new Error('Invalid Supabase URL format');
  }

  console.log('✅ Supabase frontend configuration validated');
}

// Initialize validation
validateSupabaseConfig();

// Export types for use throughout the app
export type { Database } from './types';


