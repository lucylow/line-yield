import React, { useState } from 'react';
import { ConnectWallet } from '../components/ConnectWallet';
import KaiaDefiDashboard from '../components/KaiaDefiDashboard';
import KaiaTradeAndEarn from '../components/KaiaTradeAndEarn';
import NFTMarketplace from '../components/NFTMarketplace';
import { ReferralPromotion } from '../components/ReferralPromotion';
import { PaymentFlow } from '../components/PaymentFlow';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
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

const Landing: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'dashboard' | 'trade' | 'nft' | 'referral' | 'payment'>('dashboard');

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

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <KaiaDefiDashboard />;
      case 'trade':
        return <KaiaTradeAndEarn />;
      case 'nft':
        return <NFTMarketplace />;
      case 'referral':
        return <ReferralPromotion userAddress={null} />;
      case 'payment':
        return <PaymentFlow itemId="demo" itemName="Demo Item" amount={10} currency="USDT" />;
      default:
        return <KaiaDefiDashboard />;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <Badge className="mb-4 bg-green-100 text-green-800 border-green-200">
                <Globe className="w-4 h-4 mr-2" />
                Built on Kaia Blockchain
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                LINE Yield Platform
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                A comprehensive DeFi platform built on Kaia blockchain, leveraging Kaia-native USDT 
                and stablecoin DeFi protocols to unlock trade-and-earn experiences.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <ConnectWallet />
                <Button size="lg" variant="outline" className="border-green-500 text-green-600 hover:bg-green-50">
                  <Heart className="w-5 h-5 mr-2" />
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <Icon className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-gray-600">{stat.label}</p>
                  </CardContent>
                </Card>
              );
            })}
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
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                      <Icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'trade', label: 'Trade & Earn', icon: TrendingUp },
              { id: 'nft', label: 'NFT Marketplace', icon: Star },
              { id: 'referral', label: 'Referrals', icon: Users },
              { id: 'payment', label: 'Payments', icon: DollarSign }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeSection === tab.id ? 'default' : 'outline'}
                  onClick={() => setActiveSection(tab.id as any)}
                  className="flex items-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </Button>
              );
            })}
          </div>

          {/* Dynamic Content */}
          <div className="bg-white rounded-lg shadow-sm border">
            {renderContent()}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Landing;
