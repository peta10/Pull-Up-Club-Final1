import { products } from "../services/stripe-config";
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
    // Call Supabase Edge Function to create checkout session
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: { plan, email, metadata },
    });

    if (error) {
      console.error('Error creating checkout session:', error);
      return null;
    }

    if (!data?.url) {
      console.error('No checkout URL returned');
      return null;
    }

    return data.url;
  } catch (err) {
    console.error('Error in createCheckoutSession:', err);
    return null;
  }
}

/**
 * Creates a payment intent for one-time payments
 * @returns Payment intent client secret
 */
export async function createPaymentIntent(): Promise<{ clientSecret: string }> {
  try {
    // In a real app, you'd call a serverless function or API
    // For this example, we'll mock the response
    const { data, error } = await supabase.functions.invoke('create-payment-intent', {
      body: { amount: 999 }, // $9.99
    });

    if (error) throw error;
    
    return { clientSecret: data.clientSecret };
  } catch (err) {
    console.error('Error creating payment intent:', err);
    throw new Error('Failed to create payment intent');
  }
}

/**
 * Creates a customer portal session for managing subscription
 * @returns Portal URL
 */
export async function createCustomerPortalSession(): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke('customer-portal', {
      body: {},
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

export const getActiveSubscription = async () => {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      throw new Error("User not authenticated");
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/subscription-status`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to get subscription status");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting subscription status:", error);
    throw error;
  }
};
