import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Initialize Supabase client with service role key for admin access
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Initialize Stripe
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';
const welcomeFunctionUrl = Deno.env.get('WELCOME_FUNCTION_URL') ?? '';

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-11-20',
});

// This is needed in order to use the Web Crypto API in Deno
const cryptoProvider = Stripe.createSubtleCryptoProvider();

// Helper function to verify Stripe signature
async function verifyStripeSignature(req: Request): Promise<{ valid: boolean; event?: Stripe.Event }> {
  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return { valid: false };
    }

    const body = await req.text();
    
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      stripeWebhookSecret,
      undefined,
      cryptoProvider
    );

    return { valid: true, event };
  } catch (err) {
    console.error('Error verifying Stripe signature:', err);
    return { valid: false };
  }
}

// Helper to find user by Stripe customer ID
async function getUserByCustomerId(customerId: string) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (error || !data) {
    console.error('Error finding user by customer ID:', error);
    return null;
  }

  return data;
}

// Trigger welcome flow for new subscribers
async function triggerWelcomeFlow(userId: string) {
  try {
    if (!welcomeFunctionUrl) {
      console.log('Welcome function URL not set, skipping welcome flow');
      return;
    }
    
    const response = await fetch(welcomeFunctionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to trigger welcome flow: ${response.statusText}`);
    }
    
    console.log('Welcome flow triggered successfully');
  } catch (error) {
    console.error('Error triggering welcome flow:', error);
  }
}

console.log('Stripe Webhook function initialized!');

Deno.serve(async (req: Request) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Verify the Stripe signature
    const { valid, event } = await verifyStripeSignature(req);
    
    if (!valid || !event) {
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`🔔 Stripe event received: ${event.type} (${event.id})`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (!session.customer || typeof session.customer !== 'string') {
          throw new Error('Customer ID missing or invalid');
        }
        
        // Find the user by customer ID
        const user = await getUserByCustomerId(session.customer);
        
        if (!user) {
          // If customer ID wasn't already saved, check metadata for user_id
          if (session.metadata?.user_id) {
            // Update profile with new customer ID
            const { error: profileError } = await supabaseAdmin
              .from('profiles')
              .update({ 
                stripe_customer_id: session.customer,
                is_paid: true 
              })
              .eq('id', session.metadata.user_id);
              
            if (profileError) {
              console.error('Error updating profile:', profileError);
            }
            
            // Create subscription record
            if (session.subscription && typeof session.subscription === 'string') {
              try {
                const subscription = await stripe.subscriptions.retrieve(session.subscription);
                
                const { error: subscriptionError } = await supabaseAdmin.from('subscriptions').insert({
                  user_id: session.metadata.user_id,
                  stripe_subscription_id: subscription.id,
                  status: subscription.status,
                  current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                  current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                });
                
                if (subscriptionError) {
                  console.error('Error creating subscription record:', subscriptionError);
                }
              } catch (stripeError) {
                console.error('Error retrieving subscription from Stripe:', stripeError);
              }
            }
            
            // Trigger welcome flow
            await triggerWelcomeFlow(session.metadata.user_id);
          } else {
            console.error('Unable to identify user for session:', session.id);
          }
        } else {
          // User already has customer ID, just update subscription
          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ is_paid: true })
            .eq('id', user.id);
            
          if (profileError) {
            console.error('Error updating profile payment status:', profileError);
          }
          
          // Create subscription record
          if (session.subscription && typeof session.subscription === 'string') {
            try {
              const subscription = await stripe.subscriptions.retrieve(session.subscription);
              
              const { error: subscriptionError } = await supabaseAdmin.from('subscriptions').insert({
                user_id: user.id,
                stripe_subscription_id: subscription.id,
                status: subscription.status,
                current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              });
              
              if (subscriptionError) {
                console.error('Error creating subscription record:', subscriptionError);
              }
            } catch (stripeError) {
              console.error('Error retrieving subscription from Stripe:', stripeError);
            }
          }
          
          // Trigger welcome flow
          await triggerWelcomeFlow(user.id);
        }
        
        break;
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (!invoice.customer || typeof invoice.customer !== 'string') {
          throw new Error('Customer ID missing or invalid');
        }
        
        // Only process subscription invoices
        if (!invoice.subscription || typeof invoice.subscription !== 'string') {
          break;
        }
        
        // Find the user by customer ID
        const user = await getUserByCustomerId(invoice.customer);
        
        if (!user) {
          console.error('User not found for customer:', invoice.customer);
          break;
        }
        
        // Update subscription record
        try {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
          
          const { error: updateError } = await supabaseAdmin
            .from('subscriptions')
            .update({
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id);
            
          if (updateError) {
            console.error('Error updating subscription record:', updateError);
          }
        } catch (stripeError) {
          console.error('Error retrieving subscription from Stripe:', stripeError);
        }
        
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (!invoice.customer || typeof invoice.customer !== 'string' || 
            !invoice.subscription || typeof invoice.subscription !== 'string') {
          break;
        }
        
        // Find the user by customer ID
        const user = await getUserByCustomerId(invoice.customer);
        
        if (!user) {
          console.error('User not found for customer:', invoice.customer);
          break;
        }
        
        // Update subscription status
        const { error: updateError } = await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'past_due',
          })
          .eq('stripe_subscription_id', invoice.subscription);
          
        if (updateError) {
          console.error('Error updating subscription status:', updateError);
        }
        
        // TODO: Send payment failed notification
        
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Update subscription in database
        const { error: updateError } = await supabaseAdmin
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);
          
        if (updateError) {
          console.error('Error updating subscription:', updateError);
        }
        
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Update subscription status
        const { error: updateError } = await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', subscription.id);
          
        if (updateError) {
          console.error('Error updating subscription status:', updateError);
        }
        
        // Find the user and update their paid status
        if (subscription.customer && typeof subscription.customer === 'string') {
          const user = await getUserByCustomerId(subscription.customer);
          
          if (user) {
            // Check if user has any other active subscriptions
            const { data: activeSubscriptions, error: queryError } = await supabaseAdmin
              .from('subscriptions')
              .select('id')
              .eq('user_id', user.id)
              .eq('status', 'active');
              
            if (queryError) {
              console.error('Error checking active subscriptions:', queryError);
            }
            
            // If no other active subscriptions, mark user as not paid
            if (!activeSubscriptions || activeSubscriptions.length === 0) {
              const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .update({ is_paid: false })
                .eq('id', user.id);
                
              if (profileError) {
                console.error('Error updating profile payment status:', profileError);
              }
            }
          }
        }
        
        break;
      }
    }

    return new Response(JSON.stringify({ received: true, eventId: event.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error handling webhook:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ error: 'Webhook error', details: errorMessage }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}); 