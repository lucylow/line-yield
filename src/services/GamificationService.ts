import { ethers } from 'ethers';
import { formatCurrency } from '@/utils/formatters';

// Gamification Service for LINE YIELD Points
export interface UserStats {
  balance: string;
  totalEarned: string;
  referrals: number;
  referralPoints: string;
  rank?: number;
}

export interface LeaderboardEntry {
  address: string;
  points: string;
  rank: number;
  displayName?: string;
}

export interface ContractStats {
  totalDistributed: string;
  dailyPool: string;
  lastDistributed: number;
  leaderboardSize: number;
}

export interface PointsTransaction {
  id: string;
  user: string;
  points: string;
  reason: string;
  timestamp: number;
  txHash?: string;
}

export interface DailyDistribution {
  id: string;
  totalDistributed: string;
  timestamp: number;
  txHash: string;
  participants: number;
}

class GamificationService {
  private contract: ethers.Contract | null = null;
  private provider: ethers.providers.Provider | null = null;
  private signer: ethers.Signer | null = null;
  private contractAddress: string;
  private abi: any[];

  constructor() {
    this.contractAddress = process.env.REACT_APP_POINTS_CONTRACT_ADDRESS || '';
    this.abi = [
      // Contract ABI will be generated from Solidity contract
      "function pointsBalance(address) view returns (uint256)",
      "function totalPointsEarned(address) view returns (uint256)",
      "function referralCount(address) view returns (uint256)",
      "function referralPointsEarned(address) view returns (uint256)",
      "function getLeaderboard() view returns (address[] memory, uint256[] memory)",
      "function getUserStats(address) view returns (uint256, uint256, uint256, uint256)",
      "function getContractStats() view returns (uint256, uint256, uint256, uint256)",
      "function awardDepositPoints(address, uint256)",
      "function awardReferralPoints(address, address)",
      "function distributeDailyPoints()",
      "function setDailyDistributionPool(uint256)",
      "function addAuthorizedCaller(address)",
      "function removeAuthorizedCaller(address)",
      "event PointsAwarded(address indexed user, uint256 points, string reason, uint256 timestamp)",
      "event DailyDistribution(uint256 totalDistributed, uint256 timestamp)",
      "event LeaderboardUpdated(address indexed user, uint256 newRank, uint256 points)"
    ];
  }

  /**
   * Initialize the service with provider and signer
   */
  async initialize(provider: ethers.providers.Provider, signer?: ethers.Signer) {
    this.provider = provider;
    this.signer = signer || null;
    
    if (this.contractAddress) {
      this.contract = new ethers.Contract(
        this.contractAddress,
        this.abi,
        signer || provider
      );
    }
  }

  /**
   * Get user's points balance
   */
  async getUserBalance(userAddress: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      const balance = await this.contract.pointsBalance(userAddress);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error('Failed to get user balance:', error);
      return '0';
    }
  }

  /**
   * Get comprehensive user statistics
   */
  async getUserStats(userAddress: string): Promise<UserStats> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      const [balance, totalEarned, referrals, referralPoints] = await this.contract.getUserStats(userAddress);
      
      return {
        balance: ethers.utils.formatEther(balance),
        totalEarned: ethers.utils.formatEther(totalEarned),
        referrals: referrals.toNumber(),
        referralPoints: ethers.utils.formatEther(referralPoints)
      };
    } catch (error) {
      console.error('Failed to get user stats:', error);
      return {
        balance: '0',
        totalEarned: '0',
        referrals: 0,
        referralPoints: '0'
      };
    }
  }

  /**
   * Get leaderboard data
   */
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      const [addresses, scores] = await this.contract.getLeaderboard();
      
      return addresses.map((address: string, index: number) => ({
        address,
        points: ethers.utils.formatEther(scores[index]),
        rank: index + 1,
        displayName: this.formatAddress(address)
      }));
    } catch (error) {
      console.error('Failed to get leaderboard:', error);
      return [];
    }
  }

  /**
   * Get contract statistics
   */
  async getContractStats(): Promise<ContractStats> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      const [totalDistributed, dailyPool, lastDistributed, leaderboardSize] = await this.contract.getContractStats();
      
      return {
        totalDistributed: ethers.utils.formatEther(totalDistributed),
        dailyPool: ethers.utils.formatEther(dailyPool),
        lastDistributed: lastDistributed.toNumber(),
        leaderboardSize: leaderboardSize.toNumber()
      };
    } catch (error) {
      console.error('Failed to get contract stats:', error);
      return {
        totalDistributed: '0',
        dailyPool: '0',
        lastDistributed: 0,
        leaderboardSize: 0
      };
    }
  }

  /**
   * Award deposit points (admin only)
   */
  async awardDepositPoints(userAddress: string, amount: string): Promise<string> {
    if (!this.contract || !this.signer) throw new Error('Contract or signer not initialized');
    
    try {
      const amountWei = ethers.utils.parseUnits(amount, 6); // USDT has 6 decimals
      const tx = await this.contract.awardDepositPoints(userAddress, amountWei);
      
      console.log('Deposit points transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Transaction confirmed in block:', receipt.blockNumber);
      
      return tx.hash;
    } catch (error) {
      console.error('Failed to award deposit points:', error);
      throw error;
    }
  }

  /**
   * Award referral points (admin only)
   */
  async awardReferralPoints(referrerAddress: string, refereeAddress: string): Promise<string> {
    if (!this.contract || !this.signer) throw new Error('Contract or signer not initialized');
    
    try {
      const tx = await this.contract.awardReferralPoints(referrerAddress, refereeAddress);
      
      console.log('Referral points transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Transaction confirmed in block:', receipt.blockNumber);
      
      return tx.hash;
    } catch (error) {
      console.error('Failed to award referral points:', error);
      throw error;
    }
  }

  /**
   * Distribute daily points (admin only)
   */
  async distributeDailyPoints(): Promise<string> {
    if (!this.contract || !this.signer) throw new Error('Contract or signer not initialized');
    
    try {
      const tx = await this.contract.distributeDailyPoints();
      
      console.log('Daily distribution transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Transaction confirmed in block:', receipt.blockNumber);
      
      return tx.hash;
    } catch (error) {
      console.error('Failed to distribute daily points:', error);
      throw error;
    }
  }

  /**
   * Set daily distribution pool (admin only)
   */
  async setDailyDistributionPool(amount: string): Promise<string> {
    if (!this.contract || !this.signer) throw new Error('Contract or signer not initialized');
    
    try {
      const amountWei = ethers.utils.parseEther(amount);
      const tx = await this.contract.setDailyDistributionPool(amountWei);
      
      console.log('Set daily pool transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Transaction confirmed in block:', receipt.blockNumber);
      
      return tx.hash;
    } catch (error) {
      console.error('Failed to set daily distribution pool:', error);
      throw error;
    }
  }

  /**
   * Listen to points awarded events
   */
  async listenToPointsEvents(callback: (event: PointsTransaction) => void) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      this.contract.on('PointsAwarded', (user, points, reason, timestamp, event) => {
        callback({
          id: event.transactionHash + '-' + event.logIndex,
          user,
          points: ethers.utils.formatEther(points),
          reason,
          timestamp: timestamp.toNumber(),
          txHash: event.transactionHash
        });
      });
    } catch (error) {
      console.error('Failed to listen to points events:', error);
    }
  }

  /**
   * Listen to daily distribution events
   */
  async listenToDistributionEvents(callback: (event: DailyDistribution) => void) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      this.contract.on('DailyDistribution', async (totalDistributed, timestamp, event) => {
        // Get leaderboard to count participants
        const leaderboard = await this.getLeaderboard();
        
        callback({
          id: event.transactionHash,
          totalDistributed: ethers.utils.formatEther(totalDistributed),
          timestamp: timestamp.toNumber(),
          txHash: event.transactionHash,
          participants: leaderboard.length
        });
      });
    } catch (error) {
      console.error('Failed to listen to distribution events:', error);
    }
  }

  /**
   * Calculate user's rank in leaderboard
   */
  async getUserRank(userAddress: string): Promise<number> {
    const leaderboard = await this.getLeaderboard();
    const userEntry = leaderboard.find(entry => entry.address.toLowerCase() === userAddress.toLowerCase());
    return userEntry ? userEntry.rank : 0;
  }

  /**
   * Get points earning potential for user
   */
  calculateEarningPotential(userStats: UserStats, dailyVolume: number): {
    depositPoints: string;
    holdingPoints: string;
    referralPoints: string;
    totalPotential: string;
  } {
    // Deposit points: 1 point per USDT
    const depositPoints = dailyVolume.toString();
    
    // Holding points: 10 points per day
    const holdingPoints = '10';
    
    // Referral points: 50 points per referral
    const referralPoints = (userStats.referrals * 50).toString();
    
    // Total potential
    const totalPotential = (
      parseFloat(depositPoints) + 
      parseFloat(holdingPoints) + 
      parseFloat(referralPoints)
    ).toString();
    
    return {
      depositPoints,
      holdingPoints,
      referralPoints,
      totalPotential
    };
  }

  /**
   * Format address for display
   */
  private formatAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  /**
   * Get points history for user (mock implementation)
   */
  async getPointsHistory(userAddress: string, limit: number = 50): Promise<PointsTransaction[]> {
    // In a real implementation, this would query events or a database
    // For now, return mock data
    return [
      {
        id: '1',
        user: userAddress,
        points: '100',
        reason: 'Deposit',
        timestamp: Date.now() - 86400000,
        txHash: '0x1234567890abcdef'
      },
      {
        id: '2',
        user: userAddress,
        points: '50',
        reason: 'Referral',
        timestamp: Date.now() - 172800000,
        txHash: '0xfedcba0987654321'
      }
    ];
  }

  /**
   * Get daily distribution history (mock implementation)
   */
  async getDistributionHistory(limit: number = 30): Promise<DailyDistribution[]> {
    // In a real implementation, this would query events or a database
    return [
      {
        id: '1',
        totalDistributed: '1000',
        timestamp: Date.now() - 86400000,
        txHash: '0x1234567890abcdef',
        participants: 10
      }
    ];
  }

  /**
   * Check if user is eligible for daily distribution
   */
  async isEligibleForDistribution(userAddress: string): Promise<boolean> {
    const leaderboard = await this.getLeaderboard();
    return leaderboard.some(entry => entry.address.toLowerCase() === userAddress.toLowerCase());
  }

  /**
   * Get next distribution time
   */
  async getNextDistributionTime(): Promise<number> {
    const stats = await this.getContractStats();
    return stats.lastDistributed + (24 * 60 * 60 * 1000); // Add 24 hours
  }
}

export const gamificationService = new GamificationService();
export default gamificationService;

