import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Zap,
  Shield,
  Globe
} from 'lucide-react';

interface DefiStats {
  tvl: string;
  volume24h: string;
  activeUsers: number;
  apy: string;
  priceChange24h: number;
}

interface WalletBalance {
  kaia: string;
  usdt: string;
  yieldVault: string;
}

interface TradingPair {
  pair: string;
  price: string;
  change24h: number;
  volume24h: string;
}

const KaiaDefiDashboard: React.FC = () => {
  const [defiStats, setDefiStats] = useState<DefiStats>({
    tvl: '2.5M',
    volume24h: '125K',
    activeUsers: 1520,
    apy: '12.5',
    priceChange24h: 2.3
  });

  const [walletBalance, setWalletBalance] = useState<WalletBalance>({
    kaia: '0.0000',
    usdt: '0.00',
    yieldVault: '0.00'
  });

  const [tradingPairs] = useState<TradingPair[]>([
    { pair: 'USDT/KAIA', price: '0.000045', change24h: 1.2, volume24h: '45.2K' },
    { pair: 'USDT/BTC', price: '0.000015', change24h: -0.8, volume24h: '32.1K' },
    { pair: 'USDT/ETH', price: '0.000032', change24h: 2.1, volume24h: '28.7K' }
  ]);

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setDefiStats(prev => ({
        ...prev,
        tvl: (parseFloat(prev.tvl.replace('M', '')) + (Math.random() - 0.5) * 0.1).toFixed(1) + 'M',
        volume24h: (parseFloat(prev.volume24h.replace('K', '')) + (Math.random() - 0.5) * 5).toFixed(0) + 'K',
        priceChange24h: prev.priceChange24h + (Math.random() - 0.5) * 0.5
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleConnectWallet = () => {
    setIsConnected(true);
    // Simulate wallet connection and balance loading
    setTimeout(() => {
      setWalletBalance({
        kaia: '1.2345',
        usdt: '1250.00',
        yieldVault: '850.00'
      });
    }, 1000);
  };

  const handleDepositToVault = () => {
    // Simulate deposit action
    console.log('Depositing to yield vault...');
  };

  const handleTrade = () => {
    // Simulate trade action
    console.log('Opening trade interface...');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kaia DeFi Dashboard</h2>
          <p className="text-gray-600">Real-time DeFi statistics and wallet management</p>
        </div>
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <Globe className="w-4 h-4 mr-2" />
          Kaia Network
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value Locked</p>
                <p className="text-2xl font-bold text-gray-900">${defiStats.tvl}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
            <div className="flex items-center mt-2">
              <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+{defiStats.priceChange24h}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">24h Volume</p>
                <p className="text-2xl font-bold text-gray-900">${defiStats.volume24h}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
            <div className="flex items-center mt-2">
              <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+5.2%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{defiStats.activeUsers.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
            <div className="flex items-center mt-2">
              <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+12.5%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Best APY</p>
                <p className="text-2xl font-bold text-gray-900">{defiStats.apy}%</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="flex items-center mt-2">
              <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">Yield Vault</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wallet Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wallet Balance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wallet className="w-5 h-5 mr-2" />
              Wallet Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isConnected ? (
              <div className="text-center py-8">
                <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Connect your wallet to view balances</p>
                <Button onClick={handleConnectWallet}>
                  Connect Wallet
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">KAIA</span>
                  <span className="font-semibold">{walletBalance.kaia}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">USDT</span>
                  <span className="font-semibold">{walletBalance.usdt}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Yield Vault</span>
                  <span className="font-semibold">{walletBalance.yieldVault}</span>
                </div>
                <div className="pt-4 border-t">
                  <Button className="w-full" onClick={handleDepositToVault}>
                    Deposit to Yield Vault
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trading Pairs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Trading Pairs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tradingPairs.map((pair, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold">{pair.pair}</p>
                    <p className="text-sm text-gray-600">Vol: ${pair.volume24h}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{pair.price}</p>
                    <div className="flex items-center">
                      {pair.change24h > 0 ? (
                        <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm ${pair.change24h > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {pair.change24h > 0 ? '+' : ''}{pair.change24h}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <Button className="w-full mt-4" onClick={handleTrade}>
                Start Trading
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-20 flex flex-col items-center justify-center space-y-2">
              <TrendingUp className="w-6 h-6" />
              <span>Yield Farming</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <DollarSign className="w-6 h-6" />
              <span>Lending</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <Shield className="w-6 h-6" />
              <span>Security</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { KaiaDefiDashboard };
export default KaiaDefiDashboard;
