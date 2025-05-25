import React from 'react';
import { AlertTriangle, Info, CheckCircle, XCircle, X } from 'lucide-react';

interface AlertProps {
  title?: string;
  description: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
  icon?: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  title,
  description,
  variant = 'info',
  icon,
  onClose,
  className = '',
}) => {
  const variantStyles = {
    info: {
      container: 'bg-blue-900/30 border-blue-800',
      icon: <Info className="h-5 w-5 text-blue-400" />,
      title: 'text-blue-300',
    },
    success: {
      container: 'bg-green-900/30 border-green-800',
      icon: <CheckCircle className="h-5 w-5 text-green-400" />,
      title: 'text-green-300',
    },
    warning: {
      container: 'bg-yellow-900/30 border-yellow-800',
      icon: <AlertTriangle className="h-5 w-5 text-yellow-400" />,
      title: 'text-yellow-300',
    },
    error: {
      container: 'bg-red-900/30 border-red-800',
      icon: <XCircle className="h-5 w-5 text-red-400" />,
      title: 'text-red-300',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className={`border rounded-lg p-4 ${styles.container} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {icon || styles.icon}
        </div>
        <div className="ml-3 flex-1">
          {title && <h3 className={`text-sm font-medium ${styles.title}`}>{title}</h3>}
          <div className="text-sm text-white mt-1">{description}</div>
        </div>
        {onClose && (
          <button
            type="button"
            className="ml-auto -mx-1.5 -my-1.5 bg-gray-800/30 p-1.5 rounded-lg inline-flex text-gray-400 hover:text-white"
            onClick={onClose}
          >
            <span className="sr-only">Dismiss</span>
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};