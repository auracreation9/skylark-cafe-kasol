import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://yqzelhilozltjlahbtsi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxemVsaGlsb3psdGpsYWhidHNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4NzkyODQsImV4cCI6MjA0ODQ1NTI4NH0.4J7ptQw2udURR7O6paB49x0cuG9RNyZQgrSbdVj_IVo';
// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
