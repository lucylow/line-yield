import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Menu, Home, BarChart3, Zap, BookOpen, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileNavigationProps {
  wallet: {
    isConnected: boolean;
    address?: string | null;
  };
  onConnectWallet: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ 
  wallet, 
  onConnectWallet 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Features', href: '#features', icon: Zap },
    { name: 'How It Works', href: '#how-it-works', icon: BookOpen },
  ];

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleNavClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMenu}
        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Toggle mobile menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleNavClick}
          />
          
          {/* Menu Panel */}
          <div className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl animate-slide-in-right">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
              <button
                onClick={handleNavClick}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Items */}
            <nav className="p-6">
              <ul className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        onClick={handleNavClick}
                        className={`
                          flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                          ${isActive 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'text-gray-700 hover:bg-gray-50 hover:text-green-600'
                          }
                        `}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Wallet Section */}
            <div className="p-6 border-t border-gray-200">
              {wallet.isConnected ? (
                <div className="space-y-4">
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-800">Connected</p>
                        <p className="text-xs text-green-600 font-mono">
                          {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => {
                    onConnectWallet();
                    handleNavClick();
                  }}
                  className="w-full h-12 bg-gradient-to-r from-emerald-400 to-emerald-500 text-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  <Wallet className="w-5 h-5 mr-2" />
                  Connect Wallet
                </Button>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 mt-auto">
              <p className="text-xs text-gray-500 text-center">
                Built on Kaia Blockchain
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
