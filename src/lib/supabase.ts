import { createClient } from '@supabase/supabase-js';

// TypeScript definitions for import.meta.env
interface ImportMetaEnv {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  MODE: string;
}

// Augment the ImportMeta interface
interface ImportMeta {
  env: ImportMetaEnv;
}

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

// Create a single instance of the Supabase client
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Development mode check
export const isDevelopment = import.meta.env.MODE === 'development'; 