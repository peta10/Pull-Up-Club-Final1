import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '../ui/Button';
import { AlertTriangle, CreditCard } from 'lucide-react';
import { createPaymentIntent } from '../../lib/stripe';

interface StripePaymentFormProps {
  amount?: number;
  onPaymentComplete: () => void;
  onPaymentError: (message: string) => void;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  amount = 999, // Default to $9.99
  onPaymentComplete,
  onPaymentError,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);

  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    const initializePayment = async () => {
      try {
        setIsProcessing(true);
        const result = await createPaymentIntent(amount);
        if (result?.clientSecret) {
          setClientSecret(result.clientSecret);
        } else {
          throw new Error('Failed to initialize payment');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize payment');
      } finally {
        setIsProcessing(false);
      }
    };

    initializePayment();
  }, [amount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      setError('Payment system not initialized');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (paymentMethodError) {
        throw new Error(paymentMethodError.message);
      }

      setPaymentMethod(paymentMethod.id);

      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod.id,
      });

      if (paymentError) {
        throw new Error(paymentError.message);
      }

      if (paymentIntent.status === 'succeeded') {
        onPaymentComplete();
      } else {
        throw new Error(`Payment failed with status: ${paymentIntent.status}`);
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
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="card-element" className="text-white font-medium">
              Card Details
            </label>
            <CreditCard className="text-gray-400" size={20} />
          </div>
          <div className="bg-gray-900 p-4 rounded-lg">
            <CardElement
              id="card-element"
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#ffffff',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                    iconColor: '#ffffff',
                  },
                  invalid: {
                    color: '#fa755a',
                    iconColor: '#fa755a',
                  },
                },
                hidePostalCode: true,
              }}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-700 text-white p-4 rounded-lg flex items-center">
            <AlertTriangle size={20} className="mr-2" />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={!stripe || !elements || isProcessing || !clientSecret}
          isLoading={isProcessing}
          fullWidth
        >
          {isProcessing ? 'Processing...' : `Pay $${(amount / 100).toFixed(2)}`}
        </Button>

        <div className="text-center text-xs text-gray-400 flex justify-center items-center">
          <CreditCard size={12} className="mr-1" />
          <span>Payments secured by Stripe</span>
        </div>
      </form>
    </div>
  );
};

export default StripePaymentForm;