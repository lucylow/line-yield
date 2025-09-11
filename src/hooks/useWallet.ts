import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { WalletState, WalletConnectOptions } from '../types/wallet';
import { KLAYTN_MAINNET, KLAYTN_TESTNET } from '../utils/constants';
import { formatBalance } from '../utils/formatters';

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

  const connectWallet = useCallback(async (options?: WalletConnectOptions) => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });

        const address = accounts[0];
        const network = await provider.getNetwork();
        const balance = await provider.getBalance(address);
        
        // Switch to Kaia network if needed
        const targetChainId = options?.chainId || KLAYTN_TESTNET.chainId;
        if (network.chainId !== targetChainId) {
          await switchNetwork(targetChainId);
        }

        setWallet({
          isConnected: true,
          address,
          balance: formatBalance(balance),
          network: network.name,
          provider,
        });

        return address;
      } else {
        throw new Error('No Ethereum wallet found');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }, []);

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
        
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [chainConfig],
        });
      }
      throw error;
    }
  };

  const disconnectWallet = useCallback(() => {
    setWallet({
      isConnected: false,
      address: null,
      balance: '0',
      network: '',
      provider: null,
    });
  }, []);

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
    connectWallet,
    disconnectWallet,
    switchNetwork,
  };
};