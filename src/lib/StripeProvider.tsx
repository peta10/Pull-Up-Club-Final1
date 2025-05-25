import React, { ReactNode } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '../context/AuthContext';

// Initialize Stripe with publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface StripeProviderProps {
  children: ReactNode;
}

/**
 * StripeProvider component that wraps the application with Stripe Elements
 * This provides Stripe context to all child components
 */
const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  const { user } = useAuth();
  
  // Configuration for Stripe Elements
  const options = {
    // Pass the user's email to Stripe when available
    customerEmail: user?.email,
    // Set appearance theme to match our dark UI
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#9b9b6f',
        colorBackground: '#121212',
        colorText: '#ffffff',
        colorDanger: '#ef4444',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
};

export default StripeProvider;