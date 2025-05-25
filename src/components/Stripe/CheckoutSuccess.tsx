import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CheckoutSuccessProps {
  subscriptionType?: 'monthly' | 'annual';
  customerName?: string;
  redirectTo?: string;
  redirectLabel?: string;
}

const CheckoutSuccess: React.FC<CheckoutSuccessProps> = ({ 
  subscriptionType = 'monthly',
  customerName,
  redirectTo = '/profile',
  redirectLabel = 'Go to Dashboard'
}) => {
  const planType = subscriptionType === 'annual' ? 'Annual' : 'Monthly';
  
  return (
    <div className="max-w-lg mx-auto text-center">
      <div className="mb-6 flex justify-center">
        <div className="rounded-full bg-green-500 p-3">
          <CheckCircle size={42} className="text-black" />
        </div>
      </div>
      
      <h1 className="text-3xl font-bold text-white mb-3">
        Payment Successful!
      </h1>
      
      <p className="text-xl text-gray-300 mb-3">
        {customerName ? `Welcome to Pull-Up Club, ${customerName}!` : 'Welcome to Pull-Up Club!'}
      </p>
      
      <div className="bg-white/5 rounded-lg p-5 mb-8 mt-6">
        <h3 className="text-lg font-medium text-white mb-3">
          {planType} Membership Details
        </h3>
        <p className="text-gray-400">
          You're now a member of the Pull-Up Club! Your {planType.toLowerCase()} subscription is active, and you now have full access to all features including submissions, leaderboard, and pull-up challenges.
        </p>
      </div>
      
      <Link
        to={redirectTo}
        className="inline-flex items-center px-6 py-3 rounded-full bg-[#9b9b6f] text-black font-medium hover:bg-[#7a7a58] transition"
      >
        {redirectLabel} <ArrowRight className="ml-2 h-5 w-5" />
      </Link>
    </div>
  );
};

export default CheckoutSuccess; 