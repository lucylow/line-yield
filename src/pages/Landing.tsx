import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Bot, Shield, TrendingUp, LineChart, ArrowUp, ArrowDown, PlayCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/useWallet';
import Chatbot from '@/components/Chatbot';

export const Landing = () => {
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

  const handleConnectWallet = () => {
    alert('Wallet connection functionality would be implemented here. This would connect to Kaia-compatible wallets like Kaia Wallet or MetaMask.');
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Header */}
      <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${isScrolled ? 'py-2 backdrop-blur-md bg-white/95 shadow-lg' : 'py-5 bg-white shadow-sm'}`}>
        <div className="container mx-auto px-5">
          <div className="flex justify-between items-center">
            <a href="#" className="flex items-center gap-2 md:gap-3 font-extrabold text-xl md:text-2xl">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-emerald-400 to-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg">
                <LineChart className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <span className="bg-gradient-to-r from-green-800 to-green-600 bg-clip-text text-transparent">
                LINE Yield
              </span>
            </a>
            
            <nav className="hidden lg:flex gap-6 xl:gap-8">
              <a href="#" className="text-gray-700 font-medium hover:text-green-600 transition-colors relative after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-emerald-400 after:to-emerald-500 after:transition-all hover:after:w-full">Home</a>
              <a href="#features" className="text-gray-700 font-medium hover:text-green-600 transition-colors relative after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-emerald-400 after:to-emerald-500 after:transition-all hover:after:w-full">Features</a>
              <a href="#how-it-works" className="text-gray-700 font-medium hover:text-green-600 transition-colors relative after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-emerald-400 after:to-emerald-500 after:transition-all hover:after:w-full">How It Works</a>
              <a href="#" className="text-gray-700 font-medium hover:text-green-600 transition-colors relative after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-emerald-400 after:to-emerald-500 after:transition-all hover:after:w-full">Pricing</a>
              <a href="#" className="text-gray-700 font-medium hover:text-green-600 transition-colors relative after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-emerald-400 after:to-emerald-500 after:transition-all hover:after:w-full">Docs</a>
            </nav>
            
            <div className="flex gap-2 md:gap-4 items-center">
              <Button 
                variant="outline" 
                size="sm"
                className="hidden sm:flex border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition-all duration-300"
              >
                <i className="fas fa-sign-in-alt mr-2"></i>
                Sign In
              </Button>
              <Button 
                onClick={handleConnectWallet}
                size="sm"
                className="bg-gradient-to-r from-emerald-400 to-emerald-500 text-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                <i className="fas fa-wallet mr-2"></i>
                <span className="hidden sm:inline">Connect Wallet</span>
                <span className="sm:hidden">Connect</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-40 pb-24 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '4s'}}></div>
        </div>
        
        <div className="container mx-auto px-5">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 text-green-600 px-6 py-3 rounded-full text-sm font-semibold mb-6 animate-bounce-in border border-green-200 shadow-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Powered by Kaia Blockchain</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight animate-slide-in-left">
                <span className="bg-gradient-to-r from-green-800 via-green-600 to-emerald-500 bg-clip-text text-transparent animate-gradient-shift">
                  Earn Automated Yield on Your USDT
                </span>
                <br />
                <span className="text-gray-800">While You Chat</span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0 animate-slide-in-left animate-delay-1">
                LINE Yield lets you maximize your stablecoin earnings through automated DeFi strategies, 
                directly within LINE Messenger. Set it and forget it.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-10 animate-slide-in-left animate-delay-2 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  onClick={handleGetStarted}
                  className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-emerald-400 to-emerald-500 text-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 animate-glow-pulse hover:animate-none"
                >
                  <i className="fas fa-rocket mr-2"></i>
                  Start Earning Now
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="h-14 px-8 text-lg font-semibold border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition-all duration-300 hover:shadow-lg"
                >
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 animate-slide-in-left animate-delay-3 max-w-md mx-auto lg:mx-0">
                <div className="text-center bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-green-100 hover:shadow-lg transition-all duration-300">
                  <div className="text-3xl font-extrabold text-green-800 mb-2">8.64%</div>
                  <div className="text-sm text-gray-600">Average APY</div>
                </div>
                <div className="text-center bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-green-100 hover:shadow-lg transition-all duration-300">
                  <div className="text-3xl font-extrabold text-green-800 mb-2">$12.4M</div>
                  <div className="text-sm text-gray-600">Total Value Locked</div>
                </div>
                <div className="text-center bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-green-100 hover:shadow-lg transition-all duration-300">
                  <div className="text-3xl font-extrabold text-green-800 mb-2">24/7</div>
                  <div className="text-sm text-gray-600">Auto-Rebalancing</div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 w-full max-w-lg">
              <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-6 md:p-8 shadow-2xl animate-scale-in animate-delay-2 border border-white/20 hover:shadow-3xl transition-all duration-500">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg md:text-xl font-bold text-gray-800">Your Yield Dashboard</h3>
                  <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    Live
                  </div>
                </div>
                
                <div className="text-center mb-6">
                  <div className="text-sm text-gray-600 mb-2">Total Balance</div>
                  <div className="text-3xl md:text-4xl font-extrabold text-green-800 mb-2">$12,458.90</div>
                  <div className="text-green-600 font-semibold flex items-center justify-center gap-1 bg-green-50 px-3 py-1 rounded-full">
                    <ArrowUp className="w-4 h-4" />
                    +2.4% ($298.21)
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 border border-gray-200 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-green-50 hover:to-green-100 hover:border-green-400 transition-all duration-300 cursor-pointer group">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                        <ArrowDown className="w-4 h-4" />
                      </div>
                      <div className="text-sm font-semibold text-gray-800">Deposit</div>
                    </div>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-green-50 hover:to-green-100 hover:border-green-400 transition-all duration-300 cursor-pointer group">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                        <ArrowUp className="w-4 h-4" />
                      </div>
                      <div className="text-sm font-semibold text-gray-800">Withdraw</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 p-6 rounded-2xl text-white text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
                  <div className="relative z-10">
                    <div className="text-sm mb-1 opacity-90">Current APY</div>
                    <div className="text-3xl font-extrabold">8.64%</div>
                    <div className="text-xs mt-1 opacity-80">Auto-compounded daily</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="container mx-auto px-5">
          <div className="text-center mb-16 animate-fade-in">
            <div className="text-green-600 font-semibold mb-4">Why Choose LINE Yield</div>
            <h2 className="text-4xl font-extrabold text-gray-800 mb-5">Maximize Your Earnings with Zero Effort</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform combines the power of DeFi with the convenience of LINE Messenger
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 animate-slide-up group border border-white/20">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 rounded-t-3xl"></div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mb-6 text-green-600 text-2xl group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-bolt"></i>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Gasless Transactions</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Enjoy zero transaction fees with our gas abstraction technology. We sponsor all gas costs for your deposits and withdrawals.
              </p>
              <a href="#" className="inline-flex items-center gap-2 text-green-600 font-semibold text-sm hover:gap-3 transition-all duration-300 group-hover:text-emerald-600">
                Learn more <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 animate-slide-up animate-delay-1 group border border-white/20">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 rounded-t-3xl"></div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mb-6 text-green-600 text-2xl group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-robot"></i>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Auto-Rebalancing</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Our smart contracts automatically move your funds to the highest-yielding strategies across the Kaia ecosystem.
              </p>
              <a href="#" className="inline-flex items-center gap-2 text-green-600 font-semibold text-sm hover:gap-3 transition-all duration-300 group-hover:text-emerald-600">
                Learn more <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 animate-slide-up animate-delay-2 group border border-white/20">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 rounded-t-3xl"></div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mb-6 text-green-600 text-2xl group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Secure & Audited</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                All smart contracts are thoroughly audited and built with security as the top priority. Your funds are always safe.
              </p>
              <a href="#" className="inline-flex items-center gap-2 text-green-600 font-semibold text-sm hover:gap-3 transition-all duration-300 group-hover:text-emerald-600">
                Learn more <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24">
        <div className="container mx-auto px-5">
          <div className="text-center mb-16 animate-fade-in">
            <div className="text-green-600 font-semibold mb-4">Simple Process</div>
            <h2 className="text-4xl font-extrabold text-gray-800 mb-5">Start Earning in Minutes</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Getting started with LINE Yield is easy and requires no technical knowledge
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between relative mb-16">
            <div className="hidden md:block absolute top-10 left-0 w-full h-0.5 bg-gray-200 z-0"></div>
            
            <div className="text-center relative z-10 w-full md:w-1/4 mb-8 md:mb-0 flex md:block items-center gap-4 md:gap-0">
              <div className="w-20 h-20 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center text-2xl font-extrabold text-gray-600 mx-auto md:mx-auto mb-0 md:mb-5 relative flex-shrink-0">
                1
              </div>
              <div className="text-left md:text-center">
                <h3 className="font-bold mb-3 text-gray-800">Connect Wallet</h3>
                <p className="text-sm text-gray-600 px-0 md:px-2">Link your Kaia-compatible wallet to the LINE Mini App</p>
              </div>
            </div>
            
            <div className="text-center relative z-10 w-full md:w-1/4 mb-8 md:mb-0 flex md:block items-center gap-4 md:gap-0">
              <div className="w-20 h-20 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center text-2xl font-extrabold text-gray-600 mx-auto md:mx-auto mb-0 md:mb-5 relative flex-shrink-0">
                2
              </div>
              <div className="text-left md:text-center">
                <h3 className="font-bold mb-3 text-gray-800">Deposit USDT</h3>
                <p className="text-sm text-gray-600 px-0 md:px-2">Add funds to your yield vault with one click</p>
              </div>
            </div>
            
            <div className="text-center relative z-10 w-full md:w-1/4 mb-8 md:mb-0 flex md:block items-center gap-4 md:gap-0">
              <div className="w-20 h-20 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center text-2xl font-extrabold text-gray-600 mx-auto md:mx-auto mb-0 md:mb-5 relative flex-shrink-0">
                3
              </div>
              <div className="text-left md:text-center">
                <h3 className="font-bold mb-3 text-gray-800">Earn Automatically</h3>
                <p className="text-sm text-gray-600 px-0 md:px-2">Watch your balance grow with automated yield optimization</p>
              </div>
            </div>
            
            <div className="text-center relative z-10 w-full md:w-1/4 mb-8 md:mb-0 flex md:block items-center gap-4 md:gap-0">
              <div className="w-20 h-20 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center text-2xl font-extrabold text-gray-600 mx-auto md:mx-auto mb-0 md:mb-5 relative flex-shrink-0">
                4
              </div>
              <div className="text-left md:text-center">
                <h3 className="font-bold mb-3 text-gray-800">Withdraw Anytime</h3>
                <p className="text-sm text-gray-600 px-0 md:px-2">Access your funds whenever you need them</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-green-800 to-blue-900 text-white rounded-2xl mx-5 mb-10">
        <div className="container mx-auto px-5 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-5">Ready to Start Earning Yield?</h2>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto mb-10">
            Join thousands of users who are already growing their wealth with LINE Yield. No technical knowledge required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="h-14 md:h-16 px-8 md:px-12 text-lg md:text-xl font-semibold bg-white text-green-800 hover:bg-gray-100 transition-all duration-300"
            >
              <i className="fas fa-rocket mr-3"></i>
              Get Started Now
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="h-14 md:h-16 px-8 md:px-12 text-lg md:text-xl font-semibold border-2 border-white/30 text-white hover:bg-white/10 transition-all duration-300"
            >
              <FileText className="w-5 h-5 mr-3" />
              Read Documentation
            </Button>
          </div>
        </div>
      </section>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};

export default Landing;