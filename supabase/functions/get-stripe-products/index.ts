// @supabase/auth-js: false

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.5.0";

// Initialize Stripe with the secret key
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    console.log('Fetching Stripe products and prices');
    
    // Get specific products by ID
    const monthlyProduct = await stripe.products.retrieve('prod_SMQjdlwoBBKSEa');
    const annualProduct = await stripe.products.retrieve('prod_SMQjIq7AOYdAEX');

    // Get prices for these products
    const monthlyPrices = await stripe.prices.list({
      product: monthlyProduct.id,
      active: true,
    });

    const annualPrices = await stripe.prices.list({
      product: annualProduct.id,
      active: true,
    });

    // Format the response
    const formattedResponse = {
      monthlyMembership: {
        product: {
          id: monthlyProduct.id,
          name: monthlyProduct.name,
          description: monthlyProduct.description,
        },
        prices: monthlyPrices.data.map(price => ({
          id: price.id,
          nickname: price.nickname,
          unit_amount: price.unit_amount,
          currency: price.currency,
          recurring: price.recurring,
        })),
      },
      annualMembership: {
        product: {
          id: annualProduct.id,
          name: annualProduct.name,
          description: annualProduct.description,
        },
        prices: annualPrices.data.map(price => ({
          id: price.id,
          nickname: price.nickname,
          unit_amount: price.unit_amount,
          currency: price.currency,
          recurring: price.recurring,
        })),
      },
    };

    console.log('Successfully fetched Stripe products and prices');

    return new Response(JSON.stringify(formattedResponse), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching Stripe products:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}); 