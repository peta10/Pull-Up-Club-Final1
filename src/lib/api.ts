import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type for checkout request parameters
interface CreateCheckoutParams {
  priceId: string;
  customerEmail?: string;
  returnUrl: string;
  metadata?: Record<string, string>;
}

/**
 * Creates a Stripe checkout session with embedded UI mode
 */
export async function createCheckout({
  priceId,
  customerEmail,
  returnUrl,
  metadata
}: CreateCheckoutParams) {
  try {
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: {
        priceId,
        customerEmail,
        returnUrl,
        metadata,
        uiMode: 'embedded' // Specify embedded mode
      }
    });

    if (error) {
      console.error('Error creating checkout session:', error);
      return { error: error.message };
    }

    return data; // Contains clientSecret
  } catch (err) {
    console.error('Unexpected error in createCheckout:', err);
    return { error: 'Failed to create checkout session' };
  }
}

/**
 * Gets the status of a Stripe checkout session
 */
export async function getSessionStatus(sessionId: string) {
  try {
    // For GET requests with parameters, we'll construct the URL manually
    const functionUrl = `${supabaseUrl}/functions/v1/get-session-status?session_id=${encodeURIComponent(sessionId)}`;
    
    // Get the access token
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token || '';
    
    // Make a fetch request with the appropriate authorization
    const response = await fetch(functionUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return { error: `Failed with status ${response.status}` };
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Unexpected error in getSessionStatus:', err);
    return { error: 'Failed to get session status' };
  }
}

/**
 * Creates a Stripe customer portal session for managing subscriptions
 */
export async function createPortalSession() {
  try {
    const { data, error } = await supabase.functions.invoke('customer-portal', {
      method: 'POST',
      body: {} // Send empty object to prevent empty body error
    });

    if (error) {
      console.error('Error creating portal session:', error);
      return { error: error.message };
    }

    return { url: data.url };
  } catch (err) {
    console.error('Unexpected error in createPortalSession:', err);
    return { error: 'Failed to create portal session' };
  }
} 