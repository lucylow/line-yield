import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider, formatEther } from 'ethers';
import { usePlatform } from './usePlatform';
import { WalletService } from '../services/walletService';
import { AccountService } from '../services/accountService';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string;
  chainId: number | null;
  provider: BrowserProvider | null;
  walletType: string | null;
}

export const useUniversalWallet = () => {
  const { isLiff } = usePlatform();
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: '0',
    chainId: null,
    provider: null,
    walletType: null
  });

  const walletService = new WalletService();
  const accountService = new AccountService();

  const connectWallet = useCallback(async (options?: { type?: string }) => {
    try {
      let walletType = options?.type;
      
      // Auto-detect wallet type based on platform
      if (!walletType) {
        walletType = isLiff ? 'line' : 'metamask';
      }

      const address = await walletService.connect({ 
        type: walletType as any,
        chainId: 1001 // Kaia Testnet
      });

      if (!address) return;

      // Get provider and additional wallet info
      const provider = walletService.getProvider();
      if (!provider) {
        throw new Error('Provider not available');
      }

      const balance = await provider.getBalance(address);
      const network = await provider.getNetwork();

      const newWalletState = {
        isConnected: true,
        address,
        balance: formatEther(balance),
        chainId: Number(network.chainId),
        provider,
        walletType
      };

      setWallet(newWalletState);

      // Link account across platforms
      await accountService.linkAccounts(address, isLiff ? 'liff-user-id' : undefined);

      return address;
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw error;
    }
  }, [isLiff, walletService, accountService]);

  const disconnectWallet = useCallback(() => {
    setWallet({
      isConnected: false,
      address: null,
      balance: '0',
      chainId: null,
      provider: null,
      walletType: null
    });
  }, []);

  // Auto-connect on platform change
  useEffect(() => {
    const savedAddress = localStorage.getItem('wallet_address');
    const savedType = localStorage.getItem('wallet_type');
    
    if (savedAddress && savedType) {
      connectWallet({ type: savedType }).catch(console.error);
    }
  }, [isLiff, connectWallet]);

  // Save wallet state
  useEffect(() => {
    if (wallet.address && wallet.walletType) {
      localStorage.setItem('wallet_address', wallet.address);
      localStorage.setItem('wallet_type', wallet.walletType);
    } else {
      localStorage.removeItem('wallet_address');
      localStorage.removeItem('wallet_type');
    }
  }, [wallet.address, wallet.walletType]);

  return {
    wallet,
    connectWallet,
    disconnectWallet,
    isLiff
  };
};