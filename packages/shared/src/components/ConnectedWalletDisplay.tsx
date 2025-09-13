import React, { useEffect, useState } from 'react';
import { getConnectedWalletAddress, getWalletBalance } from '../services/paymentService';

export interface WalletInfo {
  address: string;
  balance: string;
  currency: string;
  walletType: string;
}

interface ConnectedWalletDisplayProps {
  onWalletConnect?: (walletInfo: WalletInfo) => void;
  onWalletDisconnect?: () => void;
  showBalance?: boolean;
  currency?: string;
}

function truncateAddress(address: string, start = 6, end = 4): string {
  if (!address) return "";
  return `${address.substring(0, start)}...${address.substring(address.length - end)}`;
}

export const ConnectedWalletDisplay: React.FC<ConnectedWalletDisplayProps> = ({ 
  onWalletConnect,
  onWalletDisconnect,
  showBalance = true,
  currency = 'USDT'
}) => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchWalletInfo = async () => {
    setLoading(true);
    try {
      const address = await getConnectedWalletAddress();
      if (address) {
        const balance = showBalance ? await getWalletBalance(address, currency) : '0';
        const walletData: WalletInfo = {
          address,
          balance,
          currency,
          walletType: 'Kaia Wallet' // This could be determined dynamically
        };
        
        setWalletInfo(walletData);
        onWalletConnect?.(walletData);
      } else {
        setWalletInfo(null);
        onWalletDisconnect?.();
      }
    } catch (error) {
      console.error('Failed to fetch wallet info:', error);
      setWalletInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = async () => {
    setLoading(true);
    try {
      // This would trigger wallet connection in a real implementation
      // For now, we'll just fetch the current state
      await fetchWalletInfo();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletInfo();
  }, []);

  if (loading) {
    return (
      <div className="wallet-info" style={{
        padding: "12px 20px",
        backgroundColor: "#f3f4f6",
        borderRadius: "8px",
        fontFamily: "monospace",
        fontWeight: "500",
        color: "#6b7280",
        display: "inline-block"
      }}>
        Loading wallet...
      </div>
    );
  }

  if (!walletInfo) {
    return (
      <div className="wallet-info">
        <button
          onClick={connectWallet}
          style={{
            padding: "12px 20px",
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontFamily: "inherit",
            fontWeight: "600",
            cursor: "pointer",
            display: "inline-block"
          }}
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="wallet-info" style={{
      padding: "12px 20px",
      backgroundColor: "#f0f4ff",
      borderRadius: "8px",
      fontFamily: "monospace",
      fontWeight: "600",
      color: "#2563eb",
      display: "inline-block",
      border: "1px solid #bfdbfe"
    }}>
      <div style={{ marginBottom: showBalance ? 4 : 0 }}>
        <strong>Connected Wallet:</strong> <span>{truncateAddress(walletInfo.address)}</span>
      </div>
      {showBalance && (
        <div style={{ fontSize: '14px', opacity: 0.8 }}>
          Balance: {walletInfo.balance} {walletInfo.currency}
        </div>
      )}
    </div>
  );
};


