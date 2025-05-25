import { loadStripe } from "@stripe/stripe-js/pure";

// Load Stripe once and export the promise
export const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
); 