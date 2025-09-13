import {
  GamificationUser,
  Mission,
  MissionType,
  MissionStatus,
  MissionDifficulty,
  MissionCategory,
  Reward,
  RewardType,
  RewardRarity,
  Achievement,
  AchievementCategory,
  Badge,
  Leaderboard,
  LeaderboardType,
  LeaderboardPeriod,
  NFT,
  PointExchangeRate,
  GamificationStats,
  MissionProgress,
  GamificationEvent,
  GamificationEventType
} from '../types/gamification';

export class GamificationService {
  private static instance: GamificationService;
  private users: Map<string, GamificationUser> = new Map();
  private missions: Map<string, Mission> = new Map();
  private achievements: Map<string, Achievement> = new Map();
  private badges: Map<string, Badge> = new Map();
  private nfts: Map<string, NFT> = new Map();
  private events: GamificationEvent[] = [];

  private constructor() {
    this.initializeDefaultData();
  }

  static getInstance(): GamificationService {
    if (!GamificationService.instance) {
      GamificationService.instance = new GamificationService();
    }
    return GamificationService.instance;
  }

  private initializeDefaultData() {
    this.initializeDefaultMissions();
    this.initializeDefaultAchievements();
    this.initializeDefaultBadges();
    this.initializeDefaultNFTs();
  }

  private initializeDefaultMissions() {
    const defaultMissions: Mission[] = [
      {
        id: 'first_purchase',
        title: 'First Purchase',
        description: 'Make your first USDT deposit',
        type: MissionType.FIRST_PURCHASE,
        target: 1,
        current: 0,
        reward: {
          id: 'first_purchase_reward',
          type: RewardType.POINTS,
          amount: 100,
          points: 100,
          description: '100 LINE Yield Points',
          rarity: RewardRarity.COMMON
        },
        status: MissionStatus.AVAILABLE,
        difficulty: MissionDifficulty.EASY,
        category: MissionCategory.BEGINNER,
        createdAt: new Date()
      },
      {
        id: 'complete_5_missions',
        title: 'Mission Master',
        description: 'Complete 5 different missions',
        type: MissionType.COMPLETE_MISSIONS,
        target: 5,
        current: 0,
        reward: {
          id: 'mission_master_reward',
          type: RewardType.NFT,
          amount: 1,
          nftId: 'mission_master_nft',
          description: 'Mission Master NFT',
          rarity: RewardRarity.RARE
        },
        status: MissionStatus.AVAILABLE,
        difficulty: MissionDifficulty.MEDIUM,
        category: MissionCategory.SPECIAL,
        createdAt: new Date()
      },
      {
        id: 'invite_5_friends',
        title: 'Social Butterfly',
        description: 'Invite 5 friends to LINE Yield',
        type: MissionType.INVITE_FRIENDS,
        target: 5,
        current: 0,
        reward: {
          id: 'social_butterfly_reward',
          type: RewardType.KAIA_TOKENS,
          amount: 50,
          currency: 'KAIA',
          description: '50 KAIA Tokens',
          rarity: RewardRarity.EPIC
        },
        status: MissionStatus.AVAILABLE,
        difficulty: MissionDifficulty.HARD,
        category: MissionCategory.SOCIAL,
        createdAt: new Date()
      },
      {
        id: 'deposit_1000_usdt',
        title: 'Big Spender',
        description: 'Deposit 1000 USDT or more',
        type: MissionType.DEPOSIT_AMOUNT,
        target: 1000,
        current: 0,
        reward: {
          id: 'big_spender_reward',
          type: RewardType.BONUS_APY,
          amount: 0.5,
          description: '+0.5% Bonus APY for 30 days',
          rarity: RewardRarity.RARE
        },
        status: MissionStatus.AVAILABLE,
        difficulty: MissionDifficulty.MEDIUM,
        category: MissionCategory.TRADING,
        createdAt: new Date()
      },
      {
        id: 'streak_7_days',
        title: 'Daily Grind',
        description: 'Use LINE Yield for 7 consecutive days',
        type: MissionType.STREAK_DAYS,
        target: 7,
        current: 0,
        reward: {
          id: 'daily_grind_reward',
          type: RewardType.POINTS,
          amount: 200,
          points: 200,
          description: '200 LINE Yield Points',
          rarity: RewardRarity.COMMON
        },
        status: MissionStatus.AVAILABLE,
        difficulty: MissionDifficulty.MEDIUM,
        category: MissionCategory.COMMUNITY,
        createdAt: new Date()
      }
    ];

    defaultMissions.forEach(mission => {
      this.missions.set(mission.id, mission);
    });
  }

  private initializeDefaultAchievements() {
    const defaultAchievements: Achievement[] = [
      {
        id: 'first_deposit',
        title: 'First Steps',
        description: 'Made your first deposit',
        icon: '🎯',
        points: 50,
        rarity: RewardRarity.COMMON,
        unlockedAt: new Date(),
        category: AchievementCategory.TRADING
      },
      {
        id: 'millionaire',
        title: 'Millionaire',
        description: 'Accumulated 1,000,000 points',
        icon: '💰',
        points: 1000,
        rarity: RewardRarity.LEGENDARY,
        unlockedAt: new Date(),
        category: AchievementCategory.MILESTONE
      },
      {
        id: 'social_king',
        title: 'Social King',
        description: 'Invited 10+ friends',
        icon: '👑',
        points: 500,
        rarity: RewardRarity.EPIC,
        unlockedAt: new Date(),
        category: AchievementCategory.SOCIAL
      }
    ];

    defaultAchievements.forEach(achievement => {
      this.achievements.set(achievement.id, achievement);
    });
  }

  private initializeDefaultBadges() {
    const defaultBadges: Badge[] = [
      {
        id: 'early_adopter',
        name: 'Early Adopter',
        description: 'Joined LINE Yield in the first month',
        icon: '🚀',
        color: '#FFD700',
        earnedAt: new Date(),
        rarity: RewardRarity.RARE
      },
      {
        id: 'top_trader',
        name: 'Top Trader',
        description: 'Top 10% trader by volume',
        icon: '📈',
        color: '#FF6B6B',
        earnedAt: new Date(),
        rarity: RewardRarity.EPIC
      },
      {
        id: 'community_champion',
        name: 'Community Champion',
        description: 'Active community member',
        icon: '🏆',
        color: '#4ECDC4',
        earnedAt: new Date(),
        rarity: RewardRarity.COMMON
      }
    ];

    defaultBadges.forEach(badge => {
      this.badges.set(badge.id, badge);
    });
  }

  private initializeDefaultNFTs() {
    const defaultNFTs: NFT[] = [
      {
        id: 'mission_master_nft',
        name: 'Mission Master',
        description: 'Awarded for completing 5 missions',
        image: '/nfts/mission-master.png',
        rarity: RewardRarity.RARE,
        attributes: [
          { trait_type: 'Rarity', value: 'Rare' },
          { trait_type: 'Category', value: 'Achievement' },
          { trait_type: 'Power', value: 75 }
        ],
        mintedAt: new Date(),
        ownerId: '',
        collection: 'LINE Yield Achievements',
        tokenId: '1',
        contractAddress: '0x...'
      },
      {
        id: 'yield_legend_nft',
        name: 'Yield Legend',
        description: 'Legendary NFT for top performers',
        image: '/nfts/yield-legend.png',
        rarity: RewardRarity.LEGENDARY,
        attributes: [
          { trait_type: 'Rarity', value: 'Legendary' },
          { trait_type: 'Category', value: 'Legend' },
          { trait_type: 'Power', value: 100 }
        ],
        mintedAt: new Date(),
        ownerId: '',
        collection: 'LINE Yield Legends',
        tokenId: '2',
        contractAddress: '0x...'
      }
    ];

    defaultNFTs.forEach(nft => {
      this.nfts.set(nft.id, nft);
    });
  }

  // User Management
  async getUser(userId: string): Promise<GamificationUser | null> {
    return this.users.get(userId) || null;
  }

  async createUser(userId: string, walletAddress: string): Promise<GamificationUser> {
    const user: GamificationUser = {
      userId,
      walletAddress,
      totalPoints: 0,
      level: 1,
      experience: 0,
      missionsCompleted: 0,
      friendsInvited: 0,
      totalDeposits: 0,
      totalWithdrawals: 0,
      streakDays: 0,
      lastActiveDate: new Date(),
      achievements: [],
      badges: [],
      rank: 0,
      joinDate: new Date()
    };

    this.users.set(userId, user);
    return user;
  }

  async updateUser(userId: string, updates: Partial<GamificationUser>): Promise<GamificationUser> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser = { ...user, ...updates };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Mission Management
  async getMissions(userId: string): Promise<Mission[]> {
    const user = await this.getUser(userId);
    if (!user) return [];

    return Array.from(this.missions.values()).map(mission => ({
      ...mission,
      current: this.getMissionProgress(userId, mission.id)
    }));
  }

  async getMissionProgress(userId: string, missionId: string): Promise<number> {
    const user = await this.getUser(userId);
    if (!user) return 0;

    const mission = this.missions.get(missionId);
    if (!mission) return 0;

    switch (mission.type) {
      case MissionType.FIRST_PURCHASE:
        return user.totalDeposits > 0 ? 1 : 0;
      case MissionType.COMPLETE_MISSIONS:
        return user.missionsCompleted;
      case MissionType.INVITE_FRIENDS:
        return user.friendsInvited;
      case MissionType.DEPOSIT_AMOUNT:
        return user.totalDeposits;
      case MissionType.STREAK_DAYS:
        return user.streakDays;
      default:
        return 0;
    }
  }

  async completeMission(userId: string, missionId: string): Promise<Reward | null> {
    const user = await this.getUser(userId);
    const mission = this.missions.get(missionId);
    
    if (!user || !mission) return null;

    const currentProgress = await this.getMissionProgress(userId, missionId);
    if (currentProgress < mission.target) return null;

    // Award reward
    await this.awardReward(userId, mission.reward);
    
    // Update user stats
    await this.updateUser(userId, {
      missionsCompleted: user.missionsCompleted + 1,
      totalPoints: user.totalPoints + (mission.reward.points || 0)
    });

    // Update mission status
    mission.status = MissionStatus.COMPLETED;
    mission.completedAt = new Date();
    this.missions.set(missionId, mission);

    // Log event
    this.logEvent(userId, GamificationEventType.MISSION_COMPLETED, {
      missionId,
      reward: mission.reward
    }, mission.reward.points || 0);

    return mission.reward;
  }

  // Reward System
  async awardReward(userId: string, reward: Reward): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) return;

    switch (reward.type) {
      case RewardType.POINTS:
        await this.updateUser(userId, {
          totalPoints: user.totalPoints + reward.amount
        });
        break;
      case RewardType.NFT:
        if (reward.nftId) {
          await this.mintNFT(userId, reward.nftId);
        }
        break;
      case RewardType.KAIA_TOKENS:
        // Handle KAIA token transfer
        break;
      case RewardType.BONUS_APY:
        // Handle bonus APY
        break;
    }

    this.logEvent(userId, GamificationEventType.POINTS_EARNED, {
      reward
    }, reward.points || 0);
  }

  // NFT System
  async mintNFT(userId: string, nftId: string): Promise<NFT | null> {
    const nftTemplate = this.nfts.get(nftId);
    if (!nftTemplate) return null;

    const nft: NFT = {
      ...nftTemplate,
      id: `${nftId}_${Date.now()}`,
      ownerId: userId,
      mintedAt: new Date()
    };

    this.nfts.set(nft.id, nft);
    
    this.logEvent(userId, GamificationEventType.NFT_CLAIMED, {
      nftId: nft.id
    }, 0);

    return nft;
  }

  async getUserNFTs(userId: string): Promise<NFT[]> {
    return Array.from(this.nfts.values()).filter(nft => nft.ownerId === userId);
  }

  // Leaderboard System
  async getLeaderboard(type: LeaderboardType, period: LeaderboardPeriod): Promise<Leaderboard> {
    const entries = await this.generateLeaderboardEntries(type);
    
    return {
      id: `${type}_${period}`,
      title: this.getLeaderboardTitle(type, period),
      type,
      entries,
      totalParticipants: entries.length,
      lastUpdated: new Date(),
      period
    };
  }

  private async generateLeaderboardEntries(type: LeaderboardType) {
    const users = Array.from(this.users.values());
    
    let sortedUsers: GamificationUser[];
    
    switch (type) {
      case LeaderboardType.POINTS:
        sortedUsers = users.sort((a, b) => b.totalPoints - a.totalPoints);
        break;
      case LeaderboardType.LEVEL:
        sortedUsers = users.sort((a, b) => b.level - a.level);
        break;
      case LeaderboardType.TRADING_VOLUME:
        sortedUsers = users.sort((a, b) => (b.totalDeposits + b.totalWithdrawals) - (a.totalDeposits + a.totalWithdrawals));
        break;
      case LeaderboardType.REFERRALS:
        sortedUsers = users.sort((a, b) => b.friendsInvited - a.friendsInvited);
        break;
      case LeaderboardType.STREAK:
        sortedUsers = users.sort((a, b) => b.streakDays - a.streakDays);
        break;
      case LeaderboardType.ACHIEVEMENTS:
        sortedUsers = users.sort((a, b) => b.achievements.length - a.achievements.length);
        break;
      default:
        sortedUsers = users.sort((a, b) => b.totalPoints - a.totalPoints);
    }

    return sortedUsers.map((user, index) => ({
      rank: index + 1,
      userId: user.userId,
      username: `User${user.userId.slice(-4)}`,
      points: user.totalPoints,
      level: user.level,
      achievements: user.achievements.length,
      badges: user.badges.length
    }));
  }

  private getLeaderboardTitle(type: LeaderboardType, period: LeaderboardPeriod): string {
    const typeTitles = {
      [LeaderboardType.POINTS]: 'Points',
      [LeaderboardType.LEVEL]: 'Level',
      [LeaderboardType.TRADING_VOLUME]: 'Trading Volume',
      [LeaderboardType.REFERRALS]: 'Referrals',
      [LeaderboardType.STREAK]: 'Streak',
      [LeaderboardType.ACHIEVEMENTS]: 'Achievements'
    };

    const periodTitles = {
      [LeaderboardPeriod.DAILY]: 'Daily',
      [LeaderboardPeriod.WEEKLY]: 'Weekly',
      [LeaderboardPeriod.MONTHLY]: 'Monthly',
      [LeaderboardPeriod.ALL_TIME]: 'All Time'
    };

    return `${periodTitles[period]} ${typeTitles[type]} Leaderboard`;
  }

  // Point Exchange System
  async getExchangeRates(): Promise<PointExchangeRate[]> {
    return [
      {
        fromCurrency: 'LINE_YIELD_POINTS',
        toCurrency: 'KAIA',
        rate: 0.001, // 1000 points = 1 KAIA
        minAmount: 1000,
        maxAmount: 100000,
        fee: 0.05, // 5% fee
        lastUpdated: new Date()
      }
    ];
  }

  async exchangePoints(userId: string, points: number, toCurrency: string): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user || user.totalPoints < points) return false;

    const rates = await this.getExchangeRates();
    const rate = rates.find(r => r.fromCurrency === 'LINE_YIELD_POINTS' && r.toCurrency === toCurrency);
    if (!rate) return false;

    const exchangeAmount = points * rate.rate;
    const fee = exchangeAmount * rate.fee;
    const finalAmount = exchangeAmount - fee;

    // Update user points
    await this.updateUser(userId, {
      totalPoints: user.totalPoints - points
    });

    // Log exchange event
    this.logEvent(userId, GamificationEventType.POINTS_EXCHANGED, {
      pointsExchanged: points,
      currencyReceived: toCurrency,
      amountReceived: finalAmount,
      fee
    }, 0);

    return true;
  }

  // Event Logging
  private logEvent(userId: string, type: GamificationEventType, data: any, pointsEarned: number): void {
    const event: GamificationEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      data,
      pointsEarned,
      timestamp: new Date()
    };

    this.events.push(event);
  }

  async getUserEvents(userId: string, limit: number = 50): Promise<GamificationEvent[]> {
    return this.events
      .filter(event => event.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Statistics
  async getGamificationStats(): Promise<GamificationStats> {
    const users = Array.from(this.users.values());
    const totalPoints = users.reduce((sum, user) => sum + user.totalPoints, 0);
    const totalMissions = users.reduce((sum, user) => sum + user.missionsCompleted, 0);
    const totalNFTs = Array.from(this.nfts.values()).length;
    const averageLevel = users.length > 0 ? users.reduce((sum, user) => sum + user.level, 0) / users.length : 0;

    const topPerformer = users.length > 0 
      ? users.reduce((top, user) => user.totalPoints > top.totalPoints ? user : top)
      : null;

    return {
      totalUsers: users.length,
      totalPointsEarned: totalPoints,
      totalMissionsCompleted: totalMissions,
      totalNFTsMinted: totalNFTs,
      totalKAIAExchanged: 0, // TODO: Implement tracking
      averageLevel: Math.round(averageLevel * 100) / 100,
      topPerformer: topPerformer ? {
        rank: 1,
        userId: topPerformer.userId,
        username: `User${topPerformer.userId.slice(-4)}`,
        points: topPerformer.totalPoints,
        level: topPerformer.level,
        achievements: topPerformer.achievements.length,
        badges: topPerformer.badges.length
      } : {
        rank: 1,
        userId: '',
        username: 'No users yet',
        points: 0,
        level: 1,
        achievements: 0,
        badges: 0
      },
      recentAchievements: Array.from(this.achievements.values()).slice(0, 5)
    };
  }
}
