import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LanguageSwitcher } from '@shared/components/LanguageSwitcher';
import { useYieldToken } from '@/hooks/useYieldToken';
import { useTranslation, useNumberFormatting, useDateTimeFormatting } from '@shared/hooks/useTranslation';
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
  AlertTriangle,
  Globe
} from 'lucide-react';

interface TranslatedTokenManagementPanelProps {
  className?: string;
}

export const TranslatedTokenManagementPanel: React.FC<TranslatedTokenManagementPanelProps> = ({
  className = ''
}) => {
  const { t, currentLanguage, isJapanese } = useTranslation();
  const { formatNumber, formatCurrency, formatPercentage } = useNumberFormatting();
  const { formatDate, formatRelativeTime } = useDateTimeFormatting();
  
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
    return formatNumber(num, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return formatDate(date);
  };

  const formatDuration = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    return t('common.days', { count: days });
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
      {/* Header with Language Switcher */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
            <Coins className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{t('tokens.lytTokenManagement')}</h1>
          <LanguageSwitcher variant="compact" />
        </div>
        <p className="text-gray-600">
          {t('tokens.tokenManagementDescription')}
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
              {t('tokens.tokenOverview')}
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
                  {t('common.loading')}
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  {t('common.refresh')}
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
                <span className="font-medium text-yellow-800">{t('tokens.lytBalance')}</span>
              </div>
              <div className="text-2xl font-bold text-yellow-900">
                {formatBalance(tokenBalance.balance)}
              </div>
              <div className="text-sm text-yellow-700">
                {t('tokens.availableTokens')}
              </div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-800">{t('tokens.totalRewards')}</span>
              </div>
              <div className="text-2xl font-bold text-green-900">
                {formatBalance(tokenBalance.userRewards)}
              </div>
              <div className="text-sm text-green-700">
                {t('tokens.lifetimeEarnings')}
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-800">{t('tokens.pendingRewards')}</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {formatBalance(totalPendingRewards)}
              </div>
              <div className="text-sm text-blue-700">
                {t('tokens.readyToClaim')}
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
            {t('tokens.overview')}
          </TabsTrigger>
          <TabsTrigger value="staking" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            {t('navigation.staking')}
          </TabsTrigger>
          <TabsTrigger value="vesting" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {t('tokens.vesting')}
          </TabsTrigger>
          <TabsTrigger value="pools" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {t('tokens.pools')}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Pool Balances */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {t('tokens.rewardPools')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-purple-800">{t('tokens.incentivesPool')}</span>
                  </div>
                  <div className="text-xl font-bold text-purple-900">
                    {formatBalance(poolBalances.incentives)}
                  </div>
                  <div className="text-sm text-purple-700">
                    {t('tokens.availableForRewards')}
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-800">{t('tokens.stakingPool')}</span>
                  </div>
                  <div className="text-xl font-bold text-blue-900">
                    {formatBalance(poolBalances.staking)}
                  </div>
                  <div className="text-sm text-blue-700">
                    {t('tokens.stakingRewards')}
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-800">{t('tokens.referralPool')}</span>
                  </div>
                  <div className="text-xl font-bold text-green-900">
                    {formatBalance(poolBalances.referral)}
                  </div>
                  <div className="text-sm text-green-700">
                    {t('tokens.referralRewards')}
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
                {t('tokens.quickActions')}
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
                  {t('tokens.claimAllRewards')}
                </Button>
                
                <Button
                  onClick={() => setActiveTab('staking')}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  {t('tokens.stakeTokens')}
                </Button>
                
                <Button
                  onClick={() => setActiveTab('vesting')}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  {t('tokens.checkVesting')}
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
                {t('tokens.stakingPools')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stakingPools.map((pool, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={pool.isActive ? "default" : "secondary"}>
                        {pool.isActive ? t('tokens.active') : t('tokens.inactive')}
                      </Badge>
                      <span className="font-medium">{t('tokens.pool')} {index}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {t('tokens.lock')}: {formatDuration(pool.lockPeriod)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-500">{t('tokens.rewardRate')}</div>
                      <div className="font-medium">{pool.rewardRate} LYT/sec</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">{t('tokens.totalStaked')}</div>
                      <div className="font-medium">{formatBalance(pool.totalStaked)} LYT</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">{t('tokens.minStake')}</div>
                      <div className="font-medium">{formatBalance(pool.minStakeAmount)} LYT</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">{t('tokens.totalRewards')}</div>
                      <div className="font-medium">{formatBalance(pool.totalRewards)} LYT</div>
                    </div>
                  </div>
                  
                  {pool.isActive && (
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder={t('tokens.amountToStake')}
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
                        {t('tokens.stake')}
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
                {t('tokens.yourStakes')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userStakes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Lock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>{t('tokens.noActiveStakes')}</p>
                  <p className="text-sm">{t('tokens.stakeDescription')}</p>
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
                            <span className="font-medium">{t('tokens.stake')} #{index}</span>
                            <Badge variant={status.status === 'unlocked' ? 'default' : 'secondary'}>
                              {status.status === 'unlocked' ? t('tokens.unlocked') : t('tokens.locked')}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500">
                            {t('tokens.unlocks')}: {formatTime(stake.unlockTime)}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <div className="text-sm text-gray-500">{t('tokens.stakedAmount')}</div>
                            <div className="font-medium">{formatBalance(stake.amount)} LYT</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">{t('tokens.pool')}</div>
                            <div className="font-medium">{t('tokens.pool')} {stake.poolId}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">{t('tokens.pendingRewards')}</div>
                            <div className="font-medium">{formatBalance(stake.pendingRewards)} LYT</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">{t('tokens.stakedSince')}</div>
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
                            {t('tokens.claimRewards')}
                          </Button>
                          
                          {status.status === 'unlocked' && (
                            <Button
                              onClick={() => handleUnstake(index)}
                              variant="destructive"
                              size="sm"
                              className="flex items-center gap-2"
                            >
                              <Unlock className="w-3 h-3" />
                              {t('tokens.unstake')}
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
                {t('tokens.tokenVesting')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!vestingInfo || !vestingInfo.initialized ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>{t('tokens.noVestingSchedule')}</p>
                  <p className="text-sm">{t('tokens.noVestingDescription')}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Vesting Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Coins className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-800">{t('tokens.totalAmount')}</span>
                      </div>
                      <div className="text-xl font-bold text-blue-900">
                        {formatBalance(vestingInfo.amount)} LYT
                      </div>
                      <div className="text-sm text-blue-700">
                        {t('tokens.totalVestingAmount')}
                      </div>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-800">{t('tokens.vestedAmount')}</span>
                      </div>
                      <div className="text-xl font-bold text-green-900">
                        {formatBalance(vestedAmount)} LYT
                      </div>
                      <div className="text-sm text-green-700">
                        {t('tokens.alreadyVested')}
                      </div>
                    </div>
                    
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Gift className="w-4 h-4 text-purple-600" />
                        <span className="font-medium text-purple-800">{t('tokens.releasable')}</span>
                      </div>
                      <div className="text-xl font-bold text-purple-900">
                        {formatBalance(releasableAmount)} LYT
                      </div>
                      <div className="text-sm text-purple-700">
                        {t('tokens.readyToRelease')}
                      </div>
                    </div>
                  </div>

                  {/* Vesting Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t('tokens.vestingProgress')}</span>
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
                      <div className="text-sm text-gray-500">{t('tokens.startTime')}</div>
                      <div className="font-medium">{formatTime(vestingInfo.startTime)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">{t('tokens.duration')}</div>
                      <div className="font-medium">{formatDuration(vestingInfo.duration)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">{t('tokens.cliffPeriod')}</div>
                      <div className="font-medium">{formatDuration(vestingInfo.cliff)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">{t('tokens.revocable')}</div>
                      <div className="font-medium">{vestingInfo.revocable ? t('common.yes') : t('common.no')}</div>
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
                      {t('tokens.releaseVestedTokens')}
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
                {t('tokens.rewardPoolStatistics')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                  <Gift className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-purple-900 mb-1">
                    {formatBalance(poolBalances.incentives)}
                  </div>
                  <div className="text-purple-700 font-medium">{t('tokens.incentivesPool')}</div>
                  <div className="text-sm text-purple-600 mt-2">
                    {t('tokens.incentivesPoolDescription')}
                  </div>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <Lock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-blue-900 mb-1">
                    {formatBalance(poolBalances.staking)}
                  </div>
                  <div className="text-blue-700 font-medium">{t('tokens.stakingPool')}</div>
                  <div className="text-sm text-blue-600 mt-2">
                    {t('tokens.stakingPoolDescription')}
                  </div>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                  <Users className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-green-900 mb-1">
                    {formatBalance(poolBalances.referral)}
                  </div>
                  <div className="text-green-700 font-medium">{t('tokens.referralPool')}</div>
                  <div className="text-sm text-green-600 mt-2">
                    {t('tokens.referralPoolDescription')}
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

export default TranslatedTokenManagementPanel;



