export interface GamificationUser {
  userId: string;
  walletAddress: string;
  totalPoints: number;
  level: number;
  experience: number;
  missionsCompleted: number;
  friendsInvited: number;
  totalDeposits: number;
  totalWithdrawals: number;
  streakDays: number;
  lastActiveDate: Date;
  achievements: Achievement[];
  badges: Badge[];
  rank: number;
  joinDate: Date;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: MissionType;
  target: number;
  current: number;
  reward: Reward;
  status: MissionStatus;
  difficulty: MissionDifficulty;
  category: MissionCategory;
  expiresAt?: Date;
  createdAt: Date;
  completedAt?: Date;
}

export enum MissionType {
  FIRST_PURCHASE = 'first_purchase',
  COMPLETE_MISSIONS = 'complete_missions',
  INVITE_FRIENDS = 'invite_friends',
  DEPOSIT_AMOUNT = 'deposit_amount',
  WITHDRAW_AMOUNT = 'withdraw_amount',
  STREAK_DAYS = 'streak_days',
  TRADE_VOLUME = 'trade_volume',
  REFERRAL_BONUS = 'referral_bonus',
  SOCIAL_SHARE = 'social_share',
  COMMUNITY_PARTICIPATION = 'community_participation'
}

export enum MissionStatus {
  LOCKED = 'locked',
  AVAILABLE = 'available',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  EXPIRED = 'expired'
}

export enum MissionDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert'
}

export enum MissionCategory {
  BEGINNER = 'beginner',
  TRADING = 'trading',
  SOCIAL = 'social',
  COMMUNITY = 'community',
  SPECIAL = 'special'
}

export interface Reward {
  id: string;
  type: RewardType;
  amount: number;
  currency?: string;
  nftId?: string;
  points?: number;
  description: string;
  rarity: RewardRarity;
}

export enum RewardType {
  POINTS = 'points',
  KAIA_TOKENS = 'kaia_tokens',
  NFT = 'nft',
  BONUS_APY = 'bonus_apy',
  PREMIUM_FEATURES = 'premium_features',
  EXCLUSIVE_ACCESS = 'exclusive_access'
}

export enum RewardRarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  rarity: RewardRarity;
  unlockedAt: Date;
  category: AchievementCategory;
}

export enum AchievementCategory {
  TRADING = 'trading',
  SOCIAL = 'social',
  MILESTONE = 'milestone',
  SPECIAL = 'special',
  COLLECTION = 'collection'
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedAt: Date;
  rarity: RewardRarity;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar?: string;
  points: number;
  level: number;
  achievements: number;
  badges: number;
  isCurrentUser?: boolean;
}

export interface Leaderboard {
  id: string;
  title: string;
  type: LeaderboardType;
  entries: LeaderboardEntry[];
  totalParticipants: number;
  lastUpdated: Date;
  period: LeaderboardPeriod;
}

export enum LeaderboardType {
  POINTS = 'points',
  LEVEL = 'level',
  TRADING_VOLUME = 'trading_volume',
  REFERRALS = 'referrals',
  STREAK = 'streak',
  ACHIEVEMENTS = 'achievements'
}

export enum LeaderboardPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  ALL_TIME = 'all_time'
}

export interface NFT {
  id: string;
  name: string;
  description: string;
  image: string;
  rarity: RewardRarity;
  attributes: NFTAttribute[];
  mintedAt: Date;
  ownerId: string;
  collection: string;
  tokenId: string;
  contractAddress: string;
}

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  rarity_score?: number;
}

export interface PointExchangeRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  minAmount: number;
  maxAmount: number;
  fee: number;
  lastUpdated: Date;
}

export interface GamificationStats {
  totalUsers: number;
  totalPointsEarned: number;
  totalMissionsCompleted: number;
  totalNFTsMinted: number;
  totalKAIAExchanged: number;
  averageLevel: number;
  topPerformer: LeaderboardEntry;
  recentAchievements: Achievement[];
}

export interface MissionProgress {
  missionId: string;
  userId: string;
  currentValue: number;
  targetValue: number;
  percentage: number;
  lastUpdated: Date;
}

export interface GamificationEvent {
  id: string;
  userId: string;
  type: GamificationEventType;
  data: any;
  pointsEarned: number;
  timestamp: Date;
}

export enum GamificationEventType {
  MISSION_COMPLETED = 'mission_completed',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  BADGE_EARNED = 'badge_earned',
  LEVEL_UP = 'level_up',
  POINTS_EARNED = 'points_earned',
  NFT_CLAIMED = 'nft_claimed',
  POINTS_EXCHANGED = 'points_exchanged',
  REFERRAL_SUCCESS = 'referral_success'
}
