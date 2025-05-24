import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://yqnikgupiaghgjtsaypr.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxbmlrZ3VwaWFnaGdqdHNheXByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5NDIzMDMsImV4cCI6MjA2MzUxODMwM30.3rR9EyNlWSLZAoYqlCa3MOJobHH7RHjak0m_3mI6YZs'
);

async function testCheckout() {
  try {
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: { 
        priceId: 'price_1RRhrk2NRCxYlJVBB6nylJVk',
        successUrl: 'http://localhost:5180/success',
        cancelUrl: 'http://localhost:5180/submit',
        customerEmail: 'test@example.com'
      },
    });

    if (error) {
      console.error('Error invoking function:', error);
      return;
    }

    console.log('Response data:', data);
  } catch (err) {
    console.error('Exception:', err);
  }
}

testCheckout(); 