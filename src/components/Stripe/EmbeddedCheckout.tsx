import React, { useCallback } from "react";
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';
import { useAuth } from '../../context/AuthContext';

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
  
  const fetchClientSecret = useCallback(async () => {
    // Create a Checkout Session by calling our Edge Function
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
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
      throw new Error(data.error || 'Error creating checkout session');
    }
    
    return data.clientSecret;
  }, [priceId, returnUrl, user, metadata]);

  const options = { fetchClientSecret };

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