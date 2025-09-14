import React, { useEffect, useState } from 'react';
import { ArrowRight, Zap, Bot, Shield, TrendingUp, LineChart, ArrowUp, ArrowDown, PlayCircle, FileText, Menu, X } from 'lucide-react';
import { Button } from '../components/simple/Button';
import { useWallet } from '../hooks/useWallet';
import Chatbot from '../components/Chatbot';
import { LineNextIntegration } from '../components/LineNextIntegration';
import { ConnectWallet } from '@shared/components';

const Landing = () => {
  const { isConnected, connect } = useWallet();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = async () => {
    if (!isConnected) {
      connect();
    }
    // For now, just show an alert - can be replaced with actual dashboard navigation later
    alert('Welcome to LINE Yield! Dashboard functionality will be implemented here.');
  };

  const handleConnectWallet = () => {
    alert('Wallet connection functionality would be implemented here. This would connect to Kaia-compatible wallets like Kaia Wallet or MetaMask.');
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden safe-area-top safe-area-bottom">
      {/* Header */}
      <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${isScrolled ? 'py-2 backdrop-blur-md bg-white/95 shadow-lg' : 'py-3 md:py-5 bg-white shadow-sm'}`}>
        <div className="container mx-auto px-4 md:px-5">
          <div className="flex justify-between items-center">
            <a href="#" className="flex items-center gap-2 md:gap-3 font-extrabold text-lg md:text-xl lg:text-2xl">
              <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-emerald-400 to-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg">
                <LineChart className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
              </div>
              <span className="bg-gradient-to-r from-green-800 to-green-600 bg-clip-text text-transparent">
                LINE Yield
              </span>
            </a>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex gap-6 xl:gap-8">
              <a href="#" className="text-gray-700 font-medium hover:text-green-600 transition-colors relative after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-emerald-400 after:to-emerald-500 after:transition-all hover:after:w-full">Home</a>
              <a href="#features" className="text-gray-700 font-medium hover:text-green-600 transition-colors relative after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-emerald-400 after:to-emerald-500 after:transition-all hover:after:w-full">Features</a>
              <a href="#how-it-works" className="text-gray-700 font-medium hover:text-green-600 transition-colors relative after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-emerald-400 after:to-emerald-500 after:transition-all hover:after:w-full">How It Works</a>
              <a href="#" className="text-gray-700 font-medium hover:text-green-600 transition-colors relative after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-emerald-400 after:to-emerald-500 after:transition-all hover:after:w-full">Pricing</a>
              <a href="#" className="text-gray-700 font-medium hover:text-green-600 transition-colors relative after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-emerald-400 after:to-emerald-500 after:transition-all hover:after:w-full">Docs</a>
            </nav>
            
            {/* Desktop Actions */}
            <div className="hidden md:flex gap-2 lg:gap-4 items-center">
              <Button 
                variant="outline" 
                size="sm"
                className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition-all duration-300"
              >
                <i className="fas fa-sign-in-alt mr-2"></i>
                Sign In
              </Button>
              <ConnectWallet className="bg-gradient-to-r from-emerald-400 to-emerald-500 text-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300" />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 py-4 border-t border-gray-200 bg-white/95 backdrop-blur-md rounded-lg shadow-lg">
              <nav className="flex flex-col space-y-4">
                <a 
                  href="#" 
                  className="text-gray-700 font-medium hover:text-green-600 transition-colors px-4 py-2 rounded-lg hover:bg-green-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </a>
                <a 
                  href="#features" 
                  className="text-gray-700 font-medium hover:text-green-600 transition-colors px-4 py-2 rounded-lg hover:bg-green-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a 
                  href="#how-it-works" 
                  className="text-gray-700 font-medium hover:text-green-600 transition-colors px-4 py-2 rounded-lg hover:bg-green-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  How It Works
                </a>
                <a 
                  href="#" 
                  className="text-gray-700 font-medium hover:text-green-600 transition-colors px-4 py-2 rounded-lg hover:bg-green-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Pricing
                </a>
                <a 
                  href="#" 
                  className="text-gray-700 font-medium hover:text-green-600 transition-colors px-4 py-2 rounded-lg hover:bg-green-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Docs
                </a>
                <div className="px-4 pt-4 border-t border-gray-200 space-y-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition-all duration-300"
                  >
                    <i className="fas fa-sign-in-alt mr-2"></i>
                    Sign In
                  </Button>
                  <ConnectWallet className="w-full bg-gradient-to-r from-emerald-400 to-emerald-500 text-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300" />
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 md:pt-40 pb-16 md:pb-24 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
          <div className="absolute top-3/4 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-96 md:h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '4s'}}></div>
        </div>
        
        <div className="container mx-auto px-4 md:px-5">
          <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-16">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 text-green-600 px-4 md:px-6 py-2 md:py-3 rounded-full text-xs md:text-sm font-semibold mb-4 md:mb-6 animate-bounce-in border border-green-200 shadow-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Powered by Kaia Blockchain</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 md:mb-6 leading-tight animate-slide-in-left">
                <span className="bg-gradient-to-r from-green-800 via-green-600 to-emerald-500 bg-clip-text text-transparent animate-gradient-shift">
                  Earn Automated Yield on Your USDT
                </span>
                <br />
                <span className="text-gray-800">While You Chat</span>
              </h1>
              
              <p className="text-base md:text-lg lg:text-xl text-gray-600 mb-6 md:mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0 animate-slide-in-left animate-delay-1">
                LINE Yield lets you maximize your stablecoin earnings through automated DeFi strategies, 
                directly within LINE Messenger. Set it and forget it.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6 md:mb-10 animate-slide-in-left animate-delay-2 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  onClick={handleGetStarted}
                  className="h-12 md:h-14 px-6 md:px-8 text-base md:text-lg font-semibold bg-gradient-to-r from-emerald-400 to-emerald-500 text-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 animate-glow-pulse hover:animate-none"
                >
                  <i className="fas fa-rocket mr-2"></i>
                  Start Earning Now
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="h-12 md:h-14 px-6 md:px-8 text-base md:text-lg font-semibold border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition-all duration-300 hover:shadow-lg"
                >
                  <PlayCircle className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-5 animate-slide-in-left animate-delay-3 max-w-sm md:max-w-md mx-auto lg:mx-0">
                <div className="text-center bg-white/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-4 border border-green-100 hover:shadow-lg transition-all duration-300">
                  <div className="text-2xl md:text-3xl font-extrabold text-green-800 mb-1 md:mb-2">8.64%</div>
                  <div className="text-xs md:text-sm text-gray-600">Average APY</div>
                </div>
                <div className="text-center bg-white/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-4 border border-green-100 hover:shadow-lg transition-all duration-300">
                  <div className="text-2xl md:text-3xl font-extrabold text-green-800 mb-1 md:mb-2">$12.4M</div>
                  <div className="text-xs md:text-sm text-gray-600">Total Value Locked</div>
                </div>
                <div className="text-center bg-white/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-4 border border-green-100 hover:shadow-lg transition-all duration-300">
                  <div className="text-2xl md:text-3xl font-extrabold text-green-800 mb-1 md:mb-2">24/7</div>
                  <div className="text-xs md:text-sm text-gray-600">Auto-Rebalancing</div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 w-full max-w-lg mx-auto lg:mx-0">
              <div className="bg-white/90 backdrop-blur-lg rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 shadow-2xl animate-scale-in animate-delay-2 border border-white/20 hover:shadow-3xl transition-all duration-500">
                <div className="flex justify-between items-center mb-4 md:mb-6">
                  <h3 className="text-base md:text-lg lg:text-xl font-bold text-gray-800">Your Yield Dashboard</h3>
                  <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 text-white px-3 md:px-4 py-1 md:py-2 rounded-full text-xs md:text-sm font-semibold flex items-center gap-1 md:gap-2 animate-pulse">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="hidden sm:inline">Live</span>
                  </div>
                </div>
                
                <div className="text-center mb-4 md:mb-6">
                  <div className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2">Total Balance</div>
                  <div className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-green-800 mb-1 md:mb-2">$12,458.90</div>
                  <div className="text-green-600 font-semibold flex items-center justify-center gap-1 bg-green-50 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm">
                    <ArrowUp className="w-3 h-3 md:w-4 md:h-4" />
                    +2.4% ($298.21)
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
                  <div className="p-3 md:p-4 border border-gray-200 rounded-xl md:rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-green-50 hover:to-green-100 hover:border-green-400 transition-all duration-300 cursor-pointer group">
                    <div className="flex flex-col items-center gap-1 md:gap-2">
                      <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg md:rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                        <ArrowDown className="w-3 h-3 md:w-4 md:h-4" />
                      </div>
                      <div className="text-xs md:text-sm font-semibold text-gray-800">Deposit</div>
                    </div>
                  </div>
                  <div className="p-3 md:p-4 border border-gray-200 rounded-xl md:rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-green-50 hover:to-green-100 hover:border-green-400 transition-all duration-300 cursor-pointer group">
                    <div className="flex flex-col items-center gap-1 md:gap-2">
                      <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg md:rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                        <ArrowUp className="w-3 h-3 md:w-4 md:h-4" />
                      </div>
                      <div className="text-xs md:text-sm font-semibold text-gray-800">Withdraw</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 p-4 md:p-6 rounded-xl md:rounded-2xl text-white text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
                  <div className="relative z-10">
                    <div className="text-xs md:text-sm mb-1 opacity-90">Current APY</div>
                    <div className="text-2xl md:text-3xl font-extrabold">8.64%</div>
                    <div className="text-xs mt-1 opacity-80">Auto-compounded daily</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 md:px-5">
          <div className="text-center mb-12 md:mb-16 animate-fade-in">
            <div className="text-green-600 font-semibold mb-3 md:mb-4 text-sm md:text-base">Why Choose LINE Yield</div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-800 mb-4 md:mb-5">Maximize Your Earnings with Zero Effort</h2>
            <p className="text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform combines the power of DeFi with the convenience of LINE Messenger
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 animate-slide-up group border border-white/20">
              <div className="absolute top-0 left-0 w-full h-1.5 md:h-2 bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 rounded-t-2xl md:rounded-t-3xl"></div>
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 text-green-600 text-lg md:text-2xl group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-bolt"></i>
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-gray-800">Gasless Transactions</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-4 md:mb-6">
                Enjoy zero transaction fees with our gas abstraction technology. We sponsor all gas costs for your deposits and withdrawals.
              </p>
              <a href="#" className="inline-flex items-center gap-2 text-green-600 font-semibold text-xs md:text-sm hover:gap-3 transition-all duration-300 group-hover:text-emerald-600">
                Learn more <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
              </a>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 animate-slide-up animate-delay-1 group border border-white/20">
              <div className="absolute top-0 left-0 w-full h-1.5 md:h-2 bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 rounded-t-2xl md:rounded-t-3xl"></div>
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 text-green-600 text-lg md:text-2xl group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-robot"></i>
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-gray-800">Auto-Rebalancing</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-4 md:mb-6">
                Our smart contracts automatically move your funds to the highest-yielding strategies across the Kaia ecosystem.
              </p>
              <a href="#" className="inline-flex items-center gap-2 text-green-600 font-semibold text-xs md:text-sm hover:gap-3 transition-all duration-300 group-hover:text-emerald-600">
                Learn more <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
              </a>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 animate-slide-up animate-delay-2 group border border-white/20 md:col-span-2 lg:col-span-1">
              <div className="absolute top-0 left-0 w-full h-1.5 md:h-2 bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 rounded-t-2xl md:rounded-t-3xl"></div>
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 text-green-600 text-lg md:text-2xl group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-gray-800">Secure & Audited</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-4 md:mb-6">
                All smart contracts are thoroughly audited and built with security as the top priority. Your funds are always safe.
              </p>
              <a href="#" className="inline-flex items-center gap-2 text-green-600 font-semibold text-xs md:text-sm hover:gap-3 transition-all duration-300 group-hover:text-emerald-600">
                Learn more <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* LINE NEXT Integration Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4 md:px-5">
          <div className="text-center mb-12 md:mb-16 animate-fade-in">
            <div className="text-green-600 font-semibold mb-3 md:mb-4 text-sm md:text-base">LINE Ecosystem</div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-800 mb-4 md:mb-5">Connected to LINE NEXT</h2>
            <p className="text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              Seamlessly integrate with LINE's ecosystem for social features and enhanced user experience
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <LineNextIntegration />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-5">
          <div className="text-center mb-12 md:mb-16 animate-fade-in">
            <div className="text-green-600 font-semibold mb-3 md:mb-4 text-sm md:text-base">Simple Process</div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-800 mb-4 md:mb-5">Start Earning in Minutes</h2>
            <p className="text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              Getting started with LINE Yield is easy and requires no technical knowledge
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between relative mb-12 md:mb-16">
            <div className="hidden md:block absolute top-8 md:top-10 left-0 w-full h-0.5 bg-gray-200 z-0"></div>
            
            <div className="text-center relative z-10 w-full md:w-1/4 mb-6 md:mb-0 flex md:block items-center gap-3 md:gap-0">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center text-xl md:text-2xl font-extrabold text-gray-600 mx-auto md:mx-auto mb-0 md:mb-5 relative flex-shrink-0">
                1
              </div>
              <div className="text-left md:text-center">
                <h3 className="font-bold mb-2 md:mb-3 text-gray-800 text-sm md:text-base">Connect Wallet</h3>
                <p className="text-xs md:text-sm text-gray-600 px-0 md:px-2">Link your Kaia-compatible wallet to the LINE Mini App</p>
              </div>
            </div>
            
            <div className="text-center relative z-10 w-full md:w-1/4 mb-6 md:mb-0 flex md:block items-center gap-3 md:gap-0">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center text-xl md:text-2xl font-extrabold text-gray-600 mx-auto md:mx-auto mb-0 md:mb-5 relative flex-shrink-0">
                2
              </div>
              <div className="text-left md:text-center">
                <h3 className="font-bold mb-2 md:mb-3 text-gray-800 text-sm md:text-base">Deposit USDT</h3>
                <p className="text-xs md:text-sm text-gray-600 px-0 md:px-2">Add funds to your yield vault with one click</p>
              </div>
            </div>
            
            <div className="text-center relative z-10 w-full md:w-1/4 mb-6 md:mb-0 flex md:block items-center gap-3 md:gap-0">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center text-xl md:text-2xl font-extrabold text-gray-600 mx-auto md:mx-auto mb-0 md:mb-5 relative flex-shrink-0">
                3
              </div>
              <div className="text-left md:text-center">
                <h3 className="font-bold mb-2 md:mb-3 text-gray-800 text-sm md:text-base">Earn Automatically</h3>
                <p className="text-xs md:text-sm text-gray-600 px-0 md:px-2">Watch your balance grow with automated yield optimization</p>
              </div>
            </div>
            
            <div className="text-center relative z-10 w-full md:w-1/4 mb-6 md:mb-0 flex md:block items-center gap-3 md:gap-0">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center text-xl md:text-2xl font-extrabold text-gray-600 mx-auto md:mx-auto mb-0 md:mb-5 relative flex-shrink-0">
                4
              </div>
              <div className="text-left md:text-center">
                <h3 className="font-bold mb-2 md:mb-3 text-gray-800 text-sm md:text-base">Withdraw Anytime</h3>
                <p className="text-xs md:text-sm text-gray-600 px-0 md:px-2">Access your funds whenever you need them</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 lg:py-24 bg-gradient-to-r from-green-800 to-blue-900 text-white rounded-xl md:rounded-2xl mx-4 md:mx-5 mb-8 md:mb-10">
        <div className="container mx-auto px-4 md:px-5 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-4 md:mb-5">Ready to Start Earning Yield?</h2>
          <p className="text-base md:text-lg lg:text-xl opacity-90 max-w-2xl mx-auto mb-6 md:mb-10">
            Join thousands of users who are already growing their wealth with LINE Yield. No technical knowledge required.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="h-12 md:h-14 lg:h-16 px-6 md:px-8 lg:px-12 text-base md:text-lg lg:text-xl font-semibold bg-white text-green-800 hover:bg-gray-100 transition-all duration-300"
            >
              <i className="fas fa-rocket mr-2 md:mr-3"></i>
              Get Started Now
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="h-12 md:h-14 lg:h-16 px-6 md:px-8 lg:px-12 text-base md:text-lg lg:text-xl font-semibold border-2 border-white/30 text-white hover:bg-white/10 transition-all duration-300"
            >
              <FileText className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3" />
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