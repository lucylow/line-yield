import { useState, useCallback, useEffect } from 'react';
import { rewardsApiClient, Reward, UserPoints, DrawResult } from '../services/RewardsApiClient';
import { useToast } from './use-toast';

export interface UseRewardsReturn {
  // State
  isLoading: boolean;
  error: string | null;
  userPoints: UserPoints | null;
  rewardHistory: Reward[];
  drawHistory: any[];
  
  // Signup bonus
  claimSignupBonus: (userId: string) => Promise<void>;
  
  // Loyalty rewards
  claimDailyLogin: (userId: string) => Promise<void>;
  claimTransactionBonus: (userId: string, txType: string, amount?: string) => Promise<void>;
  claimMilestoneReward: (userId: string, milestone: string, points: number) => Promise<void>;
  
  // KAIA rewards
  claimFirstDeposit: (userId: string, amount: string) => Promise<void>;
  claimYieldMilestone: (userId: string, yieldAmount: string) => Promise<void>;
  claimLongTermHolder: (userId: string, daysHeld: number) => Promise<void>;
  
  // Item draw
  performItemDraw: (userId: string, drawType?: 'common' | 'premium') => Promise<DrawResult | null>;
  
  // Data fetching
  refreshUserPoints: (userId: string) => Promise<void>;
  refreshRewardHistory: (userId: string) => Promise<void>;
  refreshDrawHistory: (userId: string) => Promise<void>;
  
  // Utility
  clearError: () => void;
  getTierColor: (tier: UserPoints['tier']) => string;
  getTierIcon: (tier: UserPoints['tier']) => string;
  getRarityColor: (rarity: string) => string;
}

export const useRewards = (): UseRewardsReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [rewardHistory, setRewardHistory] = useState<Reward[]>([]);
  const [drawHistory, setDrawHistory] = useState<any[]>([]);
  const { toast } = useToast();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((err: any, operation: string) => {
    const errorMessage = err instanceof Error ? err.message : `Failed to ${operation}`;
    setError(errorMessage);
    
    toast({
      title: "Operation Failed",
      description: errorMessage,
      variant: "destructive",
    });
    
    console.error(`[Rewards] ${operation} error:`, err);
  }, [toast]);

  const showSuccess = useCallback((message: string, title: string = "Success") => {
    toast({
      title,
      description: message,
    });
  }, [toast]);

  // Signup bonus
  const claimSignupBonus = useCallback(async (userId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await rewardsApiClient.awardSignupBonus(userId);
      
      showSuccess(result.message, "Welcome Bonus!");
      
      // Refresh user points
      await refreshUserPoints(userId);
    } catch (err) {
      handleError(err, 'claim signup bonus');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleError, showSuccess]);

  // Daily login reward
  const claimDailyLogin = useCallback(async (userId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await rewardsApiClient.awardLoyaltyPoints(userId, 'daily_login');
      
      showSuccess(result.message, "Daily Login Reward!");
      
      // Refresh user points
      await refreshUserPoints(userId);
    } catch (err) {
      handleError(err, 'claim daily login reward');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleError, showSuccess]);

  // Transaction bonus
  const claimTransactionBonus = useCallback(async (
    userId: string, 
    txType: string, 
    amount?: string
  ): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await rewardsApiClient.awardLoyaltyPoints(userId, 'transaction', {
        type: txType,
        amount
      });
      
      showSuccess(result.message, "Transaction Bonus!");
      
      // Refresh user points
      await refreshUserPoints(userId);
    } catch (err) {
      handleError(err, 'claim transaction bonus');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleError, showSuccess]);

  // Milestone reward
  const claimMilestoneReward = useCallback(async (
    userId: string, 
    milestone: string, 
    points: number
  ): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await rewardsApiClient.awardLoyaltyPoints(userId, 'milestone', {
        milestone,
        points,
        description: `Milestone reward: ${milestone}`
      });
      
      showSuccess(result.message, "Milestone Reward!");
      
      // Refresh user points
      await refreshUserPoints(userId);
    } catch (err) {
      handleError(err, 'claim milestone reward');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleError, showSuccess]);

  // KAIA rewards
  const claimFirstDeposit = useCallback(async (userId: string, amount: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await rewardsApiClient.awardKaiaReward(userId, 'first_deposit', {
        amount
      });
      
      showSuccess(result.message, "KAIA First Deposit Reward!");
      
      // Refresh user points
      await refreshUserPoints(userId);
    } catch (err) {
      handleError(err, 'claim first deposit reward');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleError, showSuccess]);

  const claimYieldMilestone = useCallback(async (userId: string, yieldAmount: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await rewardsApiClient.awardKaiaReward(userId, 'yield_milestone', {
        yieldAmount
      });
      
      showSuccess(result.message, "KAIA Yield Milestone!");
      
      // Refresh user points
      await refreshUserPoints(userId);
    } catch (err) {
      handleError(err, 'claim yield milestone reward');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleError, showSuccess]);

  const claimLongTermHolder = useCallback(async (userId: string, daysHeld: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await rewardsApiClient.awardKaiaReward(userId, 'long_term_holder', {
        daysHeld
      });
      
      showSuccess(result.message, "KAIA Long-term Holder Reward!");
      
      // Refresh user points
      await refreshUserPoints(userId);
    } catch (err) {
      handleError(err, 'claim long-term holder reward');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleError, showSuccess]);

  // Item draw
  const performItemDraw = useCallback(async (
    userId: string, 
    drawType: 'common' | 'premium' = 'common'
  ): Promise<DrawResult | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await rewardsApiClient.performItemDraw(userId, drawType);
      
      if (result.success && result.reward) {
        showSuccess(
          `Congratulations! You won: ${result.reward.name} (${result.reward.rarity})`,
          "Item Draw Success!"
        );
        
        // Refresh user points and draw history
        await Promise.all([
          refreshUserPoints(userId),
          refreshDrawHistory(userId)
        ]);
      }
      
      return result;
    } catch (err) {
      handleError(err, 'perform item draw');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError, showSuccess]);

  // Data fetching
  const refreshUserPoints = useCallback(async (userId: string): Promise<void> => {
    try {
      const points = await rewardsApiClient.getUserPoints(userId);
      setUserPoints(points);
    } catch (err) {
      handleError(err, 'refresh user points');
    }
  }, [handleError]);

  const refreshRewardHistory = useCallback(async (userId: string): Promise<void> => {
    try {
      const history = await rewardsApiClient.getUserRewardHistory(userId);
      setRewardHistory(history);
    } catch (err) {
      handleError(err, 'refresh reward history');
    }
  }, [handleError]);

  const refreshDrawHistory = useCallback(async (userId: string): Promise<void> => {
    try {
      const history = await rewardsApiClient.getUserDrawHistory(userId);
      setDrawHistory(history);
    } catch (err) {
      handleError(err, 'refresh draw history');
    }
  }, [handleError]);

  // Utility functions
  const getTierColor = useCallback((tier: UserPoints['tier']): string => {
    switch (tier) {
      case 'bronze': return 'text-amber-600 bg-amber-100';
      case 'silver': return 'text-gray-600 bg-gray-100';
      case 'gold': return 'text-yellow-600 bg-yellow-100';
      case 'platinum': return 'text-blue-600 bg-blue-100';
      case 'diamond': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }, []);

  const getTierIcon = useCallback((tier: UserPoints['tier']): string => {
    switch (tier) {
      case 'bronze': return '🥉';
      case 'silver': return '🥈';
      case 'gold': return '🥇';
      case 'platinum': return '💎';
      case 'diamond': return '💠';
      default: return '⭐';
    }
  }, []);

  const getRarityColor = useCallback((rarity: string): string => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100';
      case 'rare': return 'text-blue-600 bg-blue-100';
      case 'epic': return 'text-purple-600 bg-purple-100';
      case 'legendary': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }, []);

  return {
    // State
    isLoading,
    error,
    userPoints,
    rewardHistory,
    drawHistory,
    
    // Signup bonus
    claimSignupBonus,
    
    // Loyalty rewards
    claimDailyLogin,
    claimTransactionBonus,
    claimMilestoneReward,
    
    // KAIA rewards
    claimFirstDeposit,
    claimYieldMilestone,
    claimLongTermHolder,
    
    // Item draw
    performItemDraw,
    
    // Data fetching
    refreshUserPoints,
    refreshRewardHistory,
    refreshDrawHistory,
    
    // Utility
    clearError,
    getTierColor,
    getTierIcon,
    getRarityColor,
  };
};


