import React, { useCallback, useState } from "react";
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface EmbeddedCheckoutComponentProps {
  priceId: string;
  returnUrl?: string;
  metadata?: Record<string, string>;
}

const EmbeddedCheckoutComponent: React.FC<EmbeddedCheckoutComponentProps> = ({ 
  priceId,
  returnUrl = `${window.location.origin}/subscription/return`,
  metadata = {}
}) => {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  
  const fetchClientSecret = useCallback(async () => {
    try {
      // Get the current session to use the access token
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        console.error('Error getting session:', sessionError);
        throw new Error('Authentication required. Please sign in.');
      }
      
      const accessToken = sessionData.session.access_token;
      
      // Create a Checkout Session by calling our Edge Function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          priceId,
          customerEmail: user?.email,
          returnUrl,
          uiMode: 'embedded',
          metadata: {
            ...metadata,
            userId: user?.id
          }
        })
      });
      
      const data = await response.json();
      if (!response.ok) {
        console.error('Checkout error response:', data);
        throw new Error(data.error || 'Error creating checkout session');
      }
      
      return data.clientSecret;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create checkout session';
      console.error('Error in fetchClientSecret:', errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [priceId, returnUrl, user, metadata]);

  const options = { fetchClientSecret };

  if (error) {
    return (
      <div className="w-full max-w-md mx-auto p-4 bg-red-50 border border-red-200 rounded-lg text-center">
        <h3 className="text-red-700 font-medium mb-2">Error creating checkout</h3>
        <p className="text-red-600 mb-3">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={options}
      >
        <EmbeddedCheckout className="min-h-[500px]" />
      </EmbeddedCheckoutProvider>
    </div>
  );
};

export default EmbeddedCheckoutComponent; 