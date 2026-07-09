import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const ACTIVITY_FILES_BUCKET = 'activity-files';

const supabaseStorage =
  SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY
    ? createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
        },
      )
    : null;

interface UploadActivityFileParams {
  path: string;
  token: string;
  file: File;
  contentType: string;
}

function getSupabaseStorage() {
  if (!supabaseStorage) {
    throw new Error(
      'Supabase Storage não configurado no frontend.',
    );
  }

  return supabaseStorage;
}

export async function uploadActivityFileToStorage({
  path,
  token,
  file,
  contentType,
}: UploadActivityFileParams): Promise<void> {
  const client = getSupabaseStorage();

  const { error } = await client.storage
    .from(ACTIVITY_FILES_BUCKET)
    .uploadToSignedUrl(
      path,
      token,
      file,
      {
        contentType,
        cacheControl: '3600',
      },
    );

  if (error) {
    throw new Error(
      `Erro ao enviar "${file.name}": ${error.message}`,
    );
  }
}