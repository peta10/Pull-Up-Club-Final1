import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

// Initialize Stripe with the secret key
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

// Create a Supabase client for admin operations with persistSession set to false
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  {
    auth: {
      persistSession: false
    }
  }
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Email validation function
function isValidEmail(email: string): boolean {
  if (!email) return false; // Ensure empty string evaluates to false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Extract and store user ID if authenticated
    let userId = null;
    const authHeader = req.headers.get('Authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      try {
        // Verify the JWT
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        
        if (!authError && user) {
          userId = user.id;
          console.log(`Authenticated user: ${userId}`);
        } else {
          console.error('Auth error or no user:', authError);
        }
      } catch (authError) {
        console.error('Error verifying authentication:', authError);
        // Continue processing without authentication
      }
    } else {
      console.warn('Missing or invalid Authorization header');
    }

    // Check Content-Type header
    const contentType = req.headers.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error(`Invalid Content-Type: ${contentType}`);
      return new Response(JSON.stringify({ error: 'Content-Type must be application/json' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Safely parse request body with error handling
    let requestBody;
    try {
      const rawBody = await req.text();
      console.log('Raw request body:', rawBody);
      
      if (!rawBody || rawBody.trim() === '') {
        throw new Error('Empty request body');
      }
      
      requestBody = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return new Response(JSON.stringify({ 
        error: 'Invalid JSON in request body',
        details: parseError instanceof Error ? parseError.message : 'Unknown parse error'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log('Parsed request body:', JSON.stringify(requestBody));
    
    // Support both traditional redirect and new embedded checkout
    const { 
      priceId, 
      successUrl, 
      cancelUrl, 
      returnUrl, 
      customerEmail, 
      metadata = {},
      uiMode = 'hosted' // Default to traditional hosted checkout
    } = requestBody || {};
    
    // Log the extracted values to help debug
    console.log('Extracted values:', {
      priceId,
      successUrl,
      cancelUrl,
      returnUrl,
      customerEmail,
      uiMode,
      'metadata.userId': metadata?.userId
    });
    
    // Validate required parameters
    if (!priceId) {
      return new Response(JSON.stringify({ error: 'Missing required parameter: priceId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // For embedded mode, we need returnUrl; for hosted mode, we need successUrl and cancelUrl
    if (uiMode === 'embedded' && !returnUrl) {
      console.error(`Missing returnUrl parameter for embedded mode: returnUrl=${returnUrl}, uiMode=${uiMode}`);
      return new Response(JSON.stringify({ 
        error: 'Missing required parameter for embedded mode: returnUrl',
        details: { returnUrl, uiMode }
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else if (uiMode === 'hosted' && (!successUrl || !cancelUrl)) {
      console.error(`Missing URL parameters: successUrl=${successUrl}, cancelUrl=${cancelUrl}, uiMode=${uiMode}`);
      return new Response(JSON.stringify({ 
        error: 'Missing required parameters for hosted mode: successUrl or cancelUrl',
        details: { successUrl, cancelUrl, uiMode }
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate email if provided
    if (customerEmail && !isValidEmail(customerEmail)) {
      return new Response(JSON.stringify({ error: `Invalid email address: ${customerEmail || ''}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prepare session metadata
    const sessionMetadata = {
      ...metadata,
    };
    
    // Add user ID to metadata if authenticated
    if (userId) {
      sessionMetadata.user_id = userId;
    }

    console.log('Creating Stripe checkout session with:', {
      priceId,
      email: customerEmail,
      userId: userId || 'not authenticated',
      metadata: sessionMetadata,
      uiMode
    });

    // Create Stripe Checkout Session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      metadata: sessionMetadata,
      allow_promotion_codes: true,
    };
    
    // Add customer email if provided
    if (customerEmail) {
      sessionParams.customer_email = customerEmail;
    }

    // Configure based on UI mode
    if (uiMode === 'embedded') {
      sessionParams.ui_mode = 'embedded';
      sessionParams.return_url = `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`;
    } else {
      // Traditional hosted mode
      sessionParams.success_url = successUrl;
      sessionParams.cancel_url = cancelUrl;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log('Stripe checkout session created successfully with ID:', session.id);

    // Return different response formats based on the UI mode
    if (uiMode === 'embedded') {
      return new Response(JSON.stringify({ clientSecret: session.client_secret }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // Traditional hosted mode
      return new Response(JSON.stringify({ url: session.url }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error creating checkout session',
      stack: error instanceof Error ? error.stack : undefined
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}); 