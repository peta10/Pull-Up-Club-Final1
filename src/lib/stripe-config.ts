export const products = {
  pullUpClub: {
    price: 9.99,
    name: 'Monthly Membership',
    description: 'Access to all Pull-Up Club features',
    interval: 'month',
  },
  pullUpClubAnnual: {
    price: 99.99,
    name: 'Annual Membership',
    description: 'Access to all Pull-Up Club features, billed annually',
    interval: 'year',
  },
};

export const stripeConfig = {
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  apiVersion: '2023-10-16' as const,
  successUrl: `${window.location.origin}/success`,
  cancelUrl: `${window.location.origin}/subscription`,
  allowedCountries: ['US', 'CA', 'GB', 'AU', 'NZ'], // Add or remove countries as needed
  billingAddressCollection: 'required' as const,
  customerEmail: undefined as string | undefined, // Will be set dynamically
};

// Stripe product IDs - these should match your Stripe Dashboard
export const productIds = {
  monthly: import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID,
  annual: import.meta.env.VITE_STRIPE_ANNUAL_PRICE_ID,
}; 