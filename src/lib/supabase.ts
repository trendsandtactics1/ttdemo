import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://evezmtscadnytgcnepqv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2ZXptdHNjYWRueXRnY25lcHF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc5ODc2MDAsImV4cCI6MjAyMzU2MzYwMH0.PmWGHxriiO0kBDEcxU_qJZ9WgfHO-2_3A29JGHJDsaI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);