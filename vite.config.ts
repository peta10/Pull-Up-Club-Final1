import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'node:process';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react({
        // Add the JSX runtime config
        jsxRuntime: 'automatic',
        jsxImportSource: 'react',
      }),
    ],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
    // Add resolve configuration for TypeScript extensions
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    // Make all environment variables available to the client
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || 'https://yqnikgupiaghgjtsaypr.supabase.co'),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxbmlrZ3VwaWFnaGdqdHNheXByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5NDIzMDMsImV4cCI6MjA2MzUxODMwM30.3rR9EyNlWSLZAoYqlCa3MOJobHH7RHjak0m_3mI6YZs'),
      'import.meta.env.VITE_GA_MEASUREMENT_ID': JSON.stringify(env.VITE_GA_MEASUREMENT_ID || 'G-PLACEHOLDER'),
      'import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY': JSON.stringify(env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_live_51RLYUyGaHiDfsUfBuCJ8wlW6vrQA50vyhiBi5v3lnfm3byAQpYzkqqX1ElIYEb0Alxi4IXFR2ozxmMlRKSdOKNTH00mdn1920o'),
    },
  };
});