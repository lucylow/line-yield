import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Star, 
  Users, 
  TrendingUp,
  Gift,
  Clock,
  Target,
  Award,
  Zap,
  RefreshCw,
  ExternalLink,
  Crown,
  Medal,
  Coins
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/useWallet';
import { gamificationService, UserStats, LeaderboardEntry, ContractStats } from '@/services/GamificationService';
import { formatCurrency } from '@/utils/formatters';

interface GamificationDashboardProps {
  className?: string;
}

export const GamificationDashboard: React.FC<GamificationDashboardProps> = ({ className }) => {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [contractStats, setContractStats] = useState<ContractStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nextDistribution, setNextDistribution] = useState<number>(0);
  
  const { wallet } = useWallet();
  const { toast } = useToast();

  // Load gamification data
  useEffect(() => {
    if (wallet.connected && wallet.provider) {
      loadGamificationData();
    }
  }, [wallet.connected, wallet.provider]);

  const loadGamificationData = async () => {
    if (!wallet.provider || !wallet.address) return;

    setIsLoading(true);
    try {
      // Initialize gamification service
      await gamificationService.initialize(wallet.provider, wallet.signer);

      // Load user stats
      const stats = await gamificationService.getUserStats(wallet.address);
      setUserStats(stats);

      // Load leaderboard
      const board = await gamificationService.getLeaderboard();
      setLeaderboard(board);

      // Load contract stats
      const contract = await gamificationService.getContractStats();
      setContractStats(contract);

      // Get next distribution time
      const nextDist = await gamificationService.getNextDistributionTime();
      setNextDistribution(nextDist);

    } catch (error) {
      console.error('Failed to load gamification data:', error);
      toast({
        title: 'Loading Failed',
        description: 'Failed to load gamification data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    await loadGamificationData();
    toast({
      title: 'Data Refreshed',
      description: 'Gamification data has been updated',
    });
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <Trophy className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-500';
      case 2:
        return 'bg-gray-400';
      case 3:
        return 'bg-amber-600';
      default:
        return 'bg-blue-500';
    }
  };

  const formatTimeUntilDistribution = (timestamp: number) => {
    const now = Date.now();
    const diff = timestamp - now;
    
    if (diff <= 0) return 'Available now';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const calculateProgressToNextRank = (currentPoints: string, leaderboard: LeaderboardEntry[]): number => {
    if (leaderboard.length === 0) return 0;
    
    const currentRank = leaderboard.find(entry => 
      entry.address.toLowerCase() === wallet.address?.toLowerCase()
    )?.rank || leaderboard.length + 1;
    
    if (currentRank <= 1) return 100;
    
    const nextRankEntry = leaderboard[currentRank - 2]; // Rank is 1-indexed
    const currentPointsNum = parseFloat(currentPoints);
    const nextRankPoints = parseFloat(nextRankEntry.points);
    
    if (nextRankPoints <= 0) return 0;
    
    return Math.min((currentPointsNum / nextRankPoints) * 100, 100);
  };

  if (isLoading) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading gamification data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            LINE YIELD Points
          </h1>
          <p className="text-muted-foreground">
            Earn points, climb the leaderboard, and unlock rewards
          </p>
        </div>

        {/* User Stats Cards */}
        {userStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-yellow-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Current Points</p>
                    <p className="text-lg font-semibold">{formatCurrency(userStats.balance)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Earned</p>
                    <p className="text-lg font-semibold">{formatCurrency(userStats.totalEarned)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Referrals</p>
                    <p className="text-lg font-semibold">{userStats.referrals}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Rank</p>
                    <p className="text-lg font-semibold">
                      {userStats.rank ? `#${userStats.rank}` : 'Unranked'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Progress to Next Rank */}
        {userStats && leaderboard.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Progress to Next Rank
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Current: {formatCurrency(userStats.balance)} points</span>
                  <span>
                    Next Rank: {leaderboard.find(entry => 
                      entry.address.toLowerCase() === wallet.address?.toLowerCase()
                    )?.rank === 1 ? 'Champion!' : 'Keep climbing!'}
                  </span>
                </div>
                <Progress 
                  value={calculateProgressToNextRank(userStats.balance, leaderboard)} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="leaderboard" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="earnings" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Earnings
            </TabsTrigger>
            <TabsTrigger value="rewards" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Rewards
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Top Performers
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={refreshData}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {leaderboard.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No leaderboard data available</p>
                    <p className="text-sm">Start earning points to appear on the leaderboard!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leaderboard.map((entry, index) => (
                      <div 
                        key={entry.address} 
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          entry.address.toLowerCase() === wallet.address?.toLowerCase() 
                            ? 'bg-blue-50 border-blue-200' 
                            : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getRankColor(entry.rank)}`}>
                            {getRankIcon(entry.rank)}
                          </div>
                          <div>
                            <p className="font-medium">
                              {entry.address.toLowerCase() === wallet.address?.toLowerCase() 
                                ? 'You' 
                                : entry.displayName || entry.address.slice(0, 6) + '...' + entry.address.slice(-4)
                              }
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Rank #{entry.rank}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(entry.points)}</p>
                          <p className="text-sm text-muted-foreground">points</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Earning Methods */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Earning Methods
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="font-medium">Deposits</span>
                      </div>
                      <Badge variant="outline">1 point per USDT</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">Referrals</span>
                      </div>
                      <Badge variant="outline">50 points each</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-purple-500" />
                        <span className="font-medium">Holding</span>
                      </div>
                      <Badge variant="outline">10 points/day</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Daily Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    Daily Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">Next Distribution</p>
                    <p className="text-lg font-semibold">
                      {formatTimeUntilDistribution(nextDistribution)}
                    </p>
                  </div>
                  
                  {contractStats && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Daily Pool</span>
                        <span>{formatCurrency(contractStats.dailyPool)} points</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total Distributed</span>
                        <span>{formatCurrency(contractStats.totalDistributed)} points</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="rewards" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Available Rewards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Premium Features</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Unlock advanced yield optimization strategies
                    </p>
                    <Badge variant="outline">1000 points</Badge>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Gas Credits</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Get free gas for your transactions
                    </p>
                    <Badge variant="outline">500 points</Badge>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Priority Support</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Get faster customer support
                    </p>
                    <Badge variant="outline">200 points</Badge>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Exclusive NFTs</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Limited edition LINE YIELD NFTs
                    </p>
                    <Badge variant="outline">5000 points</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Contract Stats */}
        {contractStats && (
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Protocol Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Total Points</p>
                  <p className="text-lg font-semibold">{formatCurrency(contractStats.totalDistributed)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Daily Pool</p>
                  <p className="text-lg font-semibold">{formatCurrency(contractStats.dailyPool)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Leaderboard Size</p>
                  <p className="text-lg font-semibold">{contractStats.leaderboardSize}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Distribution</p>
                  <p className="text-lg font-semibold">
                    {new Date(contractStats.lastDistributed * 1000).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GamificationDashboard;

