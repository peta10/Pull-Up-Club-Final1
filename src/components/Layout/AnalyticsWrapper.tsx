import React, { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import useAnalytics from '../../hooks/useAnalytics';

interface AnalyticsWrapperProps {
  children: ReactNode;
  pageName?: string;
}

/**
 * Wrapper component to automatically track page views and provide analytics context
 * to child components
 */
const AnalyticsWrapper: React.FC<AnalyticsWrapperProps> = ({ 
  children, 
  pageName 
}) => {
  const location = useLocation();
  const { trackEvent } = useAnalytics();

  // Example of how to track a custom event
  const handleCustomEvent = (
    action: string, 
    category: string, 
    label: string, 
    value?: number
  ) => {
    trackEvent({
      action,
      category,
      label,
      value
    });
  };

  return (
    <div data-page={pageName || location.pathname}>
      {children}
    </div>
  );
};

export default AnalyticsWrapper;