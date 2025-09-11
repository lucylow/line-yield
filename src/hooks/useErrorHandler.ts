import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';

interface ErrorContext {
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export const useErrorHandler = () => {
  const { toast } = useToast();
  const { addNotification } = useNotifications();

  const handleError = useCallback((
    error: Error | string,
    context?: ErrorContext,
    showNotification: boolean = true
  ) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorName = typeof error === 'string' ? 'Unknown Error' : error.name;

    // Log error for debugging
    console.error('Error Handler:', {
      message: errorMessage,
      name: errorName,
      context,
      stack: typeof error === 'object' ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    // Show toast notification
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive',
    });

    // Add to notifications if requested
    if (showNotification) {
      addNotification({
        type: 'error',
        title: errorName,
        message: errorMessage,
        action: context?.component ? {
          label: 'Retry',
          onClick: () => {
            // In a real app, you might want to implement retry logic
            console.log('Retry action for:', context);
          },
        } : undefined,
      });
    }

    // In a real application, you would also send this to your error tracking service
    // Example: Sentry.captureException(error, { tags: context });
  }, [toast, addNotification]);

  const handleWalletError = useCallback((error: Error | string) => {
    handleError(error, {
      component: 'Wallet',
      action: 'Connection/Transaction',
    });
  }, [handleError]);

  const handleTransactionError = useCallback((error: Error | string, transactionType: 'deposit' | 'withdraw') => {
    handleError(error, {
      component: 'Transaction',
      action: transactionType,
    });
  }, [handleError]);

  const handleNetworkError = useCallback((error: Error | string) => {
    handleError(error, {
      component: 'Network',
      action: 'Connection',
    });
  }, [handleError]);

  const handleApiError = useCallback((error: Error | string, endpoint?: string) => {
    handleError(error, {
      component: 'API',
      action: 'Request',
      metadata: { endpoint },
    });
  }, [handleError]);

  return {
    handleError,
    handleWalletError,
    handleTransactionError,
    handleNetworkError,
    handleApiError,
  };
};

// Global error boundary hook
export const useGlobalErrorHandler = () => {
  const { handleError } = useErrorHandler();

  const handleGlobalError = useCallback((event: ErrorEvent) => {
    handleError(
      new Error(event.message),
      {
        component: 'Global',
        action: 'JavaScript Error',
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      },
      false // Don't show notification for global errors
    );
  }, [handleError]);

  const handleUnhandledRejection = useCallback((event: PromiseRejectionEvent) => {
    handleError(
      new Error(event.reason?.message || 'Unhandled Promise Rejection'),
      {
        component: 'Global',
        action: 'Promise Rejection',
        metadata: {
          reason: event.reason,
        },
      },
      false // Don't show notification for promise rejections
    );
  }, [handleError]);

  return {
    handleGlobalError,
    handleUnhandledRejection,
  };
};
