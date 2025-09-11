import { useState, useEffect, useCallback } from 'react';

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: number;
  userId?: string;
}

interface PerformanceMetrics {
  pageLoadTime: number;
  interactionTime: number;
  errorCount: number;
  transactionCount: number;
}

interface UseAnalyticsReturn {
  trackEvent: (event: string, properties?: Record<string, any>) => void;
  trackPageView: (page: string) => void;
  trackTransaction: (type: 'deposit' | 'withdraw', amount: string, success: boolean) => void;
  trackError: (error: string, context?: string) => void;
  getPerformanceMetrics: () => PerformanceMetrics;
  analytics: AnalyticsEvent[];
}

export const useAnalytics = (): UseAnalyticsReturn => {
  const [analytics, setAnalytics] = useState<AnalyticsEvent[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    pageLoadTime: 0,
    interactionTime: 0,
    errorCount: 0,
    transactionCount: 0,
  });

  // Initialize performance tracking
  useEffect(() => {
    const startTime = performance.now();
    
    const handleLoad = () => {
      const loadTime = performance.now() - startTime;
      setPerformanceMetrics(prev => ({
        ...prev,
        pageLoadTime: loadTime,
      }));
    };

    window.addEventListener('load', handleLoad);
    return () => window.removeEventListener('load', handleLoad);
  }, []);

  const trackEvent = useCallback((event: string, properties?: Record<string, any>) => {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: Date.now(),
      userId: localStorage.getItem('userId') || undefined,
    };

    setAnalytics(prev => [...prev, analyticsEvent]);

    // In a real implementation, you would send this to your analytics service
    console.log('Analytics Event:', analyticsEvent);
  }, []);

  const trackPageView = useCallback((page: string) => {
    trackEvent('page_view', { page });
  }, [trackEvent]);

  const trackTransaction = useCallback((type: 'deposit' | 'withdraw', amount: string, success: boolean) => {
    trackEvent('transaction', {
      type,
      amount: parseFloat(amount),
      success,
    });

    setPerformanceMetrics(prev => ({
      ...prev,
      transactionCount: prev.transactionCount + 1,
    }));
  }, [trackEvent]);

  const trackError = useCallback((error: string, context?: string) => {
    trackEvent('error', {
      error,
      context,
    });

    setPerformanceMetrics(prev => ({
      ...prev,
      errorCount: prev.errorCount + 1,
    }));
  }, [trackEvent]);

  const getPerformanceMetrics = useCallback(() => {
    return performanceMetrics;
  }, [performanceMetrics]);

  // Track user interactions for performance metrics
  useEffect(() => {
    let interactionStartTime = 0;

    const handleInteractionStart = () => {
      interactionStartTime = performance.now();
    };

    const handleInteractionEnd = () => {
      if (interactionStartTime > 0) {
        const interactionTime = performance.now() - interactionStartTime;
        setPerformanceMetrics(prev => ({
          ...prev,
          interactionTime: Math.max(prev.interactionTime, interactionTime),
        }));
      }
    };

    // Track various user interactions
    const events = ['click', 'keydown', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, handleInteractionStart, { passive: true });
      document.addEventListener(event, handleInteractionEnd, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleInteractionStart);
        document.removeEventListener(event, handleInteractionEnd);
      });
    };
  }, []);

  return {
    trackEvent,
    trackPageView,
    trackTransaction,
    trackError,
    getPerformanceMetrics,
    analytics,
  };
};
