import { ethers, Contract } from 'ethers';
import { CONFIG } from '../config';
import { Logger } from '../utils/logger';

// Simplified ABI for demonstration - in production, use actual ABI files
const GASLESS_VAULT_ABI = [
  "function executeGaslessDeposit(address user, uint256 assets, address receiver, uint256 nonce, bytes signature) external",
  "function executeGaslessWithdraw(address user, uint256 assets, address receiver, address owner, uint256 nonce, bytes signature) external",
  "function executeGaslessMint(address user, uint256 shares, address receiver, uint256 nonce, bytes signature) external",
  "function executeGaslessRedeem(address user, uint256 shares, address receiver, address owner, uint256 nonce, bytes signature) external",
  "function nonces(address user) external view returns (uint256)",
  "function totalAssets() external view returns (uint256)",
  "function getCurrentAPY() external view returns (uint256)"
];

const STRATEGY_MANAGER_ABI = [
  "function getStrategyAllocations() external view returns (address[] strategies, uint256[] allocations)",
  "function rebalance(address fromStrategy, address toStrategy, uint256 amount) external",
  "function harvest(string strategy) external",
  "function totalAssets() external view returns (uint256)"
];

export class ContractService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private gaslessVaultContract: Contract;
  private strategyManagerContract: Contract;

  constructor(provider: ethers.JsonRpcProvider) {
    this.provider = provider;
    this.wallet = new ethers.Wallet(CONFIG.kaia.walletPrivateKey, provider);
    
    // Initialize contracts
    this.gaslessVaultContract = new ethers.Contract(
      CONFIG.contracts.gaslessVaultAddress,
      GASLESS_VAULT_ABI,
      provider
    );
    
    this.strategyManagerContract = new ethers.Contract(
      CONFIG.contracts.strategyManagerAddress,
      STRATEGY_MANAGER_ABI,
      provider
    );
  }

  // Gasless transaction methods
  async executeGaslessDeposit(
    user: string,
    assets: string,
    receiver: string,
    nonce: string,
    signature: string,
    gasPrice: number
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      const contractWithSigner = this.gaslessVaultContract.connect(this.wallet);
      
      return await contractWithSigner['executeGaslessDeposit'](
        user,
        ethers.parseUnits(assets, 6), // USDT has 6 decimals
        receiver,
        nonce,
        signature,
        {
          gasPrice: ethers.parseUnits(gasPrice.toString(), 'gwei'),
          gasLimit: 500000
        }
      );
    } catch (error) {
      Logger.error('Failed to execute gasless deposit', error);
      throw error;
    }
  }

  async executeGaslessWithdraw(
    user: string,
    assets: string,
    receiver: string,
    owner: string,
    nonce: string,
    signature: string,
    gasPrice: number
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      const contractWithSigner = this.gaslessVaultContract.connect(this.wallet);
      
      return await contractWithSigner.executeGaslessWithdraw(
        user,
        ethers.parseUnits(assets, 6), // USDT has 6 decimals
        receiver,
        owner,
        nonce,
        signature,
        {
          gasPrice: ethers.parseUnits(gasPrice.toString(), 'gwei'),
          gasLimit: 500000
        }
      );
    } catch (error) {
      Logger.error('Failed to execute gasless withdraw', error);
      throw error;
    }
  }

  async executeGaslessMint(
    user: string,
    shares: string,
    receiver: string,
    nonce: string,
    signature: string,
    gasPrice: number
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      const contractWithSigner = this.gaslessVaultContract.connect(this.wallet);
      
      return await contractWithSigner.executeGaslessMint(
        user,
        ethers.parseUnits(shares, 18), // Vault shares have 18 decimals
        receiver,
        nonce,
        signature,
        {
          gasPrice: ethers.parseUnits(gasPrice.toString(), 'gwei'),
          gasLimit: 500000
        }
      );
    } catch (error) {
      Logger.error('Failed to execute gasless mint', error);
      throw error;
    }
  }

  async executeGaslessRedeem(
    user: string,
    shares: string,
    receiver: string,
    owner: string,
    nonce: string,
    signature: string,
    gasPrice: number
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      const contractWithSigner = this.gaslessVaultContract.connect(this.wallet);
      
      return await contractWithSigner.executeGaslessRedeem(
        user,
        ethers.parseUnits(shares, 18), // Vault shares have 18 decimals
        receiver,
        owner,
        nonce,
        signature,
        {
          gasPrice: ethers.parseUnits(gasPrice.toString(), 'gwei'),
          gasLimit: 500000
        }
      );
    } catch (error) {
      Logger.error('Failed to execute gasless redeem', error);
      throw error;
    }
  }

  async getUserNonce(userAddress: string): Promise<bigint> {
    try {
      return await this.gaslessVaultContract.nonces(userAddress);
    } catch (error) {
      Logger.error('Failed to get user nonce', error);
      throw error;
    }
  }

  // Strategy management methods
  async getStrategyAllocations(): Promise<{ [key: string]: number }> {
    try {
      const [strategies, allocations] = await this.strategyManagerContract.getStrategyAllocations();
      
      const result: { [key: string]: number } = {};
      for (let i = 0; i < strategies.length; i++) {
        const strategyAddress = strategies[i];
        const allocation = parseFloat(ethers.formatUnits(allocations[i], 2)); // Basis points
        
        // Map strategy addresses to names
        const strategyName = this.getStrategyName(strategyAddress);
        result[strategyName] = allocation;
      }
      
      return result;
    } catch (error) {
      Logger.error('Failed to get strategy allocations', error);
      // Return mock data for development
      return {
        aave: 5000, // 50%
        klayswap: 3000, // 30%
        compound: 2000 // 20%
      };
    }
  }

  async rebalance(
    fromStrategy: string,
    toStrategy: string,
    amount: number
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      const contractWithSigner = this.strategyManagerContract.connect(this.wallet);
      
      return await contractWithSigner['rebalance'](
        fromStrategy,
        toStrategy,
        ethers.parseUnits(amount.toString(), 6) // USDT has 6 decimals
      );
    } catch (error) {
      Logger.error('Failed to execute rebalance', error);
      throw error;
    }
  }

  async harvestYield(strategy: string): Promise<ethers.ContractTransactionResponse> {
    try {
      const contractWithSigner = this.strategyManagerContract.connect(this.wallet);
      
      return await contractWithSigner['harvest'](strategy);
    } catch (error) {
      Logger.error('Failed to harvest yield', error);
      throw error;
    }
  }

  async getTotalTVL(): Promise<number> {
    try {
      const tvl = await this.gaslessVaultContract['totalAssets']();
      return parseFloat(ethers.formatUnits(tvl, 6)); // USDT has 6 decimals
    } catch (error) {
      Logger.error('Failed to get total TVL', error);
      throw error;
    }
  }

  async getCurrentAPY(): Promise<number> {
    try {
      const apy = await this.gaslessVaultContract['getCurrentAPY']();
      return parseFloat(ethers.formatUnits(apy, 2)); // APY in basis points
    } catch (error) {
      Logger.error('Failed to get current APY', error);
      throw error;
    }
  }

  async estimateGas(method: string, params: any[]): Promise<bigint> {
    try {
      let contract: Contract;
      
      // Determine which contract to use based on method
      if (method.startsWith('executeGasless')) {
        contract = this.gaslessVaultContract;
      } else {
        contract = this.strategyManagerContract;
      }
      
      // Estimate gas for the method
      const gasEstimate = await contract['estimateGas'][method](...params);
      return gasEstimate;
    } catch (error) {
      Logger.error('Failed to estimate gas', error);
      throw error;
    }
  }

  private getStrategyName(strategyAddress: string): string {
    // Map strategy addresses to names
      const strategyMap: { [key: string]: string } = {
        [CONFIG.strategies['aave'].address]: 'aave',
        [CONFIG.strategies['klayswap'].address]: 'klayswap',
        [CONFIG.strategies['compound'].address]: 'compound'
      };
    
    return strategyMap[strategyAddress.toLowerCase()] || 'unknown';
  }

  // Utility methods
  async getGasPrice(): Promise<number> {
    try {
      const feeData = await this.provider.getFeeData();
      return parseFloat(ethers.formatUnits(feeData.gasPrice || 0, 'gwei'));
    } catch (error) {
      Logger.error('Failed to get gas price', error);
      return 20; // Default fallback
    }
  }

  async getBlockNumber(): Promise<number> {
    try {
      return await this.provider.getBlockNumber();
    } catch (error) {
      Logger.error('Failed to get block number', error);
      throw error;
    }
  }

  async getNetworkInfo(): Promise<{ chainId: number; name: string }> {
    try {
      const network = await this.provider.getNetwork();
      return {
        chainId: Number(network.chainId),
        name: network.name
      };
    } catch (error) {
      Logger.error('Failed to get network info', error);
      throw error;
    }
  }
}
