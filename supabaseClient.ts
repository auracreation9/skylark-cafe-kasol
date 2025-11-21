import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://yqzelhilozltjlahbtsi.supabase.co';
const supabaseAnonKey = 'sb_publishable_ltaNA7nnVozoSCOcZIjg';

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
