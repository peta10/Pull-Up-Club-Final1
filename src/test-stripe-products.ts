import { fetchStripeProducts } from './lib/stripe';

// Function to test the Edge Function
async function testFetchStripeProducts() {
  console.log('Fetching Stripe products...');
  const products = await fetchStripeProducts();
  console.log('Stripe products:', JSON.stringify(products, null, 2));
}

// Run the test
testFetchStripeProducts().catch(err => {
  console.error('Error in test:', err);
}); 