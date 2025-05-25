import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { createCustomerPortalSession, cancelSubscription } from '../../lib/stripe';
import { AlertTriangle, CreditCard, ShieldCheck } from 'lucide-react';

interface ManageSubscriptionProps {
  customerName?: string;
}

const ManageSubscription: React.FC<ManageSubscriptionProps> = ({ customerName }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleManageSubscription = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const portalUrl = await createCustomerPortalSession();
      if (portalUrl) {
        window.location.href = portalUrl;
      } else {
        throw new Error("Failed to access customer portal");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    setError(null);

    try {
      const success = await cancelSubscription();
      if (success) {
        // Redirect to a success page or show success message
        window.location.href = "/subscription?cancelled=true";
      } else {
        throw new Error("Failed to cancel subscription");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsCancelling(false);
      setShowCancelConfirm(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-900/30 border border-red-800 rounded-lg">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
            <p className="text-red-200">{error}</p>
          </div>
        </div>
      )}

      {showCancelConfirm ? (
        <div className="p-4 bg-gray-800 rounded-lg border border-red-500">
          <h3 className="text-white font-medium mb-2">
            Are you sure you want to cancel?
          </h3>
          <p className="text-gray-300 text-sm mb-4">
            {`Your subscription will be cancelled at the end of the current billing period. ${
              customerName ? `${customerName}, you` : "You"
            } will lose access to all premium features once your subscription expires.`}
          </p>
          <div className="flex space-x-3">
            <Button
              variant="danger"
              isLoading={isCancelling}
              onClick={handleCancelSubscription}
              className="flex-1"
            >
              Yes, Cancel Subscription
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowCancelConfirm(false)}
              disabled={isCancelling}
              className="flex-1"
            >
              Keep Subscription
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Button
            onClick={handleManageSubscription}
            isLoading={isLoading}
            className="w-full flex items-center justify-center"
          >
            <CreditCard size={18} className="mr-2" />
            Manage Payment Methods
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowCancelConfirm(true)}
            className="w-full text-red-400 border-red-800 hover:bg-red-900/20"
            disabled={isLoading}
          >
            Cancel Subscription
          </Button>

          <div className="flex items-center justify-center text-xs text-gray-500">
            <ShieldCheck size={12} className="mr-1" />
            <span>Secure payments via Stripe</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSubscription;