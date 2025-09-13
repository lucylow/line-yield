import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

// Kaia network configurations
export const KAIANETWORKS = {
  TESTNET: {
    chainId: '0x3e9', // 1001 in hex
    chainName: 'Kaia Testnet',
    rpcUrls: ['https://api.baobab.klaytn.net:8651'],
    blockExplorerUrls: ['https://baobab.klaytnscope.com'],
    nativeCurrency: {
      name: 'KAIA',
      symbol: 'KAIA',
      decimals: 18
    }
  },
  MAINNET: {
    chainId: '0x2015', // 8217 in hex
    chainName: 'Kaia Mainnet',
    rpcUrls: ['https://public-en-cypress.klaytn.net'],
    blockExplorerUrls: ['https://klaytnscope.com'],
    nativeCurrency: {
      name: 'KAIA',
      symbol: 'KAIA',
      decimals: 18
    }
  }
};

// USDT token addresses
export const TOKEN_ADDRESSES = {
  TESTNET: {
    USDT: '0xceE8FAF64bE97bF70b95FE6537A2CFC48a5E7F75' // Kaia Testnet USDT
  },
  MAINNET: {
    USDT: '0xceE8FAF64bE97bF70b95FE6537A2CFC48a5E7F75' // Kaia Mainnet USDT
  }
};

interface WalletState {
  isConnected: boolean;
  account: string | null;
  kaiaBalance: string;
  usdtBalance: string;
  isLoading: boolean;
  error: string | null;
  network: typeof KAIANETWORKS.TESTNET | typeof KAIANETWORKS.MAINNET | null;
}

interface KaiaWalletHook extends WalletState {
  connectWallet: () => Promise<string | null>;
  disconnectWallet: () => Promise<void>;
  refreshBalances: () => Promise<void>;
  sendTransaction: (params: TransactionParams) => Promise<string | null>;
  signMessage: (message: string) => Promise<string | null>;
  connectAndSign: (message: string) => Promise<string | null>;
  switchNetwork: (network: 'testnet' | 'mainnet') => Promise<boolean>;
}

interface TransactionParams {
  to: string;
  data: string;
  value?: string;
  gasLimit?: string;
  gasPrice?: string;
}

// Declare Kaia Wallet Provider types
declare global {
  interface Window {
    kaia_requestAccounts: () => Promise<string[]>;
    kaia_accounts: () => Promise<string[]>;
    kaia_getBalance: (account: string) => Promise<string>;
    kaia_sendTransaction: (params: TransactionParams) => Promise<string>;
    kaia_signTransaction: (params: TransactionParams) => Promise<string>;
    kaia_signMessage: (message: string) => Promise<string>;
    kaia_connectAndSign: (message: string) => Promise<string>;
    disconnectWallet: () => Promise<void>;
    getErc20TokenBalance: (params: { account: string; contractAddress: string }) => Promise<string>;
    kaia_switchNetwork: (chainId: string) => Promise<boolean>;
  }
}

export const useKaiaWallet = (): KaiaWalletHook => {
  const { toast } = useToast();
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    account: null,
    kaiaBalance: '0',
    usdtBalance: '0',
    isLoading: false,
    error: null,
    network: null
  });

  // Check if Kaia Wallet Provider is available
  const isKaiaWalletAvailable = useCallback(() => {
    return typeof window !== 'undefined' && 
           typeof window.kaia_requestAccounts === 'function' &&
           typeof window.kaia_accounts === 'function';
  }, []);

  // Convert hex balance to human readable format
  const formatBalance = useCallback((hexBalance: string, decimals: number = 18): string => {
    try {
      const balance = BigInt(hexBalance);
      const divisor = BigInt(10 ** decimals);
      const wholePart = balance / divisor;
      const fractionalPart = balance % divisor;
      const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
      
      return `${wholePart}.${fractionalStr}`;
    } catch (error) {
      console.error('Error formatting balance:', error);
      return '0';
    }
  }, []);

  // Get KAIA balance
  const getKaiaBalance = useCallback(async (account: string): Promise<string> => {
    try {
      const balanceHex = await window.kaia_getBalance(account);
      return formatBalance(balanceHex, 18);
    } catch (error) {
      console.error('Error fetching KAIA balance:', error);
      return '0';
    }
  }, [formatBalance]);

  // Get USDT balance
  const getUSDTBalance = useCallback(async (account: string): Promise<string> => {
    try {
      const currentNetwork = state.network || KAIANETWORKS.TESTNET;
      const usdtAddress = currentNetwork === KAIANETWORKS.MAINNET 
        ? TOKEN_ADDRESSES.MAINNET.USDT 
        : TOKEN_ADDRESSES.TESTNET.USDT;
      
      const balanceHex = await window.getErc20TokenBalance({
        account,
        contractAddress: usdtAddress
      });
      
      // USDT has 6 decimals
      return formatBalance(balanceHex, 6);
    } catch (error) {
      console.error('Error fetching USDT balance:', error);
      return '0';
    }
  }, [state.network, formatBalance]);

  // Connect wallet using kaia_requestAccounts
  const connectWallet = useCallback(async (): Promise<string | null> => {
    if (!isKaiaWalletAvailable()) {
      const error = 'Kaia Wallet Provider not found. Please install Kaia Wallet.';
      setState(prev => ({ ...prev, error }));
      toast({
        title: "Wallet Not Found",
        description: error,
        variant: "destructive",
      });
      return null;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Request wallet connection, UI popup shown if no wallet connected yet
      const accounts = await window.kaia_requestAccounts();
      
      if (accounts.length === 0) {
        const error = 'No wallet connected';
        setState(prev => ({ ...prev, isLoading: false, error }));
        toast({
          title: "Connection Failed",
          description: "No wallet accounts found",
          variant: "destructive",
        });
        return null;
      }

      const primaryAccount = accounts[0];
      console.log('Connected account:', primaryAccount);

      // Get balances
      const [kaiaBalance, usdtBalance] = await Promise.all([
        getKaiaBalance(primaryAccount),
        getUSDTBalance(primaryAccount)
      ]);

      setState(prev => ({
        ...prev,
        isConnected: true,
        account: primaryAccount,
        kaiaBalance,
        usdtBalance,
        isLoading: false,
        error: null,
        network: KAIANETWORKS.TESTNET // Default to testnet
      }));

      toast({
        title: "Wallet Connected",
        description: `Connected to ${primaryAccount.slice(0, 6)}...${primaryAccount.slice(-4)}`,
      });

      return primaryAccount;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      console.error('Failed to connect wallet:', error);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));

      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return null;
    }
  }, [isKaiaWalletAvailable, getKaiaBalance, getUSDTBalance, toast]);

  // Disconnect wallet
  const disconnectWallet = useCallback(async (): Promise<void> => {
    try {
      await window.disconnectWallet();
      console.log('Wallet disconnected');
      
      setState(prev => ({
        ...prev,
        isConnected: false,
        account: null,
        kaiaBalance: '0',
        usdtBalance: '0',
        error: null
      }));

      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected",
      });
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      toast({
        title: "Disconnect Failed",
        description: "Unable to disconnect wallet",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Refresh balances
  const refreshBalances = useCallback(async (): Promise<void> => {
    if (!state.account) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const [kaiaBalance, usdtBalance] = await Promise.all([
        getKaiaBalance(state.account),
        getUSDTBalance(state.account)
      ]);

      setState(prev => ({
        ...prev,
        kaiaBalance,
        usdtBalance,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error refreshing balances:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.account, getKaiaBalance, getUSDTBalance]);

  // Send transaction with gas fee delegation
  const sendTransaction = useCallback(async (params: TransactionParams): Promise<string | null> => {
    if (!state.account) {
      toast({
        title: "No Wallet Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return null;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const txParams = {
        from: state.account,
        to: params.to,
        data: params.data,
        value: params.value || '0x0',
        gasLimit: params.gasLimit,
        gasPrice: params.gasPrice
      };

      const txHash = await window.kaia_sendTransaction(txParams);
      console.log('Transaction hash:', txHash);

      toast({
        title: "Transaction Sent",
        description: `Transaction submitted: ${txHash.slice(0, 10)}...`,
      });

      // Refresh balances after transaction
      setTimeout(() => refreshBalances(), 2000);

      setState(prev => ({ ...prev, isLoading: false }));
      return txHash;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Transaction failed';
      console.error('Failed to send transaction:', error);
      
      setState(prev => ({ ...prev, isLoading: false }));
      
      toast({
        title: "Transaction Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return null;
    }
  }, [state.account, refreshBalances, toast]);

  // Sign message
  const signMessage = useCallback(async (message: string): Promise<string | null> => {
    if (!state.account) {
      toast({
        title: "No Wallet Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return null;
    }

    try {
      const signature = await window.kaia_signMessage(message);
      console.log('Message signature:', signature);
      return signature;
    } catch (error) {
      console.error('Failed to sign message:', error);
      toast({
        title: "Signing Failed",
        description: "Unable to sign message",
        variant: "destructive",
      });
      return null;
    }
  }, [state.account, toast]);

  // Connect and sign in one flow
  const connectAndSign = useCallback(async (message: string): Promise<string | null> => {
    try {
      const signature = await window.kaia_connectAndSign(message);
      console.log('Connect and sign signature:', signature);
      
      // Update wallet state after successful connection
      const accounts = await window.kaia_accounts();
      if (accounts.length > 0) {
        const primaryAccount = accounts[0];
        const [kaiaBalance, usdtBalance] = await Promise.all([
          getKaiaBalance(primaryAccount),
          getUSDTBalance(primaryAccount)
        ]);

        setState(prev => ({
          ...prev,
          isConnected: true,
          account: primaryAccount,
          kaiaBalance,
          usdtBalance,
          network: KAIANETWORKS.TESTNET
        }));
      }

      return signature;
    } catch (error) {
      console.error('Connect and sign failed:', error);
      toast({
        title: "Connect & Sign Failed",
        description: "Unable to connect and sign message",
        variant: "destructive",
      });
      return null;
    }
  }, [getKaiaBalance, getUSDTBalance, toast]);

  // Switch network
  const switchNetwork = useCallback(async (network: 'testnet' | 'mainnet'): Promise<boolean> => {
    try {
      const targetNetwork = network === 'mainnet' ? KAIANETWORKS.MAINNET : KAIANETWORKS.TESTNET;
      const success = await window.kaia_switchNetwork(targetNetwork.chainId);
      
      if (success) {
        setState(prev => ({ ...prev, network: targetNetwork }));
        toast({
          title: "Network Switched",
          description: `Switched to ${targetNetwork.chainName}`,
        });
      }
      
      return success;
    } catch (error) {
      console.error('Failed to switch network:', error);
      toast({
        title: "Network Switch Failed",
        description: "Unable to switch network",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  // Check existing connection on mount
  useEffect(() => {
    const checkExistingConnection = async () => {
      if (!isKaiaWalletAvailable()) return;

      try {
        const accounts = await window.kaia_accounts();
        if (accounts.length > 0) {
          const primaryAccount = accounts[0];
          const [kaiaBalance, usdtBalance] = await Promise.all([
            getKaiaBalance(primaryAccount),
            getUSDTBalance(primaryAccount)
          ]);

          setState(prev => ({
            ...prev,
            isConnected: true,
            account: primaryAccount,
            kaiaBalance,
            usdtBalance,
            network: KAIANETWORKS.TESTNET
          }));
        }
      } catch (error) {
        console.error('Error checking existing connection:', error);
      }
    };

    checkExistingConnection();
  }, [isKaiaWalletAvailable, getKaiaBalance, getUSDTBalance]);

  return {
    ...state,
    connectWallet,
    disconnectWallet,
    refreshBalances,
    sendTransaction,
    signMessage,
    connectAndSign,
    switchNetwork
  };
};

export default useKaiaWallet;