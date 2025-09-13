import { useState, useEffect, useCallback } from 'react';
import { GamificationService } from '../services/gamificationService';
import {
  GamificationUser,
  Mission,
  Leaderboard,
  LeaderboardType,
  LeaderboardPeriod,
  NFT,
  PointExchangeRate,
  GamificationStats,
  GamificationEvent,
  Reward
} from '../types/gamification';

export function useGamification(userId?: string) {
  const [user, setUser] = useState<GamificationUser | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gamificationService = GamificationService.getInstance();

  const loadUser = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let userData = await gamificationService.getUser(userId);
      if (!userData) {
        userData = await gamificationService.createUser(userId, '');
      }
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  }, [userId, gamificationService]);

  const loadMissions = useCallback(async () => {
    if (!userId) return;
    
    try {
      const userMissions = await gamificationService.getMissions(userId);
      setMissions(userMissions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load missions');
    }
  }, [userId, gamificationService]);

  const completeMission = useCallback(async (missionId: string): Promise<Reward | null> => {
    if (!userId) return null;
    
    try {
      const reward = await gamificationService.completeMission(userId, missionId);
      if (reward) {
        await loadUser();
        await loadMissions();
      }
      return reward;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete mission');
      return null;
    }
  }, [userId, gamificationService, loadUser, loadMissions]);

  const updateUserProgress = useCallback(async (updates: Partial<GamificationUser>) => {
    if (!userId) return;
    
    try {
      const updatedUser = await gamificationService.updateUser(userId, updates);
      setUser(updatedUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    }
  }, [userId, gamificationService]);

  useEffect(() => {
    if (userId) {
      loadUser();
      loadMissions();
    }
  }, [userId, loadUser, loadMissions]);

  return {
    user,
    missions,
    loading,
    error,
    completeMission,
    updateUserProgress,
    refresh: () => {
      loadUser();
      loadMissions();
    }
  };
}

export function useLeaderboard(type: LeaderboardType = LeaderboardType.POINTS, period: LeaderboardPeriod = LeaderboardPeriod.ALL_TIME) {
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gamificationService = GamificationService.getInstance();

  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await gamificationService.getLeaderboard(type, period);
      setLeaderboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }, [type, period, gamificationService]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  return {
    leaderboard,
    loading,
    error,
    refresh: loadLeaderboard
  };
}

export function useNFTs(userId?: string) {
  const [nfts, setNFTs] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gamificationService = GamificationService.getInstance();

  const loadNFTs = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const userNFTs = await gamificationService.getUserNFTs(userId);
      setNFTs(userNFTs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load NFTs');
    } finally {
      setLoading(false);
    }
  }, [userId, gamificationService]);

  const claimNFT = useCallback(async (nftId: string): Promise<NFT | null> => {
    if (!userId) return null;
    
    try {
      const nft = await gamificationService.mintNFT(userId, nftId);
      if (nft) {
        await loadNFTs();
      }
      return nft;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to claim NFT');
      return null;
    }
  }, [userId, gamificationService, loadNFTs]);

  useEffect(() => {
    if (userId) {
      loadNFTs();
    }
  }, [userId, loadNFTs]);

  return {
    nfts,
    loading,
    error,
    claimNFT,
    refresh: loadNFTs
  };
}

export function usePointExchange(userId?: string) {
  const [exchangeRates, setExchangeRates] = useState<PointExchangeRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gamificationService = GamificationService.getInstance();

  const loadExchangeRates = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const rates = await gamificationService.getExchangeRates();
      setExchangeRates(rates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load exchange rates');
    } finally {
      setLoading(false);
    }
  }, [gamificationService]);

  const exchangePoints = useCallback(async (points: number, toCurrency: string): Promise<boolean> => {
    if (!userId) return false;
    
    try {
      const success = await gamificationService.exchangePoints(userId, points, toCurrency);
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to exchange points');
      return false;
    }
  }, [userId, gamificationService]);

  useEffect(() => {
    loadExchangeRates();
  }, [loadExchangeRates]);

  return {
    exchangeRates,
    loading,
    error,
    exchangePoints,
    refresh: loadExchangeRates
  };
}

export function useGamificationStats() {
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gamificationService = GamificationService.getInstance();

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await gamificationService.getGamificationStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  }, [gamificationService]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    refresh: loadStats
  };
}

export function useGamificationEvents(userId?: string, limit: number = 50) {
  const [events, setEvents] = useState<GamificationEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gamificationService = GamificationService.getInstance();

  const loadEvents = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const userEvents = await gamificationService.getUserEvents(userId, limit);
      setEvents(userEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [userId, limit, gamificationService]);

  useEffect(() => {
    if (userId) {
      loadEvents();
    }
  }, [userId, loadEvents]);

  return {
    events,
    loading,
    error,
    refresh: loadEvents
  };
}
