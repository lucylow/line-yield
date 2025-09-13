import { useState, useEffect, useCallback } from 'react';
import { useLocalization } from './useLocalization';

export interface WalletConnectionState {
  isConnected: boolean;
  userAddress: string | null;
  isConnecting: boolean;
  error: string | null;
  walletType: string | null;
  balance: string | null;
}

export interface WalletConnectionConfig {
  /** Whether to auto-connect on mount */
  autoConnect?: boolean;
  /** Whether to persist connection state */
  persistConnection?: boolean;
  /** Custom connection timeout in milliseconds */
  connectionTimeout?: number;
  /** Whether to show connection errors */
  showErrors?: boolean;
}

/**
 * Hook for managing wallet connection state
 * Complies with Dapp Portal design guidelines
 */
export function useWalletConnection(config: WalletConnectionConfig = {}) {
  const {
    autoConnect = false,
    persistConnection = true,
    connectionTimeout = 30000,
    showErrors = true,
  } = config;

  const { lang } = useLocalization();
  
  const [state, setState] = useState<WalletConnectionState>({
    isConnected: false,
    userAddress: null,
    isConnecting: false,
    error: null,
    walletType: null,
    balance: null,
  });

  // Get localized error messages
  const getLocalizedError = useCallback((error: string) => {
    if (lang === 'ja') {
      switch (error) {
        case 'User rejected connection':
          return 'ユーザーが接続を拒否しました';
        case 'Connection timeout':
          return '接続がタイムアウトしました';
        case 'Wallet not found':
          return 'ウォレットが見つかりません';
        case 'Network error':
          return 'ネットワークエラーが発生しました';
        default:
          return `接続エラー: ${error}`;
      }
    }
    
    return error;
  }, [lang]);

  // Check for persisted connection
  useEffect(() => {
    if (persistConnection && autoConnect) {
      const persistedState = localStorage.getItem('wallet-connection-state');
      if (persistedState) {
        try {
          const parsed = JSON.parse(persistedState);
          if (parsed.isConnected && parsed.userAddress) {
            setState(prev => ({
              ...prev,
              isConnected: parsed.isConnected,
              userAddress: parsed.userAddress,
              walletType: parsed.walletType,
            }));
          }
        } catch (error) {
          console.warn('Failed to parse persisted wallet state:', error);
        }
      }
    }
  }, [persistConnection, autoConnect]);

  // Persist connection state
  useEffect(() => {
    if (persistConnection) {
      const stateToPersist = {
        isConnected: state.isConnected,
        userAddress: state.userAddress,
        walletType: state.walletType,
      };
      localStorage.setItem('wallet-connection-state', JSON.stringify(stateToPersist));
    }
  }, [state.isConnected, state.userAddress, state.walletType, persistConnection]);

  // Connect wallet
  const connect = useCallback(async (connectFunction: () => Promise<void>) => {
    setState(prev => ({
      ...prev,
      isConnecting: true,
      error: null,
    }));

    try {
      // Set timeout for connection
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout')), connectionTimeout);
      });

      await Promise.race([connectFunction(), timeoutPromise]);
      
      setState(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        error: null,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      const localizedError = getLocalizedError(errorMessage);
      
      setState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        error: localizedError,
      }));

      if (showErrors) {
        console.error('Wallet connection failed:', localizedError);
      }

      throw error;
    }
  }, [connectionTimeout, getLocalizedError, showErrors]);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setState({
      isConnected: false,
      userAddress: null,
      isConnecting: false,
      error: null,
      walletType: null,
      balance: null,
    });

    if (persistConnection) {
      localStorage.removeItem('wallet-connection-state');
    }
  }, [persistConnection]);

  // Update wallet info
  const updateWalletInfo = useCallback((info: {
    userAddress?: string;
    walletType?: string;
    balance?: string;
  }) => {
    setState(prev => ({
      ...prev,
      ...info,
    }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  // Check if wallet is available
  const isWalletAvailable = useCallback(() => {
    return typeof window !== 'undefined' && 
           (window.ethereum || window.kaia || window.miniDappSDK);
  }, []);

  // Get wallet type
  const getWalletType = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    if (window.miniDappSDK) return 'LINE Mini Dapp';
    if (window.kaia) return 'Kaia Wallet';
    if (window.ethereum) return 'MetaMask';
    
    return null;
  }, []);

  return {
    // State
    isConnected: state.isConnected,
    userAddress: state.userAddress,
    isConnecting: state.isConnecting,
    error: state.error,
    walletType: state.walletType,
    balance: state.balance,
    
    // Actions
    connect,
    disconnect,
    updateWalletInfo,
    clearError,
    
    // Utilities
    isWalletAvailable: isWalletAvailable(),
    getWalletType,
  };
}

/**
 * Simplified hook for basic wallet connection
 */
export function useSimpleWalletConnection() {
  return useWalletConnection({
    autoConnect: false,
    persistConnection: true,
    showErrors: true,
  });
}

/**
 * Hook for wallet connection with auto-connect
 */
export function useAutoWalletConnection() {
  return useWalletConnection({
    autoConnect: true,
    persistConnection: true,
    showErrors: true,
  });
}

/**
 * Hook for wallet connection without persistence
 */
export function useTemporaryWalletConnection() {
  return useWalletConnection({
    autoConnect: false,
    persistConnection: false,
    showErrors: true,
  });
}
