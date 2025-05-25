import React, { useState, useEffect } from 'react';
import { getActiveSubscription } from '../../lib/stripe';
import { CreditCard, Calendar, AlertTriangle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PaymentStatusBadge, { PaymentStatus } from '../Stripe/PaymentStatusBadge';
import { LinkButton } from '../ui/LinkButton';
import { supabase } from '../../lib/supabase';

interface SubscriptionWidgetProps {
  compact?: boolean;
}

const SubscriptionWidget: React.FC<SubscriptionWidgetProps> = ({ compact = false }) => {
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
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
          console.warn("No authenticated session available for subscription widget");
          setIsLoading(false);
          return;
        }
        
        const data = await getActiveSubscription();
        if (data) {
          setSubscription(data);
        }
      } catch (err) {
        console.error('Error fetching subscription:', err);
        setError('Could not load subscription data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 animate-pulse">
        <div className="h-5 bg-gray-700 rounded w-1/3 mb-3"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 text-sm text-red-200">
        <div className="flex items-center">
          <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!subscription || !subscription.subscription) {
    return (
      <div className="bg-gray-800 rounded-lg p-5 text-center">
        <p className="text-gray-400 mb-3">No active subscription</p>
        <LinkButton to="/subscription" variant="outline" size="sm">
          View Plans
        </LinkButton>
      </div>
    );
  }

  const { subscription: sub, stripeSubscription } = subscription;
  const isAnnual = sub.current_period_end - sub.current_period_start > 31 * 24 * 60 * 60;
  const planName = isAnnual ? "Annual Plan" : "Monthly Plan";
  const nextBillingDate = new Date(sub.current_period_end * 1000);
  const formattedDate = nextBillingDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });

  // If compact view is requested, show minimal version
  if (compact) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 flex justify-between items-center">
        <div>
          <div className="flex items-center">
            <p className="text-white font-medium mr-2">{planName}</p>
            <PaymentStatusBadge status={sub.status as PaymentStatus} />
          </div>
          <p className="text-sm text-gray-400">Next billing: {formattedDate}</p>
        </div>
        <LinkButton to="/subscription" variant="outline" size="sm">
          Manage
        </LinkButton>
      </div>
    );
  }

  // Full view
  return (
    <div className="bg-gray-800 rounded-lg p-5">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{planName}</h3>
          <div className="flex items-center mt-1">
            <PaymentStatusBadge status={sub.status as PaymentStatus} />
            {stripeSubscription?.cancelAtPeriodEnd && (
              <span className="ml-2 text-sm text-yellow-300">Cancels after current period</span>
            )}
          </div>
        </div>
        <LinkButton to="/subscription" variant="outline" size="sm">
          Manage
        </LinkButton>
      </div>

      <div className="space-y-3">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 text-[#9b9b6f] mr-2" />
          <span className="text-gray-300">Next billing: {formattedDate}</span>
        </div>

        {stripeSubscription?.payment_method_brand && (
          <div className="flex items-center">
            <CreditCard className="h-4 w-4 text-[#9b9b6f] mr-2" />
            <span className="text-gray-300">
              {stripeSubscription.payment_method_brand.toUpperCase()} •••• {stripeSubscription.payment_method_last4}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700">
        <Link 
          to="/subscription" 
          className="flex items-center text-sm text-[#9b9b6f] hover:text-[#7a7a58]"
        >
          View billing history
          <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </div>
    </div>
  );
};

export default SubscriptionWidget;