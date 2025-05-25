import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import useAnalytics from "../../hooks/useAnalytics";

export interface LinkButtonProps extends Omit<LinkProps, 'className'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'danger' | 'default';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  className?: string;
  analyticsEvent?: {
    action: string;
    category: string;
    label: string;
    value?: number;
  };
}

export const LinkButton: React.FC<LinkButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  className = '',
  analyticsEvent,
  to,
  ...props
}) => {
  const { trackEvent } = useAnalytics();

  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-[#9b9b6f]';
  
  const variants = {
    primary: 'bg-[#9b9b6f] text-black hover:bg-[#7a7a58]',
    secondary: 'bg-white/10 text-white hover:bg-white/20',
    outline: 'border border-[#9b9b6f] text-[#9b9b6f] hover:bg-[#9b9b6f]/10',
    ghost: 'bg-transparent text-white hover:bg-white/10',
    link: 'bg-transparent text-[#9b9b6f] hover:underline p-0',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    default: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  };
  
  const sizes = {
    sm: 'text-xs px-3 py-1',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
  };
  
  const widths = fullWidth ? 'w-full' : '';
  
  const variantStyles = variants[variant];
  const sizeStyles = variant === 'link' ? '' : sizes[size];
  
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Track analytics event if provided
    if (analyticsEvent) {
      trackEvent(analyticsEvent);
    }

    // Call original onClick handler if provided
    if (props.onClick) {
      props.onClick(e);
    }
  };

  return (
    <Link
      to={to}
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${widths} ${className} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={handleClick}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </Link>
  );
};

export default LinkButton; 