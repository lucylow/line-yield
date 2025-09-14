import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './Button';
import { cn } from '../utils/cn';

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (walletType: string) => void;
}

export const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({
  isOpen,
  onClose,
  onConnect,
}) => {
  const walletOptions = [
    { 
      name: 'Google', 
      icon: 'G', 
      type: 'google',
      iconBg: 'bg-red-500',
      iconColor: 'text-white'
    },
    { 
      name: 'LINE', 
      icon: '💬', 
      type: 'line',
      iconBg: 'bg-green-500',
      iconColor: 'text-white'
    },
    { 
      name: 'Apple', 
      icon: '🍎', 
      type: 'apple',
      iconBg: 'bg-gray-800',
      iconColor: 'text-white'
    },
    { 
      name: 'Naver', 
      icon: 'N', 
      type: 'naver',
      iconBg: 'bg-green-600',
      iconColor: 'text-white'
    },
    { 
      name: 'Kakao', 
      icon: '💬', 
      type: 'kakao',
      iconBg: 'bg-yellow-400',
      iconColor: 'text-black'
    },
    { 
      name: 'OKX Wallet', 
      icon: 'OKX', 
      type: 'okx', 
      external: true,
      iconBg: 'bg-blue-600',
      iconColor: 'text-white'
    },
    { 
      name: 'Bitget Wallet', 
      icon: 'BG', 
      type: 'bitget', 
      external: true,
      iconBg: 'bg-purple-600',
      iconColor: 'text-white'
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-6 bg-white rounded-lg shadow-lg">
        <DialogHeader className="text-center">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="flex justify-center mb-4">
            {/* LINE Mini Dapp icon */}
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">💬</span>
            </div>
          </div>
          
          <DialogTitle className="text-2xl font-bold text-gray-900">Mini Dapp</DialogTitle>
          <DialogDescription className="text-gray-500 mt-2">Connect your wallet</DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-3 py-4">
          {walletOptions.map((option) => (
            <Button
              key={option.type}
              variant="outline"
              className={cn(
                "w-full justify-start py-3 h-auto text-base border-gray-200 hover:bg-gray-50 transition-colors",
                "flex items-center"
              )}
              onClick={() => onConnect(option.type)}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm font-bold",
                option.iconBg,
                option.iconColor
              )}>
                {option.icon}
              </div>
              <span className="flex-1 text-left">Connect with {option.name}</span>
              {option.external && (
                <span className="ml-auto text-gray-400 text-sm">↗</span>
              )}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
