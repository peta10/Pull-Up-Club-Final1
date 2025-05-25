import { supabase } from './supabase';

/**
 * Creates a checkout session for Stripe Embedded Checkout
 */
export async function createCheckout(payload: {
  priceId: string;
  customerEmail?: string;
  returnUrl: string;
  metadata?: Record<string, string>;
}): Promise<{ clientSecret: string; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: {
        ...payload,
        uiMode: 'embedded' // Explicitly set embedded mode
      },
    });

    if (error) {
      console.error('Error creating checkout session:', error);
      return { clientSecret: '', error: error.message };
    }

    if (!data?.clientSecret) {
      console.error('No client secret returned', data);
      return { clientSecret: '', error: 'No client secret returned from Stripe' };
    }

    return { clientSecret: data.clientSecret };
  } catch (err) {
    console.error('Error in createCheckout:', err);
    return { 
      clientSecret: '', 
      error: err instanceof Error ? err.message : 'Unknown error creating checkout'
    };
  }
}

/**
 * Checks the status of a checkout session
 */
export async function getSessionStatus(sessionId: string): Promise<{ 
  status: 'open' | 'complete' | 'expired'; 
  customer_email?: string;
  error?: string;
}> {
  try {
    // Call our session-status Edge Function
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/session-status?session_id=${sessionId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get session status');
    }

    const data = await response.json();
    return {
      status: data.status,
      customer_email: data.customer_email
    };
  } catch (error) {
    console.error('Error checking session status:', error);
    return {
      status: 'expired', // Default to expired on error
      error: error instanceof Error ? error.message : 'Unknown error checking session'
    };
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