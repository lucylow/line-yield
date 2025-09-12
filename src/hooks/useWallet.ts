import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { WalletState, WalletConnectOptions } from '../types/wallet';
import { KLAYTN_MAINNET, KLAYTN_TESTNET } from '../utils/constants';
import { formatBalance } from '../utils/formatters';
import { useToast } from '@/hooks/use-toast';

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: '0',
    network: '',
    provider: null,
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const connectWallet = useCallback(async (options?: WalletConnectOptions) => {
    if (isConnecting) return;
    
    try {
      setIsConnecting(true);
      
      if (typeof window.ethereum === 'undefined') {
        throw new Error('No Ethereum wallet found. Please install MetaMask or another Web3 wallet.');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock your wallet.');
      }

      const address = accounts[0];
      const network = await provider.getNetwork();
      
      // Switch to Kaia network if needed
      const targetChainId = options?.chainId || KLAYTN_TESTNET.chainId;
      if (Number(network.chainId) !== targetChainId) {
        await switchNetwork(targetChainId);
      }

      // Get updated balance after network switch
      const balance = await provider.getBalance(address);
      const signer = await provider.getSigner();
      
      setWallet({
        isConnected: true,
        address,
        balance: formatBalance(balance),
        network: network.name,
        provider,
        signer,
      });

      toast({
        title: "Wallet Connected",
        description: `Successfully connected to ${network.name}`,
      });

      return address;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, toast]);

  const switchNetwork = async (chainId: number) => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added, try to add it
        const chainConfig = chainId === KLAYTN_MAINNET.chainId 
          ? KLAYTN_MAINNET 
          : KLAYTN_TESTNET;
        
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [chainConfig],
          });
        } catch (addError) {
          throw new Error(`Failed to add ${chainConfig.chainName} network. Please add it manually.`);
        }
      } else {
        throw new Error(`Failed to switch to network. ${error.message || 'Unknown error'}`);
      }
    }
  };

  const disconnectWallet = useCallback(() => {
    setWallet({
      isConnected: false,
      address: null,
      balance: '0',
      network: '',
      provider: null,
      signer: null,
    });
    
    toast({
      title: "Wallet Disconnected",
      description: "You have been disconnected from your wallet",
    });
  }, [toast]);

  // Add function to refresh balance
  const refreshBalance = useCallback(async () => {
    if (!wallet.provider || !wallet.address) return;
    
    try {
      const balance = await wallet.provider.getBalance(wallet.address);
      setWallet(prev => ({
        ...prev,
        balance: formatBalance(balance),
      }));
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    }
  }, [wallet.provider, wallet.address]);

  useEffect(() => {
    // Listen for account changes
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== wallet.address) {
          connectWallet();
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [wallet.address, connectWallet, disconnectWallet]);

  return {
    wallet,
    isConnecting,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    refreshBalance,
  };
};