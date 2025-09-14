import { CONFIG } from '../config';
import { Logger } from '../utils/logger';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Logger instance removed - using static methods directly

// Initialize Supabase client with service role key (backend only)
const supabase = createClient(CONFIG.supabase.url, CONFIG.supabase.serviceRoleKey);

export interface ReferralData {
  referralCode: string;
  referralCount: number;
  totalEarnings: string;
  pendingRewards: string;
}

export interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: string;
  pendingRewards: string;
}

export interface ReferralReward {
  id: string;
  referrerId: string;
  referredId: string;
  referralCode: string;
  rewardType: 'signup' | 'deposit' | 'yield_share';
  points: number;
  status: 'pending' | 'credited' | 'expired';
  createdAt: string;
  metadata?: Record<string, any>;
}

export class ReferralService {
  private static instance: ReferralService;
  
  // Referral reward configurations
  private readonly REFERRAL_CONFIG = {
    REFERRER_REWARDS: {
      signup: 100,        // Points when referred user signs up
      deposit: 50,        // Points when referred user makes first deposit
      yield_share: 0.1    // 10% of referred user's yield earnings
    },
    REFERRED_REWARDS: {
      signup: 100,        // Bonus points for new user
      deposit: 50,        // Bonus points for first deposit
      yield_share: 0.02    // 2% APY boost for first 30 days
    },
    REFERRAL_CODE_LENGTH: 8,
    MAX_REFERRAL_DEPTH: 2 // Maximum referral depth (referrer -> referred -> referred's referred)
  };

  private constructor() {}

  public static getInstance(): ReferralService {
    if (!ReferralService.instance) {
      ReferralService.instance = new ReferralService();
    }
    return ReferralService.instance;
  }

  /**
   * Generate or fetch referral code for user
   */
  public async getOrCreateReferralCode(userAddress: string): Promise<string> {
    try {
      const normalizedAddress = userAddress.toLowerCase();
      
      // Check if user already has a referral code
      const { data: existingUser } = await supabase
        .from('users')
        .select('referral_code')
        .eq('wallet_address', normalizedAddress)
        .single();

      if (existingUser?.referral_code) {
        return existingUser.referral_code;
      }

      // Generate new referral code
      const referralCode = this.generateReferralCode();
      
      // Check if code is unique
      const { data: codeExists } = await supabase
        .from('users')
        .select('id')
        .eq('referral_code', referralCode)
        .single();

      if (codeExists) {
        // Retry with new code if collision
        return this.getOrCreateReferralCode(userAddress);
      }

      // Update user with referral code
      const { error } = await supabase
        .from('users')
        .upsert({
          wallet_address: normalizedAddress,
          referral_code: referralCode,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'wallet_address'
        });

      if (error) throw error;

      Logger.info(`Generated referral code for user ${normalizedAddress}: ${referralCode}`);
      return referralCode;
    } catch (error) {
      Logger.error('Error generating referral code:', error);
      throw new Error('Failed to generate referral code');
    }
  }

  /**
   * Redeem referral code for new user
   */
  public async redeemReferralCode(
    referredByCode: string, 
    userAddress: string
  ): Promise<{ success: boolean; message: string; referrerAddress?: string }> {
    try {
      const normalizedAddress = userAddress.toLowerCase();
      const referralCode = referredByCode.toLowerCase();

      // Find referrer by code
      const { data: referrer } = await supabase
        .from('users')
        .select('wallet_address, referral_code')
        .eq('referral_code', referralCode)
        .single();

      if (!referrer) {
        return { success: false, message: 'Invalid referral code' };
      }

      // Prevent self-referral
      if (referrer.wallet_address === normalizedAddress) {
        return { success: false, message: 'Cannot refer yourself' };
      }

      // Check if user already has a referrer
      const { data: existingUser } = await supabase
        .from('users')
        .select('referred_by')
        .eq('wallet_address', normalizedAddress)
        .single();

      if (existingUser?.referred_by) {
        return { success: false, message: 'Referral already redeemed' };
      }

      // Update user with referrer
      const { error: updateError } = await supabase
        .from('users')
        .upsert({
          wallet_address: normalizedAddress,
          referred_by: referrer.wallet_address,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'wallet_address'
        });

      if (updateError) throw updateError;

      // Award referral rewards
      await this.awardReferralRewards(referrer.wallet_address, normalizedAddress, 'signup');

      Logger.info(`Referral redeemed: ${normalizedAddress} referred by ${referrer.wallet_address}`);
      
      return { 
        success: true, 
        message: 'Referral redeemed successfully',
        referrerAddress: referrer.wallet_address
      };
    } catch (error) {
      Logger.error('Error redeeming referral code:', error);
      return { success: false, message: 'Failed to redeem referral code' };
    }
  }

  /**
   * Get referral data for user
   */
  public async getReferralData(userAddress: string): Promise<ReferralData | null> {
    try {
      const normalizedAddress = userAddress.toLowerCase();
      
      // Get user's referral code
      const { data: user } = await supabase
        .from('users')
        .select('referral_code')
        .eq('wallet_address', normalizedAddress)
        .single();

      if (!user?.referral_code) {
        return null;
      }

      // Get referral statistics
      const { data: referrals } = await supabase
        .from('users')
        .select('wallet_address')
        .eq('referred_by', normalizedAddress);

      const referralCount = referrals?.length || 0;

      // Get total earnings from referral rewards
      const { data: rewards } = await supabase
        .from('rewards')
        .select('points, status')
        .eq('user_id', normalizedAddress)
        .eq('type', 'referral');

      const totalEarnings = rewards
        ?.filter(r => r.status === 'credited')
        ?.reduce((sum, r) => sum + r.points, 0) || 0;

      const pendingRewards = rewards
        ?.filter(r => r.status === 'pending')
        ?.reduce((sum, r) => sum + r.points, 0) || 0;

      return {
        referralCode: user.referral_code,
        referralCount,
        totalEarnings: totalEarnings.toString(),
        pendingRewards: pendingRewards.toString()
      };
    } catch (error) {
      Logger.error('Error getting referral data:', error);
      return null;
    }
  }

  /**
   * Get referral statistics for user
   */
  public async getReferralStats(userAddress: string): Promise<ReferralStats | null> {
    try {
      const normalizedAddress = userAddress.toLowerCase();
      
      // Get all users referred by this user
      const { data: referrals } = await supabase
        .from('users')
        .select('wallet_address, created_at')
        .eq('referred_by', normalizedAddress);

      const totalReferrals = referrals?.length || 0;
      
      // Count active referrals (users who have made deposits)
      const { data: activeReferrals } = await supabase
        .from('users')
        .select('wallet_address')
        .eq('referred_by', normalizedAddress)
        .gt('total_deposited', '0');

      const activeReferralsCount = activeReferrals?.length || 0;

      // Calculate total earnings
      const { data: rewards } = await supabase
        .from('rewards')
        .select('points, status')
        .eq('user_id', normalizedAddress)
        .eq('type', 'referral');

      const totalEarnings = rewards
        ?.filter(r => r.status === 'credited')
        ?.reduce((sum, r) => sum + r.points, 0) || 0;

      const pendingRewards = rewards
        ?.filter(r => r.status === 'pending')
        ?.reduce((sum, r) => sum + r.points, 0) || 0;

      return {
        totalReferrals,
        activeReferrals: activeReferralsCount,
        totalEarnings: totalEarnings.toString(),
        pendingRewards: pendingRewards.toString()
      };
    } catch (error) {
      Logger.error('Error getting referral stats:', error);
      return null;
    }
  }

  /**
   * Award referral rewards
   */
  public async awardReferralRewards(
    referrerAddress: string,
    referredAddress: string,
    rewardType: 'signup' | 'deposit' | 'yield_share',
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const referrerPoints = this.REFERRAL_CONFIG.REFERRER_REWARDS[rewardType];
      const referredPoints = this.REFERRAL_CONFIG.REFERRED_REWARDS[rewardType];

      // Award points to referrer
      if (referrerPoints > 0) {
        await this.createReferralReward(
          referrerAddress,
          referredAddress,
          rewardType,
          referrerPoints,
          { ...metadata, recipient: 'referrer' }
        );

        // Award NFT yield points
        await this.awardNFTYieldPoints(referrerAddress, referrerPoints, `referral_${rewardType}`);
      }

      // Award points to referred user
      if (referredPoints > 0) {
        await this.createReferralReward(
          referredAddress,
          referrerAddress,
          rewardType,
          referredPoints,
          { ...metadata, recipient: 'referred' }
        );

        // Award NFT yield points
        await this.awardNFTYieldPoints(referredAddress, referredPoints, `referral_${rewardType}`);
      }

      Logger.info(`Referral rewards awarded: ${rewardType} - Referrer: ${referrerPoints}, Referred: ${referredPoints}`);
    } catch (error) {
      Logger.error('Error awarding referral rewards:', error);
      throw error;
    }
  }

  /**
   * Track deposit for referral rewards
   */
  public async trackDepositForReferral(userAddress: string, amount: string): Promise<void> {
    try {
      const normalizedAddress = userAddress.toLowerCase();
      
      // Get user's referrer
      const { data: user } = await supabase
        .from('users')
        .select('referred_by')
        .eq('wallet_address', normalizedAddress)
        .single();

      if (!user?.referred_by) {
        return; // No referrer
      }

      // Check if this is the first deposit
      const { data: existingDeposits } = await supabase
        .from('transactions')
        .select('id')
        .eq('user_id', normalizedAddress)
        .eq('type', 'deposit')
        .eq('status', 'confirmed');

      const isFirstDeposit = !existingDeposits || existingDeposits.length === 0;

      if (isFirstDeposit) {
        // Award deposit rewards
        await this.awardReferralRewards(
          user.referred_by,
          normalizedAddress,
          'deposit',
          { amount, isFirstDeposit: true }
        );
      }
    } catch (error) {
      Logger.error('Error tracking deposit for referral:', error);
    }
  }

  /**
   * Track yield earnings for referral rewards
   */
  public async trackYieldForReferral(userAddress: string, yieldAmount: string): Promise<void> {
    try {
      const normalizedAddress = userAddress.toLowerCase();
      
      // Get user's referrer
      const { data: user } = await supabase
        .from('users')
        .select('referred_by')
        .eq('wallet_address', normalizedAddress)
        .single();

      if (!user?.referred_by) {
        return; // No referrer
      }

      // Calculate referrer's share (10% of yield)
      const referrerShare = Math.floor(parseFloat(yieldAmount) * this.REFERRAL_CONFIG.REFERRER_REWARDS.yield_share);

      if (referrerShare > 0) {
        await this.createReferralReward(
          user.referred_by,
          normalizedAddress,
          'yield_share',
          referrerShare,
          { yieldAmount, referrerShare }
        );
      }
    } catch (error) {
      Logger.error('Error tracking yield for referral:', error);
    }
  }

  /**
   * Generate unique referral code
   */
  private generateReferralCode(): string {
    return crypto.randomBytes(this.REFERRAL_CONFIG.REFERRAL_CODE_LENGTH / 2).toString('hex');
  }

  /**
   * Create referral reward record
   */
  private async createReferralReward(
    recipientAddress: string,
    sourceAddress: string,
    rewardType: string,
    points: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const reward = {
        user_id: recipientAddress,
        type: 'referral',
        points,
        description: `Referral reward: ${rewardType}`,
        metadata: {
          ...metadata,
          sourceAddress,
          rewardType
        },
        status: 'pending',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days
      };

      const { error } = await supabase
        .from('rewards')
        .insert([reward]);

      if (error) throw error;

      // Credit points to user
      const { error: creditError } = await supabase.rpc('credit_user_points', {
        user_id: recipientAddress,
        points_to_add: points,
        source_type: 'referral'
      });

      if (creditError) throw creditError;
    } catch (error) {
      Logger.error('Error creating referral reward:', error);
      throw error;
    }
  }

  /**
   * Get referral leaderboard
   */
  public async getReferralLeaderboard(limit: number = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          wallet_address,
          referral_code,
          (
            SELECT COUNT(*)
            FROM users u2
            WHERE u2.referred_by = users.wallet_address
          ) as referral_count,
          (
            SELECT COALESCE(SUM(points), 0)
            FROM rewards r
            WHERE r.user_id = users.wallet_address
            AND r.type = 'referral'
            AND r.status = 'credited'
          ) as total_earnings
        `)
        .not('referral_code', 'is', null)
        .order('referral_count', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      Logger.error('Error getting referral leaderboard:', error);
      return [];
    }
  }

  /**
   * Award NFT yield points (integrate with NFT service)
   */
  private async awardNFTYieldPoints(
    userAddress: string, 
    points: number, 
    reason: string
  ): Promise<void> {
    try {
      // Import NFT service dynamically to avoid circular dependency
      const { nftService } = await import('./NFTService');
      
      if (nftService.isServiceInitialized()) {
        await nftService.awardYieldPoints(userAddress, points, reason);
        Logger.info(`Awarded ${points} NFT yield points to ${userAddress} for ${reason}`);
      } else {
        Logger.warn('NFT service not initialized, skipping NFT yield points award');
      }
    } catch (error) {
      Logger.error('Error awarding NFT yield points:', error);
      // Don't throw error to avoid breaking referral flow
    }
  }
}

// Export singleton instance
export const referralService = ReferralService.getInstance();
