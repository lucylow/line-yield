import { CONFIG } from '../config';
import { Logger } from '../utils/logger';
import { createClient } from '@supabase/supabase-js';

const logger = new Logger('RewardsService');

// Initialize Supabase client with service role key (backend only)
const supabase = createClient(CONFIG.supabase.url, CONFIG.supabase.serviceRoleKey);

export interface Reward {
  id: string;
  userId: string;
  type: 'signup_bonus' | 'loyalty' | 'kaia_reward' | 'item_draw' | 'referral' | 'achievement';
  points: number;
  description: string;
  metadata?: Record<string, any>;
  status: 'pending' | 'credited' | 'expired' | 'cancelled';
  createdAt: string;
  expiresAt?: string;
}

export interface UserPoints {
  userId: string;
  totalPoints: number;
  availablePoints: number;
  usedPoints: number;
  level: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  lastUpdated: string;
}

export interface ItemDrawReward {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  pointsCost: number;
  imageUrl?: string;
  metadata?: Record<string, any>;
  isActive: boolean;
}

export interface DrawResult {
  success: boolean;
  reward?: ItemDrawReward;
  pointsDeducted: number;
  remainingPoints: number;
  drawId: string;
}

export interface LoyaltyMilestone {
  level: number;
  pointsRequired: number;
  rewards: {
    points?: number;
    items?: ItemDrawReward[];
    benefits?: string[];
  };
}

export class RewardsService {
  private static instance: RewardsService;
  
  // Reward configurations
  private readonly REWARD_CONFIG = {
    SIGNUP_BONUS: 1000,
    REFERRAL_BONUS: 500,
    DAILY_LOGIN: 50,
    TRANSACTION_BONUS: {
      deposit: 100,
      withdraw: 50,
      yield_earned: 200
    },
    LOYALTY_MILESTONES: [
      { level: 1, pointsRequired: 0, rewards: { points: 0 } },
      { level: 2, pointsRequired: 1000, rewards: { points: 100 } },
      { level: 3, pointsRequired: 2500, rewards: { points: 250 } },
      { level: 4, pointsRequired: 5000, rewards: { points: 500 } },
      { level: 5, pointsRequired: 10000, rewards: { points: 1000 } }
    ],
    KAIA_REWARDS: {
      first_deposit: 200,
      yield_milestone: 300,
      long_term_holder: 500
    }
  };

  private constructor() {}

  public static getInstance(): RewardsService {
    if (!RewardsService.instance) {
      RewardsService.instance = new RewardsService();
    }
    return RewardsService.instance;
  }

  /**
   * Award signup bonus to new user
   */
  public async awardSignupBonus(userId: string): Promise<Reward> {
    try {
      // Check if user already received signup bonus
      const { data: existingReward } = await supabase
        .from('rewards')
        .select('id')
        .eq('user_id', userId)
        .eq('type', 'signup_bonus')
        .single();

      if (existingReward) {
        throw new Error('User has already received signup bonus');
      }

      // Create signup bonus reward
      const reward: Omit<Reward, 'id'> = {
        userId,
        type: 'signup_bonus',
        points: this.REWARD_CONFIG.SIGNUP_BONUS,
        description: 'Welcome to LINE Yield! Signup bonus credited.',
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      };

      const { data, error } = await supabase
        .from('rewards')
        .insert([reward])
        .select()
        .single();

      if (error) throw error;

      // Credit points to user
      await this.creditPoints(userId, this.REWARD_CONFIG.SIGNUP_BONUS, 'signup_bonus');

      // Award NFT yield points
      await this.awardNFTYieldPoints(userId, this.REWARD_CONFIG.SIGNUP_BONUS, 'signup_bonus');

      logger.info(`Signup bonus awarded to user ${userId}: ${this.REWARD_CONFIG.SIGNUP_BONUS} points`);
      return data;
    } catch (error) {
      logger.error('Error awarding signup bonus:', error);
      throw new Error('Failed to award signup bonus');
    }
  }

  /**
   * Award loyalty points based on user activity
   */
  public async awardLoyaltyPoints(
    userId: string, 
    activity: 'daily_login' | 'transaction' | 'milestone',
    metadata?: Record<string, any>
  ): Promise<Reward> {
    try {
      let points = 0;
      let description = '';

      switch (activity) {
        case 'daily_login':
          points = this.REWARD_CONFIG.DAILY_LOGIN;
          description = 'Daily login reward';
          break;
        case 'transaction':
          const txType = metadata?.type;
          points = this.REWARD_CONFIG.TRANSACTION_BONUS[txType] || 0;
          description = `Transaction bonus: ${txType}`;
          break;
        case 'milestone':
          points = metadata?.points || 0;
          description = metadata?.description || 'Loyalty milestone reward';
          break;
      }

      if (points === 0) {
        throw new Error('No points to award for this activity');
      }

      const reward: Omit<Reward, 'id'> = {
        userId,
        type: 'loyalty',
        points,
        description,
        metadata,
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days
      };

      const { data, error } = await supabase
        .from('rewards')
        .insert([reward])
        .select()
        .single();

      if (error) throw error;

      // Credit points to user
      await this.creditPoints(userId, points, 'loyalty');

      // Award NFT yield points
      await this.awardNFTYieldPoints(userId, points, `loyalty_${activity}`);

      logger.info(`Loyalty points awarded to user ${userId}: ${points} points`);
      return data;
    } catch (error) {
      logger.error('Error awarding loyalty points:', error);
      throw new Error('Failed to award loyalty points');
    }
  }

  /**
   * Award KAIA-specific rewards
   */
  public async awardKaiaReward(
    userId: string,
    rewardType: 'first_deposit' | 'yield_milestone' | 'long_term_holder',
    metadata?: Record<string, any>
  ): Promise<Reward> {
    try {
      const points = this.REWARD_CONFIG.KAIA_REWARDS[rewardType];
      
      const reward: Omit<Reward, 'id'> = {
        userId,
        type: 'kaia_reward',
        points,
        description: `KAIA Reward: ${rewardType.replace('_', ' ')}`,
        metadata: { ...metadata, rewardType },
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() // 60 days
      };

      const { data, error } = await supabase
        .from('rewards')
        .insert([reward])
        .select()
        .single();

      if (error) throw error;

      // Credit points to user
      await this.creditPoints(userId, points, 'kaia_reward');

      logger.info(`KAIA reward awarded to user ${userId}: ${points} points`);
      return data;
    } catch (error) {
      logger.error('Error awarding KAIA reward:', error);
      throw new Error('Failed to award KAIA reward');
    }
  }

  /**
   * Perform item draw for user
   */
  public async performItemDraw(userId: string, drawType: 'common' | 'premium' = 'common'): Promise<DrawResult> {
    try {
      // Get user's current points
      const userPoints = await this.getUserPoints(userId);
      
      // Get available items for draw
      const items = await this.getAvailableDrawItems(drawType);
      
      if (items.length === 0) {
        throw new Error('No items available for draw');
      }

      // Calculate draw cost
      const drawCost = drawType === 'premium' ? 1000 : 500;
      
      if (userPoints.availablePoints < drawCost) {
        throw new Error('Insufficient points for draw');
      }

      // Perform weighted random draw
      const selectedItem = this.selectRandomItem(items);
      
      // Deduct points
      await this.deductPoints(userId, drawCost, 'item_draw');

      // Create draw record
      const drawId = `draw_${Date.now()}_${userId}`;
      await supabase
        .from('draw_history')
        .insert([{
          id: drawId,
          user_id: userId,
          item_id: selectedItem.id,
          points_cost: drawCost,
          draw_type: drawType,
          created_at: new Date().toISOString()
        }]);

      const updatedPoints = await this.getUserPoints(userId);

      logger.info(`Item draw completed for user ${userId}: ${selectedItem.name}`);

      return {
        success: true,
        reward: selectedItem,
        pointsDeducted: drawCost,
        remainingPoints: updatedPoints.availablePoints,
        drawId
      };
    } catch (error) {
      logger.error('Error performing item draw:', error);
      throw new Error('Failed to perform item draw');
    }
  }

  /**
   * Get user's current points and level
   */
  public async getUserPoints(userId: string): Promise<UserPoints> {
    try {
      const { data, error } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) {
        // Create new user points record
        const newUserPoints: Omit<UserPoints, 'lastUpdated'> = {
          userId,
          totalPoints: 0,
          availablePoints: 0,
          usedPoints: 0,
          level: 1,
          tier: 'bronze'
        };

        const { data: createdData, error: createError } = await supabase
          .from('user_points')
          .insert([{ ...newUserPoints, last_updated: new Date().toISOString() }])
          .select()
          .single();

        if (createError) throw createError;
        return { ...createdData, lastUpdated: createdData.last_updated };
      }

      return { ...data, lastUpdated: data.last_updated };
    } catch (error) {
      logger.error('Error getting user points:', error);
      throw new Error('Failed to get user points');
    }
  }

  /**
   * Credit points to user
   */
  private async creditPoints(userId: string, points: number, source: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('credit_user_points', {
        user_id: userId,
        points_to_add: points,
        source_type: source
      });

      if (error) throw error;

      // Update user level if needed
      await this.updateUserLevel(userId);
    } catch (error) {
      logger.error('Error crediting points:', error);
      throw error;
    }
  }

  /**
   * Deduct points from user
   */
  private async deductPoints(userId: string, points: number, source: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('deduct_user_points', {
        user_id: userId,
        points_to_deduct: points,
        source_type: source
      });

      if (error) throw error;
    } catch (error) {
      logger.error('Error deducting points:', error);
      throw error;
    }
  }

  /**
   * Update user level based on total points
   */
  private async updateUserLevel(userId: string): Promise<void> {
    try {
      const userPoints = await this.getUserPoints(userId);
      
      // Find current level based on total points
      let newLevel = 1;
      let newTier: UserPoints['tier'] = 'bronze';

      for (const milestone of this.REWARD_CONFIG.LOYALTY_MILESTONES) {
        if (userPoints.totalPoints >= milestone.pointsRequired) {
          newLevel = milestone.level;
        }
      }

      // Determine tier based on level
      if (newLevel >= 5) newTier = 'diamond';
      else if (newLevel >= 4) newTier = 'platinum';
      else if (newLevel >= 3) newTier = 'gold';
      else if (newLevel >= 2) newTier = 'silver';
      else newTier = 'bronze';

      // Update if level changed
      if (newLevel !== userPoints.level || newTier !== userPoints.tier) {
        await supabase
          .from('user_points')
          .update({
            level: newLevel,
            tier: newTier,
            last_updated: new Date().toISOString()
          })
          .eq('user_id', userId);

        logger.info(`User ${userId} leveled up to level ${newLevel}, tier ${newTier}`);
      }
    } catch (error) {
      logger.error('Error updating user level:', error);
    }
  }

  /**
   * Get available items for draw
   */
  private async getAvailableDrawItems(drawType: string): Promise<ItemDrawReward[]> {
    try {
      const { data, error } = await supabase
        .from('draw_items')
        .select('*')
        .eq('is_active', true)
        .eq('draw_type', drawType);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error getting draw items:', error);
      return [];
    }
  }

  /**
   * Select random item based on rarity weights
   */
  private selectRandomItem(items: ItemDrawReward[]): ItemDrawReward {
    const weights = {
      common: 50,
      rare: 30,
      epic: 15,
      legendary: 5
    };

    const weightedItems: ItemDrawReward[] = [];
    
    items.forEach(item => {
      const weight = weights[item.rarity];
      for (let i = 0; i < weight; i++) {
        weightedItems.push(item);
      }
    });

    const randomIndex = Math.floor(Math.random() * weightedItems.length);
    return weightedItems[randomIndex];
  }

  /**
   * Get user's reward history
   */
  public async getUserRewardHistory(userId: string, limit: number = 50): Promise<Reward[]> {
    try {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error getting reward history:', error);
      throw new Error('Failed to get reward history');
    }
  }

  /**
   * Get user's draw history
   */
  public async getUserDrawHistory(userId: string, limit: number = 20): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('draw_history')
        .select(`
          *,
          draw_items (
            name,
            description,
            rarity,
            image_url
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error getting draw history:', error);
      throw new Error('Failed to get draw history');
    }
  }

  /**
   * Award NFT yield points (integrate with NFT service)
   */
  private async awardNFTYieldPoints(
    userId: string, 
    points: number, 
    reason: string
  ): Promise<void> {
    try {
      // Import NFT service dynamically to avoid circular dependency
      const { nftService } = await import('./NFTService');
      
      if (nftService.isServiceInitialized()) {
        await nftService.awardYieldPoints(userId, points, reason);
        logger.info(`Awarded ${points} NFT yield points to ${userId} for ${reason}`);
      } else {
        logger.warn('NFT service not initialized, skipping NFT yield points award');
      }
    } catch (error) {
      logger.error('Error awarding NFT yield points:', error);
      // Don't throw error to avoid breaking rewards flow
    }
  }
}

// Export singleton instance
export const rewardsService = RewardsService.getInstance();
