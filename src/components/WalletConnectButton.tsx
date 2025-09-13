import React from 'react';
import { useWallet, useNetworkCheck } from '../hooks/useWallet';
import { cn } from '../utils/cn';

interface WalletConnectButtonProps {
  className?: string;
  showNetworkSwitch?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline';
}

export const WalletConnectButton: React.FC<WalletConnectButtonProps> = ({
  className = '',
  showNetworkSwitch = true,
  size = 'md',
  variant = 'primary'
}) => {
  const { 
    address, 
    isConnected, 
    isConnecting, 
    balanceFormatted, 
    symbol, 
    isKaiaNetwork,
    connect,
    switchToKaia 
  } = useWallet();

  const { isCorrectNetwork, switchToCorrectNetwork } = useNetworkCheck();

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-base';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-gray-600 hover:bg-gray-700 text-white';
      case 'outline':
        return 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatBalance = (balance: string | undefined, symbol: string | undefined) => {
    if (!balance || !symbol) return '';
    const num = parseFloat(balance);
    if (num < 0.001) return '< 0.001';
    return num.toFixed(3);
  };

  if (!isConnected) {
    return (
      <button
        onClick={connect}
        disabled={isConnecting}
        className={cn(
          'rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
          getSizeClasses(),
          getVariantClasses(),
          className
        )}
      >
        {isConnecting ? (
          <div className="flex items-center space-x-2">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Connecting...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Connect Wallet</span>
          </div>
        )}
      </button>
    );
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {/* Network Switch Button */}
      {showNetworkSwitch && !isCorrectNetwork && (
        <button
          onClick={switchToCorrectNetwork}
          className={cn(
            'rounded-lg font-medium transition-colors',
            getSizeClasses(),
            'bg-orange-600 hover:bg-orange-700 text-white'
          )}
        >
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Switch to Kaia</span>
          </div>
        </button>
      )}

      {/* Wallet Info */}
      <div className={cn(
        'rounded-lg border-2 border-gray-200 bg-white px-4 py-2',
        getSizeClasses()
      )}>
        <div className="flex items-center space-x-3">
          {/* Wallet Icon */}
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          {/* Address and Balance */}
          <div className="flex flex-col">
            <div className="text-sm font-medium text-gray-900">
              {formatAddress(address!)}
            </div>
            {balanceFormatted && symbol && (
              <div className="text-xs text-gray-500">
                {formatBalance(balanceFormatted, symbol)} {symbol}
              </div>
            )}
          </div>

          {/* Network Indicator */}
          <div className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            isKaiaNetwork 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          )}>
            {isKaiaNetwork ? 'Kaia' : 'Other'}
          </div>
        </div>
      </div>

      {/* Disconnect Button */}
      <button
        onClick={() => {
          // You can add a confirmation dialog here if needed
          if (window.confirm('Are you sure you want to disconnect your wallet?')) {
            // Disconnect logic would go here
            window.location.reload(); // Simple refresh for now
          }
        }}
        className={cn(
          'rounded-lg font-medium transition-colors',
          getSizeClasses(),
          'bg-red-600 hover:bg-red-700 text-white'
        )}
        title="Disconnect Wallet"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </div>
  );
};

// Simple AppKit Button Component (alternative to custom button)
export const AppKitButton: React.FC<{ className?: string }> = ({ className }) => {
  const { openAppKit } = useWallet();
  
  return (
    <div className={className}>
      <button 
        onClick={openAppKit}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Connect Wallet
      </button>
    </div>
  );
};
