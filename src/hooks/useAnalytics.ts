import { useCallback } from 'react';
import { trackEvent as analyticsTrackEvent } from '../utils/analytics';

interface AnalyticsEventParams {
  category: string;
  action: string;
  label?: string;
  value?: number;
}

const useAnalytics = () => {
  const logEvent = useCallback((params: AnalyticsEventParams) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', params.action, {
        event_category: params.category,
        event_label: params.label,
        value: params.value
      });
    }
  }, []);

  const trackEvent = useCallback((category: string, action: string, label?: string, value?: number) => {
    analyticsTrackEvent({ category, action, label: label || category, value });
  }, []);

  return {
    logEvent,
    trackEvent
  };
};

export default useAnalytics; 