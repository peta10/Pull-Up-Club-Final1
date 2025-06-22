// Performance monitoring utility for tracking optimization results
interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private isDevelopment = import.meta.env.MODE === 'development';

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeTracking();
    }
  }

  private initializeTracking(): void {
    // Track First Contentful Paint
    this.trackFCP();
    
    // Track Largest Contentful Paint
    this.trackLCP();
    
    // Track First Input Delay
    this.trackFID();
    
    // Track Cumulative Layout Shift
    this.trackCLS();
    
    // Track Time to First Byte
    this.trackTTFB();

    // Log metrics in development
    if (this.isDevelopment) {
      setTimeout(() => this.logMetrics(), 5000);
    }
  }

  private trackFCP(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          this.metrics.fcp = fcpEntry.startTime;
          observer.disconnect();
        }
      });
      observer.observe({ entryTypes: ['paint'] });
    } catch (error) {
      console.warn('FCP tracking not supported');
    }
  }

  private trackLCP(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.lcp = lastEntry.startTime;
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      console.warn('LCP tracking not supported');
    }
  }

  private trackFID(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (entry.processingStart && entry.startTime) {
            this.metrics.fid = entry.processingStart - entry.startTime;
          }
        });
      });
      observer.observe({ entryTypes: ['first-input'] });
    } catch (error) {
      console.warn('FID tracking not supported');
    }
  }

  private trackCLS(): void {
    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.metrics.cls = clsValue;
      });
      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.warn('CLS tracking not supported');
    }
  }

  private trackTTFB(): void {
    try {
      const navigationEntries = performance.getEntriesByType('navigation');
      if (navigationEntries.length > 0) {
        const nav = navigationEntries[0] as PerformanceNavigationTiming;
        this.metrics.ttfb = nav.responseStart - nav.requestStart;
      }
    } catch (error) {
      console.warn('TTFB tracking not supported');
    }
  }

  private logMetrics(): void {
    if (this.isDevelopment) {
      console.group('🚀 Performance Metrics');
      console.log('First Contentful Paint (FCP):', this.metrics.fcp ? `${this.metrics.fcp.toFixed(0)}ms` : 'Not measured');
      console.log('Largest Contentful Paint (LCP):', this.metrics.lcp ? `${this.metrics.lcp.toFixed(0)}ms` : 'Not measured');
      console.log('First Input Delay (FID):', this.metrics.fid ? `${this.metrics.fid.toFixed(1)}ms` : 'Not measured');
      console.log('Cumulative Layout Shift (CLS):', this.metrics.cls ? this.metrics.cls.toFixed(3) : 'Not measured');
      console.log('Time to First Byte (TTFB):', this.metrics.ttfb ? `${this.metrics.ttfb.toFixed(0)}ms` : 'Not measured');
      console.groupEnd();

      // Performance score calculation
      this.calculatePerformanceScore();
    }
  }

  private calculatePerformanceScore(): void {
    let score = 100;
    
    // LCP scoring (0-2500ms = 100, 2500-4000ms = 50-100, >4000ms = 0-50)
    if (this.metrics.lcp) {
      if (this.metrics.lcp > 4000) score -= 40;
      else if (this.metrics.lcp > 2500) score -= 20;
    }

    // FCP scoring (0-1800ms = 100, 1800-3000ms = 50-100, >3000ms = 0-50)
    if (this.metrics.fcp) {
      if (this.metrics.fcp > 3000) score -= 30;
      else if (this.metrics.fcp > 1800) score -= 15;
    }

    // CLS scoring (0-0.1 = 100, 0.1-0.25 = 50-100, >0.25 = 0-50)
    if (this.metrics.cls) {
      if (this.metrics.cls > 0.25) score -= 20;
      else if (this.metrics.cls > 0.1) score -= 10;
    }

    // FID scoring (0-100ms = 100, 100-300ms = 50-100, >300ms = 0-50)
    if (this.metrics.fid) {
      if (this.metrics.fid > 300) score -= 10;
      else if (this.metrics.fid > 100) score -= 5;
    }

    console.log(`📊 Estimated Performance Score: ${Math.max(0, score)}/100`);
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // Method to track custom metrics
  public trackCustomMetric(name: string, value: number): void {
    if (this.isDevelopment) {
      console.log(`📈 Custom Metric [${name}]:`, value);
    }
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export for manual usage in components
export default PerformanceMonitor; 