import { BrowserProvider, formatEther } from 'ethers';

export interface WalletConnectionOptions {
  type: 'metamask' | 'line' | 'walletconnect';
  chainId?: number;
}

export class WalletService {
  private provider: BrowserProvider | null = null;

  async connect(options: WalletConnectionOptions): Promise<string | null> {
    try {
      if (options.type === 'metamask') {
        return this.connectMetaMask(options.chainId);
      } else if (options.type === 'line') {
        return this.connectLineWallet(options.chainId);
      }
      throw new Error(`Unsupported wallet type: ${options.type}`);
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw error;
    }
  }

  private async connectMetaMask(chainId?: number): Promise<string | null> {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    this.provider = new BrowserProvider(window.ethereum);
    
    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    if (chainId) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${chainId.toString(16)}` }],
        });
      } catch (switchError: any) {
        // If network doesn't exist, add it
        if (switchError.code === 4902) {
          await this.addKaiaNetwork(chainId);
        } else {
          throw switchError;
        }
      }
    }

    return accounts[0] || null;
  }

  private async connectLineWallet(chainId?: number): Promise<string | null> {
    // For LIFF, we'll use a mock implementation
    // In a real implementation, this would integrate with LINE's wallet
    if (typeof window !== 'undefined' && (window as any).lineWallet) {
      const accounts = await (window as any).lineWallet.request({
        method: 'eth_requestAccounts'
      });
      return accounts[0] || null;
    }
    
    // Fallback for development
    return '0x742d35Cc6634C0532925a3b8D8C8d6C7B8b8b8b8';
  }

  private async addKaiaNetwork(chainId?: number): Promise<void> {
    const isMainnet = chainId === 8217;
    
    const networkConfig = isMainnet ? {
      chainId: '0x2011', // 8217 in hex
      chainName: 'Kaia Mainnet',
      nativeCurrency: {
        name: 'KAIA',
        symbol: 'KAIA',
        decimals: 18,
      },
      rpcUrls: ['https://rpc.kaia.one'],
      blockExplorerUrls: ['https://kaiascan.io'],
    } : {
      chainId: '0x3e9', // 1001 in hex
      chainName: 'Kaia Testnet',
      nativeCurrency: {
        name: 'KAIA',
        symbol: 'KAIA',
        decimals: 18,
      },
      rpcUrls: ['https://api.baobab.kaia.io'],
      blockExplorerUrls: ['https://baobab.kaiascan.io'],
    };

    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [networkConfig],
    });
  }

  getProvider(): BrowserProvider | null {
    return this.provider;
  }

  async getBalance(address: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    
    const balance = await this.provider.getBalance(address);
    return formatEther(balance);
  }

  async getNetwork(): Promise<any> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    
    return this.provider.getNetwork();
  }
}