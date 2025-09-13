import axios, { AxiosInstance, AxiosResponse } from 'axios';

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

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class RewardsApiClient {
  private static instance: RewardsApiClient;
  private api: AxiosInstance;
  private baseURL: string;

  private constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    
    this.api = axios.create({
      baseURL: `${this.baseURL}/api/rewards`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for logging
    this.api.interceptors.request.use(
      (config) => {
        console.log(`[RewardsAPI] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[RewardsAPI] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        console.error('[RewardsAPI] Response error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  public static getInstance(): RewardsApiClient {
    if (!RewardsApiClient.instance) {
      RewardsApiClient.instance = new RewardsApiClient();
    }
    return RewardsApiClient.instance;
  }

  /**
   * Award signup bonus to new user
   */
  public async awardSignupBonus(userId: string): Promise<{ reward: Reward; message: string }> {
    try {
      const response = await this.api.post(`/signup-bonus/${userId}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to award signup bonus');
    }
  }

  /**
   * Award loyalty points for user activity
   */
  public async awardLoyaltyPoints(
    userId: string,
    activity: 'daily_login' | 'transaction' | 'milestone',
    metadata?: Record<string, any>
  ): Promise<{ reward: Reward; message: string }> {
    try {
      const response = await this.api.post(`/loyalty/${userId}`, {
        activity,
        metadata
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to award loyalty points');
    }
  }

  /**
   * Award KAIA-specific rewards
   */
  public async awardKaiaReward(
    userId: string,
    rewardType: 'first_deposit' | 'yield_milestone' | 'long_term_holder',
    metadata?: Record<string, any>
  ): Promise<{ reward: Reward; message: string }> {
    try {
      const response = await this.api.post(`/kaia/${userId}`, {
        rewardType,
        metadata
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to award KAIA reward');
    }
  }

  /**
   * Perform item draw for user
   */
  public async performItemDraw(
    userId: string,
    drawType: 'common' | 'premium' = 'common'
  ): Promise<DrawResult> {
    try {
      const response = await this.api.post(`/draw/${userId}`, {
        drawType
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to perform item draw');
    }
  }

  /**
   * Get user's current points and level
   */
  public async getUserPoints(userId: string): Promise<UserPoints> {
    try {
      const response = await this.api.get(`/points/${userId}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get user points');
    }
  }

  /**
   * Get user's reward history
   */
  public async getUserRewardHistory(userId: string, limit: number = 50): Promise<Reward[]> {
    try {
      const response = await this.api.get(`/history/${userId}?limit=${limit}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get reward history');
    }
  }

  /**
   * Get user's draw history
   */
  public async getUserDrawHistory(userId: string, limit: number = 20): Promise<any[]> {
    try {
      const response = await this.api.get(`/draw-history/${userId}?limit=${limit}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get draw history');
    }
  }

  /**
   * Get points leaderboard
   */
  public async getLeaderboard(limit: number = 100): Promise<any> {
    try {
      const response = await this.api.get(`/leaderboard?limit=${limit}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get leaderboard');
    }
  }

  /**
   * Health check
   */
  public async healthCheck(): Promise<any> {
    try {
      const response = await this.api.get('/health');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Health check failed');
    }
  }
}

// Export singleton instance
export const rewardsApiClient = RewardsApiClient.getInstance();


