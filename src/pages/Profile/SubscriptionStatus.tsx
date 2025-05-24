import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getActiveSubscription } from '../../lib/stripe';
import { products } from '../../stripe-config';

const SubscriptionStatus: React.FC = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSubscription() {
      if (user) {
        try {
          const sub = await getActiveSubscription();
          setSubscription(sub);
        } catch (error) {
          console.error('Error fetching subscription:', error);
        } finally {
          setIsLoading(false);
        }
      }
    }

    fetchSubscription();
  }, [user]);

  if (isLoading) {
    return (
      <div className="bg-gray-950 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-white mb-4">Subscription Status</h3>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-800 rounded w-3/4"></div>
          <div className="h-4 bg-gray-800 rounded w-1/2"></div>
          <div className="h-4 bg-gray-800 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="bg-gray-950 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-white mb-4">Subscription Status</h3>
        <p className="text-red-400">No active subscription found</p>
      </div>
    );
  }

  const isAnnual = subscription.price_id === products.pullUpClubAnnual.priceId;
  const product = isAnnual ? products.pullUpClubAnnual : products.pullUpClub;

  return (
    <div className="bg-gray-950 p-6 rounded-lg">
      <h3 className="text-lg font-medium text-white mb-4">Subscription Status</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-400">Plan:</span>
          <span className="text-white font-medium">{product.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Status:</span>
          <span className="text-green-400 font-medium">
            {subscription.subscription_status === 'active' ? 'Active' : subscription.subscription_status}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Billing Period:</span>
          <span className="text-white">{isAnnual ? 'Yearly' : 'Monthly'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Next Payment:</span>
          <span className="text-white">
            {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
          </span>
        </div>
        {subscription.payment_method_brand && (
          <div className="flex justify-between">
            <span className="text-gray-400">Payment Method:</span>
            <span className="text-white">
              {subscription.payment_method_brand.toUpperCase()} •••• {subscription.payment_method_last4}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionStatus;