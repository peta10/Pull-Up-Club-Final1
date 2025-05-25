import { products } from "./stripe-config";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with publishable key
export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

// Function to fetch Stripe products from Edge Function
export async function fetchStripeProducts() {
  try {
    const { data, error } = await supabase.functions.invoke(
      "get-stripe-products"
    );

    if (error) {
      console.error("Error fetching Stripe products:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Exception when fetching Stripe products:", err);
    return null;
  }
}

// Export existing product configuration
export { products };

/**
 * Creates a Stripe checkout session for subscription
 * @param plan "monthly" or "annual"
 * @param email User's email
 * @param metadata Additional metadata to include with the checkout session
 * @returns Checkout URL or null on error
 */
export async function createCheckoutSession(
  plan: 'monthly' | 'annual' = 'monthly',
  email?: string,
  metadata: Record<string, string> = {}
): Promise<string | null> {
  try {
    // Helper to obtain a valid session, retrying briefly if needed
    const obtainSession = async (retries = 3, delayMs = 500): Promise<Session | null> => {
      for (let i = 0; i < retries; i++) {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (session && !error) return session;

        // Wait before retrying
        await new Promise((res) => setTimeout(res, delayMs));
      }
      return null;
    };

    // Make sure we have a valid session
    const session = await obtainSession();
    if (!session) {
      console.warn('createCheckoutSession: No authenticated session; cannot create checkout');
      throw new Error('Authentication required. Please sign in to continue.');
    }

    // Determine which product to use - get the exact price ID from our config
    const priceId = plan === 'monthly' 
      ? products.pullUpClub.priceId 
      : products.pullUpClubAnnual.priceId;

    console.log(`Creating checkout session with priceId: ${priceId}, plan: ${plan}`);
    
    // Ensure we have a valid email to use
    const customerEmail = email || session.user.email;
    if (!customerEmail) {
      throw new Error('Customer email is required for checkout');
    }

    // Prepare the request body as a proper object
    const requestBody = {
      priceId,
      customerEmail,
      successUrl: `${window.location.origin}/success?checkout=completed&plan=${plan}`,
      cancelUrl: `${window.location.origin}/subscription`,
      returnUrl: `${window.location.origin}/subscription/return`,
      uiMode: 'hosted',
      metadata: {
        ...metadata,
        userId: session.user.id,
        plan
      }
    };

    console.log('Sending request body to create-checkout:', JSON.stringify(requestBody));

    // Call Supabase Edge Function to create checkout session with explicit headers
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: requestBody,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      console.error('Error creating checkout session:', error);
      throw new Error(`Checkout session creation failed: ${error.message}`);
    }

    if (!data?.url) {
      console.error('No checkout URL returned', data);
      throw new Error('No checkout URL returned from Stripe');
    }

    return data.url;
  } catch (err) {
    console.error('Error in createCheckoutSession:', err);
    throw err;
  }
}

/**
 * Creates a payment intent for one-time payments
 * @param amount Amount in cents (e.g., 999 for $9.99)
 * @returns Payment intent client secret
 */
export async function createPaymentIntent(amount: number = 999): Promise<{ clientSecret: string } | null> {
  try {
    const { data, error } = await supabase.functions.invoke('create-payment-intent', {
      body: { amount },
    });

    if (error) {
      console.error('Error creating payment intent:', error);
      return null;
    }
    
    return { clientSecret: data.clientSecret };
  } catch (err) {
    console.error('Error creating payment intent:', err);
    return null;
  }
}

/**
 * Creates a customer portal session for managing subscription
 * @returns Portal URL
 */
export async function createCustomerPortalSession(): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke('customer-portal', {
      body: {
        returnUrl: `${window.location.origin}/profile`,
      },
    });

    if (error) {
      console.error('Error creating customer portal session:', error);
      return null;
    }

    return data.url;
  } catch (err) {
    console.error('Error in createCustomerPortalSession:', err);
    return null;
  }
}

/**
 * Gets the active subscription for the current user
 */
export const getActiveSubscription = async () => {
  try {
    // Helper to obtain a valid session, retrying briefly if needed
    const obtainSession = async (retries = 3, delayMs = 500): Promise<Session | null> => {
      for (let i = 0; i < retries; i++) {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (session && !error) return session;

        // Wait before retrying
        await new Promise((res) => setTimeout(res, delayMs));
      }
      return null;
    };

    const session = await obtainSession();

    if (!session) {
      console.warn('getActiveSubscription: No authenticated session; skipping subscription check');
      return null;
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/subscription-status`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get subscription status');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting subscription status:', error);
    throw error;
  }
};

/**
 * Cancels the active subscription for the current user
 */
export const cancelSubscription = async (): Promise<boolean> => {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      throw new Error("User not authenticated");
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cancel-subscription`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to cancel subscription");
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    throw error;
  }
};

export async function getPaymentHistory() {
  try {
    // Helper to obtain a valid session, retrying briefly if needed
    const obtainSession = async (retries = 3, delayMs = 500): Promise<Session | null> => {
      for (let i = 0; i < retries; i++) {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (session && !error) return session;

        // Wait before retrying
        await new Promise((res) => setTimeout(res, delayMs));
      }
      return null;
    };

    // Make sure we have a valid session
    const session = await obtainSession();
    if (!session) {
      console.warn('getPaymentHistory: No authenticated session; cannot fetch payments');
      throw new Error('Authentication required. Please sign in to continue.');
    }

    // Call Supabase Edge Function to get payment history
    const { data, error } = await supabase.functions.invoke('get-payment-history', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      console.error('Error fetching payment history:', error);
      return [];
    }

    if (!data?.payments) {
      return [];
    }

    // Transform the data to the format our component expects
    return data.payments.map((payment: any) => ({
      id: payment.id,
      amount: payment.amount / 100, // Convert cents to dollars
      status: payment.status,
      date: new Date(payment.created * 1000).toISOString(),
      receipt: payment.receipt_url,
    }));
  } catch (error) {
    console.error('Error in getPaymentHistory:', error);
    return [];
  }
}