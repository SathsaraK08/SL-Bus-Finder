import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://peuscsqevvcxegoqygzu.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBldXNjc3FldnZjeGVnb3F5Z3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxOTQyNDAsImV4cCI6MjA4Mzc3MDI0MH0._fCG85bLNgGGw2umpbuFYPOdeJVWL2wtYQBaD7sB0N4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
    return supabaseUrl && supabaseAnonKey;
};
