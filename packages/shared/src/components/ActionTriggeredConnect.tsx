import React, { useState } from 'react';
import { cn } from '../utils/cn';
import { useT } from '../hooks';

interface ActionTriggeredConnectProps {
  /** The action that requires wallet connection */
  action: 'deposit' | 'withdraw' | 'buy' | 'claim' | 'transfer' | 'custom';
  /** Custom action description */
  actionDescription?: string;
  /** Whether wallet is connected */
  isConnected: boolean;
  /** User's wallet address */
  userAddress?: string;
  /** Wallet connection function */
  onConnect: () => Promise<void>;
  /** Action execution function */
  onAction: () => Promise<void>;
  /** Whether connection/action is in progress */
  isLoading?: boolean;
  /** Button variant */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Whether button is disabled */
  disabled?: boolean;
  /** Custom action text */
  actionText?: string;
  /** Custom connect text */
  connectText?: string;
}

/**
 * Component that triggers wallet connection only when specific actions are executed
 * Complies with Dapp Portal design guidelines
 */
export const ActionTriggeredConnect: React.FC<ActionTriggeredConnectProps> = ({
  action,
  actionDescription,
  isConnected,
  userAddress,
  onConnect,
  onAction,
  isLoading = false,
  variant = 'default',
  size = 'md',
  className = '',
  disabled = false,
  actionText,
  connectText,
}) => {
  const t = useT();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isExecutingAction, setIsExecutingAction] = useState(false);

  // Get action-specific text
  const getActionText = () => {
    if (actionText) return actionText;
    
    switch (action) {
      case 'deposit':
        return t('deposit', 'Deposit');
      case 'withdraw':
        return t('withdraw', 'Withdraw');
      case 'buy':
        return t('buy', 'Buy');
      case 'claim':
        return t('claim', 'Claim');
      case 'transfer':
        return t('transfer', 'Transfer');
      default:
        return t('execute', 'Execute');
    }
  };

  const getConnectText = () => {
    if (connectText) return connectText;
    
    switch (action) {
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

  const getActionDescription = () => {
    if (actionDescription) return actionDescription;
    
    switch (action) {
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

  // Handle wallet connection
  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await onConnect();
    } catch (error) {
      console.error('Wallet connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle action execution
  const handleAction = async () => {
    if (!isConnected) {
      // Trigger wallet connection first
      await handleConnect();
      return;
    }

    setIsExecutingAction(true);
    try {
      await onAction();
    } catch (error) {
      console.error('Action execution failed:', error);
    } finally {
      setIsExecutingAction(false);
    }
  };

  // Get variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          base: 'bg-blue-600 text-white hover:bg-blue-700',
          success: 'bg-green-600 text-white hover:bg-green-700',
          warning: 'bg-yellow-600 text-white hover:bg-yellow-700',
          danger: 'bg-red-600 text-white hover:bg-red-700',
          disabled: 'bg-gray-400 text-gray-200',
        };
      case 'success':
        return {
          base: 'bg-green-600 text-white hover:bg-green-700',
          success: 'bg-green-600 text-white hover:bg-green-700',
          warning: 'bg-yellow-600 text-white hover:bg-yellow-700',
          danger: 'bg-red-600 text-white hover:bg-red-700',
          disabled: 'bg-gray-400 text-gray-200',
        };
      case 'warning':
        return {
          base: 'bg-yellow-600 text-white hover:bg-yellow-700',
          success: 'bg-green-600 text-white hover:bg-green-700',
          warning: 'bg-yellow-600 text-white hover:bg-yellow-700',
          danger: 'bg-red-600 text-white hover:bg-red-700',
          disabled: 'bg-gray-400 text-gray-200',
        };
      case 'danger':
        return {
          base: 'bg-red-600 text-white hover:bg-red-700',
          success: 'bg-green-600 text-white hover:bg-green-700',
          warning: 'bg-yellow-600 text-white hover:bg-yellow-700',
          danger: 'bg-red-600 text-white hover:bg-red-700',
          disabled: 'bg-gray-400 text-gray-200',
        };
      default:
        return {
          base: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700',
          success: 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700',
          warning: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700',
          danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700',
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
  const loading = isLoading || isConnecting || isExecutingAction;

  // Determine current state and styles
  const getCurrentState = () => {
    if (loading) {
      return {
        text: isConnecting ? t('connecting', 'Connecting...') : t('processing', 'Processing...'),
        styles: variantStyles.disabled,
        icon: 'spinner',
      };
    }

    if (isConnected) {
      return {
        text: getActionText(),
        styles: variantStyles.success,
        icon: 'action',
      };
    }

    return {
      text: getConnectText(),
      styles: variantStyles.base,
      icon: 'connect',
    };
  };

  const currentState = getCurrentState();

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        className={cn(
          'font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5',
          sizeStyles,
          currentState.styles,
          className
        )}
        onClick={handleAction}
        disabled={disabled || loading}
        aria-label={currentState.text}
      >
        <div className="flex items-center gap-2">
          {loading && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {!loading && isConnected && (
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          )}
          {currentState.text}
        </div>
      </button>
      
      {/* Status description */}
      <span className="text-xs text-gray-500 text-center max-w-xs">
        {isConnected 
          ? `${t('readyTo', 'Ready to')} ${getActionText().toLowerCase()}`
          : getActionDescription()
        }
      </span>
      
      {/* Wallet address display when connected */}
      {isConnected && userAddress && (
        <span className="text-xs text-gray-400 font-mono">
          {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
        </span>
      )}
    </div>
  );
};

/**
 * Hook for managing action-triggered wallet connection
 */
export function useActionTriggeredConnect() {
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isExecutingAction, setIsExecutingAction] = useState(false);
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

  const executeAction = async (actionFunction: () => Promise<void>) => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }

    setIsExecutingAction(true);
    setError(null);
    
    try {
      await actionFunction();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Action failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsExecutingAction(false);
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
    isExecutingAction,
    error,
    connect,
    executeAction,
    disconnect,
    setUserAddress,
  };
}
