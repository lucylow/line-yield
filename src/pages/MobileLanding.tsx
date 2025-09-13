import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileNavigation } from '../components/MobileNavigation';
import { MobileBottomNavigation } from '../components/MobileBottomNavigation';
import { MobileButton } from '../components/MobileButton';
import { MobileCard } from '../components/MobileCard';
import { MobilePullToRefresh } from '../components/MobilePullToRefresh';
import { MobileFadeIn, MobileStagger } from '../components/MobileAnimations';
import { 
  ArrowRight, 
  Zap, 
  Shield, 
  TrendingUp, 
  LineChart,
  ArrowUp,
  ArrowDown,
  PlayCircle,
  FileText,
  CheckCircle,
  Users,
  DollarSign
} from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';

export const MobileLanding: React.FC = () => {
  const navigate = useNavigate();
  const { wallet, connectWallet } = useWallet();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = async () => {
    if (!wallet.isConnected) {
      await connectWallet();
    }
    navigate('/dashboard');
  };

  const handleRefresh = async () => {
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Page refreshed');
  };

  const features = [
    {
      icon: Zap,
      title: 'Gasless Transactions',
      description: 'Zero transaction fees with our gas abstraction technology',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      icon: TrendingUp,
      title: 'Auto-Rebalancing',
      description: 'Smart contracts automatically optimize your yield',
      color: 'from-green-400 to-emerald-500'
    },
    {
      icon: Shield,
      title: 'Secure & Audited',
      description: 'Thoroughly audited smart contracts for maximum security',
      color: 'from-blue-400 to-indigo-500'
    }
  ];

  const steps = [
    {
      number: 1,
      title: 'Connect Wallet',
      description: 'Link your Kaia-compatible wallet',
      icon: Users
    },
    {
      number: 2,
      title: 'Deposit USDT',
      description: 'Add funds with one click',
      icon: DollarSign
    },
    {
      number: 3,
      title: 'Earn Automatically',
      description: 'Watch your balance grow',
      icon: TrendingUp
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      {/* Mobile Navigation */}
      <MobileNavigation />

      {/* Pull to Refresh Wrapper */}
      <MobilePullToRefresh onRefresh={handleRefresh}>
        {/* Hero Section */}
        <section className="pt-20 pb-12 px-4">
        <div className="max-w-md mx-auto text-center">
          {/* Badge */}
          <MobileFadeIn delay={0} direction="down">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 text-green-600 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Powered by Kaia Blockchain</span>
            </div>
          </MobileFadeIn>
          
          {/* Main Headline */}
          <MobileFadeIn delay={200} direction="up">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-green-800 via-green-600 to-emerald-500 bg-clip-text text-transparent">
                Earn Automated Yield on Your USDT
              </span>
              <br />
              <span className="text-gray-800">While You Chat</span>
            </h1>
          </MobileFadeIn>
          
          {/* Description */}
          <MobileFadeIn delay={400} direction="up">
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              LINE Yield lets you maximize your stablecoin earnings through automated DeFi strategies, 
              directly within LINE Messenger.
            </p>
          </MobileFadeIn>
          
          {/* CTA Buttons */}
          <MobileStagger delay={600} staggerDelay={100}>
            <div className="space-y-4 mb-8">
              <MobileButton
                size="lg"
                fullWidth
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg mobile-tap"
              >
                <Zap className="w-5 h-5 mr-2" />
                Start Earning Now
              </MobileButton>
              
              <MobileButton
                variant="outline"
                size="lg"
                fullWidth
                className="border-2 border-green-600 text-green-600 mobile-tap"
              >
                <PlayCircle className="w-5 h-5 mr-2" />
                Watch Demo
              </MobileButton>
            </div>
          </MobileStagger>
          
          {/* Stats */}
          <MobileStagger delay={800} staggerDelay={150}>
            <div className="grid grid-cols-3 gap-4">
              <MobileCard padding="sm" className="text-center mobile-tap-light">
                <div className="text-2xl font-extrabold text-green-800 mb-1">8.64%</div>
                <div className="text-xs text-gray-600">Average APY</div>
              </MobileCard>
              <MobileCard padding="sm" className="text-center mobile-tap-light">
                <div className="text-2xl font-extrabold text-green-800 mb-1">$12.4M</div>
                <div className="text-xs text-gray-600">Total Value Locked</div>
              </MobileCard>
              <MobileCard padding="sm" className="text-center mobile-tap-light">
                <div className="text-2xl font-extrabold text-green-800 mb-1">24/7</div>
                <div className="text-xs text-gray-600">Auto-Rebalancing</div>
              </MobileCard>
            </div>
          </MobileStagger>
        </div>
      </section>

      {/* Demo Dashboard */}
      <section className="px-4 mb-12">
        <div className="max-w-sm mx-auto">
          <MobileCard gradient shadow="lg" className="overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">Your Yield Dashboard</h3>
                <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                  Live
                </div>
              </div>
              
              <div className="text-center mb-6">
                <div className="text-xs text-gray-600 mb-1">Total Balance</div>
                <div className="text-3xl font-extrabold text-green-800 mb-2">$12,458.90</div>
                <div className="text-green-600 font-semibold flex items-center justify-center gap-1 bg-green-50 px-3 py-1 rounded-full text-sm">
                  <ArrowUp className="w-3 h-3" />
                  +2.4% ($298.21)
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 border border-gray-200 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-green-50 hover:to-green-100 hover:border-green-400 transition-all duration-300 cursor-pointer group">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                      <ArrowDown className="w-3 h-3" />
                    </div>
                    <div className="text-xs font-semibold text-gray-800">Deposit</div>
                  </div>
                </div>
                <div className="p-3 border border-gray-200 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-green-50 hover:to-green-100 hover:border-green-400 transition-all duration-300 cursor-pointer group">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                      <ArrowUp className="w-3 h-3" />
                    </div>
                    <div className="text-xs font-semibold text-gray-800">Withdraw</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 p-4 rounded-xl text-white text-center">
                <div className="text-xs mb-1 opacity-90">Current APY</div>
                <div className="text-2xl font-extrabold">8.64%</div>
                <div className="text-xs mt-1 opacity-80">Auto-compounded daily</div>
              </div>
            </div>
          </MobileCard>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 mb-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="text-green-600 font-semibold mb-2">Why Choose LINE Yield</div>
            <h2 className="text-2xl font-extrabold text-gray-800 mb-3">Maximize Your Earnings</h2>
            <p className="text-gray-600">
              Our platform combines DeFi power with LINE Messenger convenience
            </p>
          </div>
          
          <div className="space-y-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <MobileCard key={index} interactive className="group">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-2 text-gray-800">{feature.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </MobileCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 mb-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="text-green-600 font-semibold mb-2">Simple Process</div>
            <h2 className="text-2xl font-extrabold text-gray-800 mb-3">Start Earning in Minutes</h2>
            <p className="text-gray-600">
              Getting started is easy and requires no technical knowledge
            </p>
          </div>
          
          <div className="space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center text-lg font-extrabold text-gray-600 flex-shrink-0">
                    {step.number}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold mb-1 text-gray-800">{step.title}</h3>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                  <Icon className="w-5 h-5 text-gray-400" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 mb-12">
        <div className="max-w-md mx-auto">
          <MobileCard gradient className="bg-gradient-to-r from-green-800 to-blue-900 text-white text-center">
            <div className="p-6">
              <h2 className="text-2xl font-extrabold mb-3">Ready to Start Earning?</h2>
              <p className="text-lg opacity-90 mb-6">
                Join thousands of users growing their wealth with LINE Yield
              </p>
              <div className="space-y-3">
                <MobileButton
                  size="lg"
                  fullWidth
                  onClick={handleGetStarted}
                  className="bg-white text-green-800 hover:bg-gray-100"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Get Started Now
                </MobileButton>
                <MobileButton
                  variant="outline"
                  size="lg"
                  fullWidth
                  className="border-2 border-white/30 text-white hover:bg-white/10"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Read Documentation
                </MobileButton>
              </div>
            </div>
          </MobileCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 pb-8">
        <div className="max-w-md mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-emerald-500 text-white rounded-lg flex items-center justify-center">
              <LineChart className="w-3 h-3" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-green-800 to-green-600 bg-clip-text text-transparent">
              LINE Yield
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Powered by Kaia Blockchain • Built for LINE Messenger
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-600 font-medium">Live</span>
          </div>
        </div>
      </footer>
      </MobilePullToRefresh>

      {/* Bottom Navigation */}
      <MobileBottomNavigation />
    </div>
  );
};

export default MobileLanding;
