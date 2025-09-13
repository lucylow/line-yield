import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Target, 
  Crown, 
  Coins, 
  Users, 
  TrendingUp,
  Gift,
  Award,
  Star,
  Zap,
  RefreshCw,
  Calendar,
  BarChart3
} from 'lucide-react';
import { MissionCard } from './MissionCard';
import { LeaderboardComponent } from './Leaderboard';
import { NFTCard } from './NFTCard';
import { PointExchange } from './PointExchange';
import { 
  useGamification, 
  useLeaderboard, 
  useNFTs, 
  usePointExchange,
  useGamificationStats 
} from '../hooks/useGamification';
import { LeaderboardType, LeaderboardPeriod } from '../types/gamification';
import { useT } from '../hooks/useLocalization';
import { cn } from '../utils/cn';

interface GamificationDashboardProps {
  userId: string;
  className?: string;
}

export const GamificationDashboard: React.FC<GamificationDashboardProps> = ({
  userId,
  className = ''
}) => {
  const t = useT();
  const [activeTab, setActiveTab] = useState('missions');
  const [selectedLeaderboardType, setSelectedLeaderboardType] = useState<LeaderboardType>(LeaderboardType.POINTS);
  const [selectedLeaderboardPeriod, setSelectedLeaderboardPeriod] = useState<LeaderboardPeriod>(LeaderboardPeriod.ALL_TIME);

  const {
    user,
    missions,
    loading: userLoading,
    completeMission,
    refresh: refreshUser
  } = useGamification(userId);

  const {
    leaderboard,
    loading: leaderboardLoading,
    refresh: refreshLeaderboard
  } = useLeaderboard(selectedLeaderboardType, selectedLeaderboardPeriod);

  const {
    nfts,
    loading: nftsLoading,
    claimNFT,
    refresh: refreshNFTs
  } = useNFTs(userId);

  const {
    exchangeRates,
    loading: exchangeLoading,
    exchangePoints,
    refresh: refreshExchange
  } = usePointExchange(userId);

  const {
    stats,
    loading: statsLoading
  } = useGamificationStats();

  const handleCompleteMission = async (missionId: string) => {
    const reward = await completeMission(missionId);
    if (reward) {
      // Show success notification
      console.log('Mission completed!', reward);
    }
  };

  const handleClaimNFT = async (nftId: string) => {
    const nft = await claimNFT(nftId);
    if (nft) {
      // Show success notification
      console.log('NFT claimed!', nft);
    }
  };

  const handleExchangePoints = async (points: number, toCurrency: string) => {
    return await exchangePoints(points, toCurrency);
  };

  const getLevelProgress = () => {
    if (!user) return { current: 0, total: 100, percentage: 0 };
    const currentLevelExp = user.experience % 1000;
    const totalLevelExp = 1000;
    const percentage = (currentLevelExp / totalLevelExp) * 100;
    return { current: currentLevelExp, total: totalLevelExp, percentage };
  };

  const levelProgress = getLevelProgress();

  if (userLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading gamification data...</span>
      </div>
    );
  }

  return (
    <div className={cn('w-full space-y-6', className)}>
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Trophy className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{user?.totalPoints || 0}</div>
                <div className="text-sm text-gray-600">Total Points</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{user?.missionsCompleted || 0}</div>
                <div className="text-sm text-gray-600">Missions Done</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Crown className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">Level {user?.level || 1}</div>
                <div className="text-sm text-gray-600">Current Level</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Users className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{user?.friendsInvited || 0}</div>
                <div className="text-sm text-gray-600">Friends Invited</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Level Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Experience to Next Level</span>
              <span>{levelProgress.current} / {levelProgress.total} XP</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${levelProgress.percentage}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 text-center">
              {Math.round(levelProgress.percentage)}% to Level {(user?.level || 1) + 1}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="missions" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Missions
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="nfts" className="flex items-center gap-2">
            <Gift className="w-4 h-4" />
            NFTs
          </TabsTrigger>
          <TabsTrigger value="exchange" className="flex items-center gap-2">
            <Coins className="w-4 h-4" />
            Exchange
          </TabsTrigger>
        </TabsList>

        {/* Missions Tab */}
        <TabsContent value="missions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Available Missions</h3>
            <Button variant="outline" size="sm" onClick={refreshUser}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {missions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                onComplete={handleCompleteMission}
              />
            ))}
          </div>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Leaderboards</h3>
            <div className="flex gap-2">
              <select
                value={selectedLeaderboardType}
                onChange={(e) => setSelectedLeaderboardType(e.target.value as LeaderboardType)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value={LeaderboardType.POINTS}>Points</option>
                <option value={LeaderboardType.LEVEL}>Level</option>
                <option value={LeaderboardType.TRADING_VOLUME}>Trading Volume</option>
                <option value={LeaderboardType.REFERRALS}>Referrals</option>
                <option value={LeaderboardType.STREAK}>Streak</option>
                <option value={LeaderboardType.ACHIEVEMENTS}>Achievements</option>
              </select>
              <select
                value={selectedLeaderboardPeriod}
                onChange={(e) => setSelectedLeaderboardPeriod(e.target.value as LeaderboardPeriod)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value={LeaderboardPeriod.DAILY}>Daily</option>
                <option value={LeaderboardPeriod.WEEKLY}>Weekly</option>
                <option value={LeaderboardPeriod.MONTHLY}>Monthly</option>
                <option value={LeaderboardPeriod.ALL_TIME}>All Time</option>
              </select>
              <Button variant="outline" size="sm" onClick={refreshLeaderboard}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {leaderboard && (
            <LeaderboardComponent
              leaderboard={leaderboard}
              loading={leaderboardLoading}
              onRefresh={refreshLeaderboard}
            />
          )}
        </TabsContent>

        {/* NFTs Tab */}
        <TabsContent value="nfts" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Your NFT Collection</h3>
            <Button variant="outline" size="sm" onClick={refreshNFTs}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {nfts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {nfts.map((nft) => (
                <NFTCard
                  key={nft.id}
                  nft={nft}
                  onView={(nftId) => console.log('View NFT:', nftId)}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Gift className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No NFTs Yet</h4>
                <p className="text-gray-600 mb-4">
                  Complete missions to earn exclusive NFTs!
                </p>
                <Button onClick={() => setActiveTab('missions')}>
                  View Missions
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Exchange Tab */}
        <TabsContent value="exchange" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Point Exchange</h3>
            <Button variant="outline" size="sm" onClick={refreshExchange}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Rates
            </Button>
          </div>

          <PointExchange
            exchangeRates={exchangeRates}
            userPoints={user?.totalPoints || 0}
            onExchange={handleExchangePoints}
            loading={exchangeLoading}
          />
        </TabsContent>
      </Tabs>

      {/* Global Stats */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Global Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
                <div className="text-sm text-gray-600">Total Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.totalPointsEarned.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Points Earned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.totalMissionsCompleted}</div>
                <div className="text-sm text-gray-600">Missions Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.totalNFTsMinted}</div>
                <div className="text-sm text-gray-600">NFTs Minted</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GamificationDashboard;
