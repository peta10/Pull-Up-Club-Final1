import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

// Define types for gtag events
interface GTagEvent {
  action: string;
  category: string;
  label: string;
  value?: number;
}

// Declare global gtag function
declare global {
  interface Window {
    gtag: (
      command: 'event' | 'config' | 'set', 
      targetId: string, 
      params?: Record<string, unknown> | GTagEvent
    ) => void;
    dataLayer: any[];
  }
}

/**
 * Custom hook for Google Analytics tracking
 * Automatically tracks page views when location changes
 * Provides a function to track custom events
 */
export const useAnalytics = () => {
  const location = useLocation();
  const gaTrackingId = import.meta.env.VITE_GA_MEASUREMENT_ID as string;

  // Track page views whenever location changes
  useEffect(() => {
    if (!gaTrackingId || typeof window.gtag !== 'function') {
      // Skip tracking if GA ID is not set or gtag isn't loaded
      return;
    }

    // Send pageview event to Google Analytics
    window.gtag('config', gaTrackingId, {
      page_path: location.pathname + location.search,
      page_location: window.location.href,
    });
  }, [location, gaTrackingId]);

  // Function to track custom events
  const trackEvent = useCallback((event: GTagEvent) => {
    if (!gaTrackingId || typeof window.gtag !== 'function') {
      // Skip tracking if GA ID is not set or gtag isn't loaded
      return;
    }

    // Send custom event to Google Analytics
    window.gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
    });
  }, [gaTrackingId]);

  return { trackEvent };
};

export default useAnalytics;