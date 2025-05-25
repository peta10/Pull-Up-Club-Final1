import React from 'react';

export type PaymentStatus = 'active' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'unpaid';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}

const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ status, className = '' }) => {
  let color = '';
  let label = '';

  switch (status) {
    case 'active':
      color = 'bg-green-500/20 text-green-500 border-green-500/30';
      label = 'Active';
      break;
    case 'past_due':
      color = 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      label = 'Past Due';
      break;
    case 'canceled':
      color = 'bg-red-500/20 text-red-500 border-red-500/30';
      label = 'Canceled';
      break;
    case 'incomplete':
      color = 'bg-orange-500/20 text-orange-500 border-orange-500/30';
      label = 'Incomplete';
      break;
    case 'incomplete_expired':
      color = 'bg-red-500/20 text-red-500 border-red-500/30';
      label = 'Expired';
      break;
    case 'trialing':
      color = 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      label = 'Trial';
      break;
    case 'unpaid':
      color = 'bg-red-500/20 text-red-500 border-red-500/30';
      label = 'Unpaid';
      break;
    default:
      color = 'bg-gray-500/20 text-gray-500 border-gray-500/30';
      label = 'Unknown';
  }

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${color} ${className}`}>
      {label}
    </span>
  );
};

export default PaymentStatusBadge; 