import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  Zap,
  Shield,
  Target
} from 'lucide-react';
import { kaiaService, KAIA_DEFI_CONFIG, TRADE_AND_EARN_CONFIG } from '../services/kaiaService';
import { useTranslation } from '../i18n';

interface DefiStats {
  totalValueLocked: string;
  totalVolume24h: string;
  activeUsers: string;
  apy: string;
  kaiaBalance: string;
  usdtBalance: string;
  yieldVaultBalance: string;
  pendingRewards: string;
}

interface TradingPair {
  pair: string;
  price: string;
  change24h: number;
  volume24h: string;
}

export const KaiaDefiDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DefiStats | null>(null);
  const [tradingPairs, setTradingPairs] = useState<TradingPair[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load DeFi stats
      const defiStats = await kaiaService.getKaiaDefiStats();
      
      // Load wallet balances if connected
      let kaiaBalance = '0';
      let usdtBalance = '0';
      let yieldVaultBalance = '0';
      let pendingRewards = '0';

      if (isConnected && walletAddress) {
        try {
          kaiaBalance = await kaiaService.getKaiaBalance();
          usdtBalance = await kaiaService.getUSDTBalance();
          yieldVaultBalance = await kaiaService.getYieldVaultBalance();
          pendingRewards = await kaiaService.getPendingRewards();
        } catch (error) {
          console.warn('Failed to load wallet data:', error);
        }
      }

      setStats({
        totalValueLocked: defiStats.totalValueLocked,
        totalVolume24h: defiStats.totalVolume24h,
        activeUsers: defiStats.activeUsers,
        apy: defiStats.apy,
        kaiaBalance,
        usdtBalance,
        yieldVaultBalance,
        pendingRewards,
      });

      // Load trading pairs
      setTradingPairs([
        { pair: 'USDT/KAIA', price: '0.000123', change24h: 2.5, volume24h: '125000' },
        { pair: 'USDT/BTC', price: '0.000015', change24h: -1.2, volume24h: '89000' },
        { pair: 'USDT/ETH', price: '0.000045', change24h: 3.8, volume24h: '156000' },
      ]);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const connectWallet = async () => {
    try {
      const address = await kaiaService.connectWallet();
      setWalletAddress(address);
      setIsConnected(true);
      await loadDashboardData();
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  const handleDepositToVault = async (amount: string) => {
    try {
      const tx = await kaiaService.depositToYieldVault(amount);
      await tx.wait();
      await loadDashboardData();
    } catch (error) {
      console.error('Deposit failed:', error);
    }
  };

  const handleWithdrawFromVault = async (amount: string) => {
    try {
      const tx = await kaiaService.withdrawFromYieldVault(amount);
      await tx.wait();
      await loadDashboardData();
    } catch (error) {
      console.error('Withdrawal failed:', error);
    }
  };

  const handleClaimRewards = async () => {
    try {
      const tx = await kaiaService.claimRewards();
      await tx.wait();
      await loadDashboardData();
    } catch (error) {
      console.error('Claim rewards failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading Kaia DeFi data...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Kaia DeFi Dashboard
        </h1>
        <p className="text-gray-600">
          Trade and earn with Kaia-native USDT and stablecoin DeFi protocols
        </p>
      </div>

      {/* Connection Status */}
      {!isConnected ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Connect Your Wallet
          </h3>
          <p className="text-blue-700 mb-4">
            Connect your wallet to access Kaia DeFi features and start trading & earning
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

      {/* DeFi Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value Locked</p>
              <p className="text-2xl font-bold text-gray-900">
                ${stats?.totalValueLocked || '0'}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">24h Volume</p>
              <p className="text-2xl font-bold text-gray-900">
                ${stats?.totalVolume24h || '0'}
              </p>
            </div>
            <Activity className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.activeUsers || '0'}
              </p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current APY</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.apy || '0'}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Wallet Balances */}
      {isConnected && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Kaia Balance</p>
                <p className="text-xl font-bold text-gray-900">
                  {stats?.kaiaBalance || '0'} KAIA
                </p>
              </div>
              <Target className="w-6 h-6 text-gray-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">USDT Balance</p>
                <p className="text-xl font-bold text-gray-900">
                  {stats?.usdtBalance || '0'} USDT
                </p>
              </div>
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Yield Vault</p>
                <p className="text-xl font-bold text-gray-900">
                  {stats?.yieldVaultBalance || '0'} USDT
                </p>
              </div>
              <Zap className="w-6 h-6 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Rewards</p>
                <p className="text-xl font-bold text-gray-900">
                  {stats?.pendingRewards || '0'} USDT
                </p>
              </div>
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      )}

      {/* Trading Pairs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Trading Pairs</h2>
          <p className="text-gray-600">Kaia-native trading pairs with real-time prices</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {tradingPairs.map((pair, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-semibold text-sm">
                      {pair.pair.split('/')[0].slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{pair.pair}</p>
                    <p className="text-sm text-gray-600">Volume: ${pair.volume24h}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${pair.price}</p>
                  <div className={`flex items-center text-sm ${
                    pair.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {pair.change24h >= 0 ? (
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 mr-1" />
                    )}
                    {Math.abs(pair.change24h)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {isConnected && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Yield Farming</h3>
            <p className="text-gray-600 mb-4">
              Deposit USDT to earn {stats?.apy || '8.64'}% APY
            </p>
            <div className="space-y-3">
              <button
                onClick={() => handleDepositToVault('100')}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Deposit 100 USDT
              </button>
              <button
                onClick={() => handleWithdrawFromVault('50')}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Withdraw 50 USDT
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Trade & Earn</h3>
            <p className="text-gray-600 mb-4">
              Trade USDT pairs and earn {TRADE_AND_EARN_CONFIG.rewardMultiplier}x rewards
            </p>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
                Trade USDT/KAIA
              </button>
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors">
                Provide Liquidity
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rewards</h3>
            <p className="text-gray-600 mb-4">
              Claim your pending rewards from trading and liquidity provision
            </p>
            <button
              onClick={handleClaimRewards}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Claim {stats?.pendingRewards || '0'} USDT
            </button>
          </div>
        </div>
      )}

      {/* Kaia Ecosystem Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Kaia Ecosystem</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Native USDT</h4>
            <p className="text-gray-600 text-sm">
              Kaia-native USDT provides low fees and fast transactions on the Kaia blockchain,
              optimized for DeFi protocols and trading.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Trade & Earn</h4>
            <p className="text-gray-600 text-sm">
              Earn rewards while trading and providing liquidity in the Kaia ecosystem,
              with enhanced rewards for active participants.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KaiaDefiDashboard;
