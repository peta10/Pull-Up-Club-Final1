import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and anon key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing required environment variables for Supabase connection');
  alert('Missing Supabase configuration. Please check your environment variables.');
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

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
  // Reduce default timeout and retry counts
  global: {
    fetch: (url, options) => {
      return fetch(url, { 
        ...options, 
        signal: AbortSignal.timeout(10000) // 10-second timeout
      });
    }
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

// Test connection on initialization
(async () => {
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase.from('profiles').select('count(*)');
    
    if (error) {
      console.error('Supabase connection test failed:', error);
    } else {
      console.log('Supabase connection successful!');
    }
  } catch (err) {
    console.error('Supabase connection test error:', err);
  }
})();