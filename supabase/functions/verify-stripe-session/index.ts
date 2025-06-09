import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13.6.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    // Parse request body
    const { sessionId } = await req.json()

    if (!sessionId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Session ID is required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    // Check if the session is valid and payment was successful
    const isValid = session.payment_status === 'paid' && 
                   session.status === 'complete'

    return new Response(
      JSON.stringify({
        success: true,
        isValid,
        customerEmail: session.customer_details?.email,
        subscriptionId: session.subscription,
        customerId: session.customer,
        sessionData: {
          paymentStatus: session.payment_status,
          status: session.status,
          amountTotal: session.amount_total,
          currency: session.currency
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error verifying Stripe session:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to verify session' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 