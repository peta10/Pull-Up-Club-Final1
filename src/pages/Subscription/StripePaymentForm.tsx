import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '../../components/ui/Button';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { createPaymentIntent } from '../../lib/stripe';

interface StripePaymentFormProps {
  onPaymentComplete: () => void;
  onPaymentError: (message: string) => void;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  onPaymentComplete,
  onPaymentError,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    const initializePayment = async () => {
      try {
        const result = await createPaymentIntent();
        if (result?.clientSecret) {
          setClientSecret(result.clientSecret);
        } else {
          setError('Failed to get payment details. Please try again.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize payment');
      }
    };

    initializePayment();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      setError('Payment system not initialized');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (paymentError) {
        throw new Error(paymentError.message);
      }

      if (paymentIntent.status === 'succeeded') {
        onPaymentComplete();
      } else {
        throw new Error('Payment failed');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment failed';
      setError(message);
      onPaymentError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-900 p-4 rounded-lg">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#ffffff',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#fa755a',
                },
              },
            }}
          />
        </div>

        {error && (
          <div className="bg-red-900 border border-red-700 text-white p-4 rounded-lg flex items-center">
            <AlertTriangle size={20} className="mr-2" />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={!stripe || !elements || isProcessing}
          className="w-full mt-4"
        >
          {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isProcessing ? 'Processing...' : 'Pay $10.00'}
        </Button>
      </form>
    </div>
  );
};

export default StripePaymentForm;