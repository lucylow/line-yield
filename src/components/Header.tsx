import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LineChart, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/useWallet';

export const Header = () => {
  const { wallet, connectWallet } = useWallet();
  const location = useLocation();

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center shadow-primary">
              <LineChart className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">LINE Yield</h1>
              <p className="text-xs text-muted-foreground font-medium">Smart USDT Yield Farming</p>
            </div>
          </Link>
          
          <nav className="hidden md:flex">
            <ul className="flex gap-8">
              <li>
                <Link 
                  to="/" 
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === '/' ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/dashboard" 
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === '/dashboard' ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <a href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                  Docs
                </a>
              </li>
            </ul>
          </nav>
          
          <div className="flex items-center gap-3">
            {wallet.isConnected ? (
              <div className="flex items-center gap-3">
                <div className="bg-card/60 backdrop-blur-sm border border-border rounded-xl px-3 py-2">
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                    </p>
                    <p className="text-xs text-muted-foreground">Kaia Network</p>
                  </div>
                </div>
                <div className="w-3 h-3 bg-yield rounded-full animate-pulse"></div>
              </div>
            ) : (
              <Button onClick={() => connectWallet()} className="gap-2">
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};