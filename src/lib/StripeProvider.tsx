import React, { ReactNode, useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from './stripe';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

// Define allowed theme types for Stripe
type StripeTheme = 'flat' | 'night' | 'stripe';

interface StripeProviderProps {
  children: ReactNode;
}

// List of routes that need Stripe functionality
const STRIPE_REQUIRED_ROUTES = [
  '/subscribe',
  '/subscription',
  '/payment',
  '/checkout',
  '/success'
];

/**
 * Provider component that wraps application with Stripe Elements
 * Makes Stripe available throughout the app, but only initializes when needed
 */
const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [shouldLoadStripe, setShouldLoadStripe] = useState(false);

  useEffect(() => {
    // Only load Stripe on relevant routes
    const needsStripe = STRIPE_REQUIRED_ROUTES.some(route => 
      location.pathname.startsWith(route)
    );
    setShouldLoadStripe(needsStripe);
  }, [location.pathname]);

  // Appearance configuration for Stripe elements
  const appearance = {
    theme: 'flat' as StripeTheme,
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
    loader: 'auto' as const,
  };

  // Only wrap with Elements if Stripe is needed
  if (!shouldLoadStripe) {
    return <>{children}</>;
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
};

export default StripeProvider;