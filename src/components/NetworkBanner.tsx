import React from 'react';
import { useNetworkCheck } from '../hooks/useWallet';
import { cn } from '../utils/cn';

interface NetworkBannerProps {
  className?: string;
  showWhenCorrect?: boolean;
}

export const NetworkBanner: React.FC<NetworkBannerProps> = ({
  className = '',
  showWhenCorrect = false
}) => {
  const { isCorrectNetwork, isConnected, switchToCorrectNetwork, currentChainId } = useNetworkCheck();

  // Don't show banner if not connected
  if (!isConnected) return null;

  // Don't show banner if on correct network and showWhenCorrect is false
  if (isCorrectNetwork && !showWhenCorrect) return null;

  const getNetworkName = (chainId: number | undefined) => {
    switch (chainId) {
      case 1: return 'Ethereum';
      case 137: return 'Polygon';
      case 42161: return 'Arbitrum';
      case 8453: return 'Base';
      case 8217: return 'Kaia';
      default: return `Chain ${chainId}`;
    }
  };

  if (isCorrectNetwork && showWhenCorrect) {
    return (
      <div className={cn(
        'bg-green-50 border border-green-200 rounded-lg p-4',
        className
      )}>
        <div className="flex items-center">
          <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-green-800">
              Connected to Kaia Network
            </h3>
            <p className="text-sm text-green-700 mt-1">
              You're connected to the correct network for LINE Yield.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'bg-orange-50 border border-orange-200 rounded-lg p-4',
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-orange-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-orange-800">
              Wrong Network Detected
            </h3>
            <p className="text-sm text-orange-700 mt-1">
              You're connected to {getNetworkName(currentChainId)}. Please switch to Kaia network to use LINE Yield.
            </p>
          </div>
        </div>
        <button
          onClick={switchToCorrectNetwork}
          className="ml-4 bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
        >
          Switch to Kaia
        </button>
      </div>
    </div>
  );
};
