import { useState, useEffect } from 'react';

interface KaiaWalletState {
  isConnected: boolean;
  address: string | null;
  balance: string;
  chainId: number | null;
  error: string | null;
}

export const useKaiaWallet = () => {
  const [state, setState] = useState<KaiaWalletState>({
    isConnected: false,
    address: null,
    balance: '0',
    chainId: null,
    error: null
  });

  // Kaia network configuration
  const KAIROS_TESTNET = {
    chainId: '0x3e9', // 1001 in hex
    chainName: 'Kaia Kairos Testnet',
    rpcUrls: ['https://api.baobab.klaytn.net:8651'],
    blockExplorerUrls: ['https://baobab.klaytnscope.com/'],
    nativeCurrency: {
      name: 'KLAY',
      symbol: 'KLAY',
      decimals: 18
    }
  };

  const KAIROS_MAINNET = {
    chainId: '0x2015', // 8217 in hex
    chainName: 'Kaia Mainnet',
    rpcUrls: ['https://public-en-kaia.klaytn.net'],
    blockExplorerUrls: ['https://klaytnscope.com/'],
    nativeCurrency: {
      name: 'KLAY',
      symbol: 'KLAY',
      decimals: 18
    }
  };

  useEffect(() => {
    // Check if wallet is already connected
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const balance = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [accounts[0], 'latest']
          });
          
          setState(prev => ({
            ...prev,
            isConnected: true,
            address: accounts[0],
            balance: (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4),
            chainId: parseInt(window.ethereum.chainId, 16)
          }));
        }
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  };

  const connect = async () => {
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('No wallet detected. Please install Kaia Wallet or MetaMask.');
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Switch to Kaia network
      await switchToKaiaNetwork();

      // Get balance
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [accounts[0], 'latest']
      });

      setState(prev => ({
        ...prev,
        isConnected: true,
        address: accounts[0],
        balance: (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4),
        chainId: parseInt(window.ethereum.chainId, 16),
        error: null
      }));

      return accounts[0];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  };

  const switchToKaiaNetwork = async () => {
    try {
      // Try to switch to Kaia Kairos Testnet first
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: KAIROS_TESTNET.chainId }]
      });
    } catch (switchError: any) {
      // If the network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [KAIROS_TESTNET]
          });
        } catch (addError) {
          console.error('Failed to add Kaia network:', addError);
          throw new Error('Failed to add Kaia network');
        }
      } else {
        throw switchError;
      }
    }
  };

  const disconnect = () => {
    setState({
      isConnected: false,
      address: null,
      balance: '0',
      chainId: null,
      error: null
    });
  };

  const sendTransaction = async (to: string, value: string, data?: string) => {
    try {
      if (!state.isConnected || !state.address) {
        throw new Error('Wallet not connected');
      }

      const transaction = {
        from: state.address,
        to,
        value: value ? `0x${parseInt(value).toString(16)}` : '0x0',
        data: data || '0x'
      };

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transaction]
      });

      return txHash;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Transaction failed';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  };

  const signMessage = async (message: string) => {
    try {
      if (!state.isConnected || !state.address) {
        throw new Error('Wallet not connected');
      }

      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, state.address]
      });

      return signature;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signing failed';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  };

  return {
    ...state,
    connect,
    disconnect,
    sendTransaction,
    signMessage,
    switchToKaiaNetwork
  };
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}
