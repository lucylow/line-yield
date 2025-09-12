import React from 'react';
import { Button } from './Button';
import { useUniversalWallet } from '../hooks/useUniversalWallet';
import { usePlatform } from '../hooks/usePlatform';

export const Header: React.FC = () => {
  const { wallet, connectWallet, disconnectWallet } = useUniversalWallet();
  const { isLiff } = usePlatform();

  const handleWalletAction = async () => {
    if (wallet.isConnected) {
      disconnectWallet();
    } else {
      try {
        await connectWallet();
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    }
  };

  return (
    <header className={`bg-white shadow-sm ${isLiff ? 'px-4 py-3' : 'px-6 py-4'}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">LY</span>
            </div>
            <span className="text-xl font-bold text-gray-900">LINE Yield</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {wallet.isConnected ? (
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-600">
                {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
              </div>
              <div className="text-sm text-gray-500">
                {wallet.balance} KAIA
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleWalletAction}
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <Button onClick={handleWalletAction}>
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
