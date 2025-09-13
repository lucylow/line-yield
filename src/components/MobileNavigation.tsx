import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  X, 
  Home, 
  BarChart3, 
  Wallet, 
  Settings, 
  HelpCircle,
  LineChart,
  User
} from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { cn } from '@/lib/utils';

interface MobileNavigationProps {
  className?: string;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { wallet, connectWallet, disconnectWallet } = useWallet();

  const navigationItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Wallet', href: '/wallet', icon: Wallet },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Help', href: '/help', icon: HelpCircle },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleWalletAction = async () => {
    if (wallet.isConnected) {
      disconnectWallet();
    } else {
      await connectWallet();
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <header className={cn(
        'fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200',
        className
      )}>
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-500 text-white rounded-lg flex items-center justify-center">
              <LineChart className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-green-800 to-green-600 bg-clip-text text-transparent">
              LINE Yield
            </span>
          </Link>

          {/* Wallet Status & Menu Button */}
          <div className="flex items-center gap-3">
            {/* Wallet Status */}
            {wallet.isConnected ? (
              <div className="hidden sm:flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs font-medium text-green-700">
                  {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                </span>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={handleWalletAction}
                className="hidden sm:flex bg-gradient-to-r from-emerald-400 to-emerald-500 text-white"
              >
                <Wallet className="w-4 h-4 mr-1" />
                Connect
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="p-2"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={toggleMenu} />
      )}

      {/* Mobile Menu */}
      <div className={cn(
        'fixed top-0 right-0 z-50 h-full w-80 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          {/* Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-500 text-white rounded-lg flex items-center justify-center">
                <LineChart className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg">LINE Yield</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="p-2"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* User Profile Section */}
          <div className="p-4 border-b border-gray-200">
            {wallet.isConnected ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Connected Wallet</p>
                  <p className="text-sm text-gray-500 font-mono">
                    {wallet.address?.slice(0, 8)}...{wallet.address?.slice(-6)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Balance: {wallet.balance} USDT
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Wallet className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mb-3">Connect your wallet to start earning</p>
                <Button
                  onClick={handleWalletAction}
                  className="w-full bg-gradient-to-r from-emerald-400 to-emerald-500 text-white"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      onClick={toggleMenu}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                        isActive
                          ? 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      )}
                    >
                      <Icon className={cn(
                        'w-5 h-5',
                        isActive ? 'text-emerald-600' : 'text-gray-400'
                      )} />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Menu Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">Powered by Kaia Blockchain</p>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600 font-medium">Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileNavigation;