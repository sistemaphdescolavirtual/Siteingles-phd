// Initialize a Supabase client using the service role key. Using the service role
// key allows the backend to bypass row-level security policies when necessary.
// Note: never expose this key to the frontend.
import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);