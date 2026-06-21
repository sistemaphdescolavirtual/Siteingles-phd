import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;


if (!supabaseUrl) {
  throw new Error('A variável SUPABASE_URL não foi configurada no .env');
}

if (!supabasePublishableKey) {
  throw new Error('A variável SUPABASE_PUBLISHABLE_KEY não foi configurada no .env');
}

if (!supabaseServiceRoleKey) {
  throw new Error('A variável SUPABASE_SERVICE_ROLE_KEY não foi configurada no .env');
}

/**
 * Cliente administrativo.
 * Use apenas no backend.
 */
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);

/**
 * Cliente usado para login com email e senha.
 */
export const supabaseAuth = createClient(
  supabaseUrl,
  supabasePublishableKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);

/**
 * Mantém compatibilidade com as rotas antigas, como modules.routes.js.
 */
export const supabase = supabaseAdmin;

