import { products } from "../services/stripe-config";
import { supabase } from "./supabase";

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

export const createCheckoutSession = async (
  subscriptionType: "monthly" | "annual",
  email: string,
  formData?: any
) => {
  // Store the email in localStorage to use it later for account creation if needed
  localStorage.setItem("checkoutEmail", email);

  // Determine the product based on subscription type
  const product =
    subscriptionType === "monthly"
      ? products.pullUpClub
      : products.pullUpClubAnnual;

  // Debug logs
  console.log("Creating checkout session with:", {
    subscriptionType,
    email,
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    productId: product.id,
    priceId: product.priceId,
  });

  try {
    // Get the current session if user is logged in
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Set up request headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add Authorization header if user is logged in
    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
      console.log("Adding auth token to request");
    } else {
      console.log("No auth token available, making unauthenticated request");
    }

    // Make API request to our serverless function
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          priceId: product.priceId,
          successUrl: `${window.location.origin}/success`,
          cancelUrl: `${window.location.origin}/`,
          customerEmail: email,
          metadata: {
            formData: formData ? JSON.stringify(formData) : null,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Checkout API error response:", errorData);
      throw new Error(errorData.error || "Failed to create checkout session");
    }

    const data = await response.json();
    console.log("Checkout session created successfully:", data);
    return data.url;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
};

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

export const createCustomerPortalSession = async (
  returnUrl: string = `${window.location.origin}/profile`
) => {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      throw new Error("User not authenticated");
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/customer-portal`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          returnUrl,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || "Failed to create customer portal session"
      );
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error("Error creating customer portal session:", error);
    throw error;
  }
};

export const createPaymentIntent = async () => {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      throw new Error("User not authenticated");
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`,
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
      throw new Error(errorData.error || "Failed to create payment intent");
    }

    const data = await response.json();
    return { clientSecret: data.clientSecret };
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw error;
  }
};
