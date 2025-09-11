import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LineChart, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/useWallet';

export const Header = () => {
  const { wallet, connectWallet } = useWallet();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'py-2 backdrop-blur-md bg-white/95 shadow-lg' 
        : 'py-5 bg-white shadow-sm'
    }`}>
      <div className="container mx-auto px-5">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 font-extrabold text-2xl">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg">
              <LineChart className="w-6 h-6" />
            </div>
            <span className="bg-gradient-to-r from-green-800 to-green-600 bg-clip-text text-transparent">
              LINE Yield
            </span>
          </Link>
          
          <nav className="hidden md:flex gap-8">
            <Link 
              to="/" 
              className={`font-medium transition-colors relative after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-emerald-400 after:to-emerald-500 after:transition-all hover:after:w-full ${
                location.pathname === '/' 
                  ? 'text-green-600 after:w-full' 
                  : 'text-gray-700 hover:text-green-600'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/dashboard" 
              className={`font-medium transition-colors relative after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-emerald-400 after:to-emerald-500 after:transition-all hover:after:w-full ${
                location.pathname === '/dashboard' 
                  ? 'text-green-600 after:w-full' 
                  : 'text-gray-700 hover:text-green-600'
              }`}
            >
              Dashboard
            </Link>
            <a 
              href="#features" 
              className="text-gray-700 font-medium hover:text-green-600 transition-colors relative after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-emerald-400 after:to-emerald-500 after:transition-all hover:after:w-full"
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              className="text-gray-700 font-medium hover:text-green-600 transition-colors relative after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-emerald-400 after:to-emerald-500 after:transition-all hover:after:w-full"
            >
              How It Works
            </a>
            <a 
              href="#" 
              className="text-gray-700 font-medium hover:text-green-600 transition-colors relative after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-emerald-400 after:to-emerald-500 after:transition-all hover:after:w-full"
            >
              Docs
            </a>
          </nav>
          
          <div className="flex gap-4 items-center">
            {wallet.isConnected ? (
              <div className="flex items-center gap-3">
                <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">
                      {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                    </p>
                    <p className="text-xs text-gray-600">Kaia Network</p>
                  </div>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition-all duration-300"
                >
                  <i className="fas fa-sign-in-alt mr-2"></i>
                  Sign In
                </Button>
                <Button 
                  onClick={() => connectWallet()} 
                  className="bg-gradient-to-r from-emerald-400 to-emerald-500 text-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};