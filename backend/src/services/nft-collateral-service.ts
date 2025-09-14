import { ethers } from 'ethers';
import { Logger } from '../utils/logger';
import { CONFIG } from '../config';

export interface NFTCollateralPosition {
  positionId: string;
  owner: string;
  nftContract: string;
  tokenId: string;
  collateralValue: string;
  loanAmount: string;
  interestAccrued: string;
  lastInterestUpdate: number;
  createdAt: number;
  active: boolean;
  liquidated: boolean;
}

export interface NFTCollection {
  contractAddress: string;
  supported: boolean;
  maxLTV: number;
  liquidationThreshold: number;
  interestRate: number;
  active: boolean;
}

export interface NFTOwnership {
  contractAddress: string;
  tokenId: string;
  name?: string;
  image?: string;
  metadata?: any;
}

export interface BorrowRequest {
  nftContract: string;
  tokenId: string;
  borrowAmount: string;
  userAddress: string;
}

export interface RepayRequest {
  positionId: string;
  repayAmount: string;
  userAddress: string;
}

export interface LiquidationRequest {
  positionId: string;
  liquidatorAddress: string;
}

export class NFTCollateralService {
  private provider: ethers.Provider;
  private wallet: ethers.Wallet;
  private nftCollateralVault: ethers.Contract;
  private nftPriceOracle: ethers.Contract;
  private liquidationEngine: ethers.Contract;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(CONFIG.kaia.rpcUrl);
    this.wallet = new ethers.Wallet(CONFIG.wallet.privateKey, this.provider);
    
    // Initialize contracts (addresses should be in config)
    this.nftCollateralVault = new ethers.Contract(
      CONFIG.contracts.nftCollateralVaultAddress,
      this.getNFTCollateralVaultABI(),
      this.wallet
    );
    
    this.nftPriceOracle = new ethers.Contract(
      CONFIG.contracts.nftPriceOracleAddress,
      this.getNFTPriceOracleABI(),
      this.wallet
    );
    
    this.liquidationEngine = new ethers.Contract(
      CONFIG.contracts.liquidationEngineAddress,
      this.getLiquidationEngineABI(),
      this.wallet
    );
  }

  /**
   * Get user's NFT positions
   */
  async getUserPositions(userAddress: string): Promise<NFTCollateralPosition[]> {
    try {
      const positionIds = await this.nftCollateralVault.getUserPositions(userAddress);
      const positions: NFTCollateralPosition[] = [];

      for (const positionId of positionIds) {
        const position = await this.getPosition(positionId);
        if (position) {
          positions.push(position);
        }
      }

      return positions;
    } catch (error) {
      Logger.error('Failed to get user positions', error);
      throw new Error('Failed to get user positions');
    }
  }

  /**
   * Get position details
   */
  async getPosition(positionId: string): Promise<NFTCollateralPosition | null> {
    try {
      const position = await this.nftCollateralVault.getPosition(positionId);
      
      if (!position.active) {
        return null;
      }

      return {
        positionId,
        owner: position.owner,
        nftContract: position.nftContract,
        tokenId: position.tokenId.toString(),
        collateralValue: ethers.formatUnits(position.collateralValue, 6),
        loanAmount: ethers.formatUnits(position.loanAmount, 6),
        interestAccrued: ethers.formatUnits(position.interestAccrued, 6),
        lastInterestUpdate: Number(position.lastInterestUpdate),
        createdAt: Number(position.createdAt),
        active: position.active,
        liquidated: position.liquidated,
      };
    } catch (error) {
      Logger.error('Failed to get position', error);
      return null;
    }
  }

  /**
   * Get supported NFT collections
   */
  async getSupportedCollections(): Promise<NFTCollection[]> {
    try {
      // This would typically come from a database or contract events
      // For now, return mock data
      return [
        {
          contractAddress: '0x1234567890123456789012345678901234567890',
          supported: true,
          maxLTV: 7000, // 70%
          liquidationThreshold: 8000, // 80%
          interestRate: 500, // 5%
          active: true,
        },
        {
          contractAddress: '0x2345678901234567890123456789012345678901',
          supported: true,
          maxLTV: 6000, // 60%
          liquidationThreshold: 7500, // 75%
          interestRate: 750, // 7.5%
          active: true,
        },
      ];
    } catch (error) {
      Logger.error('Failed to get supported collections', error);
      throw new Error('Failed to get supported collections');
    }
  }

  /**
   * Get user's NFT ownership
   */
  async getUserNFTs(userAddress: string): Promise<NFTOwnership[]> {
    try {
      // This would typically query NFT ownership from blockchain or indexing service
      // For now, return mock data
      return [
        {
          contractAddress: '0x1234567890123456789012345678901234567890',
          tokenId: '1',
          name: 'Cool NFT #1',
          image: 'https://example.com/nft1.png',
        },
        {
          contractAddress: '0x1234567890123456789012345678901234567890',
          tokenId: '2',
          name: 'Cool NFT #2',
          image: 'https://example.com/nft2.png',
        },
      ];
    } catch (error) {
      Logger.error('Failed to get user NFTs', error);
      throw new Error('Failed to get user NFTs');
    }
  }

  /**
   * Get NFT value from oracle
   */
  async getNFTValue(nftContract: string, tokenId: string): Promise<string> {
    try {
      const value = await this.nftPriceOracle.getNFTValue(nftContract, tokenId);
      return ethers.formatUnits(value, 6);
    } catch (error) {
      Logger.error('Failed to get NFT value', error);
      throw new Error('Failed to get NFT value');
    }
  }

  /**
   * Calculate maximum borrow amount
   */
  async calculateMaxBorrow(nftContract: string, tokenId: string): Promise<string> {
    try {
      const value = await this.getNFTValue(nftContract, tokenId);
      const collections = await this.getSupportedCollections();
      const collection = collections.find(c => c.contractAddress.toLowerCase() === nftContract.toLowerCase());
      
      if (!collection) {
        throw new Error('Collection not supported');
      }

      const maxBorrow = (parseFloat(value) * collection.maxLTV) / 10000;
      return maxBorrow.toString();
    } catch (error) {
      Logger.error('Failed to calculate max borrow', error);
      throw new Error('Failed to calculate max borrow');
    }
  }

  /**
   * Check if position is liquidatable
   */
  async isPositionLiquidatable(positionId: string): Promise<boolean> {
    try {
      const position = await this.getPosition(positionId);
      if (!position) return false;

      const collections = await this.getSupportedCollections();
      const collection = collections.find(c => c.contractAddress.toLowerCase() === position.nftContract.toLowerCase());
      
      if (!collection) return false;

      const totalDebt = parseFloat(position.loanAmount) + parseFloat(position.interestAccrued);
      const collateralRatio = (parseFloat(position.collateralValue) * 10000) / totalDebt;

      return collateralRatio < collection.liquidationThreshold;
    } catch (error) {
      Logger.error('Failed to check liquidation status', error);
      return false;
    }
  }

  /**
   * Get vault statistics
   */
  async getVaultStats(): Promise<{
    totalCollateralValue: string;
    totalLoanAmount: string;
    totalInterestAccrued: string;
    vaultLiquidity: string;
  }> {
    try {
      const stats = await this.nftCollateralVault.getVaultStats();
      
      return {
        totalCollateralValue: ethers.formatUnits(stats[0], 6),
        totalLoanAmount: ethers.formatUnits(stats[1], 6),
        totalInterestAccrued: ethers.formatUnits(stats[2], 6),
        vaultLiquidity: ethers.formatUnits(stats[3], 6),
      };
    } catch (error) {
      Logger.error('Failed to get vault stats', error);
      throw new Error('Failed to get vault stats');
    }
  }

  /**
   * Update NFT price in oracle
   */
  async updateNFTPrice(nftContract: string, tokenId: string, price: string): Promise<void> {
    try {
      const priceWei = ethers.parseUnits(price, 6);
      const tx = await this.nftPriceOracle.updateNFTPrice(nftContract, tokenId, priceWei);
      await tx.wait();
      
      Logger.info(`Updated NFT price: ${nftContract}:${tokenId} = ${price} USDT`);
    } catch (error) {
      Logger.error('Failed to update NFT price', error);
      throw new Error('Failed to update NFT price');
    }
  }

  /**
   * Update collection floor price
   */
  async updateFloorPrice(nftContract: string, floorPrice: string): Promise<void> {
    try {
      const priceWei = ethers.parseUnits(floorPrice, 6);
      const tx = await this.nftPriceOracle.updateFloorPrice(nftContract, priceWei);
      await tx.wait();
      
      Logger.info(`Updated floor price: ${nftContract} = ${floorPrice} USDT`);
    } catch (error) {
      Logger.error('Failed to update floor price', error);
      throw new Error('Failed to update floor price');
    }
  }

  /**
   * Add NFT collection
   */
  async addCollection(
    nftContract: string,
    maxLTV: number,
    liquidationThreshold: number,
    interestRate: number
  ): Promise<void> {
    try {
      const tx = await this.nftCollateralVault.addNFTCollection(
        nftContract,
        maxLTV,
        liquidationThreshold,
        interestRate
      );
      await tx.wait();
      
      Logger.info(`Added NFT collection: ${nftContract}`);
    } catch (error) {
      Logger.error('Failed to add collection', error);
      throw new Error('Failed to add collection');
    }
  }

  /**
   * Get liquidation parameters
   */
  async getLiquidationParameters(): Promise<{
    liquidationBonusBps: number;
    maxLiquidationRatio: number;
  }> {
    try {
      const params = await this.liquidationEngine.getLiquidationParameters();
      
      return {
        liquidationBonusBps: Number(params[0]),
        maxLiquidationRatio: Number(params[1]),
      };
    } catch (error) {
      Logger.error('Failed to get liquidation parameters', error);
      throw new Error('Failed to get liquidation parameters');
    }
  }

  /**
   * Calculate liquidation amount
   */
  async calculateLiquidationAmount(collateralValue: string, totalDebt: string): Promise<string> {
    try {
      const collateralWei = ethers.parseUnits(collateralValue, 6);
      const debtWei = ethers.parseUnits(totalDebt, 6);
      
      const liquidationAmount = await this.liquidationEngine.calculateLiquidationAmount(
        collateralWei,
        debtWei
      );
      
      return ethers.formatUnits(liquidationAmount, 6);
    } catch (error) {
      Logger.error('Failed to calculate liquidation amount', error);
      throw new Error('Failed to calculate liquidation amount');
    }
  }

  /**
   * Get contract ABIs (simplified versions)
   */
  private getNFTCollateralVaultABI(): any[] {
    return [
      'function getUserPositions(address user) external view returns (bytes32[])',
      'function getPosition(bytes32 positionId) external view returns (tuple(address owner, address nftContract, uint256 tokenId, uint256 collateralValue, uint256 loanAmount, uint256 interestAccrued, uint256 lastInterestUpdate, uint256 createdAt, bool active, bool liquidated))',
      'function getVaultStats() external view returns (uint256, uint256, uint256, uint256)',
      'function addNFTCollection(address nftContract, uint256 maxLTV, uint256 liquidationThreshold, uint256 interestRate) external',
      'function depositNFTAndBorrow(address nftContract, uint256 tokenId, uint256 borrowAmount) external',
      'function repayLoan(bytes32 positionId, uint256 repayAmount) external',
      'function withdrawNFT(bytes32 positionId) external',
      'function liquidatePosition(bytes32 positionId) external',
    ];
  }

  private getNFTPriceOracleABI(): any[] {
    return [
      'function getNFTValue(address nftContract, uint256 tokenId) external view returns (uint256)',
      'function getFloorPrice(address nftContract) external view returns (uint256)',
      'function updateNFTPrice(address nftContract, uint256 tokenId, uint256 price) external',
      'function updateFloorPrice(address nftContract, uint256 floorPrice) external',
      'function isPriceAvailable(address nftContract, uint256 tokenId) external view returns (bool)',
    ];
  }

  private getLiquidationEngineABI(): any[] {
    return [
      'function getLiquidationParameters() external view returns (uint256, uint256)',
      'function calculateLiquidationAmount(uint256 collateralValue, uint256 totalDebt) external pure returns (uint256)',
      'function calculateLiquidationBonus(uint256 collateralValue, uint256 liquidationAmount) external view returns (uint256)',
      'function isLiquidatable(uint256 collateralValue, uint256 totalDebt, uint256 liquidationThreshold) external pure returns (bool)',
    ];
  }
}

// Singleton instance
export const nftCollateralService = new NFTCollateralService();



