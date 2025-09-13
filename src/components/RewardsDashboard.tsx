import React, { useState, useEffect } from 'react';
import { useRewards } from '@/hooks/useRewards';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RewardsDashboardProps {
  className?: string;
}

export const RewardsDashboard: React.FC<RewardsDashboardProps> = ({ className = '' }) => {
  const { wallet } = useWallet();
  const {
    isLoading,
    error,
    userPoints,
    rewardHistory,
    drawHistory,
    claimSignupBonus,
    claimDailyLogin,
    claimTransactionBonus,
    performItemDraw,
    refreshUserPoints,
    refreshRewardHistory,
    refreshDrawHistory,
    clearError,
    getTierColor,
    getTierIcon,
    getRarityColor
  } = useRewards();

  const [selectedDrawType, setSelectedDrawType] = useState<'common' | 'premium'>('common');
  const [lastDrawResult, setLastDrawResult] = useState<any>(null);

  // Load user data when wallet connects
  useEffect(() => {
    if (wallet.isConnected && wallet.address) {
      refreshUserPoints(wallet.address);
      refreshRewardHistory(wallet.address);
      refreshDrawHistory(wallet.address);
    }
  }, [wallet.isConnected, wallet.address, refreshUserPoints, refreshRewardHistory, refreshDrawHistory]);

  const handleSignupBonus = async () => {
    if (!wallet.address) return;
    try {
      await claimSignupBonus(wallet.address);
    } catch (error) {
      console.error('Failed to claim signup bonus:', error);
    }
  };

  const handleDailyLogin = async () => {
    if (!wallet.address) return;
    try {
      await claimDailyLogin(wallet.address);
    } catch (error) {
      console.error('Failed to claim daily login:', error);
    }
  };

  const handleItemDraw = async () => {
    if (!wallet.address) return;
    try {
      const result = await performItemDraw(wallet.address, selectedDrawType);
      setLastDrawResult(result);
    } catch (error) {
      console.error('Failed to perform item draw:', error);
    }
  };

  const getDrawCost = (type: 'common' | 'premium'): number => {
    return type === 'premium' ? 1000 : 500;
  };

  const getNextLevelPoints = (): number => {
    if (!userPoints) return 0;
    const milestones = [0, 1000, 2500, 5000, 10000];
    const currentLevel = userPoints.level;
    return currentLevel < milestones.length - 1 ? milestones[currentLevel] : milestones[milestones.length - 1];
  };

  const getLevelProgress = (): number => {
    if (!userPoints) return 0;
    const milestones = [0, 1000, 2500, 5000, 10000];
    const currentLevel = userPoints.level;
    const currentMilestone = milestones[currentLevel - 1] || 0;
    const nextMilestone = milestones[currentLevel] || milestones[milestones.length - 1];
    return ((userPoints.totalPoints - currentMilestone) / (nextMilestone - currentMilestone)) * 100;
  };

  if (!wallet.isConnected) {
    return (
      <div className={`max-w-4xl mx-auto p-6 ${className}`}>
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect Wallet to Access Rewards</h3>
            <p className="text-gray-600">Connect your wallet to view and claim your rewards</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`max-w-6xl mx-auto p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🎁 Rewards Center</h1>
        <p className="text-gray-600">Earn points, level up, and win amazing prizes!</p>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error}
            <Button onClick={clearError} variant="link" className="ml-2 p-0 h-auto">
              Clear
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* User Points Overview */}
      {userPoints && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">{getTierIcon(userPoints.tier)}</span>
                Current Tier
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <Badge className={`text-lg px-4 py-2 ${getTierColor(userPoints.tier)}`}>
                  {userPoints.tier.toUpperCase()}
                </Badge>
                <p className="text-sm text-gray-600 mt-2">Level {userPoints.level}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {userPoints.availablePoints.toLocaleString()}
                </div>
                <p className="text-sm text-gray-600">Points Available</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {userPoints.totalPoints.toLocaleString()}
                </div>
                <p className="text-sm text-gray-600">All Time Points</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Level Progress */}
      {userPoints && (
        <Card>
          <CardHeader>
            <CardTitle>Level Progress</CardTitle>
            <CardDescription>
              Progress to next level: {userPoints.totalPoints.toLocaleString()} / {getNextLevelPoints().toLocaleString()} points
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={getLevelProgress()} className="h-3" />
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>Level {userPoints.level}</span>
              <span>Level {userPoints.level + 1}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="rewards" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="rewards">Claim Rewards</TabsTrigger>
          <TabsTrigger value="draw">Item Draw</TabsTrigger>
          <TabsTrigger value="history">Reward History</TabsTrigger>
          <TabsTrigger value="draw-history">Draw History</TabsTrigger>
        </TabsList>

        {/* Claim Rewards Tab */}
        <TabsContent value="rewards" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Signup Bonus */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎉 Welcome Bonus
                </CardTitle>
                <CardDescription>
                  New users get 1,000 points just for signing up!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">1,000 Points</div>
                    <p className="text-sm text-gray-600">One-time bonus</p>
                  </div>
                  <Button 
                    onClick={handleSignupBonus}
                    disabled={isLoading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? 'Processing...' : 'Claim Welcome Bonus'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Daily Login */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📅 Daily Login
                </CardTitle>
                <CardDescription>
                  Earn 50 points every day you log in!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">50 Points</div>
                    <p className="text-sm text-gray-600">Daily reward</p>
                  </div>
                  <Button 
                    onClick={handleDailyLogin}
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? 'Processing...' : 'Claim Daily Login'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* KAIA Rewards */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  ⚡ KAIA Rewards
                </CardTitle>
                <CardDescription>
                  Special rewards for KAIA network activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">First Deposit</div>
                      <div className="text-sm text-gray-600">200 points</div>
                    </div>
                    <Badge variant="outline">Auto-claimed</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">Yield Milestone</div>
                      <div className="text-sm text-gray-600">300 points</div>
                    </div>
                    <Badge variant="outline">Auto-claimed</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">Long-term Holder</div>
                      <div className="text-sm text-gray-600">500 points</div>
                    </div>
                    <Badge variant="outline">Auto-claimed</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transaction Bonuses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  💰 Transaction Bonuses
                </CardTitle>
                <CardDescription>
                  Earn points for your DeFi activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">Deposit</div>
                      <div className="text-sm text-gray-600">100 points</div>
                    </div>
                    <Badge variant="outline">Auto-claimed</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">Withdraw</div>
                      <div className="text-sm text-gray-600">50 points</div>
                    </div>
                    <Badge variant="outline">Auto-claimed</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">Yield Earned</div>
                      <div className="text-sm text-gray-600">200 points</div>
                    </div>
                    <Badge variant="outline">Auto-claimed</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Item Draw Tab */}
        <TabsContent value="draw" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎲 Item Draw
              </CardTitle>
              <CardDescription>
                Spend points to draw random items with different rarities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Draw Type Selection */}
              <div className="grid grid-cols-2 gap-4">
                <Card 
                  className={`cursor-pointer transition-colors ${
                    selectedDrawType === 'common' ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedDrawType('common')}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-lg font-semibold">Common Draw</div>
                    <div className="text-sm text-gray-600">500 Points</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Higher chance for common items
                    </div>
                  </CardContent>
                </Card>
                <Card 
                  className={`cursor-pointer transition-colors ${
                    selectedDrawType === 'premium' ? 'ring-2 ring-purple-500 bg-purple-50' : ''
                  }`}
                  onClick={() => setSelectedDrawType('premium')}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-lg font-semibold">Premium Draw</div>
                    <div className="text-sm text-gray-600">1,000 Points</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Better chance for rare items
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Draw Button */}
              <div className="text-center">
                <Button 
                  onClick={handleItemDraw}
                  disabled={isLoading || !userPoints || userPoints.availablePoints < getDrawCost(selectedDrawType)}
                  className={`px-8 py-3 text-lg ${
                    selectedDrawType === 'premium' 
                      ? 'bg-purple-600 hover:bg-purple-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isLoading ? 'Drawing...' : `Draw ${selectedDrawType === 'premium' ? 'Premium' : 'Common'} Item`}
                </Button>
                {userPoints && userPoints.availablePoints < getDrawCost(selectedDrawType) && (
                  <p className="text-sm text-red-600 mt-2">
                    Insufficient points. Need {getDrawCost(selectedDrawType)} points.
                  </p>
                )}
              </div>

              {/* Last Draw Result */}
              {lastDrawResult && (
                <Card className="bg-gradient-to-r from-green-50 to-blue-50">
                  <CardContent className="p-6 text-center">
                    <div className="text-2xl mb-2">🎉 Congratulations!</div>
                    <div className="text-lg font-semibold mb-2">{lastDrawResult.reward?.name}</div>
                    <Badge className={`${getRarityColor(lastDrawResult.reward?.rarity)} text-lg px-4 py-2`}>
                      {lastDrawResult.reward?.rarity?.toUpperCase()}
                    </Badge>
                    <div className="text-sm text-gray-600 mt-2">
                      Points deducted: {lastDrawResult.pointsDeducted}
                    </div>
                    <div className="text-sm text-gray-600">
                      Remaining points: {lastDrawResult.remainingPoints}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Rarity Information */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <Badge className={`${getRarityColor('common')} w-full`}>Common</Badge>
                  <div className="text-xs text-gray-600 mt-1">50% chance</div>
                </div>
                <div className="text-center">
                  <Badge className={`${getRarityColor('rare')} w-full`}>Rare</Badge>
                  <div className="text-xs text-gray-600 mt-1">30% chance</div>
                </div>
                <div className="text-center">
                  <Badge className={`${getRarityColor('epic')} w-full`}>Epic</Badge>
                  <div className="text-xs text-gray-600 mt-1">15% chance</div>
                </div>
                <div className="text-center">
                  <Badge className={`${getRarityColor('legendary')} w-full`}>Legendary</Badge>
                  <div className="text-xs text-gray-600 mt-1">5% chance</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reward History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Reward History</CardTitle>
              <CardDescription>
                Your recent reward activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rewardHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No rewards claimed yet
                </div>
              ) : (
                <div className="space-y-4">
                  {rewardHistory.map((reward) => (
                    <div key={reward.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">{reward.description}</div>
                          <div className="text-sm text-gray-600">
                            {new Date(reward.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">+{reward.points}</div>
                        <Badge variant="outline" className="text-xs">
                          {reward.type.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Draw History Tab */}
        <TabsContent value="draw-history">
          <Card>
            <CardHeader>
              <CardTitle>Draw History</CardTitle>
              <CardDescription>
                Your item draw results
              </CardDescription>
            </CardHeader>
            <CardContent>
              {drawHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No draws performed yet
                </div>
              ) : (
                <div className="space-y-4">
                  {drawHistory.map((draw) => (
                    <div key={draw.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-full">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">{draw.draw_items?.name || 'Unknown Item'}</div>
                          <div className="text-sm text-gray-600">
                            {new Date(draw.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`${getRarityColor(draw.draw_items?.rarity)}`}>
                          {draw.draw_items?.rarity?.toUpperCase()}
                        </Badge>
                        <div className="text-sm text-gray-600 mt-1">
                          -{draw.points_cost} points
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RewardsDashboard;


