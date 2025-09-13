/**
 * Mini Dapp SDK Service
 * Provides wallet integration functions for both LINE and Web versions
 */

// Extend Window interface for Kaia Mini Dapp SDK
declare global {
  interface Window {
    kaia_accounts?: () => Promise<string[]>;
    kaia_requestAccounts?: () => Promise<string[]>;
    kaia_getBalance?: (address: string) => Promise<string>;
    kaia_sendTransaction?: (transaction: any) => Promise<string>;
    kaia_signMessage?: (message: string) => Promise<string>;
    kaia_getWalletType?: () => string;
    kaia_switchNetwork?: (chainId: string) => Promise<void>;
    kaia_addNetwork?: (networkConfig: any) => Promise<void>;
  }
}

export interface WalletInfo {
  address: string | null;
  balance: string | null;
  walletType: string | null;
  chainId: number | null;
}

export interface MiniDappSDKConfig {
  chainId?: string;
  rpcUrl?: string;
  networkName?: string;
}

class MiniDappSDK {
  private config: MiniDappSDKConfig;

  constructor(config: MiniDappSDKConfig = {}) {
    this.config = {
      chainId: '8217', // Kaia mainnet
      rpcUrl: 'https://public-en-cypress.klaytn.net',
      networkName: 'Kaia Mainnet',
      ...config
    };
  }

  /**
   * Check if wallet is already connected
   */
  async kaia_accounts(): Promise<string[]> {
    try {
      if (typeof window !== 'undefined' && window.kaia_accounts) {
        return await window.kaia_accounts();
      }
      
      // Fallback to ethereum provider
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        return accounts || [];
      }
      
      return [];
    } catch (error) {
      console.error('Error getting accounts:', error);
      return [];
    }
  }

  /**
   * Request wallet connection
   */
  async kaia_requestAccounts(): Promise<string[]> {
    try {
      if (typeof window !== 'undefined' && window.kaia_requestAccounts) {
        return await window.kaia_requestAccounts();
      }
      
      // Fallback to ethereum provider
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        return accounts || [];
      }
      
      throw new Error('No wallet provider found');
    } catch (error) {
      console.error('Error requesting accounts:', error);
      throw error;
    }
  }

  /**
   * Get wallet balance
   */
  async kaia_getBalance(address: string): Promise<string> {
    try {
      if (typeof window !== 'undefined' && window.kaia_getBalance) {
        return await window.kaia_getBalance(address);
      }
      
      // Fallback to ethereum provider
      if (window.ethereum) {
        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [address, 'latest']
        });
        return (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4);
      }
      
      throw new Error('No wallet provider found');
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }

  /**
   * Get wallet type
   */
  getWalletType(): string {
    try {
      if (typeof window !== 'undefined' && window.kaia_getWalletType) {
        return window.kaia_getWalletType();
      }
      
      // Detect wallet type based on available providers
      if (window.kaia_accounts) {
        return 'Kaia Wallet';
      } else if (window.ethereum?.isMetaMask) {
        return 'MetaMask';
      } else if (window.ethereum) {
        return 'Ethereum Wallet';
      }
      
      return 'Unknown';
    } catch (error) {
      console.error('Error getting wallet type:', error);
      return 'Unknown';
    }
  }

  /**
   * Send transaction
   */
  async kaia_sendTransaction(transaction: any): Promise<string> {
    try {
      if (typeof window !== 'undefined' && window.kaia_sendTransaction) {
        return await window.kaia_sendTransaction(transaction);
      }
      
      // Fallback to ethereum provider
      if (window.ethereum) {
        return await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [transaction]
        });
      }
      
      throw new Error('No wallet provider found');
    } catch (error) {
      console.error('Error sending transaction:', error);
      throw error;
    }
  }

  /**
   * Sign message
   */
  async kaia_signMessage(message: string): Promise<string> {
    try {
      if (typeof window !== 'undefined' && window.kaia_signMessage) {
        return await window.kaia_signMessage(message);
      }
      
      // Fallback to ethereum provider
      if (window.ethereum) {
        const accounts = await this.kaia_accounts();
        if (accounts.length === 0) {
          throw new Error('No accounts connected');
        }
        
        return await window.ethereum.request({
          method: 'personal_sign',
          params: [message, accounts[0]]
        });
      }
      
      throw new Error('No wallet provider found');
    } catch (error) {
      console.error('Error signing message:', error);
      throw error;
    }
  }

  /**
   * Switch network
   */
  async kaia_switchNetwork(chainId: string): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.kaia_switchNetwork) {
        return await window.kaia_switchNetwork(chainId);
      }
      
      // Fallback to ethereum provider
      if (window.ethereum) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId }]
        });
      }
    } catch (error) {
      console.error('Error switching network:', error);
      throw error;
    }
  }

  /**
   * Add network
   */
  async kaia_addNetwork(networkConfig: any): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.kaia_addNetwork) {
        return await window.kaia_addNetwork(networkConfig);
      }
      
      // Fallback to ethereum provider
      if (window.ethereum) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [networkConfig]
        });
      }
    } catch (error) {
      console.error('Error adding network:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive wallet info
   */
  async getWalletInfo(): Promise<WalletInfo> {
    try {
      const accounts = await this.kaia_accounts();
      
      if (accounts.length === 0) {
        return {
          address: null,
          balance: null,
          walletType: null,
          chainId: null
        };
      }

      const address = accounts[0];
      const balance = await this.kaia_getBalance(address);
      const walletType = this.getWalletType();
      
      // Get chain ID
      let chainId = null;
      if (window.ethereum) {
        chainId = parseInt(window.ethereum.chainId, 16);
      }

      return {
        address,
        balance,
        walletType,
        chainId
      };
    } catch (error) {
      console.error('Error getting wallet info:', error);
      return {
        address: null,
        balance: null,
        walletType: null,
        chainId: null
      };
    }
  }

  /**
   * Check if running in LINE environment
   */
  isLineEnvironment(): boolean {
    return typeof window !== 'undefined' && 
           (window.navigator.userAgent.includes('Line') || 
            window.location.href.includes('line.me'));
  }

  /**
   * Check if running in Web environment
   */
  isWebEnvironment(): boolean {
    return typeof window !== 'undefined' && 
           !this.isLineEnvironment();
  }
}

// Create singleton instance
export const miniDappSDK = new MiniDappSDK();

// Export individual functions for convenience
export const {
  kaia_accounts,
  kaia_requestAccounts,
  kaia_getBalance,
  kaia_sendTransaction,
  kaia_signMessage,
  getWalletType,
  kaia_switchNetwork,
  kaia_addNetwork,
  getWalletInfo,
  isLineEnvironment,
  isWebEnvironment
} = miniDappSDK;

