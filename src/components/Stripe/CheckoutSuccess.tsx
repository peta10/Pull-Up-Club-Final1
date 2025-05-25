import React from 'react';
import { CheckCircle, ChevronRight } from 'lucide-react';
import { LinkButton } from '../ui/LinkButton';

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
  redirectLabel = 'Go to your profile',
}) => {
  // Get the plan price from the subscription type
  const price = subscriptionType === 'monthly' ? '$9.99/month' : '$99.00/year';
  
  // Get the greeting with the customer name if available
  const greeting = customerName ? `Thank you, ${customerName}!` : 'Thank you for your subscription!';
  
  return (
    <div className="bg-gray-900 p-8 rounded-xl text-center space-y-6 max-w-md mx-auto">
      <div className="flex justify-center">
        <div className="rounded-full bg-[#9b9b6f] p-4">
          <CheckCircle size={40} className="text-black" />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-white">{greeting}</h2>
      
      <p className="text-gray-300">
        Your {subscriptionType} subscription to Pull-Up Club has been successfully activated at {price}.
      </p>
      
      <div className="bg-gray-800 p-4 rounded-lg text-left space-y-3">
        <h3 className="text-lg font-semibold text-white">What's next?</h3>
        <ul className="space-y-2 text-gray-300 text-sm">
          <li className="flex items-start">
            <ChevronRight className="w-4 h-4 text-[#9b9b6f] mr-2 mt-0.5 flex-shrink-0" />
            <span>Complete your profile with your shipping information to receive your exclusive Battle Bunker patch</span>
          </li>
          <li className="flex items-start">
            <ChevronRight className="w-4 h-4 text-[#9b9b6f] mr-2 mt-0.5 flex-shrink-0" />
            <span>Submit your first pull-up video to join the leaderboard</span>
          </li>
          <li className="flex items-start">
            <ChevronRight className="w-4 h-4 text-[#9b9b6f] mr-2 mt-0.5 flex-shrink-0" />
            <span>Explore your badge progress and set goals to reach the next tier</span>
          </li>
        </ul>
      </div>
      
      <LinkButton to={redirectTo} className="w-full">
        {redirectLabel} <ChevronRight size={18} className="ml-1" />
      </LinkButton>
    </div>
  );
};

export default CheckoutSuccess;