import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Award,
  Clock,
  Users,
  BarChart3,
  Activity
} from 'lucide-react';

interface TradeData {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
  slippage: number;
  priceImpact: number;
}

interface LiquidityData {
  pair: string;
  amountA: string;
  amountB: string;
  apy: number;
  rewards: string;
}

interface RewardData {
  tradingRewards: string;
  liquidityRewards: string;
  referralRewards: string;
  totalRewards: string;
  multiplier: number;
}

const KaiaTradeAndEarn: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trade' | 'liquidity' | 'rewards'>('trade');
  const [tradeData, setTradeData] = useState<TradeData>({
    tokenIn: 'USDT',
    tokenOut: 'KAIA',
    amountIn: '',
    amountOut: '',
    slippage: 0.5,
    priceImpact: 0.1
  });

  const [liquidityData] = useState<LiquidityData[]>([
    { pair: 'USDT/KAIA', amountA: '1000', amountB: '0.045', apy: 10.5, rewards: '25.50' },
    { pair: 'USDT/BTC', amountA: '500', amountB: '0.0075', apy: 8.2, rewards: '12.30' },
    { pair: 'USDT/ETH', amountA: '750', amountB: '0.024', apy: 9.8, rewards: '18.75' }
  ]);

  const [rewardData] = useState<RewardData>({
    tradingRewards: '45.20',
    liquidityRewards: '78.50',
    referralRewards: '12.30',
    totalRewards: '136.00',
    multiplier: 1.5
  });

  const handleTrade = () => {
    console.log('Executing trade:', tradeData);
  };

  const handleProvideLiquidity = () => {
    console.log('Providing liquidity...');
  };

  const handleClaimRewards = () => {
    console.log('Claiming rewards...');
  };

  const renderTradeTab = () => (
    <div className="space-y-6">
      {/* Trading Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Trade with Enhanced Rewards
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0.0"
                  value={tradeData.amountIn}
                  onChange={(e) => setTradeData(prev => ({ ...prev, amountIn: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <div className="absolute right-3 top-3">
                  <Badge variant="outline">{tradeData.tokenIn}</Badge>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0.0"
                  value={tradeData.amountOut}
                  onChange={(e) => setTradeData(prev => ({ ...prev, amountOut: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <div className="absolute right-3 top-3">
                  <Badge variant="outline">{tradeData.tokenOut}</Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Slippage</p>
              <p className="font-semibold">{tradeData.slippage}%</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Price Impact</p>
              <p className="font-semibold">{tradeData.priceImpact}%</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600">Reward Multiplier</p>
              <p className="font-semibold text-green-700">{rewardData.multiplier}x</p>
            </div>
          </div>

          <Button className="w-full" size="lg" onClick={handleTrade}>
            <TrendingUp className="w-5 h-5 mr-2" />
            Execute Trade
          </Button>
        </CardContent>
      </Card>

      {/* Trading Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Activity className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">$125K</p>
            <p className="text-gray-600">24h Volume</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">1,520</p>
            <p className="text-gray-600">Active Traders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Award className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">1.5x</p>
            <p className="text-gray-600">Reward Multiplier</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderLiquidityTab = () => (
    <div className="space-y-6">
      {/* Liquidity Pools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Liquidity Mining (10% APY)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {liquidityData.map((pool, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold">{pool.pair}</h3>
                  <p className="text-sm text-gray-600">
                    {pool.amountA} {pool.pair.split('/')[0]} + {pool.amountB} {pool.pair.split('/')[1]}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center mb-1">
                    <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                    <span className="font-semibold text-green-600">{pool.apy}% APY</span>
                  </div>
                  <p className="text-sm text-gray-600">Rewards: ${pool.rewards}</p>
                </div>
                <Button size="sm" onClick={handleProvideLiquidity}>
                  Add Liquidity
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Liquidity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Total Liquidity</h3>
              <BarChart3 className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">$2.5M</p>
            <div className="flex items-center">
              <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+12.5% this week</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Active Pools</h3>
              <Target className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">12</p>
            <div className="flex items-center">
              <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+2 new pools</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderRewardsTab = () => (
    <div className="space-y-6">
      {/* Rewards Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="w-5 h-5 mr-2" />
            Trade & Earn Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">${rewardData.tradingRewards}</p>
              <p className="text-gray-600">Trading Rewards</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Zap className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">${rewardData.liquidityRewards}</p>
              <p className="text-gray-600">Liquidity Rewards</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">${rewardData.referralRewards}</p>
              <p className="text-gray-600">Referral Rewards</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <Award className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">${rewardData.totalRewards}</p>
              <p className="text-gray-600">Total Rewards</p>
            </div>
          </div>

          <div className="text-center">
            <Button size="lg" onClick={handleClaimRewards}>
              <Award className="w-5 h-5 mr-2" />
              Claim All Rewards
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reward Multiplier Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Kaia Ecosystem Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Enhanced Rewards</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <ArrowUpRight className="w-4 h-4 text-green-500 mr-2" />
                  1.5x multiplier for trading on Kaia
                </li>
                <li className="flex items-center">
                  <ArrowUpRight className="w-4 h-4 text-green-500 mr-2" />
                  10% APY for liquidity provision
                </li>
                <li className="flex items-center">
                  <ArrowUpRight className="w-4 h-4 text-green-500 mr-2" />
                  Low fees and fast transactions
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Requirements</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <Clock className="w-4 h-4 text-blue-500 mr-2" />
                  Minimum trade: 10 USDT
                </li>
                <li className="flex items-center">
                  <Clock className="w-4 h-4 text-blue-500 mr-2" />
                  Maximum trade: 10,000 USDT
                </li>
                <li className="flex items-center">
                  <Clock className="w-4 h-4 text-blue-500 mr-2" />
                  Real-time distribution
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Trade & Earn</h2>
          <p className="text-gray-600">Enhanced rewards for Kaia ecosystem participation</p>
        </div>
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <Zap className="w-4 h-4 mr-2" />
          1.5x Multiplier
        </Badge>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'trade', label: 'Trading', icon: TrendingUp },
          { id: 'liquidity', label: 'Liquidity', icon: Zap },
          { id: 'rewards', label: 'Rewards', icon: Award }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              onClick={() => setActiveTab(tab.id as any)}
              className="flex-1 flex items-center justify-center"
            >
              <Icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'trade' && renderTradeTab()}
      {activeTab === 'liquidity' && renderLiquidityTab()}
      {activeTab === 'rewards' && renderRewardsTab()}
    </div>
  );
};

export { KaiaTradeAndEarn };
export default KaiaTradeAndEarn;
