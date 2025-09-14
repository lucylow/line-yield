import { useState, useEffect, useCallback } from 'react';
import { qrPaymentService, QRPaymentSession, CreatePaymentRequest, PaymentStatusResponse } from '../services/qrPaymentService';

export interface UseQRPaymentReturn {
  // State
  currentSession: QRPaymentSession | null;
  paymentStatus: PaymentStatusResponse | null;
  isLoading: boolean;
  error: string | null;
  isPolling: boolean;
  
  // Actions
  createPayment: (request: CreatePaymentRequest) => Promise<void>;
  cancelPayment: () => Promise<void>;
  confirmPayment: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
  
  // Utilities
  formatAmount: (amount: string, token?: string) => string;
  formatTimeRemaining: (expiresAt: number) => string;
  isExpired: (expiresAt: number) => boolean;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => string;
}

export const useQRPayment = (): UseQRPaymentReturn => {
  const [currentSession, setCurrentSession] = useState<QRPaymentSession | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  // Polling interval for payment status
  const POLLING_INTERVAL = 3000; // 3 seconds

  /**
   * Create a new payment session
   */
  const createPayment = useCallback(async (request: CreatePaymentRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const session = await qrPaymentService.createPaymentSession(request);
      setCurrentSession(session);
      setPaymentStatus({
        id: session.id,
        amount: session.amount,
        token: session.token,
        status: session.status,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        qrCodeData: session.qrCodeData,
      });
      
      // Start polling for status updates
      setIsPolling(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create payment';
      setError(errorMessage);
      console.error('Failed to create payment:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Cancel current payment session
   */
  const cancelPayment = useCallback(async () => {
    if (!currentSession) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      await qrPaymentService.cancelPayment(currentSession.id, currentSession.userAddress);
      
      // Update local state
      setCurrentSession(prev => prev ? { ...prev, status: 'cancelled' } : null);
      setPaymentStatus(prev => prev ? { ...prev, status: 'cancelled' } : null);
      setIsPolling(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel payment';
      setError(errorMessage);
      console.error('Failed to cancel payment:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentSession]);

  /**
   * Confirm payment (for testing)
   */
  const confirmPayment = useCallback(async () => {
    if (!currentSession) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await qrPaymentService.confirmPayment(currentSession.id);
      
      // Update local state
      setCurrentSession(prev => prev ? { 
        ...prev, 
        status: 'paid',
        transactionHash: result.transactionHash,
        payerAddress: result.payerAddress
      } : null);
      setPaymentStatus(prev => prev ? { 
        ...prev, 
        status: 'paid',
        transactionHash: result.transactionHash,
        payerAddress: result.payerAddress
      } : null);
      setIsPolling(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to confirm payment';
      setError(errorMessage);
      console.error('Failed to confirm payment:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentSession]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    setCurrentSession(null);
    setPaymentStatus(null);
    setIsLoading(false);
    setError(null);
    setIsPolling(false);
  }, []);

  /**
   * Poll for payment status updates
   */
  useEffect(() => {
    if (!isPolling || !currentSession) return;

    const pollStatus = async () => {
      try {
        const status = await qrPaymentService.getPaymentStatus(currentSession.id);
        
        if (status) {
          setPaymentStatus(status);
          
          // Update current session with latest status
          setCurrentSession(prev => prev ? { ...prev, ...status } : null);
          
          // Stop polling if payment is completed or expired
          if (status.status === 'paid' || status.status === 'expired' || status.status === 'cancelled') {
            setIsPolling(false);
          }
        } else {
          // Session not found, stop polling
          setIsPolling(false);
        }
      } catch (err) {
        console.error('Failed to poll payment status:', err);
        // Continue polling on error, but log it
      }
    };

    // Poll immediately, then at intervals
    pollStatus();
    const interval = setInterval(pollStatus, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [isPolling, currentSession]);

  /**
   * Auto-stop polling when session expires
   */
  useEffect(() => {
    if (!currentSession || !isPolling) return;

    const checkExpiry = () => {
      if (qrPaymentService.isExpired(currentSession.expiresAt)) {
        setIsPolling(false);
        setCurrentSession(prev => prev ? { ...prev, status: 'expired' } : null);
        setPaymentStatus(prev => prev ? { ...prev, status: 'expired' } : null);
      }
    };

    const interval = setInterval(checkExpiry, 1000); // Check every second
    return () => clearInterval(interval);
  }, [currentSession, isPolling]);

  // Utility functions
  const formatAmount = useCallback((amount: string, token?: string) => {
    return qrPaymentService.formatAmount(amount, token);
  }, []);

  const formatTimeRemaining = useCallback((expiresAt: number) => {
    return qrPaymentService.formatTimeRemaining(expiresAt);
  }, []);

  const isExpired = useCallback((expiresAt: number) => {
    return qrPaymentService.isExpired(expiresAt);
  }, []);

  const getStatusColor = useCallback((status: string) => {
    return qrPaymentService.getStatusColor(status);
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    return qrPaymentService.getStatusIcon(status);
  }, []);

  return {
    // State
    currentSession,
    paymentStatus,
    isLoading,
    error,
    isPolling,
    
    // Actions
    createPayment,
    cancelPayment,
    confirmPayment,
    clearError,
    reset,
    
    // Utilities
    formatAmount,
    formatTimeRemaining,
    isExpired,
    getStatusColor,
    getStatusIcon,
  };
};



