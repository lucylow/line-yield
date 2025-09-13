import React, { useState } from 'react';
import { cn } from '../utils/cn';
import { useT } from '../hooks';

interface CompliantConnectButtonProps {
  /** Callback when wallet connection is triggered */
  onConnect: () => Promise<void>;
  /** Whether wallet is currently connected */
  isConnected: boolean;
  /** User's wallet address when connected */
  userAddress?: string;
  /** Whether connection is in progress */
  isConnecting?: boolean;
  /** Custom button text when not connected */
  connectText?: string;
  /** Custom button text when connecting */
  connectingText?: string;
  /** Custom button text when connected */
  connectedText?: string;
  /** Button variant */
  variant?: 'default' | 'primary' | 'secondary' | 'outline';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Whether button is disabled */
  disabled?: boolean;
  /** Action that requires wallet connection */
  actionType?: 'deposit' | 'withdraw' | 'buy' | 'claim' | 'transfer' | 'custom';
  /** Custom action description */
  actionDescription?: string;
}

/**
 * Connect button that complies with Dapp Portal design guidelines
 * Defers wallet connection until specific actions are executed
 */
export const CompliantConnectButton: React.FC<CompliantConnectButtonProps> = ({
  onConnect,
  isConnected,
  userAddress,
  isConnecting = false,
  connectText,
  connectingText,
  connectedText,
  variant = 'default',
  size = 'md',
  className = '',
  disabled = false,
  actionType = 'custom',
  actionDescription,
}) => {
  const t = useT();
  const [internalConnecting, setInternalConnecting] = useState(false);

  const connecting = isConnecting || internalConnecting;

  // Get localized text
  const getConnectText = () => {
    if (connectText) return connectText;
    
    switch (actionType) {
      case 'deposit':
        return t('connectToDeposit', 'Connect to Deposit');
      case 'withdraw':
        return t('connectToWithdraw', 'Connect to Withdraw');
      case 'buy':
        return t('connectToBuy', 'Connect to Buy');
      case 'claim':
        return t('connectToClaim', 'Connect to Claim');
      case 'transfer':
        return t('connectToTransfer', 'Connect to Transfer');
      default:
        return t('connectWallet', 'Connect Wallet');
    }
  };

  const getConnectingText = () => {
    if (connectingText) return connectingText;
    return t('connecting', 'Connecting...');
  };

  const getConnectedText = () => {
    if (connectedText) return connectedText;
    if (userAddress) {
      return `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
    }
    return t('connected', 'Connected');
  };

  const getActionDescription = () => {
    if (actionDescription) return actionDescription;
    
    switch (actionType) {
      case 'deposit':
        return t('walletRequiredForDeposit', 'Wallet connection required to deposit funds');
      case 'withdraw':
        return t('walletRequiredForWithdraw', 'Wallet connection required to withdraw funds');
      case 'buy':
        return t('walletRequiredForBuy', 'Wallet connection required to complete purchase');
      case 'claim':
        return t('walletRequiredForClaim', 'Wallet connection required to claim rewards');
      case 'transfer':
        return t('walletRequiredForTransfer', 'Wallet connection required to transfer tokens');
      default:
        return t('walletRequiredForAction', 'Wallet connection required for this action');
    }
  };

  // Handle connection
  const handleConnectClick = async () => {
    if (isConnected || connecting || disabled) return;

    setInternalConnecting(true);
    try {
      await onConnect();
    } catch (error) {
      console.error('Wallet connection failed:', error);
    } finally {
      setInternalConnecting(false);
    }
  };

  // Get variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          base: 'bg-blue-600 text-white hover:bg-blue-700',
          connected: 'bg-green-600 text-white',
          disabled: 'bg-gray-400 text-gray-200',
        };
      case 'secondary':
        return {
          base: 'bg-gray-600 text-white hover:bg-gray-700',
          connected: 'bg-green-600 text-white',
          disabled: 'bg-gray-400 text-gray-200',
        };
      case 'outline':
        return {
          base: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
          connected: 'border-2 border-green-600 text-green-600 bg-green-50',
          disabled: 'border-2 border-gray-400 text-gray-400',
        };
      default:
        return {
          base: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700',
          connected: 'bg-gradient-to-r from-green-500 to-green-600 text-white',
          disabled: 'bg-gray-400 text-gray-200',
        };
    }
  };

  // Get size styles
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-sm';
      case 'lg':
        return 'px-6 py-4 text-lg';
      default:
        return 'px-4 py-3 text-base';
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  // Connected state
  if (isConnected && userAddress) {
    return (
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          className={cn(
            'font-medium rounded-xl transition-all duration-200 shadow-lg',
            sizeStyles,
            variantStyles.connected,
            className
          )}
          disabled
          aria-label={t('walletConnected', 'Wallet connected')}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            {getConnectedText()}
          </div>
        </button>
        <span className="text-xs text-gray-500">
          {t('walletConnected', 'Wallet Connected')}
        </span>
      </div>
    );
  }

  // Not connected state
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        className={cn(
          'font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5',
          sizeStyles,
          connecting || disabled ? variantStyles.disabled : variantStyles.base,
          className
        )}
        onClick={handleConnectClick}
        disabled={connecting || disabled}
        aria-label={getConnectText()}
      >
        <div className="flex items-center gap-2">
          {connecting && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {connecting ? getConnectingText() : getConnectText()}
        </div>
      </button>
      
      {/* Action description */}
      <span className="text-xs text-gray-500 text-center max-w-xs">
        {getActionDescription()}
      </span>
    </div>
  );
};

/**
 * Hook for managing wallet connection state
 */
export function useWalletConnection() {
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = async (connectFunction: () => Promise<void>) => {
    setIsConnecting(true);
    setError(null);
    
    try {
      await connectFunction();
      setIsConnected(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Connection failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setUserAddress(null);
    setError(null);
  };

  return {
    isConnected,
    userAddress,
    isConnecting,
    error,
    connect,
    disconnect,
    setUserAddress,
  };
}
