import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { createPortalSession } from '../../lib/api';

interface ManageSubscriptionProps {
  customerName?: string;
}

export default function ManageSubscription({ customerName }: ManageSubscriptionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenPortal = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { url, error } = await createPortalSession();
      if (error) {
        setError(error);
        return;
      }
      
      if (url) {
        window.location.href = url;
      } else {
        setError('Failed to create customer portal session');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Portal error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium text-white">
          {customerName ? `Hello ${customerName}` : 'Manage Your Subscription'}
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          You'll be redirected to the Stripe Customer Portal
        </p>
      </div>

      <Button
        onClick={handleOpenPortal}
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Manage Billing & Payment Methods'}
      </Button>

      <Button
        onClick={handleOpenPortal}
        variant="outline"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Update Plan or Cancel'}
      </Button>

      {error && (
        <div className="p-3 bg-red-900/30 border border-red-800 rounded text-red-200 text-sm">
          {error}
        </div>
      )}
    </div>
  );
} 