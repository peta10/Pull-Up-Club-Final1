import { useState } from 'react';
import EmbeddedCheckout from '../../components/Stripe/EmbeddedCheckout';

export default function SubscriptionPage() {
  const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null);
  
  // Replace with your actual Stripe price ID for the $9.99/month subscription
  const MONTHLY_PRICE_ID = 'price_1RMacXGaHiDfsUfBF4dgFfjO'; // Updated to actual price ID
  
  const handleSubscribe = () => {
    setSelectedPriceId(MONTHLY_PRICE_ID);
  };
  
  // If a price is selected, show the embedded checkout
  if (selectedPriceId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-center mb-8">Complete Your Subscription</h1>
        <EmbeddedCheckout 
          priceId={selectedPriceId}
          returnUrl={`${window.location.origin}/subscription/return`}
          metadata={{ selectedPlan: 'monthly' }}
        />
        <div className="mt-4 text-center">
          <button
            onClick={() => setSelectedPriceId(null)}
            className="text-blue-600 hover:underline"
          >
            Back to plans
          </button>
        </div>
      </div>
    );
  }
  
  // Otherwise, show the subscription plan selection
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-center mb-8">Choose Your Subscription Plan</h1>
      
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-2">Pull-Up Club Membership</h2>
          <p className="text-gray-600 mb-4">Join our community and start tracking your progress</p>
          
          <div className="flex justify-between items-center border-t pt-4 mt-4">
            <div>
              <p className="font-bold text-2xl">$9.99<span className="text-sm font-normal text-gray-600">/month</span></p>
              <p className="text-sm text-gray-600">Billed monthly</p>
            </div>
            <button
              onClick={handleSubscribe}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Subscribe
            </button>
          </div>
          
          <ul className="mt-6 space-y-2">
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Access to monthly challenges</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Track your progress on the leaderboard</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Daily workout reminders</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Cancel anytime</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
} 