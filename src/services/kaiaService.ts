import { ethers } from 'ethers';

// Kaia blockchain configuration
export const KAIA_CONFIG = {
  chainId: 8217,
  chainName: 'Kaia Mainnet',
  rpcUrl: import.meta.env.VITE_KAIA_RPC_URL || 'https://public-en.node.kaia.io',
  blockExplorer: 'https://kaiascan.io',
  nativeCurrency: {
    name: 'Kaia',
    symbol: 'KAIA',
    decimals: 18,
  },
};

// Kaia-native USDT configuration
export const KAIA_USDT_CONFIG = {
  address: import.meta.env.VITE_KAIA_USDT_CONTRACT_ADDRESS || '0x1234567890123456789012345678901234567890',
  decimals: 6,
  symbol: 'USDT',
  name: 'Tether USD (Kaia)',
};

// Kaia DeFi protocols configuration
export const KAIA_DEFI_CONFIG = {
  yieldVault: import.meta.env.VITE_KAIA_YIELD_VAULT_ADDRESS || '0x1234567890123456789012345678901234567890',
  lendingPool: import.meta.env.VITE_KAIA_LENDING_POOL_ADDRESS || '0x1234567890123456789012345678901234567890',
  tradingPool: import.meta.env.VITE_KAIA_TRADING_POOL_ADDRESS || '0x1234567890123456789012345678901234567890',
  rewardsContract: import.meta.env.VITE_KAIA_REWARDS_CONTRACT_ADDRESS || '0x1234567890123456789012345678901234567890',
  liquidityMining: import.meta.env.VITE_KAIA_LIQUIDITY_MINING_ADDRESS || '0x1234567890123456789012345678901234567890',
};

// Trade-and-Earn configuration
export const TRADE_AND_EARN_CONFIG = {
  minTradeAmount: '10', // Minimum USDT for trading
  maxTradeAmount: '10000', // Maximum USDT for trading
  rewardMultiplier: 1.5, // 1.5x rewards for trading
  liquidityRewardRate: 0.1, // 10% APY for liquidity provision
  tradingFeeRate: 0.003, // 0.3% trading fee
};

// Kaia service class
export class KaiaService {
  private provider: ethers.Provider | null = null;
  private signer: ethers.Signer | null = null;
  private usdtContract: ethers.Contract | null = null;

  constructor() {
    this.initializeProvider();
  }

  private async initializeProvider() {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      this.provider = new ethers.BrowserProvider((window as any).ethereum);
      
      // Check if we're on Kaia network
      const network = await this.provider.getNetwork();
      if (network.chainId !== BigInt(KAIA_CONFIG.chainId)) {
        await this.switchToKaiaNetwork();
      }
    }
  }

  async connectWallet(): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      // Request account access
      const accounts = await (window as any).ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      this.signer = await this.provider.getSigner();
      const address = await this.signer.getAddress();

      // Initialize USDT contract
      this.initializeUSDTContract();

      return address;
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw error;
    }
  }

  private async switchToKaiaNetwork() {
    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${KAIA_CONFIG.chainId.toString(16)}` }],
      });
    } catch (error: any) {
      // If the network doesn't exist, add it
      if (error.code === 4902) {
        await this.addKaiaNetwork();
      } else {
        throw error;
      }
    }
  }

  private async addKaiaNetwork() {
    await (window as any).ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: `0x${KAIA_CONFIG.chainId.toString(16)}`,
          chainName: KAIA_CONFIG.chainName,
          rpcUrls: [KAIA_CONFIG.rpcUrl],
          blockExplorerUrls: [KAIA_CONFIG.blockExplorer],
          nativeCurrency: KAIA_CONFIG.nativeCurrency,
        },
      ],
    });
  }

  private initializeUSDTContract() {
    if (!this.signer) return;

    // ERC-20 ABI for USDT
    const erc20Abi = [
      'function balanceOf(address owner) view returns (uint256)',
      'function transfer(address to, uint256 amount) returns (bool)',
      'function approve(address spender, uint256 amount) returns (bool)',
      'function allowance(address owner, address spender) view returns (uint256)',
      'function decimals() view returns (uint8)',
      'function symbol() view returns (string)',
      'function name() view returns (string)',
      'event Transfer(address indexed from, address indexed to, uint256 value)',
      'event Approval(address indexed owner, address indexed spender, uint256 value)',
    ];

    this.usdtContract = new ethers.Contract(
      KAIA_USDT_CONFIG.address,
      erc20Abi,
      this.signer
    );
  }

  // Kaia-native USDT operations
  async getUSDTBalance(address?: string): Promise<string> {
    if (!this.usdtContract) {
      throw new Error('USDT contract not initialized');
    }

    const targetAddress = address || (this.signer ? await this.signer.getAddress() : '');
    const balance = await this.usdtContract.balanceOf(targetAddress);
    return ethers.formatUnits(balance, KAIA_USDT_CONFIG.decimals);
  }

  async transferUSDT(to: string, amount: string): Promise<ethers.TransactionResponse> {
    if (!this.usdtContract || !this.signer) {
      throw new Error('Contract or signer not initialized');
    }

    const amountWei = ethers.parseUnits(amount, KAIA_USDT_CONFIG.decimals);
    const tx = await this.usdtContract.transfer(to, amountWei);
    return tx;
  }

  async approveUSDT(spender: string, amount: string): Promise<ethers.TransactionResponse> {
    if (!this.usdtContract || !this.signer) {
      throw new Error('Contract or signer not initialized');
    }

    const amountWei = ethers.parseUnits(amount, KAIA_USDT_CONFIG.decimals);
    const tx = await this.usdtContract.approve(spender, amountWei);
    return tx;
  }

  // Kaia DeFi operations
  async depositToYieldVault(amount: string): Promise<ethers.TransactionResponse> {
    if (!this.signer) {
      throw new Error('Signer not initialized');
    }

    // First approve the vault to spend USDT
    await this.approveUSDT(KAIA_DEFI_CONFIG.yieldVault, amount);

    // Then deposit to yield vault
    const vaultAbi = [
      'function deposit(uint256 amount) returns (uint256)',
    ];

    const vaultContract = new ethers.Contract(
      KAIA_DEFI_CONFIG.yieldVault,
      vaultAbi,
      this.signer
    );

    const amountWei = ethers.parseUnits(amount, KAIA_USDT_CONFIG.decimals);
    const tx = await vaultContract.deposit(amountWei);
    return tx;
  }

  async withdrawFromYieldVault(amount: string): Promise<ethers.TransactionResponse> {
    if (!this.signer) {
      throw new Error('Signer not initialized');
    }

    const vaultAbi = [
      'function withdraw(uint256 amount) returns (uint256)',
    ];

    const vaultContract = new ethers.Contract(
      KAIA_DEFI_CONFIG.yieldVault,
      vaultAbi,
      this.signer
    );

    const amountWei = ethers.parseUnits(amount, KAIA_USDT_CONFIG.decimals);
    const tx = await vaultContract.withdraw(amountWei);
    return tx;
  }

  async getYieldVaultBalance(): Promise<string> {
    if (!this.signer) {
      throw new Error('Signer not initialized');
    }

    const vaultAbi = [
      'function balanceOf(address account) view returns (uint256)',
    ];

    const vaultContract = new ethers.Contract(
      KAIA_DEFI_CONFIG.yieldVault,
      vaultAbi,
      this.signer
    );

    const address = await this.signer.getAddress();
    const balance = await vaultContract.balanceOf(address);
    return ethers.formatUnits(balance, KAIA_USDT_CONFIG.decimals);
  }

  // Trade-and-Earn operations
  async executeTrade(
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    minAmountOut: string
  ): Promise<ethers.TransactionResponse> {
    if (!this.signer) {
      throw new Error('Signer not initialized');
    }

    // Approve trading pool to spend USDT
    await this.approveUSDT(KAIA_DEFI_CONFIG.tradingPool, amountIn);

    const tradingAbi = [
      'function swapExactTokensForTokens(uint256 amountIn, uint256 minAmountOut, address[] calldata path, address to, uint256 deadline) returns (uint256[] memory amounts)',
    ];

    const tradingContract = new ethers.Contract(
      KAIA_DEFI_CONFIG.tradingPool,
      tradingAbi,
      this.signer
    );

    const amountInWei = ethers.parseUnits(amountIn, KAIA_USDT_CONFIG.decimals);
    const minAmountOutWei = ethers.parseUnits(minAmountOut, KAIA_USDT_CONFIG.decimals);
    const path = [tokenIn, tokenOut];
    const deadline = Math.floor(Date.now() / 1000) + 1800; // 30 minutes

    const tx = await tradingContract.swapExactTokensForTokens(
      amountInWei,
      minAmountOutWei,
      path,
      await this.signer.getAddress(),
      deadline
    );

    return tx;
  }

  async provideLiquidity(
    tokenA: string,
    tokenB: string,
    amountA: string,
    amountB: string
  ): Promise<ethers.TransactionResponse> {
    if (!this.signer) {
      throw new Error('Signer not initialized');
    }

    // Approve both tokens
    await this.approveUSDT(KAIA_DEFI_CONFIG.tradingPool, amountA);

    const liquidityAbi = [
      'function addLiquidity(address tokenA, address tokenB, uint256 amountADesired, uint256 amountBDesired, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) returns (uint256 amountA, uint256 amountB, uint256 liquidity)',
    ];

    const liquidityContract = new ethers.Contract(
      KAIA_DEFI_CONFIG.tradingPool,
      liquidityAbi,
      this.signer
    );

    const amountAWei = ethers.parseUnits(amountA, KAIA_USDT_CONFIG.decimals);
    const amountBWei = ethers.parseUnits(amountB, KAIA_USDT_CONFIG.decimals);
    const deadline = Math.floor(Date.now() / 1000) + 1800; // 30 minutes

    const tx = await liquidityContract.addLiquidity(
      tokenA,
      tokenB,
      amountAWei,
      amountBWei,
      amountAWei * 95n / 100n, // 5% slippage tolerance
      amountBWei * 95n / 100n,
      await this.signer.getAddress(),
      deadline
    );

    return tx;
  }

  async claimRewards(): Promise<ethers.TransactionResponse> {
    if (!this.signer) {
      throw new Error('Signer not initialized');
    }

    const rewardsAbi = [
      'function claimRewards() returns (uint256)',
    ];

    const rewardsContract = new ethers.Contract(
      KAIA_DEFI_CONFIG.rewardsContract,
      rewardsAbi,
      this.signer
    );

    const tx = await rewardsContract.claimRewards();
    return tx;
  }

  async getPendingRewards(): Promise<string> {
    if (!this.signer) {
      throw new Error('Signer not initialized');
    }

    const rewardsAbi = [
      'function pendingRewards(address account) view returns (uint256)',
    ];

    const rewardsContract = new ethers.Contract(
      KAIA_DEFI_CONFIG.rewardsContract,
      rewardsAbi,
      this.signer
    );

    const address = await this.signer.getAddress();
    const rewards = await rewardsContract.pendingRewards(address);
    return ethers.formatUnits(rewards, KAIA_USDT_CONFIG.decimals);
  }

  // Utility functions
  async getKaiaBalance(): Promise<string> {
    if (!this.signer) {
      throw new Error('Signer not initialized');
    }

    const address = await this.signer.getAddress();
    const balance = await this.provider!.getBalance(address);
    return ethers.formatEther(balance);
  }

  async getTransactionHistory(address: string, limit: number = 10): Promise<any[]> {
    // This would typically call a block explorer API
    // For now, return mock data
    return [
      {
        hash: '0x1234567890123456789012345678901234567890',
        from: address,
        to: KAIA_USDT_CONFIG.address,
        value: '100.0',
        timestamp: Date.now() - 3600000,
        type: 'transfer',
      },
    ];
  }

  // Kaia ecosystem specific functions
  async getKaiaNetworkInfo() {
    return {
      chainId: KAIA_CONFIG.chainId,
      chainName: KAIA_CONFIG.chainName,
      rpcUrl: KAIA_CONFIG.rpcUrl,
      blockExplorer: KAIA_CONFIG.blockExplorer,
      nativeCurrency: KAIA_CONFIG.nativeCurrency,
    };
  }

  async getKaiaDefiStats() {
    // This would typically call DeFi protocol APIs
    return {
      totalValueLocked: '1000000',
      totalVolume24h: '50000',
      activeUsers: '1500',
      apy: '8.64',
    };
  }
}

// Export singleton instance
export const kaiaService = new KaiaService();

export default kaiaService;
