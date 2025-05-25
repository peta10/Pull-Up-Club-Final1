import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { createCheckoutSession } from '../../lib/stripe';
import { products } from '../../lib/stripe-config';
import { CheckCircle2, ChevronRight, CreditCard, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface StripeCheckoutProps {
  plan: 'monthly' | 'annual';
  buttonText?: string;
  redirectToLogin?: boolean;
}

const StripeCheckout: React.FC<StripeCheckoutProps> = ({ 
  plan, 
  buttonText = 'Subscribe Now', 
  redirectToLogin = true 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleCheckout = async () => {
    setError(null);

    // If user is not logged in and redirectToLogin is true, redirect to login page
    if (!user && redirectToLogin) {
      const state = { intendedAction: "subscribe", plan };
      window.location.href = `/login?${new URLSearchParams({ redirectTo: '/subscription' }).toString()}`;
      // Store the state so it can be accessed after login
      sessionStorage.setItem('checkoutIntention', JSON.stringify(state));
      return;
    }

    setIsLoading(true);
    try {
      const checkoutUrl = await createCheckoutSession(
        plan,
        user?.email,
        { userId: user?.id || '' }
      );

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to start checkout process"
      );
      setIsLoading(false);
    }
  };

  // Get price based on plan
  const price = plan === 'monthly' 
    ? `$${products.pullUpClub.price}/month` 
    : `$${products.pullUpClubAnnual.price}/year`;

  return (
    <div className="w-full">
      <Button
        onClick={handleCheckout}
        disabled={isLoading}
        className="w-full flex items-center justify-center bg-[#9b9b6f] hover:bg-[#7a7a58] text-black font-medium py-3 px-4 rounded-lg"
      >
        {isLoading ? (
          <span className="flex items-center">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-black"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </span>
        ) : (
          <span className="flex items-center">
            {buttonText} - {price} <ChevronRight size={18} className="ml-1" />
          </span>
        )}
      </Button>

      {error && (
        <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-sm text-white">
          {error}
        </div>
      )}

      <div className="mt-4 flex justify-center items-center text-gray-400 text-xs">
        <ShieldCheck className="w-4 h-4 mr-1" />
        <span>Secure payment powered by Stripe</span>
      </div>

      <div className="mt-3 space-y-2">
        {[
          'Cancel anytime with no fees',
          'Encrypted payment processing',
          'Access to all features & competitions'
        ].map((feature, index) => (
          <div key={index} className="flex items-start text-xs text-gray-300">
            <CheckCircle2 className="w-3 h-3 text-[#9b9b6f] mt-0.5 mr-1 flex-shrink-0" />
            <span>{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StripeCheckout;