import React, { useState } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { createCustomerPortalSession } from '../../lib/stripe';

interface ManageSubscriptionProps {
  customerName?: string;
}

const ManageSubscription: React.FC<ManageSubscriptionProps> = ({ customerName }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleManageSubscription = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const portalUrl = await createCustomerPortalSession();
      if (portalUrl) {
        window.location.href = portalUrl;
      } else {
        throw new Error("Failed to create customer portal session");
      }
    } catch (error) {
      console.error("Error creating portal session:", error);
      setError("Failed to open customer portal. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-gray-300 mb-4">
          {customerName ? `Hello ${customerName}! ` : ''}
          You'll be redirected to Stripe's secure customer portal to manage your subscription.
        </p>
      </div>

      <Button
        onClick={handleManageSubscription}
        disabled={isLoading}
        className="w-full bg-[#9b9b6f] hover:bg-[#7a7a58] text-black"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Redirecting...
          </>
        ) : (
          'Manage in Stripe Portal'
        )}
      </Button>

      {error && (
        <div className="bg-red-900/30 border border-red-800 rounded-lg p-3 text-sm flex items-start">
          <AlertTriangle className="h-4 w-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-red-200">{error}</span>
        </div>
      )}
    </div>
  );
};

export default ManageSubscription; 