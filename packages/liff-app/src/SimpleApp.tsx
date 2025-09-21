import React, { useState } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Star,
  Zap,
  Shield,
  Globe,
  Heart,
  Award,
  BarChart3,
  Activity
} from 'lucide-react';

const SimpleApp: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'dashboard' | 'trade' | 'nft' | 'referral' | 'payment'>('dashboard');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const features = [
    {
      icon: TrendingUp,
      title: 'Kaia Yield Vault',
      description: 'Automated yield farming with Kaia-native USDT (up to 12.5% APY)',
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    {
      icon: Users,
      title: 'Lending Pool',
      description: 'Borrow and lend USDT on Kaia with competitive rates',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      icon: DollarSign,
      title: 'Trade & Earn',
      description: '1.5x multiplier rewards for trading on Kaia',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      icon: Star,
      title: 'NFT Marketplace',
      description: 'Buy, sell, and auction NFTs with volume tracking',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50'
    },
    {
      icon: Zap,
      title: 'Liquidity Mining',
      description: '10% APY for providing liquidity to Kaia pairs',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Multi-signature wallets and advanced security measures',
      color: 'text-red-500',
      bgColor: 'bg-red-50'
    }
  ];

  const stats = [
    { label: 'Total Value Locked', value: '$2.5M', icon: BarChart3 },
    { label: 'Active Users', value: '15.2K', icon: Users },
    { label: 'Trading Volume', value: '$125K', icon: Activity },
    { label: 'Rewards Distributed', value: '$45K', icon: Award }
  ];

  const handleConnectWallet = async () => {
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const accounts = await (window as any).ethereum.request({
          method: 'eth_requestAccounts',
        });
        
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsWalletConnected(true);
        }
      } else {
        // Mock connection for demo
        setWalletAddress('0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6');
        setIsWalletConnected(true);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleDisconnectWallet = () => {
    setIsWalletConnected(false);
    setWalletAddress(null);
  };

  const renderDashboard = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kaia DeFi Dashboard</h2>
          <p className="text-gray-600">Real-time DeFi statistics and wallet management</p>
        </div>
        <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
          <Globe className="w-4 h-4" />
          Kaia Network
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <Icon className="w-8 h-8 text-green-500" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Wallet Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Wallet className="w-5 h-5 mr-2" />
          Wallet Balance
        </h3>
        {!isWalletConnected ? (
          <div className="text-center py-8">
            <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Connect your wallet to view balances</p>
            <button 
              onClick={handleConnectWallet}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Address:</span>
              <span className="font-mono text-sm">{walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">KAIA:</span>
              <span className="font-semibold">1.2345</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">USDT:</span>
              <span className="font-semibold">1,250.00</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Yield Vault:</span>
              <span className="font-semibold">850.00</span>
            </div>
            <div className="pt-4 border-t">
              <button 
                onClick={handleDisconnectWallet}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Disconnect Wallet
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderTrade = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Trade & Earn</h2>
          <p className="text-gray-600">Enhanced rewards for Kaia ecosystem participation</p>
        </div>
        <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
          <Zap className="w-4 h-4" />
          1.5x Multiplier
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">$125K</p>
          <p className="text-gray-600">24h Volume</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">1,520</p>
          <p className="text-gray-600">Active Traders</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <Award className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">1.5x</p>
          <p className="text-gray-600">Reward Multiplier</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Trading Interface</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0.0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <div className="absolute right-3 top-3">
                  <span className="text-sm bg-gray-100 px-2 py-1 rounded">USDT</span>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0.0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <div className="absolute right-3 top-3">
                  <span className="text-sm bg-gray-100 px-2 py-1 rounded">KAIA</span>
                </div>
              </div>
            </div>
          </div>
          <button className="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors">
            Execute Trade
          </button>
        </div>
      </div>
    </div>
  );

  const renderNFT = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">NFT Marketplace</h2>
          <p className="text-gray-600">Discover and trade NFTs on Kaia blockchain</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">$2.5M</p>
          <p className="text-gray-600">24h Volume</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">15.2K</p>
          <p className="text-gray-600">Active Users</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <BarChart3 className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">8.5K</p>
          <p className="text-gray-600">Collections</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <Activity className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">125K</p>
          <p className="text-gray-600">Total NFTs</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Featured Collections</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div className="w-full h-48 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg mb-4"></div>
            <h4 className="font-semibold mb-2">LINE Yield Genesis</h4>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Floor: 0.5 ETH</span>
              <span>24h Vol: 1,250 ETH</span>
            </div>
          </div>
          <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div className="w-full h-48 bg-gradient-to-br from-green-400 to-yellow-500 rounded-lg mb-4"></div>
            <h4 className="font-semibold mb-2">Crypto Warriors</h4>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Floor: 0.8 ETH</span>
              <span>24h Vol: 2,100 ETH</span>
            </div>
          </div>
          <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div className="w-full h-48 bg-gradient-to-br from-red-400 to-pink-500 rounded-lg mb-4"></div>
            <h4 className="font-semibold mb-2">Digital Art Collection</h4>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Floor: 0.3 ETH</span>
              <span>24h Vol: 850 ETH</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReferral = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Referral Program</h2>
          <p className="text-gray-600">Invite friends and earn rewards together</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Your Referral Link</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value="https://line-yield.com/ref/abc123"
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
              Copy
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">12</p>
              <p className="text-gray-600">Referrals</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <DollarSign className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">$245</p>
              <p className="text-gray-600">Earned</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Award className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">Level 3</p>
              <p className="text-gray-600">Status</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPayment = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payment System</h2>
          <p className="text-gray-600">Secure payment processing with multiple options</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-2 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-500" />
              Cryptocurrency
            </h4>
            <p className="text-gray-600 text-sm mb-4">Pay with USDT, USDC, ETH, or KAIA</p>
            <button className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors">
              Pay with Crypto
            </button>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-2 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-500" />
              Credit Card
            </h4>
            <p className="text-gray-600 text-sm mb-4">Secure payment with Stripe</p>
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
              Pay with Card
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'trade':
        return renderTrade();
      case 'nft':
        return renderNFT();
      case 'referral':
        return renderReferral();
      case 'payment':
        return renderPayment();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-gray-900">LINE Yield Platform</h1>
              <nav className="flex space-x-8">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                  { id: 'trade', label: 'Trade & Earn', icon: TrendingUp },
                  { id: 'nft', label: 'NFT Marketplace', icon: Star },
                  { id: 'referral', label: 'Referrals', icon: Users },
                  { id: 'payment', label: 'Payments', icon: DollarSign }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveSection(tab.id as any)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeSection === tab.id
                          ? 'bg-green-100 text-green-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              {isWalletConnected ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                  </span>
                  <button
                    onClick={handleDisconnectWallet}
                    className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleConnectWallet}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm mb-4 mx-auto w-fit">
              <Globe className="w-4 h-4" />
              Built on Kaia Blockchain
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              LINE Yield Platform
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              A comprehensive DeFi platform built on Kaia blockchain, leveraging Kaia-native USDT 
              and stablecoin DeFi protocols to unlock trade-and-earn experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleConnectWallet}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center"
              >
                <Wallet className="w-5 h-5 mr-2" />
                Connect Wallet
              </button>
              <button className="border border-green-500 text-green-600 hover:bg-green-50 px-6 py-3 rounded-lg transition-colors flex items-center justify-center">
                <Heart className="w-5 h-5 mr-2" />
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Core Features</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Experience the power of Kaia blockchain with our comprehensive DeFi platform
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-lg transition-shadow">
                <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SimpleApp;
