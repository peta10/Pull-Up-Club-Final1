import React from 'react';
import { products } from '../../lib/stripe-config';
import { CheckCircle2, X } from 'lucide-react';
import StripeCheckout from './StripeCheckout';

interface PlanComparisonProps {
  selectedPlan?: 'monthly' | 'annual';
  onSelectPlan?: (plan: 'monthly' | 'annual') => void;
}

const PlanComparison: React.FC<PlanComparisonProps> = ({ 
  selectedPlan = 'monthly',
  onSelectPlan,
}) => {
  // Calculate annual savings
  const annualSavings = (
    products.pullUpClub.price * 12 - 
    products.pullUpClubAnnual.price
  ).toFixed(2);

  // Determine which features to show
  const features = [
    { name: 'Leaderboard access', monthly: true, annual: true },
    { name: 'Achievement badges', monthly: true, annual: true },
    { name: 'Monthly video submissions', monthly: true, annual: true },
    { name: 'Battle Bunker entrance patch', monthly: true, annual: true },
    { name: 'Priority video review', monthly: false, annual: true },
    { name: 'Exclusive quarterly collector\'s patch', monthly: false, annual: true },
    { name: 'Annual savings of $' + annualSavings, monthly: false, annual: true },
  ];

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white text-center mb-6">Choose Your Membership Plan</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left py-4 px-4 text-gray-400 font-normal"></th>
              <th className="text-center py-4 px-4">
                <div 
                  className={`rounded-lg p-4 ${
                    selectedPlan === 'monthly' 
                      ? 'bg-[#9b9b6f] bg-opacity-20 border border-[#9b9b6f]' 
                      : 'bg-gray-800'
                  } cursor-pointer`}
                  onClick={() => onSelectPlan?.('monthly')}
                >
                  <div className="text-white font-bold text-lg mb-1">Monthly</div>
                  <div className="text-2xl font-bold text-white mb-1">${products.pullUpClub.price}</div>
                  <div className="text-gray-400 text-sm">per month</div>
                </div>
              </th>
              <th className="text-center py-4 px-4">
                <div 
                  className={`rounded-lg p-4 relative ${
                    selectedPlan === 'annual' 
                      ? 'bg-[#9b9b6f] bg-opacity-20 border border-[#9b9b6f]' 
                      : 'bg-gray-800'
                  } cursor-pointer`}
                  onClick={() => onSelectPlan?.('annual')}
                >
                  <div className="absolute -top-3 right-0 left-0 mx-auto w-max bg-[#9b9b6f] text-black text-xs font-bold px-2 py-1 rounded-full">BEST VALUE</div>
                  <div className="text-white font-bold text-lg mb-1">Annual</div>
                  <div className="text-2xl font-bold text-white mb-1">${products.pullUpClubAnnual.price}</div>
                  <div className="text-gray-400 text-sm">per year</div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {features.map((feature, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-800 bg-opacity-30' : ''}>
                <td className="py-3 px-4 text-gray-300">{feature.name}</td>
                <td className="py-3 px-4 text-center">
                  {feature.monthly ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                  ) : (
                    <X className="h-5 w-5 text-red-500 mx-auto" />
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  {feature.annual ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                  ) : (
                    <X className="h-5 w-5 text-red-500 mx-auto" />
                  )}
                </td>
              </tr>
            ))}
            <tr>
              <td className="py-4 px-4"></td>
              <td className="py-4 px-4 text-center">
                <StripeCheckout 
                  plan="monthly" 
                  buttonText="Subscribe Monthly"
                  redirectToLogin={true}
                />
              </td>
              <td className="py-4 px-4 text-center">
                <StripeCheckout 
                  plan="annual" 
                  buttonText="Subscribe Annually"
                  redirectToLogin={true}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlanComparison;