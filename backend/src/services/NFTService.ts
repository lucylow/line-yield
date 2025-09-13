import { ethers } from 'ethers';
import { CONFIG } from '../config';
import { Logger } from '../utils/logger';
import { createClient } from '@supabase/supabase-js';

const logger = new Logger('NFTService');

// Initialize Supabase client with service role key (backend only)
const supabase = createClient(CONFIG.supabase.url, CONFIG.supabase.serviceRoleKey);

export interface NFTTier {
  tier: number;
  threshold: number;
  name: string;
  uri: string;
  maxSupply: number;
  currentSupply: number;
}

export interface UserNFTCollection {
  tokenIds: number[];
  tiers: number[];
  uris: string[];
  names: string[];
}

export interface UserTierInfo {
  currentTier: number;
  tierName: string;
  points: number;
  nextTier?: {
    tier: number;
    pointsNeeded: number;
    tierName: string;
    tierURI: string;
  };
}

export interface NFTMintResult {
  success: boolean;
  tokenId?: number;
  tier?: number;
  tierName?: string;
  error?: string;
}

export class NFTService {
  private static instance: NFTService;
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;
  private isInitialized: boolean = false;

  // NFT Tier configurations
  private readonly NFT_TIERS = [
    {
      tier: 0,
      threshold: 100,
      name: "Yield Novice",
      uri: "https://api.line-yield.com/nft/metadata/novice.json",
      maxSupply: 10000
    },
    {
      tier: 1,
      threshold: 500,
      name: "Yield Explorer",
      uri: "https://api.line-yield.com/nft/metadata/explorer.json",
      maxSupply: 5000
    },
    {
      tier: 2,
      threshold: 1000,
      name: "Yield Pioneer",
      uri: "https://api.line-yield.com/nft/metadata/pioneer.json",
      maxSupply: 2500
    },
    {
      tier: 3,
      threshold: 2500,
      name: "Yield Master",
      uri: "https://api.line-yield.com/nft/metadata/master.json",
      maxSupply: 1000
    },
    {
      tier: 4,
      threshold: 5000,
      name: "Yield Legend",
      uri: "https://api.line-yield.com/nft/metadata/legend.json",
      maxSupply: 500
    },
    {
      tier: 5,
      threshold: 10000,
      name: "Yield Titan",
      uri: "https://api.line-yield.com/nft/metadata/titan.json",
      maxSupply: 100
    }
  ];

  private constructor() {
    this.provider = new ethers.JsonRpcProvider(CONFIG.kaia.rpcUrl);
    this.wallet = new ethers.Wallet(CONFIG.kaia.walletPrivateKey, this.provider);
  }

  public static getInstance(): NFTService {
    if (!NFTService.instance) {
      NFTService.instance = new NFTService();
    }
    return NFTService.instance;
  }

  /**
   * Initialize the NFT service with contract address
   */
  public async initialize(contractAddress: string): Promise<void> {
    try {
      // Contract ABI (simplified for this example)
      const contractABI = [
        "function awardYieldPoints(address user, uint256 points, string memory reason) external",
        "function batchAwardYieldPoints(address[] memory users, uint256[] memory points, string memory reason) external",
        "function mintNFTReward() external",
        "function mintSpecificTier(address user, uint256 tier) external",
        "function getUserNFTCollection(address user) external view returns (uint256[] memory, uint256[] memory, string[] memory, string[] memory)",
        "function getUserCurrentTier(address user) external view returns (uint256, string memory)",
        "function getNextTierRequirements(address user) external view returns (uint256, uint256, string memory, string memory)",
        "function getAllTiers() external view returns (uint256[] memory, string[] memory, string[] memory, uint256[] memory, uint256[] memory)",
        "function yieldPoints(address user) external view returns (uint256)",
        "function tokensOfOwner(address owner) external view returns (uint256[] memory)",
        "event YieldPointsAwarded(address indexed user, uint256 points, string reason)",
        "event NFTMinted(address indexed user, uint256 tokenId, uint256 tier, string tokenURI)"
      ];

      this.contract = new ethers.Contract(contractAddress, contractABI, this.wallet);
      this.isInitialized = true;
      
      logger.info(`NFT Service initialized with contract: ${contractAddress}`);
    } catch (error) {
      logger.error('Failed to initialize NFT service:', error);
      throw new Error('Failed to initialize NFT service');
    }
  }

  /**
   * Award yield points to user
   */
  public async awardYieldPoints(
    userAddress: string, 
    points: number, 
    reason: string = 'system_reward'
  ): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('NFT Service not initialized');
    }

    try {
      const tx = await this.contract.awardYieldPoints(userAddress, points, reason);
      await tx.wait();
      
      logger.info(`Awarded ${points} yield points to ${userAddress} for ${reason}`);
      
      // Log to database
      await this.logYieldPointsAward(userAddress, points, reason, tx.hash);
    } catch (error) {
      logger.error('Failed to award yield points:', error);
      throw new Error('Failed to award yield points');
    }
  }

  /**
   * Batch award yield points to multiple users
   */
  public async batchAwardYieldPoints(
    users: string[], 
    points: number[], 
    reason: string = 'batch_reward'
  ): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('NFT Service not initialized');
    }

    try {
      const tx = await this.contract.batchAwardYieldPoints(users, points, reason);
      await tx.wait();
      
      logger.info(`Batch awarded yield points to ${users.length} users for ${reason}`);
      
      // Log to database
      await this.logBatchYieldPointsAward(users, points, reason, tx.hash);
    } catch (error) {
      logger.error('Failed to batch award yield points:', error);
      throw new Error('Failed to batch award yield points');
    }
  }

  /**
   * Mint NFT reward for user
   */
  public async mintNFTReward(userAddress: string): Promise<NFTMintResult> {
    if (!this.isInitialized) {
      throw new Error('NFT Service not initialized');
    }

    try {
      // Check if user has enough points
      const userPoints = await this.contract.yieldPoints(userAddress);
      if (userPoints === 0) {
        return { success: false, error: 'No yield points available' };
      }

      // Check what tier they can mint
      const tierInfo = await this.getUserTierInfo(userAddress);
      if (!tierInfo.nextTier) {
        return { success: false, error: 'No new NFT tier available to mint' };
      }

      // Create a transaction for the user to sign
      const mintTx = await this.contract.mintNFTReward.populateTransaction();
      
      return {
        success: true,
        tier: tierInfo.nextTier.tier,
        tierName: tierInfo.nextTier.tierName
      };
    } catch (error) {
      logger.error('Failed to mint NFT reward:', error);
      return { success: false, error: 'Failed to mint NFT reward' };
    }
  }

  /**
   * Get user's NFT collection
   */
  public async getUserNFTCollection(userAddress: string): Promise<UserNFTCollection> {
    if (!this.isInitialized) {
      throw new Error('NFT Service not initialized');
    }

    try {
      const [tokenIds, tiers, uris, names] = await this.contract.getUserNFTCollection(userAddress);
      
      return {
        tokenIds: tokenIds.map((id: any) => Number(id)),
        tiers: tiers.map((tier: any) => Number(tier)),
        uris: uris,
        names: names
      };
    } catch (error) {
      logger.error('Failed to get user NFT collection:', error);
      throw new Error('Failed to get user NFT collection');
    }
  }

  /**
   * Get user's current tier information
   */
  public async getUserTierInfo(userAddress: string): Promise<UserTierInfo> {
    if (!this.isInitialized) {
      throw new Error('NFT Service not initialized');
    }

    try {
      const [currentTier, tierName] = await this.contract.getUserCurrentTier(userAddress);
      const [nextTier, pointsNeeded, nextTierName, nextTierURI] = await this.contract.getNextTierRequirements(userAddress);
      const userPoints = await this.contract.yieldPoints(userAddress);

      const result: UserTierInfo = {
        currentTier: Number(currentTier),
        tierName: tierName,
        points: Number(userPoints)
      };

      if (pointsNeeded > 0) {
        result.nextTier = {
          tier: Number(nextTier),
          pointsNeeded: Number(pointsNeeded),
          tierName: nextTierName,
          tierURI: nextTierURI
        };
      }

      return result;
    } catch (error) {
      logger.error('Failed to get user tier info:', error);
      throw new Error('Failed to get user tier info');
    }
  }

  /**
   * Get all NFT tiers information
   */
  public async getAllTiers(): Promise<NFTTier[]> {
    if (!this.isInitialized) {
      throw new Error('NFT Service not initialized');
    }

    try {
      const [thresholds, names, uris, maxSupplies, currentSupplies] = await this.contract.getAllTiers();
      
      const tiers: NFTTier[] = [];
      for (let i = 0; i < thresholds.length; i++) {
        tiers.push({
          tier: i,
          threshold: Number(thresholds[i]),
          name: names[i],
          uri: uris[i],
          maxSupply: Number(maxSupplies[i]),
          currentSupply: Number(currentSupplies[i])
        });
      }

      return tiers;
    } catch (error) {
      logger.error('Failed to get all tiers:', error);
      throw new Error('Failed to get all tiers');
    }
  }

  /**
   * Get user's yield points balance
   */
  public async getUserYieldPoints(userAddress: string): Promise<number> {
    if (!this.isInitialized) {
      throw new Error('NFT Service not initialized');
    }

    try {
      const points = await this.contract.yieldPoints(userAddress);
      return Number(points);
    } catch (error) {
      logger.error('Failed to get user yield points:', error);
      throw new Error('Failed to get user yield points');
    }
  }

  /**
   * Check if user can mint NFT
   */
  public async canUserMintNFT(userAddress: string): Promise<{ canMint: boolean; reason?: string; nextTier?: NFTTier }> {
    try {
      const tierInfo = await this.getUserTierInfo(userAddress);
      
      if (!tierInfo.nextTier) {
        return { canMint: false, reason: 'No new NFT tier available to mint' };
      }

      const tiers = await this.getAllTiers();
      const nextTier = tiers.find(t => t.tier === tierInfo.nextTier.tier);
      
      if (!nextTier) {
        return { canMint: false, reason: 'Invalid tier configuration' };
      }

      if (nextTier.currentSupply >= nextTier.maxSupply) {
        return { canMint: false, reason: 'Tier supply limit reached' };
      }

      return { canMint: true, nextTier };
    } catch (error) {
      logger.error('Failed to check if user can mint NFT:', error);
      return { canMint: false, reason: 'Error checking mint eligibility' };
    }
  }

  /**
   * Log yield points award to database
   */
  private async logYieldPointsAward(
    userAddress: string, 
    points: number, 
    reason: string, 
    txHash: string
  ): Promise<void> {
    try {
      await supabase
        .from('nft_yield_points_logs')
        .insert([{
          user_address: userAddress.toLowerCase(),
          points_awarded: points,
          reason: reason,
          transaction_hash: txHash,
          created_at: new Date().toISOString()
        }]);
    } catch (error) {
      logger.error('Failed to log yield points award:', error);
    }
  }

  /**
   * Log batch yield points award to database
   */
  private async logBatchYieldPointsAward(
    users: string[], 
    points: number[], 
    reason: string, 
    txHash: string
  ): Promise<void> {
    try {
      const logs = users.map((user, index) => ({
        user_address: user.toLowerCase(),
        points_awarded: points[index],
        reason: reason,
        transaction_hash: txHash,
        created_at: new Date().toISOString()
      }));

      await supabase
        .from('nft_yield_points_logs')
        .insert(logs);
    } catch (error) {
      logger.error('Failed to log batch yield points award:', error);
    }
  }

  /**
   * Get yield points history for user
   */
  public async getUserYieldPointsHistory(userAddress: string, limit: number = 50): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('nft_yield_points_logs')
        .select('*')
        .eq('user_address', userAddress.toLowerCase())
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Failed to get user yield points history:', error);
      throw new Error('Failed to get user yield points history');
    }
  }

  /**
   * Get NFT tier configuration
   */
  public getNFTTierConfig(): typeof this.NFT_TIERS {
    return this.NFT_TIERS;
  }

  /**
   * Check if service is initialized
   */
  public isServiceInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Get contract address
   */
  public getContractAddress(): string {
    if (!this.isInitialized) {
      throw new Error('NFT Service not initialized');
    }
    return this.contract.target as string;
  }
}

// Export singleton instance
export const nftService = NFTService.getInstance();


