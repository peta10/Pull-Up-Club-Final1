import { useEffect, useState } from 'react';
import { EmbeddedCheckout as StripeEmbeddedCheckout } from '@stripe/react-stripe-js';
import { stripePromise } from '../../lib/stripeClient';
import { createCheckout } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

interface EmbeddedCheckoutProps {
  priceId: string;
  returnUrl: string;
  metadata?: Record<string, string>;
}

export default function EmbeddedCheckout({ priceId, returnUrl, metadata }: EmbeddedCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const initializeCheckout = async () => {
      setIsLoading(true);
      try {
        const { clientSecret, error } = await createCheckout({
          priceId,
          customerEmail: user?.email,
          returnUrl,
          metadata
        });

        if (error) {
          console.error('Error creating checkout:', error);
          setError(error);
          setIsLoading(false);
          return;
        }

        if (!clientSecret) {
          setError('No client secret returned from server');
          setIsLoading(false);
          return;
        }

        setClientSecret(clientSecret);
      } catch (err) {
        console.error('Unexpected error initializing checkout:', err);
        setError('Failed to initialize checkout');
      } finally {
        setIsLoading(false);
      }
    };

    initializeCheckout();
  }, [priceId, returnUrl, user?.email, metadata]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 text-red-700 rounded-md">
        <p className="font-medium">Error loading checkout</p>
        <p className="text-sm">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!clientSecret) {
    return null;
  }

  return (
    <div className="max-w-md mx-auto border border-gray-200 rounded-lg overflow-hidden">
      <StripeEmbeddedCheckout
        stripe={stripePromise}
        options={{ clientSecret }}
      />
    </div>
  );
} 