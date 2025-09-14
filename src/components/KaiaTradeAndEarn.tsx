import React, { useState, useEffect } from 'react';
import { 
  ArrowUpDown, 
  TrendingUp, 
  Zap, 
  DollarSign,
  Activity,
  Target,
  Shield,
  Clock
} from 'lucide-react';
import { kaiaService, TRADE_AND_EARN_CONFIG } from '../services/kaiaService';
import { useTranslation } from '../i18n';

interface TradeData {
  pair: string;
  price: string;
  change24h: number;
  volume24h: string;
  liquidity: string;
  apy: string;
}

interface EarningData {
  tradingRewards: string;
  liquidityRewards: string;
  totalEarnings: string;
  multiplier: number;
  nextClaim: number;
}

export const KaiaTradeAndEarn: React.FC = () => {
  const { t } = useTranslation();
  const [tradeData, setTradeData] = useState<TradeData[]>([]);
  const [earningData, setEarningData] = useState<EarningData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'trade' | 'earn' | 'liquidity'>('trade');

  // Trade form state
  const [tradeForm, setTradeForm] = useState({
    tokenIn: 'USDT',
    tokenOut: 'KAIA',
    amountIn: '',
    slippage: '0.5',
  });

  // Liquidity form state
  const [liquidityForm, setLiquidityForm] = useState({
    tokenA: 'USDT',
    tokenB: 'KAIA',
    amountA: '',
    amountB: '',
  });

  useEffect(() => {
    loadTradeAndEarnData();
  }, []);

  const loadTradeAndEarnData = async () => {
    try {
      setIsLoading(true);
      
      // Load trading pairs data
      setTradeData([
        {
          pair: 'USDT/KAIA',
          price: '0.000123',
          change24h: 2.5,
          volume24h: '125000',
          liquidity: '500000',
          apy: '12.5',
        },
        {
          pair: 'USDT/BTC',
          price: '0.000015',
          change24h: -1.2,
          volume24h: '89000',
          liquidity: '300000',
          apy: '8.3',
        },
        {
          pair: 'USDT/ETH',
          price: '0.000045',
          change24h: 3.8,
          volume24h: '156000',
          liquidity: '750000',
          apy: '15.2',
        },
      ]);

      // Load earning data if connected
      if (isConnected && walletAddress) {
        try {
          const pendingRewards = await kaiaService.getPendingRewards();
          setEarningData({
            tradingRewards: (parseFloat(pendingRewards) * 0.6).toString(),
            liquidityRewards: (parseFloat(pendingRewards) * 0.4).toString(),
            totalEarnings: pendingRewards,
            multiplier: TRADE_AND_EARN_CONFIG.rewardMultiplier,
            nextClaim: Date.now() + 3600000, // 1 hour from now
          });
        } catch (error) {
          console.warn('Failed to load earning data:', error);
        }
      }

    } catch (error) {
      console.error('Failed to load trade and earn data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const connectWallet = async () => {
    try {
      const address = await kaiaService.connectWallet();
      setWalletAddress(address);
      setIsConnected(true);
      await loadTradeAndEarnData();
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  const executeTrade = async () => {
    if (!tradeForm.amountIn) return;

    try {
      const minAmountOut = (parseFloat(tradeForm.amountIn) * 0.95).toString(); // 5% slippage
      const tx = await kaiaService.executeTrade(
        tradeForm.tokenIn,
        tradeForm.tokenOut,
        tradeForm.amountIn,
        minAmountOut
      );
      
      await tx.wait();
      await loadTradeAndEarnData();
      
      // Show success message
      alert('Trade executed successfully! You earned trading rewards.');
    } catch (error) {
      console.error('Trade execution failed:', error);
      alert('Trade execution failed. Please try again.');
    }
  };

  const provideLiquidity = async () => {
    if (!liquidityForm.amountA || !liquidityForm.amountB) return;

    try {
      const tx = await kaiaService.provideLiquidity(
        liquidityForm.tokenA,
        liquidityForm.tokenB,
        liquidityForm.amountA,
        liquidityForm.amountB
      );
      
      await tx.wait();
      await loadTradeAndEarnData();
      
      // Show success message
      alert('Liquidity provided successfully! You will earn liquidity rewards.');
    } catch (error) {
      console.error('Liquidity provision failed:', error);
      alert('Liquidity provision failed. Please try again.');
    }
  };

  const claimRewards = async () => {
    try {
      const tx = await kaiaService.claimRewards();
      await tx.wait();
      await loadTradeAndEarnData();
      
      // Show success message
      alert('Rewards claimed successfully!');
    } catch (error) {
      console.error('Claim rewards failed:', error);
      alert('Failed to claim rewards. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading trade and earn data...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Kaia Trade & Earn
        </h1>
        <p className="text-gray-600">
          Trade Kaia-native USDT pairs and earn enhanced rewards
        </p>
        <div className="mt-4 flex items-center justify-center space-x-4">
          <div className="flex items-center text-sm text-green-600">
            <Zap className="w-4 h-4 mr-1" />
            {TRADE_AND_EARN_CONFIG.rewardMultiplier}x Trading Rewards
          </div>
          <div className="flex items-center text-sm text-blue-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            {TRADE_AND_EARN_CONFIG.liquidityRewardRate * 100}% APY Liquidity
          </div>
        </div>
      </div>

      {/* Connection Status */}
      {!isConnected ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Connect Your Wallet
          </h3>
          <p className="text-blue-700 mb-4">
            Connect your wallet to start trading and earning on Kaia
          </p>
          <button
            onClick={connectWallet}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-green-800 font-medium">
                Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            </div>
            <button
              onClick={() => {
                setIsConnected(false);
                setWalletAddress('');
              }}
              className="text-green-600 hover:text-green-800 text-sm"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}

      {/* Earning Overview */}
      {isConnected && earningData && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Earnings</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Trading Rewards</p>
              <p className="text-xl font-bold text-green-600">
                {earningData.tradingRewards} USDT
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Liquidity Rewards</p>
              <p className="text-xl font-bold text-blue-600">
                {earningData.liquidityRewards} USDT
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Earnings</p>
              <p className="text-xl font-bold text-purple-600">
                {earningData.totalEarnings} USDT
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Reward Multiplier</p>
              <p className="text-xl font-bold text-orange-600">
                {earningData.multiplier}x
              </p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <button
              onClick={claimRewards}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Claim {earningData.totalEarnings} USDT Rewards
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('trade')}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            activeTab === 'trade'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ArrowUpDown className="w-4 h-4 inline mr-2" />
          Trade
        </button>
        <button
          onClick={() => setActiveTab('earn')}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            activeTab === 'earn'
              ? 'bg-white text-green-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <TrendingUp className="w-4 h-4 inline mr-2" />
          Earn
        </button>
        <button
          onClick={() => setActiveTab('liquidity')}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            activeTab === 'liquidity'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Zap className="w-4 h-4 inline mr-2" />
          Liquidity
        </button>
      </div>

      {/* Trade Tab */}
      {activeTab === 'trade' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trading Pairs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Trading Pairs</h3>
              <p className="text-gray-600">Kaia-native trading pairs with enhanced rewards</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {tradeData.map((pair, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-semibold text-sm">
                          {pair.pair.split('/')[0].slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{pair.pair}</p>
                        <p className="text-sm text-gray-600">
                          Volume: ${pair.volume24h} | Liquidity: ${pair.liquidity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${pair.price}</p>
                      <div className={`flex items-center text-sm ${
                        pair.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {pair.change24h >= 0 ? '↗' : '↘'} {Math.abs(pair.change24h)}%
                      </div>
                      <p className="text-xs text-gray-500">{pair.apy}% APY</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Trade Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Execute Trade</h3>
              <p className="text-gray-600">Trade with {TRADE_AND_EARN_CONFIG.rewardMultiplier}x rewards</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Token In
                </label>
                <select
                  value={tradeForm.tokenIn}
                  onChange={(e) => setTradeForm({ ...tradeForm, tokenIn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USDT">USDT</option>
                  <option value="KAIA">KAIA</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Token Out
                </label>
                <select
                  value={tradeForm.tokenOut}
                  onChange={(e) => setTradeForm({ ...tradeForm, tokenOut: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="KAIA">KAIA</option>
                  <option value="USDT">USDT</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount In
                </label>
                <input
                  type="number"
                  value={tradeForm.amountIn}
                  onChange={(e) => setTradeForm({ ...tradeForm, amountIn: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slippage Tolerance
                </label>
                <select
                  value={tradeForm.slippage}
                  onChange={(e) => setTradeForm({ ...tradeForm, slippage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="0.1">0.1%</option>
                  <option value="0.5">0.5%</option>
                  <option value="1.0">1.0%</option>
                </select>
              </div>

              <button
                onClick={executeTrade}
                disabled={!tradeForm.amountIn || !isConnected}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Execute Trade
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Earn Tab */}
      {activeTab === 'earn' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Trading Rewards</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-semibold text-green-900">Trading Volume</p>
                  <p className="text-sm text-green-700">Last 24 hours</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-900">$1,250</p>
                  <p className="text-sm text-green-700">+2.5%</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-semibold text-blue-900">Reward Multiplier</p>
                  <p className="text-sm text-blue-700">Active bonus</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-900">{TRADE_AND_EARN_CONFIG.rewardMultiplier}x</p>
                  <p className="text-sm text-blue-700">Enhanced rewards</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Liquidity Rewards</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="font-semibold text-purple-900">Liquidity Provided</p>
                  <p className="text-sm text-purple-700">USDT/KAIA pair</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-purple-900">$5,000</p>
                  <p className="text-sm text-purple-700">+0.1%</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div>
                  <p className="font-semibold text-orange-900">APY Rate</p>
                  <p className="text-sm text-orange-700">Current rate</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-orange-900">{TRADE_AND_EARN_CONFIG.liquidityRewardRate * 100}%</p>
                  <p className="text-sm text-orange-700">Annual yield</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Liquidity Tab */}
      {activeTab === 'liquidity' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Provide Liquidity</h3>
            <p className="text-gray-600">Add liquidity to earn {TRADE_AND_EARN_CONFIG.liquidityRewardRate * 100}% APY</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Token A
                  </label>
                  <select
                    value={liquidityForm.tokenA}
                    onChange={(e) => setLiquidityForm({ ...liquidityForm, tokenA: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USDT">USDT</option>
                    <option value="KAIA">KAIA</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount A
                  </label>
                  <input
                    type="number"
                    value={liquidityForm.amountA}
                    onChange={(e) => setLiquidityForm({ ...liquidityForm, amountA: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Token B
                  </label>
                  <select
                    value={liquidityForm.tokenB}
                    onChange={(e) => setLiquidityForm({ ...liquidityForm, tokenB: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="KAIA">KAIA</option>
                    <option value="USDT">USDT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount B
                  </label>
                  <input
                    type="number"
                    value={liquidityForm.amountB}
                    onChange={(e) => setLiquidityForm({ ...liquidityForm, amountB: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={provideLiquidity}
                disabled={!liquidityForm.amountA || !liquidityForm.amountB || !isConnected}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Provide Liquidity
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kaia Ecosystem Benefits */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Kaia Ecosystem Benefits</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900 mb-2">Low Fees</h4>
            <p className="text-gray-600 text-sm">
              Kaia blockchain provides low transaction fees for DeFi operations
            </p>
          </div>
          <div className="text-center">
            <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900 mb-2">Fast Transactions</h4>
            <p className="text-gray-600 text-sm">
              Quick confirmation times for trading and liquidity operations
            </p>
          </div>
          <div className="text-center">
            <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900 mb-2">Enhanced Rewards</h4>
            <p className="text-gray-600 text-sm">
              Special rewards for trading and liquidity provision on Kaia
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KaiaTradeAndEarn;
