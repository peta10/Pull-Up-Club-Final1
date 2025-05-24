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

export const STRIPE_PUBLISHABLE_KEY = 'pk_live_51RLYUyGaHiDfsUfBuCJ8wlW6vrQA50vyhiBi5v3lnfm3byAQpYzkqqX1ElIYEb0Alxi4IXFR2ozxmMlRKSdOKNTH00mdn1920o';