import { useState, useCallback } from 'react';
import { paymentApiClient, PaymentIntent, CryptoPayment, PaymentRecord, PaymentStats } from '../services/PaymentApiClient';
import { useToast } from './use-toast';

export interface UsePaymentsReturn {
  // State
  isLoading: boolean;
  error: string | null;
  paymentHistory: PaymentRecord[];
  paymentStats: PaymentStats | null;
  
  // Stripe payments
  createStripePayment: (amount: number, currency?: string, metadata?: Record<string, string>) => Promise<PaymentIntent | null>;
  confirmStripePayment: (paymentIntentId: string) => Promise<PaymentRecord | null>;
  
  // Crypto payments
  createCryptoPayment: (amount: string, token: string, recipientAddress: string, network?: 'kaia' | 'ethereum' | 'polygon') => Promise<CryptoPayment | null>;
  updateCryptoPayment: (paymentId: string, txHash: string, status: 'confirmed' | 'failed') => Promise<PaymentRecord | null>;
  
  // Payment management
  getPaymentHistory: () => Promise<void>;
  getPaymentById: (paymentId: string) => Promise<PaymentRecord | null>;
  processRefund: (paymentId: string, reason?: string) => Promise<PaymentRecord | null>;
  getPaymentStats: () => Promise<void>;
  
  // Utility
  clearError: () => void;
  formatAmount: (amount: number, currency: string) => string;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => string;
}

export const usePayments = (userId?: string): UsePaymentsReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
  const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null);
  const { toast } = useToast();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((err: any, operation: string) => {
    const errorMessage = err instanceof Error ? err.message : `Failed to ${operation}`;
    setError(errorMessage);
    
    toast({
      title: "Payment Error",
      description: errorMessage,
      variant: "destructive",
    });
    
    console.error(`[Payments] ${operation} error:`, err);
  }, [toast]);

  const showSuccess = useCallback((message: string, title: string = "Success") => {
    toast({
      title,
      description: message,
    });
  }, [toast]);

  // Stripe payments
  const createStripePayment = useCallback(async (
    amount: number,
    currency: string = 'usd',
    metadata?: Record<string, string>
  ): Promise<PaymentIntent | null> => {
    if (!userId) {
      handleError(new Error('User ID is required'), 'create Stripe payment');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const paymentIntent = await paymentApiClient.createStripePaymentIntent(
        amount,
        currency,
        userId,
        metadata
      );
      
      showSuccess(`Payment intent created for $${amount} ${currency.toUpperCase()}`, "Payment Created");
      return paymentIntent;
    } catch (err) {
      handleError(err, 'create Stripe payment');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId, handleError, showSuccess]);

  const confirmStripePayment = useCallback(async (paymentIntentId: string): Promise<PaymentRecord | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const payment = await paymentApiClient.confirmStripePayment(paymentIntentId);
      
      showSuccess("Payment confirmed successfully!", "Payment Confirmed");
      
      // Refresh payment history
      await getPaymentHistory();
      
      return payment;
    } catch (err) {
      handleError(err, 'confirm Stripe payment');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError, showSuccess]);

  // Crypto payments
  const createCryptoPayment = useCallback(async (
    amount: string,
    token: string,
    recipientAddress: string,
    network: 'kaia' | 'ethereum' | 'polygon' = 'kaia'
  ): Promise<CryptoPayment | null> => {
    if (!userId) {
      handleError(new Error('User ID is required'), 'create crypto payment');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const cryptoPayment = await paymentApiClient.createCryptoPayment(
        amount,
        token,
        recipientAddress,
        userId,
        network
      );
      
      showSuccess(`Crypto payment created for ${amount} ${token}`, "Payment Created");
      return cryptoPayment;
    } catch (err) {
      handleError(err, 'create crypto payment');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId, handleError, showSuccess]);

  const updateCryptoPayment = useCallback(async (
    paymentId: string,
    txHash: string,
    status: 'confirmed' | 'failed'
  ): Promise<PaymentRecord | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const payment = await paymentApiClient.updateCryptoPayment(paymentId, txHash, status);
      
      showSuccess(
        status === 'confirmed' ? "Payment confirmed!" : "Payment failed",
        status === 'confirmed' ? "Payment Confirmed" : "Payment Failed"
      );
      
      // Refresh payment history
      await getPaymentHistory();
      
      return payment;
    } catch (err) {
      handleError(err, 'update crypto payment');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError, showSuccess]);

  // Payment management
  const getPaymentHistory = useCallback(async (): Promise<void> => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const history = await paymentApiClient.getPaymentHistory(userId);
      setPaymentHistory(history);
    } catch (err) {
      handleError(err, 'get payment history');
    } finally {
      setIsLoading(false);
    }
  }, [userId, handleError]);

  const getPaymentById = useCallback(async (paymentId: string): Promise<PaymentRecord | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const payment = await paymentApiClient.getPaymentById(paymentId);
      return payment;
    } catch (err) {
      handleError(err, 'get payment by ID');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const processRefund = useCallback(async (
    paymentId: string,
    reason?: string
  ): Promise<PaymentRecord | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const refund = await paymentApiClient.processRefund(paymentId, reason);
      
      showSuccess("Refund processed successfully!", "Refund Processed");
      
      // Refresh payment history
      await getPaymentHistory();
      
      return refund;
    } catch (err) {
      handleError(err, 'process refund');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError, showSuccess, getPaymentHistory]);

  const getPaymentStats = useCallback(async (): Promise<void> => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const stats = await paymentApiClient.getPaymentStats(userId);
      setPaymentStats(stats);
    } catch (err) {
      handleError(err, 'get payment stats');
    } finally {
      setIsLoading(false);
    }
  }, [userId, handleError]);

  // Utility functions
  const formatAmount = useCallback((amount: number, currency: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }, []);

  const getStatusColor = useCallback((status: string): string => {
    switch (status) {
      case 'completed':
      case 'succeeded':
        return 'text-green-600 bg-green-100';
      case 'pending':
      case 'processing':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
      case 'canceled':
        return 'text-red-600 bg-red-100';
      case 'refunded':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }, []);

  const getStatusIcon = useCallback((status: string): string => {
    switch (status) {
      case 'completed':
      case 'succeeded':
        return '✅';
      case 'pending':
      case 'processing':
        return '⏳';
      case 'failed':
      case 'canceled':
        return '❌';
      case 'refunded':
        return '🔄';
      default:
        return '❓';
    }
  }, []);

  return {
    // State
    isLoading,
    error,
    paymentHistory,
    paymentStats,
    
    // Stripe payments
    createStripePayment,
    confirmStripePayment,
    
    // Crypto payments
    createCryptoPayment,
    updateCryptoPayment,
    
    // Payment management
    getPaymentHistory,
    getPaymentById,
    processRefund,
    getPaymentStats,
    
    // Utility
    clearError,
    formatAmount,
    getStatusColor,
    getStatusIcon,
  };
};


