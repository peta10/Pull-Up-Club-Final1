import React from 'react';
import { CreditCard } from 'lucide-react';

interface PaymentMethodDisplayProps {
  brand?: string; // visa, mastercard, amex, etc.
  last4?: string; // last 4 digits of the card
  expMonth?: number;
  expYear?: number;
  showIcon?: boolean;
}

const PaymentMethodDisplay: React.FC<PaymentMethodDisplayProps> = ({
  brand = 'unknown',
  last4 = '****',
  expMonth,
  expYear,
  showIcon = true,
}) => {
  // Format brand name
  const formattedBrand = brand.charAt(0).toUpperCase() + brand.slice(1);

  return (
    <div className="flex items-center">
      {showIcon && <CreditCard className="w-5 h-5 text-[#9b9b6f] mr-3 flex-shrink-0" />}
      <div className="flex flex-col">
        <p className="text-white">
          {formattedBrand} •••• {last4}
        </p>
        {expMonth && expYear && (
          <p className="text-gray-400 text-sm">
            Expires {expMonth.toString().padStart(2, '0')}/{expYear.toString().slice(-2)}
          </p>
        )}
      </div>
    </div>
  );
};

export default PaymentMethodDisplay;