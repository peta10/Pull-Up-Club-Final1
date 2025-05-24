declare global {
  interface ImportMeta {
    env: {
      VITE_SUPABASE_URL: string;
      VITE_SUPABASE_ANON_KEY: string;
      MODE: string;
      [key: string]: any; // To allow other VITE_ env variables
    };
  }
}

// Export an empty object to make this a module, which is sometimes necessary for global augmentations to be picked up.
export {}; 