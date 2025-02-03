import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://cdmwcgryucdqetkwoyva.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkbXdjZ3J5dWNkcWV0a3dveXZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc1MjkyNjAsImV4cCI6MjA1MzEwNTI2MH0.NrBHoYCrVR-Fdun0PVAzmk__sgkRRp1tRugu6ksTFAc";

// Create Supabase client with custom headers and proper error handling
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }
});

// Add error handling for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    console.log('User signed out');
  } else if (event === 'SIGNED_IN') {
    console.log('User signed in:', session?.user?.email);
  } else if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed');
  } else if (event === 'USER_UPDATED') {
    console.log('User updated');
  }
});