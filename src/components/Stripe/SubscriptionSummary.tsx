import React from 'react';
import { format } from 'date-fns';
import { CreditCard, Calendar, AlertCircle } from 'lucide-react';
import PaymentStatusBadge, { PaymentStatus } from './PaymentStatusBadge';
import PaymentMethodDisplay from './PaymentMethodDisplay';

interface SubscriptionSummaryProps {
  plan: string;
  status: PaymentStatus;
  currentPeriodEnd?: string | number;
  paymentMethod?: {
    brand?: string;
    last4?: string;
    expMonth?: number;
    expYear?: number;
  };
  cancelAtPeriodEnd?: boolean;
}

const SubscriptionSummary: React.FC<SubscriptionSummaryProps> = ({
  plan,
  status,
  currentPeriodEnd,
  paymentMethod,
  cancelAtPeriodEnd = false,
}) => {
  // Format the end date if provided
  const formattedEndDate = currentPeriodEnd 
    ? format(
        typeof currentPeriodEnd === 'string'
          ? new Date(currentPeriodEnd)
          : new Date(currentPeriodEnd * 1000), 
        'MMMM d, yyyy'
      )
    : 'N/A';

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:justify-between">
        <div className="mb-3 sm:mb-0">
          <h3 className="text-lg font-semibold text-white">{plan}</h3>
          <div className="mt-1">
            <PaymentStatusBadge status={status} />
          </div>
        </div>
      </div>

      {cancelAtPeriodEnd && (
        <div className="flex items-start bg-yellow-900/30 border border-yellow-800 rounded-lg p-4 text-sm">
          <AlertCircle className="w-5 h-5 text-yellow-500 mr-2 mt-0.5" />
          <div className="text-yellow-200">
            <p className="font-medium">Your subscription is set to cancel</p>
            <p>You will have access until {formattedEndDate}, after which your subscription will end.</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-start">
          <Calendar className="w-5 h-5 text-[#9b9b6f] mr-3 mt-0.5" />
          <div>
            <p className="font-medium text-white">Next billing date</p>
            <p className="text-gray-400">{formattedEndDate}</p>
          </div>
        </div>

        {paymentMethod && (
          <div className="flex items-start">
            <PaymentMethodDisplay
              brand={paymentMethod.brand}
              last4={paymentMethod.last4}
              expMonth={paymentMethod.expMonth}
              expYear={paymentMethod.expYear}
              showIcon={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionSummary;