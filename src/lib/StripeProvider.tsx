import React, { ReactNode } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from './stripe';
import { useAuth } from '../context/AuthContext';

// Define allowed theme types for Stripe
type StripeTheme = 'flat' | 'night' | 'stripe';

interface StripeProviderProps {
  children: ReactNode;
}

/**
 * Provider component that wraps application with Stripe Elements
 * Makes Stripe available throughout the app
 */
const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  const { user } = useAuth();

  // Appearance configuration for Stripe elements
  const appearance = {
    theme: 'flat' as StripeTheme, // Explicitly type as StripeTheme
    variables: {
      colorPrimary: '#9b9b6f',
      colorBackground: '#1e1e1e',
      colorText: '#ffffff',
      colorDanger: '#ff5555',
      fontFamily: 'Inter, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  };

  // Create options without clientSecret to fix type issues
  const options = {
    appearance,
    customerEmail: user?.email,
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
};

export default StripeProvider;