import { useState, useCallback } from 'react';
import { secureApiClient, SignedTransaction, UserNonce, WalletInfo } from '../services/SecureApiClient';
import { useWallet } from './useWallet';
import { useToast } from './use-toast';

export interface UseSecureApiReturn {
  // State
  isLoading: boolean;
  error: string | null;
  
  // User nonce operations
  getUserNonce: (userAddress: string) => Promise<UserNonce>;
  
  // Transaction operations
  createDepositTransaction: (amount: string) => Promise<SignedTransaction>;
  createWithdrawTransaction: (amount: string) => Promise<SignedTransaction>;
  signTransaction: (amount: string, method: 'deposit' | 'withdraw' | 'mint' | 'redeem') => Promise<SignedTransaction>;
  
  // Utility operations
  getWalletInfo: () => Promise<WalletInfo>;
  verifySignature: (userAddress: string, message: string, signature: string) => Promise<boolean>;
  healthCheck: () => Promise<any>;
  
  // Transaction broadcasting
  broadcastTransaction: (signedTx: string) => Promise<string>;
  waitForConfirmation: (txHash: string, confirmations?: number) => Promise<any>;
  
  // Error handling
  clearError: () => void;
}

export const useSecureApi = (): UseSecureApiReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { wallet } = useWallet();
  const { toast } = useToast();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((err: any, operation: string) => {
    const errorMessage = err instanceof Error ? err.message : `Failed to ${operation}`;
    setError(errorMessage);
    
    toast({
      title: "Operation Failed",
      description: errorMessage,
      variant: "destructive",
    });
    
    console.error(`[SecureAPI] ${operation} error:`, err);
  }, [toast]);

  const getUserNonce = useCallback(async (userAddress: string): Promise<UserNonce> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const nonce = await secureApiClient.getUserNonce(userAddress);
      
      toast({
        title: "Nonce Retrieved",
        description: `Current nonce: ${nonce.nonce}`,
      });
      
      return nonce;
    } catch (err) {
      handleError(err, 'get user nonce');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleError, toast]);

  const createDepositTransaction = useCallback(async (amount: string): Promise<SignedTransaction> => {
    if (!wallet.isConnected || !wallet.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const signedTx = await secureApiClient.createDepositTransaction(
        wallet.address,
        amount,
        wallet.signer
      );
      
      toast({
        title: "Deposit Transaction Created",
        description: `Transaction signed successfully. Hash: ${signedTx.txHash.slice(0, 10)}...`,
      });
      
      return signedTx;
    } catch (err) {
      handleError(err, 'create deposit transaction');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [wallet, handleError, toast]);

  const createWithdrawTransaction = useCallback(async (amount: string): Promise<SignedTransaction> => {
    if (!wallet.isConnected || !wallet.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const signedTx = await secureApiClient.createWithdrawTransaction(
        wallet.address,
        amount,
        wallet.signer
      );
      
      toast({
        title: "Withdraw Transaction Created",
        description: `Transaction signed successfully. Hash: ${signedTx.txHash.slice(0, 10)}...`,
      });
      
      return signedTx;
    } catch (err) {
      handleError(err, 'create withdraw transaction');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [wallet, handleError, toast]);

  const signTransaction = useCallback(async (
    amount: string, 
    method: 'deposit' | 'withdraw' | 'mint' | 'redeem'
  ): Promise<SignedTransaction> => {
    if (!wallet.isConnected || !wallet.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const signedTx = await secureApiClient.signTransaction(
        wallet.address,
        amount,
        method,
        wallet.signer
      );
      
      toast({
        title: "Transaction Signed",
        description: `${method} transaction signed successfully. Hash: ${signedTx.txHash.slice(0, 10)}...`,
      });
      
      return signedTx;
    } catch (err) {
      handleError(err, 'sign transaction');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [wallet, handleError, toast]);

  const getWalletInfo = useCallback(async (): Promise<WalletInfo> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const walletInfo = await secureApiClient.getWalletInfo();
      
      return walletInfo;
    } catch (err) {
      handleError(err, 'get wallet info');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const verifySignature = useCallback(async (
    userAddress: string,
    message: string,
    signature: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const isValid = await secureApiClient.verifySignature(userAddress, message, signature);
      
      toast({
        title: "Signature Verification",
        description: isValid ? "Signature is valid" : "Signature is invalid",
        variant: isValid ? "default" : "destructive",
      });
      
      return isValid;
    } catch (err) {
      handleError(err, 'verify signature');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleError, toast]);

  const healthCheck = useCallback(async (): Promise<any> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const health = await secureApiClient.healthCheck();
      
      toast({
        title: "API Health Check",
        description: "Secure API is healthy",
      });
      
      return health;
    } catch (err) {
      handleError(err, 'health check');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleError, toast]);

  const broadcastTransaction = useCallback(async (signedTx: string): Promise<string> => {
    if (!wallet.provider) {
      throw new Error('Wallet provider not available');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const txHash = await secureApiClient.broadcastTransaction(signedTx, wallet.provider);
      
      toast({
        title: "Transaction Broadcasted",
        description: `Transaction sent to network. Hash: ${txHash.slice(0, 10)}...`,
      });
      
      return txHash;
    } catch (err) {
      handleError(err, 'broadcast transaction');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [wallet, handleError, toast]);

  const waitForConfirmation = useCallback(async (
    txHash: string, 
    confirmations: number = 1
  ): Promise<any> => {
    if (!wallet.provider) {
      throw new Error('Wallet provider not available');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const receipt = await secureApiClient.waitForConfirmation(txHash, wallet.provider, confirmations);
      
      toast({
        title: "Transaction Confirmed",
        description: `Transaction confirmed with ${confirmations} confirmation(s)`,
      });
      
      return receipt;
    } catch (err) {
      handleError(err, 'wait for confirmation');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [wallet, handleError, toast]);

  return {
    // State
    isLoading,
    error,
    
    // Operations
    getUserNonce,
    createDepositTransaction,
    createWithdrawTransaction,
    signTransaction,
    getWalletInfo,
    verifySignature,
    healthCheck,
    broadcastTransaction,
    waitForConfirmation,
    
    // Error handling
    clearError,
  };
};


