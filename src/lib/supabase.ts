import { createClient } from '@supabase/supabase-js';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

// Function to get the correct URL for authentication redirects
export const getRedirectUrl = (): string => {
  // Check if it's browser environment
  if (typeof window !== 'undefined') {
    const host = window.location.host;
    // Ensure SSL is used
    const protocol = window.location.protocol;
    return `${protocol}//${host}/auth/callback`;
  }
  // Fallback for non-browser environments
  return 'http://localhost:5173/auth/callback';
};

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    // Remove redirectTo property since it's not recognized
    // redirectTo: getRedirectUrl()
  },
});

// Development mode check
export const isDevelopment = import.meta.env.MODE === 'development';

// Helper function for handling auth redirects in components
export const handleAuthRedirect = (customPath?: string) => {
  const baseUrl = getRedirectUrl();
  const redirectPath = customPath || '';
  
  // If custom path starts with '/', remove the trailing slash from baseUrl
  return customPath?.startsWith('/') 
    ? `${baseUrl.slice(0, -1)}${redirectPath}`
    : `${baseUrl}${redirectPath}`;
}; 