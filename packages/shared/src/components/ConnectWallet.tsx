import React from 'react';
import { Button } from './Button';
import { useUniversalWallet } from '../hooks/useUniversalWallet';
import { usePlatform } from '../hooks/usePlatform';

interface ConnectWalletProps {
  onConnect?: () => void;
  onDisconnect?: () => void;
  className?: string;
}

export const ConnectWallet: React.FC<ConnectWalletProps> = ({
  onConnect,
  onDisconnect,
  className = ''
}) => {
  const { wallet, connectWallet, disconnectWallet } = useUniversalWallet();
  const { isLiff } = usePlatform();

  const handleWalletAction = async () => {
    if (wallet.isConnected) {
      disconnectWallet();
      onDisconnect?.();
    } else {
      try {
        await connectWallet();
        onConnect?.();
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    }
  };

  const getWalletType = () => {
    if (isLiff) return 'LINE Wallet';
    return wallet.walletType === 'metamask' ? 'MetaMask' : 'Wallet';
  };

  if (wallet.isConnected) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className="text-sm text-gray-600">
          {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleWalletAction}
        >
          Disconnect {getWalletType()}
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={handleWalletAction} className={className}>
      Connect {getWalletType()}
    </Button>
  );
};