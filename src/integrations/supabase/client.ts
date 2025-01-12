import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://sqnomwztuuaxtzdbqvji.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxbm9td3p0dXVheHR6ZGJxdmppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzMzkxNDcsImV4cCI6MjA1MTkxNTE0N30.3TiS4slsDY32HstHn4byifGVMM5w8N9nDOIBfysAWdw";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxbm9td3p0dXVheHR6ZGJxdmppIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjMzOTE0NywiZXhwIjoyMDUxOTE1MTQ3fQ.vQjgODEzKEzXRz5e_-YvQDuqxNB5E_vJNZhFE9B7MAg";

// Regular client for authenticated operations
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

// Service role client for admin operations
export const serviceRoleClient = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);