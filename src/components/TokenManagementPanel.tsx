import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useYieldToken } from '@/hooks/useYieldToken';
import { 
  Coins, 
  TrendingUp, 
  Lock, 
  Unlock,
  Gift,
  Users,
  Clock,
  DollarSign,
  Zap,
  RefreshCw,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface TokenManagementPanelProps {
  className?: string;
}

export const TokenManagementPanel: React.FC<TokenManagementPanelProps> = ({
  className = ''
}) => {
  const {
    tokenBalance,
    poolBalances,
    stakingPools,
    userStakes,
    totalPendingRewards,
    vestingInfo,
    vestedAmount,
    releasableAmount,
    isLoading,
    error,
    refreshTokenData,
    stakeTokens,
    unstakeTokens,
    claimRewards,
    releaseVestedTokens
  } = useYieldToken();

  const [activeTab, setActiveTab] = useState('overview');
  const [stakeAmount, setStakeAmount] = useState('');
  const [selectedPool, setSelectedPool] = useState(0);

  const formatBalance = (balance: string, decimals: number = 2) => {
    const num = parseFloat(balance);
    return num.toFixed(decimals);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  const formatDuration = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    return `${days} days`;
  };

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      return;
    }
    
    await stakeTokens(selectedPool, stakeAmount);
    setStakeAmount('');
  };

  const handleUnstake = async (stakeId: number) => {
    await unstakeTokens(stakeId);
  };

  const handleClaimRewards = async (stakeId?: number) => {
    await claimRewards(stakeId);
  };

  const handleReleaseVested = async () => {
    await releaseVestedTokens();
  };

  const getStakeStatus = (stake: any) => {
    const now = Date.now();
    if (now >= stake.unlockTime) {
      return { status: 'unlocked', color: 'green', icon: Unlock };
    } else {
      return { status: 'locked', color: 'orange', icon: Lock };
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
            <Coins className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">LYT Token Management</h1>
        </div>
        <p className="text-gray-600">
          Manage your LINE Yield Token (LYT) holdings, staking, and rewards
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Token Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Coins className="w-5 h-5" />
              Token Overview
            </CardTitle>
            <Button
              onClick={refreshTokenData}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="w-4 h-4 text-yellow-600" />
                <span className="font-medium text-yellow-800">LYT Balance</span>
              </div>
              <div className="text-2xl font-bold text-yellow-900">
                {formatBalance(tokenBalance.balance)}
              </div>
              <div className="text-sm text-yellow-700">
                Available tokens
              </div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-800">Total Rewards</span>
              </div>
              <div className="text-2xl font-bold text-green-900">
                {formatBalance(tokenBalance.userRewards)}
              </div>
              <div className="text-sm text-green-700">
                Lifetime earnings
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-800">Pending Rewards</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {formatBalance(totalPendingRewards)}
              </div>
              <div className="text-sm text-blue-700">
                Ready to claim
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Coins className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="staking" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Staking
          </TabsTrigger>
          <TabsTrigger value="vesting" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Vesting
          </TabsTrigger>
          <TabsTrigger value="pools" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Pools
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Pool Balances */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Reward Pools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-purple-800">Incentives Pool</span>
                  </div>
                  <div className="text-xl font-bold text-purple-900">
                    {formatBalance(poolBalances.incentives)}
                  </div>
                  <div className="text-sm text-purple-700">
                    Available for rewards
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Staking Pool</span>
                  </div>
                  <div className="text-xl font-bold text-blue-900">
                    {formatBalance(poolBalances.staking)}
                  </div>
                  <div className="text-sm text-blue-700">
                    Staking rewards
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-800">Referral Pool</span>
                  </div>
                  <div className="text-xl font-bold text-green-900">
                    {formatBalance(poolBalances.referral)}
                  </div>
                  <div className="text-sm text-green-700">
                    Referral rewards
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => handleClaimRewards()}
                  disabled={parseFloat(totalPendingRewards) === 0}
                  className="flex items-center gap-2"
                >
                  <Gift className="w-4 h-4" />
                  Claim All Rewards
                </Button>
                
                <Button
                  onClick={() => setActiveTab('staking')}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Stake Tokens
                </Button>
                
                <Button
                  onClick={() => setActiveTab('vesting')}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  Check Vesting
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staking Tab */}
        <TabsContent value="staking" className="space-y-6">
          {/* Staking Pools */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Staking Pools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stakingPools.map((pool, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={pool.isActive ? "default" : "secondary"}>
                        {pool.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <span className="font-medium">Pool {index}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Lock: {formatDuration(pool.lockPeriod)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-500">Reward Rate</div>
                      <div className="font-medium">{pool.rewardRate} LYT/sec</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Total Staked</div>
                      <div className="font-medium">{formatBalance(pool.totalStaked)} LYT</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Min Stake</div>
                      <div className="font-medium">{formatBalance(pool.minStakeAmount)} LYT</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Total Rewards</div>
                      <div className="font-medium">{formatBalance(pool.totalRewards)} LYT</div>
                    </div>
                  </div>
                  
                  {pool.isActive && (
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Amount to stake"
                        value={selectedPool === index ? stakeAmount : ''}
                        onChange={(e) => {
                          setSelectedPool(index);
                          setStakeAmount(e.target.value);
                        }}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleStake}
                        disabled={!stakeAmount || parseFloat(stakeAmount) <= 0}
                        className="flex items-center gap-2"
                      >
                        <Lock className="w-4 h-4" />
                        Stake
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* User Stakes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Your Stakes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userStakes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Lock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No active stakes</p>
                  <p className="text-sm">Stake your LYT tokens to start earning rewards</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userStakes.map((stake, index) => {
                    const status = getStakeStatus(stake);
                    const StatusIcon = status.icon;
                    
                    return (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <StatusIcon className={`w-4 h-4 text-${status.color}-500`} />
                            <span className="font-medium">Stake #{index}</span>
                            <Badge variant={status.status === 'unlocked' ? 'default' : 'secondary'}>
                              {status.status === 'unlocked' ? 'Unlocked' : 'Locked'}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500">
                            Unlocks: {formatTime(stake.unlockTime)}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <div className="text-sm text-gray-500">Staked Amount</div>
                            <div className="font-medium">{formatBalance(stake.amount)} LYT</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Pool</div>
                            <div className="font-medium">Pool {stake.poolId}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Pending Rewards</div>
                            <div className="font-medium">{formatBalance(stake.pendingRewards)} LYT</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Staked Since</div>
                            <div className="font-medium">{formatTime(stake.stakeTime)}</div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleClaimRewards(index)}
                            disabled={parseFloat(stake.pendingRewards) === 0}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <Gift className="w-3 h-3" />
                            Claim Rewards
                          </Button>
                          
                          {status.status === 'unlocked' && (
                            <Button
                              onClick={() => handleUnstake(index)}
                              variant="destructive"
                              size="sm"
                              className="flex items-center gap-2"
                            >
                              <Unlock className="w-3 h-3" />
                              Unstake
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vesting Tab */}
        <TabsContent value="vesting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Token Vesting
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!vestingInfo || !vestingInfo.initialized ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No vesting schedule</p>
                  <p className="text-sm">You don't have any vesting tokens</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Vesting Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Coins className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-800">Total Amount</span>
                      </div>
                      <div className="text-xl font-bold text-blue-900">
                        {formatBalance(vestingInfo.amount)} LYT
                      </div>
                      <div className="text-sm text-blue-700">
                        Total vesting amount
                      </div>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-800">Vested Amount</span>
                      </div>
                      <div className="text-xl font-bold text-green-900">
                        {formatBalance(vestedAmount)} LYT
                      </div>
                      <div className="text-sm text-green-700">
                        Already vested
                      </div>
                    </div>
                    
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Gift className="w-4 h-4 text-purple-600" />
                        <span className="font-medium text-purple-800">Releasable</span>
                      </div>
                      <div className="text-xl font-bold text-purple-900">
                        {formatBalance(releasableAmount)} LYT
                      </div>
                      <div className="text-sm text-purple-700">
                        Ready to release
                      </div>
                    </div>
                  </div>

                  {/* Vesting Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Vesting Progress</span>
                      <span>{((parseFloat(vestedAmount) / parseFloat(vestingInfo.amount)) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={(parseFloat(vestedAmount) / parseFloat(vestingInfo.amount)) * 100} 
                      className="h-2"
                    />
                  </div>

                  {/* Vesting Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Start Time</div>
                      <div className="font-medium">{formatTime(vestingInfo.startTime)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Duration</div>
                      <div className="font-medium">{formatDuration(vestingInfo.duration)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Cliff Period</div>
                      <div className="font-medium">{formatDuration(vestingInfo.cliff)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Revocable</div>
                      <div className="font-medium">{vestingInfo.revocable ? 'Yes' : 'No'}</div>
                    </div>
                  </div>

                  {/* Release Button */}
                  <div className="flex justify-center">
                    <Button
                      onClick={handleReleaseVested}
                      disabled={parseFloat(releasableAmount) === 0}
                      className="flex items-center gap-2"
                      size="lg"
                    >
                      <Gift className="w-4 h-4" />
                      Release Vested Tokens
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pools Tab */}
        <TabsContent value="pools" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Reward Pool Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                  <Gift className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-purple-900 mb-1">
                    {formatBalance(poolBalances.incentives)}
                  </div>
                  <div className="text-purple-700 font-medium">Incentives Pool</div>
                  <div className="text-sm text-purple-600 mt-2">
                    Available for user rewards and incentives
                  </div>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <Lock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-blue-900 mb-1">
                    {formatBalance(poolBalances.staking)}
                  </div>
                  <div className="text-blue-700 font-medium">Staking Pool</div>
                  <div className="text-sm text-blue-600 mt-2">
                    Rewards for staked token holders
                  </div>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                  <Users className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-green-900 mb-1">
                    {formatBalance(poolBalances.referral)}
                  </div>
                  <div className="text-green-700 font-medium">Referral Pool</div>
                  <div className="text-sm text-green-600 mt-2">
                    Rewards for successful referrals
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TokenManagementPanel;



