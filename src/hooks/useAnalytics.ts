import { useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AnalyticsEvent } from '../types';

// Declare global gtag function
declare global {
  interface Window {
    gtag: (
      command: string, 
      targetId: string, 
      params?: Record<string, any>
    ) => void;
    dataLayer: any[];
  }
}

/**
 * Custom hook for Google Analytics tracking
 * Automatically tracks page views when location changes
 * Provides a function to track custom events
 */
const useAnalytics = () => {
  const location = useLocation();

  // Track page views
  useEffect(() => {
    const pageName = location.pathname;
    trackPageView(pageName);
  }, [location]);

  // Track page view
  const trackPageView = useCallback((pageName: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID || '', {
        page_path: pageName,
      });
      console.log(`[Analytics] Page view: ${pageName}`);
    }
  }, []);

  // Track custom events
  const trackEvent = useCallback((event: AnalyticsEvent) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
      });
      console.log(`[Analytics] Event: ${event.action} (${event.category})`);
    }
  }, []);

  return {
    trackPageView,
    trackEvent,
  };
};

export default useAnalytics;