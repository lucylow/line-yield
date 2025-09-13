import React, { useState, useEffect } from 'react';
import { useRewards } from '@/hooks/useRewards';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RewardsWidgetProps {
  className?: string;
  compact?: boolean;
}

export const RewardsWidget: React.FC<RewardsWidgetProps> = ({ 
  className = '', 
  compact = false 
}) => {
  const { wallet } = useWallet();
  const {
    isLoading,
    error,
    userPoints,
    claimSignupBonus,
    claimDailyLogin,
    refreshUserPoints,
    clearError,
    getTierColor,
    getTierIcon
  } = useRewards();

  const [hasClaimedSignup, setHasClaimedSignup] = useState(false);
  const [hasClaimedDaily, setHasClaimedDaily] = useState(false);

  // Load user data when wallet connects
  useEffect(() => {
    if (wallet.isConnected && wallet.address) {
      refreshUserPoints(wallet.address);
    }
  }, [wallet.isConnected, wallet.address, refreshUserPoints]);

  const handleSignupBonus = async () => {
    if (!wallet.address) return;
    try {
      await claimSignupBonus(wallet.address);
      setHasClaimedSignup(true);
    } catch (error) {
      console.error('Failed to claim signup bonus:', error);
    }
  };

  const handleDailyLogin = async () => {
    if (!wallet.address) return;
    try {
      await claimDailyLogin(wallet.address);
      setHasClaimedDaily(true);
    } catch (error) {
      console.error('Failed to claim daily login:', error);
    }
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
      <Card className={className}>
        <CardContent className="text-center py-6">
          <div className="text-gray-400 mb-3">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Connect Wallet</h3>
          <p className="text-gray-600 text-sm">Connect to view rewards</p>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="text-xl">🎁</span>
            Rewards
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="py-2">
              <AlertDescription className="text-sm">
                {error}
                <Button onClick={clearError} variant="link" className="ml-2 p-0 h-auto text-sm">
                  Clear
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {userPoints && (
            <div className="space-y-3">
              {/* Points Display */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {userPoints.availablePoints.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Available Points</div>
                </div>
                <Badge className={`${getTierColor(userPoints.tier)} text-sm px-3 py-1`}>
                  {getTierIcon(userPoints.tier)} {userPoints.tier.toUpperCase()}
                </Badge>
              </div>

              {/* Level Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Level {userPoints.level}</span>
                  <span>{userPoints.totalPoints.toLocaleString()} / {getNextLevelPoints().toLocaleString()}</span>
                </div>
                <Progress value={getLevelProgress()} className="h-2" />
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                {!hasClaimedSignup && (
                  <Button 
                    onClick={handleSignupBonus}
                    disabled={isLoading}
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? '...' : 'Welcome Bonus'}
                  </Button>
                )}
                {!hasClaimedDaily && (
                  <Button 
                    onClick={handleDailyLogin}
                    disabled={isLoading}
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    {isLoading ? '...' : 'Daily Login'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🎁</span>
          Rewards Center
        </CardTitle>
        <CardDescription>
          Earn points and unlock amazing rewards
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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

        {userPoints && (
          <>
            {/* Points Overview */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {userPoints.availablePoints.toLocaleString()}
                </div>
                <div className="text-sm text-blue-600">Available</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {userPoints.totalPoints.toLocaleString()}
                </div>
                <div className="text-sm text-green-600">Total</div>
              </div>
            </div>

            {/* Tier and Level */}
            <div className="text-center">
              <Badge className={`${getTierColor(userPoints.tier)} text-lg px-4 py-2`}>
                {getTierIcon(userPoints.tier)} {userPoints.tier.toUpperCase()} - Level {userPoints.level}
              </Badge>
            </div>

            {/* Level Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to Level {userPoints.level + 1}</span>
                <span>{Math.round(getLevelProgress())}%</span>
              </div>
              <Progress value={getLevelProgress()} className="h-3" />
              <div className="text-center text-sm text-gray-600">
                {userPoints.totalPoints.toLocaleString()} / {getNextLevelPoints().toLocaleString()} points
              </div>
            </div>

            {/* Quick Rewards */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Quick Rewards</h4>
              
              {!hasClaimedSignup && (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-medium text-green-800">Welcome Bonus</div>
                    <div className="text-sm text-green-600">1,000 points for new users</div>
                  </div>
                  <Button 
                    onClick={handleSignupBonus}
                    disabled={isLoading}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? 'Claiming...' : 'Claim'}
                  </Button>
                </div>
              )}

              {!hasClaimedDaily && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="font-medium text-blue-800">Daily Login</div>
                    <div className="text-sm text-blue-600">50 points every day</div>
                  </div>
                  <Button 
                    onClick={handleDailyLogin}
                    disabled={isLoading}
                    size="sm"
                    variant="outline"
                  >
                    {isLoading ? 'Claiming...' : 'Claim'}
                  </Button>
                </div>
              )}

              {(hasClaimedSignup && hasClaimedDaily) && (
                <div className="text-center py-4 text-gray-500">
                  <div className="text-sm">All quick rewards claimed!</div>
                  <div className="text-xs">Check back tomorrow for daily login</div>
                </div>
              )}
            </div>

            {/* Rewards Info */}
            <div className="text-center">
              <Button variant="link" className="text-sm">
                View All Rewards →
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RewardsWidget;


