import React, { useState, useEffect } from 'react';
import { CalendarX, CreditCard, Loader2, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { getActiveSubscription, createCustomerPortalSession } from '../../lib/stripe';

interface SubscriptionManagerProps {
  onError?: (error: string) => void;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ onError }) => {
  const [subscription, setSubscription] = useState<any>(null);
  const [stripeSubscription, setStripeSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      setIsLoading(true);
      try {
        const data = await getActiveSubscription();
        setSubscription(data.subscription);
        setStripeSubscription(data.stripeSubscription);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load subscription';
        setError(errorMessage);
        if (onError) onError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, [onError]);

  const handleManageSubscription = async () => {
    try {
      setIsLoading(true);
      const portalUrl = await createCustomerPortalSession();
      if (portalUrl) {
        window.location.href = portalUrl;
      } else {
        throw new Error("Failed to create customer portal session");
      }
    } catch (error) {
      console.error("Error creating portal session:", error);
      setError("Failed to open customer portal. Please try again later.");
      if (onError) onError("Failed to open customer portal. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 shadow-md flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 text-[#9b9b6f] animate-spin" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 shadow-md">
        <div className="text-center">
          <CalendarX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Active Subscription</h3>
          <p className="text-gray-400 mb-6">You don't have an active subscription at the moment.</p>
          <button
            onClick={() => window.location.href = '/submit'}
            className="bg-[#9b9b6f] text-black px-4 py-2 rounded font-medium hover:bg-[#7a7a58] transition"
          >
            Subscribe Now
          </button>
        </div>
      </div>
    );
  }

  // Format the subscription end date
  const endDate = new Date(stripeSubscription?.currentPeriodEnd || subscription.current_period_end);
  const formattedEndDate = format(endDate, 'MMMM d, yyyy');
  
  // Determine subscription type (monthly or annual)
  const isAnnual = endDate.getTime() - new Date().getTime() > 32 * 24 * 60 * 60 * 1000; // > ~1 month
  const planType = isAnnual ? 'Annual' : 'Monthly';
  const planPrice = isAnnual ? '$99.00/year' : '$9.99/month';

  return (
    <div className="bg-gradient-to-r from-[#ffffff10] to-[#121212] backdrop-blur-sm rounded-xl p-6 shadow-md border border-gray-700">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white mb-1">
            {planType} Membership
          </h3>
          <p className="text-[#9b9b6f] font-medium">{planPrice}</p>
        </div>
        <div className="bg-[#9b9b6f]/20 rounded-full px-3 py-1">
          <span className="text-[#9b9b6f] text-sm font-medium">Active</span>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-start">
          <CreditCard className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
          <div>
            <p className="text-gray-300 font-medium">Next billing date</p>
            <p className="text-gray-400 text-sm">{formattedEndDate}</p>
          </div>
        </div>

        {stripeSubscription?.cancelAtPeriodEnd && (
          <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4 text-sm text-yellow-200">
            Your subscription is set to cancel at the end of the current billing period. You'll still have access until {formattedEndDate}.
          </div>
        )}
      </div>

      <button
        onClick={handleManageSubscription}
        disabled={isPortalLoading}
        className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2.5 rounded-lg transition flex items-center justify-center"
      >
        {isPortalLoading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Shield className="h-4 w-4 mr-2" />
        )}
        {isPortalLoading ? 'Loading...' : 'Manage Subscription'}
      </button>

      {error && (
        <div className="mt-4 bg-red-900/30 border border-red-800 rounded-lg p-3 text-sm text-red-200">
          {error}
        </div>
      )}
    </div>
  );
};

export default SubscriptionManager; 