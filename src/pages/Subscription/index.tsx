import { useState } from 'react';
import { trackEvent } from '../../utils/analytics';

// Payment links
const STRIPE_PAYMENT_LINKS: Record<'monthly' | 'annual', string> = {
  monthly: "https://buy.stripe.com/dRmdR9dos2kmaQcdHGejK00",
  annual: "https://buy.stripe.com/28EcN5dosf784rO0UUejK01"
};

export default function SubscriptionPage() {
  const [isRedirecting, setIsRedirecting] = useState<null | 'monthly' | 'annual'>(null);
  
  const handleSubscribe = (plan: 'monthly' | 'annual') => {
    setIsRedirecting(plan);
    trackEvent({
      action: 'checkout_redirect_link',
      category: 'stripe',
      label: plan,
    });
    window.location.href = STRIPE_PAYMENT_LINKS[plan];
  };
  
  // Show the subscription plan selection
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-center mb-8">Choose Your Subscription Plan</h1>
      
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-2">Pull-Up Club Membership</h2>
          <p className="text-gray-600 mb-4">Join our community and start tracking your progress</p>
          
          {/* Monthly Plan */}
          <div className="flex justify-between items-center border-t pt-4 mt-4">
            <div>
              <p className="font-bold text-2xl">$9.99<span className="text-sm font-normal text-gray-600">/month</span></p>
              <p className="text-sm text-gray-600">Billed monthly</p>
            </div>
            <button
              onClick={() => handleSubscribe('monthly')}
              disabled={isRedirecting !== null}
              className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
                isRedirecting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isRedirecting === 'monthly' ? 'Redirecting...' : 'Subscribe'}
            </button>
          </div>
          
          {/* Annual Plan */}
          <div className="flex justify-between items-center border-t pt-4 mt-4">
            <div>
              <p className="font-bold text-2xl">$99.00<span className="text-sm font-normal text-gray-600">/year</span></p>
              <p className="text-sm text-gray-600">Billed annually (save 17%)</p>
            </div>
            <button
              onClick={() => handleSubscribe('annual')}
              disabled={isRedirecting !== null}
              className={`px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors ${
                isRedirecting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isRedirecting === 'annual' ? 'Redirecting...' : 'Subscribe'}
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