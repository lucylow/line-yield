import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  BarChart3, 
  Trophy, 
  Wallet, 
  Settings,
  Plus,
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWallet } from '@/hooks/useWallet';

interface MobileBottomNavigationProps {
  className?: string;
}

export const MobileBottomNavigation: React.FC<MobileBottomNavigationProps> = ({ 
  className = '' 
}) => {
  const location = useLocation();
  const { wallet } = useWallet();

  const navigationItems = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
      active: location.pathname === '/'
    },
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: BarChart3,
      active: location.pathname === '/dashboard'
    },
    {
      name: 'Earn',
      href: '/gamification',
      icon: Trophy,
      active: location.pathname === '/gamification',
      badge: wallet.isConnected ? '3' : null
    },
    {
      name: 'Wallet',
      href: '/wallet',
      icon: Wallet,
      active: location.pathname === '/wallet',
      connected: wallet.isConnected
    },
    {
      name: 'More',
      href: '/settings',
      icon: Settings,
      active: location.pathname === '/settings'
    }
  ];

  return (
    <nav className={cn(
      'fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 safe-area-bottom',
      className
    )}>
      <div className="flex items-center justify-around px-2 py-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.active;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-lg transition-all duration-200',
                'active:scale-95 active:bg-gray-100',
                isActive 
                  ? 'text-emerald-600' 
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <div className="relative">
                <Icon 
                  className={cn(
                    'w-5 h-5 transition-all duration-200',
                    isActive && 'scale-110'
                  )} 
                />
                
                {/* Badge */}
                {item.badge && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {item.badge}
                  </span>
                )}
                
                {/* Connection indicator */}
                {item.name === 'Wallet' && item.connected && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full"></div>
                )}
              </div>
              
              <span className={cn(
                'text-xs font-medium mt-1 transition-all duration-200',
                isActive ? 'text-emerald-600' : 'text-gray-500'
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNavigation;
