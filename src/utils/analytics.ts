/**
 * Utility functions for Google Analytics
 */

// Type for page view tracking
export interface PageViewParams {
  title?: string;
  location?: string;
  path?: string;
}

// Type for event tracking
export interface EventParams {
  action: string;
  category: string;
  label: string;
  value?: number;
  nonInteraction?: boolean;
}

/**
 * Track a page view in Google Analytics
 */
export const trackPageView = (params?: PageViewParams) => {
  if (typeof window.gtag !== 'function') return;
  
  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!gaId) return;

  window.gtag('config', gaId, {
    page_title: params?.title,
    page_location: params?.location || window.location.href,
    page_path: params?.path || window.location.pathname + window.location.search,
  });
};

/**
 * Track a custom event in Google Analytics
 */
export const trackEvent = (params: EventParams) => {
  if (typeof window.gtag !== 'function') return;

  window.gtag('event', params.action, {
    event_category: params.category,
    event_label: params.label,
    value: params.value,
    non_interaction: params.nonInteraction,
  });
};

/**
 * Set user properties in Google Analytics
 */
export const setUserProperties = (properties: Record<string, any>) => {
  if (typeof window.gtag !== 'function') return;
  
  window.gtag('set', 'user_properties', properties);
};

/**
 * Track exceptions/errors in Google Analytics
 */
export const trackException = (description: string, fatal: boolean = false) => {
  if (typeof window.gtag !== 'function') return;

  window.gtag('event', 'exception', {
    description,
    fatal,
  });
};