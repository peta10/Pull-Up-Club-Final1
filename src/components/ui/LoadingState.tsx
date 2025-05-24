import React from 'react';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  className = '',
}) => {
  return (
    <div className={`bg-gray-800 p-8 rounded-lg text-center ${className}`}>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
      <p className="text-white">{message}</p>
    </div>
  );
};

interface ErrorStateProps {
  message: string;
  className?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  className = '',
  onRetry,
}) => {
  return (
    <div className={`bg-red-900 border border-red-700 text-white p-4 rounded-lg flex items-center justify-between ${className}`}>
      <div className="flex items-center">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 mr-2 flex-shrink-0" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path 
            fillRule="evenodd" 
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
            clipRule="evenodd" 
          />
        </svg>
        <span>{message}</span>
      </div>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="bg-red-800 hover:bg-red-700 text-white text-sm px-3 py-1 rounded-md ml-4 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
};

interface EmptyStateProps {
  title: string;
  message: string;
  className?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  className = '',
  action,
}) => {
  return (
    <div className={`bg-gray-800 p-8 rounded-lg text-center ${className}`}>
      <h3 className="text-white text-xl mb-2">{title}</h3>
      <p className="text-gray-400 mb-4">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}; 