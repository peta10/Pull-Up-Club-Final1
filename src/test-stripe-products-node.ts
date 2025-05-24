import { createClient } from '@supabase/supabase-js';

// Use environment variables or hardcoded values for testing
const supabaseUrl = process.env.SUPABASE_URL || 'https://yqnikgupiaghgjtsaypr.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxbmlrZ3VwaWFnaGdqdHNheXByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5NDIzMDMsImV4cCI6MjA2MzUxODMwM30.3rR9EyNlWSLZAoYqlCa3MOJobHH7RHjak0m_3mI6YZs';

// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to test the Edge Function
async function testFetchStripeProducts() {
  console.log('Fetching Stripe products...');
  
  try {
    const { data, error } = await supabase.functions.invoke('get-stripe-products');
    
    if (error) {
      console.error('Error fetching Stripe products:', error);
      return;
    }
    
    console.log('Stripe products:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Exception when fetching Stripe products:', err);
  }
}

// Run the test
testFetchStripeProducts().catch(err => {
  console.error('Error in test:', err);
}); 