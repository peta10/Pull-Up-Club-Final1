import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { getActiveSubscription } from '../../lib/stripe';
import { products } from '../../lib/stripe-config.ts';
import { Button } from '../../components/ui/Button';
import { Calendar, CreditCard, AlertTriangle } from 'lucide-react';
import ManageSubscription from './SubscriptionManager';
import { supabase } from '../../lib/supabase';

interface SubscriptionDetailsProps {
  // No props needed
}

const SubscriptionDetails: React.FC<SubscriptionDetailsProps> = () => {
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showManageOptions, setShowManageOptions] = useState(false);

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        setIsLoading(true);

        // Helper to obtain a valid session, retrying briefly if needed
        const obtainSession = async (retries = 3, delayMs = 500) => {
          for (let i = 0; i < retries; i++) {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (session && !error) return session;
            // Wait before retrying
            await new Promise((res) => setTimeout(res, delayMs));
          }
          return null;
        };

        // Make sure we have a valid session before checking subscription
        const session = await obtainSession();
        if (!session) {
          setError('No active session found. Please sign in again.');
          setIsLoading(false);
          return;
        }

        const data = await getActiveSubscription();
        if (!data) {
          setError('No subscription data available');
        } else {
          setSubscription(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load subscription data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionData();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9b9b6f] mx-auto"></div>
        <p className="text-gray-300 mt-4">Loading subscription details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-800 rounded-lg p-6">
        <div className="flex items-center text-red-200 mb-4">
          <AlertTriangle className="w-6 h-6 mr-2" />
          <h3 className="text-lg font-medium">Error Loading Subscription</h3>
        </div>
        <p className="text-gray-300">{error}</p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!subscription || !subscription.subscription) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <p className="text-gray-300">No active subscription found</p>
      </div>
    );
  }

  const { subscription: sub, stripeSubscription } = subscription;
  const isAnnual = sub.current_period_end - sub.current_period_start > 31 * 24 * 60 * 60;
  const product = isAnnual ? products.pullUpClubAnnual : products.pullUpClub;
  const nextBillingDate = new Date(sub.current_period_end * 1000);
  const formattedNextBillingDate = format(nextBillingDate, 'MMMM d, yyyy');
  const cancelAtPeriodEnd = stripeSubscription?.cancelAtPeriodEnd;

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
          <p className="text-gray-400">
            Status: <span className={`font-medium ${sub.status === 'active' ? 'text-green-400' : 'text-yellow-400'}`}>
              {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
            </span>
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <p className="text-xl font-bold text-white">${product.price}</p>
          <p className="text-sm text-gray-400">Billed {isAnnual ? 'annually' : 'monthly'}</p>
        </div>
      </div>

      {cancelAtPeriodEnd && (
        <div className="p-4 bg-yellow-900/30 border border-yellow-800 rounded-lg">
          <p className="text-yellow-200">
            Your subscription is set to cancel at the end of the current billing period. 
            You will have access until {formattedNextBillingDate}.
          </p>
        </div>
      )}

      <div className="space-y-4 border-t border-gray-700 pt-4">
        <div className="flex items-start">
          <Calendar className="w-5 h-5 text-[#9b9b6f] mr-3 mt-0.5" />
          <div>
            <p className="font-medium text-white">Next billing date</p>
            <p className="text-gray-400">{formattedNextBillingDate}</p>
          </div>
        </div>

        {stripeSubscription?.payment_method_brand && (
          <div className="flex items-start">
            <CreditCard className="w-5 h-5 text-[#9b9b6f] mr-3 mt-0.5" />
            <div>
              <p className="font-medium text-white">Payment method</p>
              <p className="text-gray-400">
                {stripeSubscription.payment_method_brand.toUpperCase()} •••• {stripeSubscription.payment_method_last4}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-700 pt-6">
        {showManageOptions ? (
          <ManageSubscription />
        ) : (
          <Button 
            onClick={() => setShowManageOptions(true)} 
            className="w-full"
          >
            Manage Subscription
          </Button>
        )}
      </div>
    </div>
  );
};

export default SubscriptionDetails;