import { useState, useCallback } from 'react';
import { useToast } from './use-toast';
import { useWallet } from './useWallet';

export interface KaiaPayment {
  id: string;
  paymentId: number;
  buyerAddress: string;
  sellerAddress: string;
  amount: string;
  platformFee: string;
  loyaltyFee: string;
  sellerPayout: string;
  productId: string;
  description: string;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  orderHash: string;
  txHash?: string;
  createdAt: string;
  completedAt?: string;
}

export interface PaymentFees {
  platformFee: string;
  loyaltyFee: string;
  sellerPayout: string;
}

export interface PaymentStats {
  totalVolumeProcessed: string;
  totalFeesCollected: string;
  totalPayments: number;
  platformFeePercent: number;
  loyaltyFeePercent: number;
  gasFeePercent: number;
}

export interface CreatePaymentRequest {
  sellerAddress: string;
  amount: string;
  productId: string;
  description?: string;
}

export const useKaiaPayments = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payments, setPayments] = useState<KaiaPayment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [balance, setBalance] = useState<string>('0');
  
  const { wallet } = useWallet();
  const { toast } = useToast();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((err: any, operation: string) => {
    const errorMessage = err instanceof Error ? err.message : `Failed to ${operation}`;
    setError(errorMessage);
    
    toast({
      title: "KAIA Payment Error",
      description: errorMessage,
      variant: "destructive",
    });
    
    console.error(`[KAIA Payments] ${operation} error:`, err);
  }, [toast]);

  const showSuccess = useCallback((message: string, title: string = "Success") => {
    toast({
      title,
      description: message,
    });
  }, [toast]);

  /**
   * Create a new KAIA payment
   */
  const createPayment = useCallback(async (request: CreatePaymentRequest): Promise<KaiaPayment | null> => {
    if (!wallet.isConnected) {
      handleError(new Error('Wallet not connected'), 'create payment');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/kaia-payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...request,
          buyerAddress: wallet.address
        })
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error);
      }

      showSuccess(`Payment created successfully! ID: ${data.data.paymentId}`, "Payment Created");
      return data.data;
    } catch (err) {
      handleError(err, 'create payment');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [wallet.isConnected, wallet.address, handleError, showSuccess]);

  /**
   * Complete a payment (seller action)
   */
  const completePayment = useCallback(async (paymentId: number, sellerPrivateKey: string): Promise<string | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/kaia-payments/${paymentId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerPrivateKey })
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error);
      }

      showSuccess("Payment completed successfully!", "Payment Completed");
      return data.data.txHash;
    } catch (err) {
      handleError(err, 'complete payment');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError, showSuccess]);

  /**
   * Cancel a payment
   */
  const cancelPayment = useCallback(async (paymentId: number, reason: string, userPrivateKey: string): Promise<string | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/kaia-payments/${paymentId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          reason, 
          userAddress: wallet.address,
          userPrivateKey 
        })
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error);
      }

      showSuccess("Payment cancelled successfully!", "Payment Cancelled");
      return data.data.txHash;
    } catch (err) {
      handleError(err, 'cancel payment');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [wallet.address, handleError, showSuccess]);

  /**
   * Get payment by ID
   */
  const getPayment = useCallback(async (paymentId: number): Promise<KaiaPayment | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/kaia-payments/${paymentId}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }

      return data.data;
    } catch (err) {
      handleError(err, 'get payment');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  /**
   * Get user's payment history
   */
  const getUserPayments = useCallback(async (userAddress?: string, limit: number = 50): Promise<void> => {
    const address = userAddress || wallet.address;
    if (!address) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/kaia-payments/user/${address}?limit=${limit}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }

      setPayments(data.data);
    } catch (err) {
      handleError(err, 'get user payments');
    } finally {
      setIsLoading(false);
    }
  }, [wallet.address, handleError]);

  /**
   * Get payment statistics
   */
  const getPaymentStats = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/kaia-payments/stats');
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }

      setStats(data.data);
    } catch (err) {
      handleError(err, 'get payment stats');
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  /**
   * Get KAIA balance
   */
  const getKaiaBalance = useCallback(async (address?: string): Promise<void> => {
    const addr = address || wallet.address;
    if (!addr) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/kaia-payments/balance/${addr}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }

      setBalance(data.data.balance);
    } catch (err) {
      handleError(err, 'get KAIA balance');
    } finally {
      setIsLoading(false);
    }
  }, [wallet.address, handleError]);

  /**
   * Calculate fees for a given amount
   */
  const calculateFees = useCallback(async (amount: string): Promise<PaymentFees | null> => {
    if (!amount || parseFloat(amount) <= 0) return null;

    try {
      const response = await fetch('/api/kaia-payments/fees/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error);
      }

      return data.data;
    } catch (err) {
      handleError(err, 'calculate fees');
      return null;
    }
  }, [handleError]);

  /**
   * Format amount for display
   */
  const formatAmount = useCallback((amount: string, decimals: number = 4): string => {
    const num = parseFloat(amount);
    return isNaN(num) ? '0' : num.toFixed(decimals);
  }, []);

  /**
   * Get status color for payment
   */
  const getStatusColor = useCallback((status: string): string => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      case 'refunded':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }, []);

  /**
   * Get status icon for payment
   */
  const getStatusIcon = useCallback((status: string): string => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'pending':
        return '⏳';
      case 'cancelled':
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
    payments,
    stats,
    balance,
    
    // Actions
    createPayment,
    completePayment,
    cancelPayment,
    getPayment,
    getUserPayments,
    getPaymentStats,
    getKaiaBalance,
    calculateFees,
    
    // Utilities
    clearError,
    formatAmount,
    getStatusColor,
    getStatusIcon,
  };
};

