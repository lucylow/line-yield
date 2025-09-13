import { useState, useCallback } from 'react';
import { PaymentStatus, PaymentType, WalletInfo } from '../types/payment';
import { initiatePayment, checkPaymentStatus, getConnectedWalletAddress } from '../services/paymentService';

interface UsePaymentState {
  loading: boolean;
  paymentId: string | null;
  status: PaymentStatus | null;
  error: string | null;
  walletInfo: WalletInfo | null;
}

interface UsePaymentReturn extends UsePaymentState {
  processPayment: (itemId: string, amount: number, paymentType: PaymentType, currency: string) => Promise<string | null>;
  pollPaymentStatus: (paymentId: string) => Promise<PaymentStatus>;
  connectWallet: () => Promise<WalletInfo | null>;
  clearError: () => void;
  resetPayment: () => void;
}

export const usePayment = (): UsePaymentReturn => {
  const [state, setState] = useState<UsePaymentState>({
    loading: false,
    paymentId: null,
    status: null,
    error: null,
    walletInfo: null,
  });

  const connectWallet = useCallback(async (): Promise<WalletInfo | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const address = await getConnectedWalletAddress();
      if (!address) {
        throw new Error('No wallet connected');
      }

      const walletInfo: WalletInfo = {
        address,
        balance: '0', // This would be fetched from the wallet
        currency: 'USDT',
        walletType: 'Kaia Wallet'
      };

      setState(prev => ({ 
        ...prev, 
        loading: false, 
        walletInfo,
        error: null 
      }));

      return walletInfo;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      return null;
    }
  }, []);

  const processPayment = useCallback(async (
    itemId: string,
    amount: number,
    paymentType: PaymentType,
    currency: string
  ): Promise<string | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      if (!state.walletInfo?.address) {
        throw new Error('Wallet not connected');
      }

      const paymentId = await initiatePayment(
        itemId,
        amount,
        paymentType,
        currency,
        state.walletInfo.address
      );

      setState(prev => ({ 
        ...prev, 
        loading: false, 
        paymentId,
        status: 'pending',
        error: null 
      }));

      return paymentId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      return null;
    }
  }, [state.walletInfo]);

  const pollPaymentStatus = useCallback(async (paymentId: string): Promise<PaymentStatus> => {
    try {
      const status = await checkPaymentStatus(paymentId);
      setState(prev => ({ ...prev, status }));
      return status;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to check payment status';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const resetPayment = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      paymentId: null, 
      status: null, 
      error: null 
    }));
  }, []);

  return {
    ...state,
    processPayment,
    pollPaymentStatus,
    connectWallet,
    clearError,
    resetPayment,
  };
};


