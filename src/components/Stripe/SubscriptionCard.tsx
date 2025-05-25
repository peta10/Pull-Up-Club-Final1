import React from 'react';
import { products } from '../../lib/stripe-config';
import { CheckCircle2, CreditCard } from 'lucide-react';
import StripeCheckout from './StripeCheckout';

interface SubscriptionCardProps {
  type: 'monthly' | 'annual';
  isSelected?: boolean;
  onSelect?: () => void;
  showCheckoutButton?: boolean;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ 
  type, 
  isSelected = false, 
  onSelect,
  showCheckoutButton = true
}) => {
  const product = type === 'monthly' 
    ? products.pullUpClub 
    : products.pullUpClubAnnual;
  
  const isAnnual = type === 'annual';
  
  // Calculate savings for annual plan
  const annualSavings = isAnnual 
    ? (products.pullUpClub.price * 12 - products.pullUpClubAnnual.price).toFixed(2)
    : 0;

  return (
    <div 
      className={`
        relative rounded-xl overflow-hidden transition-all duration-300
        ${isSelected 
          ? "border-2 border-[#9b9b6f] shadow-lg shadow-[#9b9b6f]/20 transform scale-[1.02]" 
          : "border border-gray-700"}
      `}
      onClick={onSelect}
    >
      {isAnnual && (
        <div className="absolute top-0 right-0 bg-[#9b9b6f] text-black px-3 py-1 text-xs font-semibold z-10">
          BEST VALUE
        </div>
      )}
      
      <div className="bg-gradient-to-r from-[#ffffff10] to-[#121212] backdrop-blur-sm p-6">
        <h3 className="text-xl font-bold text-white mb-2">
          {isAnnual ? 'Annual Membership' : 'Monthly Membership'}
        </h3>
        
        <div className="flex items-baseline mb-1">
          <span className="text-3xl font-bold text-white">${product.price}</span>
          <span className="text-gray-400 ml-1">/{isAnnual ? 'year' : 'month'}</span>
        </div>
        
        {isAnnual && (
          <p className="text-green-400 text-sm mb-4">
            Save ${annualSavings} per year
          </p>
        )}

        <ul className="space-y-3 mb-6">
          <li className="flex items-start">
            <CheckCircle2 className="h-5 w-5 text-[#9b9b6f] mr-2 flex-shrink-0" />
            <span className="text-gray-300">
              {isAnnual ? 'Everything in monthly plan' : 'Leaderboard access'}
            </span>
          </li>
          
          <li className="flex items-start">
            <CheckCircle2 className="h-5 w-5 text-[#9b9b6f] mr-2 flex-shrink-0" />
            <span className="text-gray-300">
              {isAnnual 
                ? 'Better value for long-term commitment' 
                : 'Achievement badges'
              }
            </span>
          </li>
          
          <li className="flex items-start">
            <CheckCircle2 className="h-5 w-5 text-[#9b9b6f] mr-2 flex-shrink-0" />
            <span className="text-gray-300">
              {isAnnual 
                ? 'Set-it-and-forget-it billing' 
                : 'Cancel anytime'
              }
            </span>
          </li>
        </ul>

        {showCheckoutButton && (
          <StripeCheckout plan={type} buttonText={`Get ${isAnnual ? 'Annual' : 'Monthly'} Plan`} />
        )}
        
        {!showCheckoutButton && (
          <div className="flex items-center justify-center space-x-1 text-xs text-gray-400">
            <CreditCard size={12} />
            <span>Secure payments with Stripe</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionCard;