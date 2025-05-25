/**
 * Stripe product configuration
 * These values should match the products created in your Stripe dashboard
 */
export const products = {
  pullUpClub: {
    id: 'prod_SH8uXKHPtjHbke',
    priceId: 'price_1RMacXGaHiDfsUfBF4dgFfjO',
    name: 'Pull-Up Monthly',
    description: 'Monthly pullupclub.com membership.',
    price: 9.99,
    mode: 'subscription' as const,
  },
  pullUpClubAnnual: {
    id: 'prod_SH8vqXMcQi0qFQ',
    priceId: 'price_1RMadhGaHiDfsUfBrKZXrwQS',
    name: 'Pull-Up Club Yearly',
    description: 'Yearly pullupclub.com membership with 2 months free!',
    price: 99.00,
    mode: 'subscription' as const,
  }
};

// Stripe API Keys (using environment variables)
export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

// Stripe webhook endpoint
export const STRIPE_WEBHOOK_ENDPOINT = '/api/webhooks/stripe';