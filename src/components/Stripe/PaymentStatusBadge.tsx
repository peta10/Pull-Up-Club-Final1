import React from 'react';
import { Badge } from '../ui/Badge';
import { CheckCircle, AlertCircle, Clock, XCircle } from 'lucide-react';

export type PaymentStatus = 'active' | 'past_due' | 'canceled' | 'unpaid' | 'trialing' | 'incomplete' | 'incomplete_expired' | 'paused';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}

const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ status, className = '' }) => {
  let variant: 'default' | 'success' | 'warning' | 'danger' = 'default';
  let icon = null;
  let label = status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');

  switch (status) {
    case 'active':
    case 'trialing':
      variant = 'success';
      icon = <CheckCircle className="w-3 h-3 mr-1" />;
      break;
    case 'past_due':
    case 'incomplete':
      variant = 'warning';
      icon = <AlertCircle className="w-3 h-3 mr-1" />;
      break;
    case 'canceled':
    case 'unpaid':
    case 'incomplete_expired':
      variant = 'danger';
      icon = <XCircle className="w-3 h-3 mr-1" />;
      break;
    case 'paused':
      variant = 'default';
      icon = <Clock className="w-3 h-3 mr-1" />;
      break;
  }

  return (
    <Badge variant={variant} className={`flex items-center ${className}`}>
      {icon}
      <span>{label}</span>
    </Badge>
  );
};

export default PaymentStatusBadge;