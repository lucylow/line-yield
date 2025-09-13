import { useAccount, useConnect, useDisconnect, useBalance, useChainId, useSwitchChain } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
// Define Kaia network constant
const KAIANETWORK_ID = 8217;

export interface WalletInfo {
  address: string | undefined;
  isConnected: boolean;
  isConnecting: boolean;
  isDisconnected: boolean;
  chainId: number | undefined;
  balance: string | undefined;
  balanceFormatted: string | undefined;
  symbol: string | undefined;
  isKaiaNetwork: boolean;
}

export function useWallet(): WalletInfo & {
  connect: () => void;
  disconnect: () => void;
  switchToKaia: () => void;
  openAppKit: () => void;
} {
  const { address, isConnected, isConnecting, isDisconnected, chainId } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { open } = useAppKit();

  // Get balance for the connected address
  const { data: balanceData } = useBalance({
    address: address,
    chainId: chainId,
  });

  const isKaiaNetwork = chainId === KAIANETWORK_ID;

  const connectWallet = () => {
    open();
  };

  const disconnectWallet = () => {
    disconnect();
  };

  const switchToKaia = () => {
    if (switchChain) {
      switchChain({ chainId: KAIANETWORK_ID });
    }
  };

  const openAppKit = () => {
    open();
  };

  return {
    // Account info
    address,
    isConnected,
    isConnecting,
    isDisconnected,
    chainId,
    
    // Balance info
    balance: balanceData?.value?.toString(),
    balanceFormatted: balanceData?.formatted,
    symbol: balanceData?.symbol,
    
    // Network info
    isKaiaNetwork,
    
    // Actions
    connect: connectWallet,
    disconnect: disconnectWallet,
    switchToKaia,
    openAppKit,
  };
}

// Hook for checking if user is on the correct network
export function useNetworkCheck() {
  const { chainId, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  
  const isCorrectNetwork = chainId === KAIANETWORK_ID;
  
  const switchToCorrectNetwork = () => {
    if (switchChain) {
      switchChain({ chainId: KAIANETWORK_ID });
    }
  };
  
  return {
    isCorrectNetwork,
    isConnected,
    switchToCorrectNetwork,
    currentChainId: chainId,
    targetChainId: KAIANETWORK_ID,
  };
}

// Hook for getting token balances
export function useTokenBalance(tokenAddress?: string) {
  const { address, chainId } = useAccount();
  
  const { data: balanceData } = useBalance({
    address: address,
    token: tokenAddress as `0x${string}`,
    chainId: chainId,
  });
  
  return {
    balance: balanceData?.value?.toString(),
    balanceFormatted: balanceData?.formatted,
    symbol: balanceData?.symbol,
    decimals: balanceData?.decimals,
  };
}