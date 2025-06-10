import React from 'react';
import { Link } from 'react-router-dom';
import useAnalytics from '../../hooks/useAnalytics';

interface LinkButtonProps {
  to: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  analyticsEvent?: {
    category: string;
    action: string;
    label?: string;
    value?: number;
  };
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

const LinkButton: React.FC<LinkButtonProps> = ({
  to,
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  analyticsEvent,
  onClick,
  ...props
}) => {
  const { trackEvent } = useAnalytics();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (analyticsEvent) {
      const { category, action, label, value } = analyticsEvent;
      trackEvent(category, action, label, value);
    }
    onClick?.(e);
  };

  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors';
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
    success: 'bg-green-600 text-white hover:bg-green-700',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  };

  return (
    <Link
      to={to}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
};

export { LinkButton }; 