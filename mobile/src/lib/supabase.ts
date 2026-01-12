import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// REPLACE THESE WITH YOUR OWN SUPABASE CREDENTIALS
// Find them at: https://supabase.com/dashboard/project/_/settings/api
const supabaseUrl = 'https://peuscsqevvcxegoqygzu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBldXNjc3FldnZjeGVnb3F5Z3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxOTQyNDAsImV4cCI6MjA4Mzc3MDI0MH0._fCG85bLNgGGw2umpbuFYPOdeJVWL2wtYQBaD7sB0N4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
