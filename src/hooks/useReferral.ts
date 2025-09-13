import { useState, useEffect, useCallback } from 'react';
import { useWallet } from './useWallet';

interface ReferralData {
  referralCode: string;
  inviteLink: string;
  totalReferrals: number;
  totalEarnings: string;
  pendingRewards: string;
}

interface ReferralHook {
  referralData: ReferralData;
  isLoading: boolean;
  error: string | null;
  copyInviteLink: () => Promise<boolean>;
  shareInviteLink: () => Promise<boolean>;
  refreshStats: () => Promise<void>;
}

export const useReferral = (): ReferralHook => {
  const { wallet } = useWallet();
  const [referralData, setReferralData] = useState<ReferralData>({
    referralCode: '',
    inviteLink: '',
    totalReferrals: 0,
    totalEarnings: '0.00',
    pendingRewards: '0.00'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate referral code and invite link
  const generateReferralData = useCallback(() => {
    if (!wallet.address) return;

    const referralCode = wallet.address.slice(0, 8);
    const baseUrl = window.location.origin;
    const inviteLink = `${baseUrl}/dashboard?ref=${referralCode}`;

    setReferralData(prev => ({
      ...prev,
      referralCode,
      inviteLink
    }));
  }, [wallet.address]);

  // Load referral stats from API
  const loadReferralStats = useCallback(async () => {
    if (!wallet.isConnected) return;

    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/referrals/${wallet.address}`);
      // const stats = await response.json();
      
      // Mock data for now
      const mockStats = {
        totalReferrals: Math.floor(Math.random() * 20),
        totalEarnings: (Math.random() * 100).toFixed(2),
        pendingRewards: (Math.random() * 50).toFixed(2)
      };

      setReferralData(prev => ({
        ...prev,
        ...mockStats
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load referral stats');
    } finally {
      setIsLoading(false);
    }
  }, [wallet.isConnected]);

  // Copy invite link to clipboard
  const copyInviteLink = async (): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(referralData.inviteLink);
      return true;
    } catch (err) {
      console.error('Failed to copy invite link:', err);
      return false;
    }
  };

  // Share invite link using Web Share API
  const shareInviteLink = async (): Promise<boolean> => {
    try {
      const shareText = `🚀 Join me on LINE Yield and start earning 8.64% APY on your USDT! 

💰 Earn automated yield on stablecoins
🔒 Secure DeFi strategies on Kaia blockchain
📱 Access directly from LINE Messenger

Get started: ${referralData.inviteLink}`;

      if (navigator.share) {
        await navigator.share({
          title: 'LINE Yield - Earn Automated Yield',
          text: shareText,
          url: referralData.inviteLink,
        });
        return true;
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareText);
        return true;
      }
    } catch (err) {
      console.error('Failed to share invite link:', err);
      return false;
    }
  };

  // Refresh referral stats
  const refreshStats = async () => {
    await loadReferralStats();
  };

  // Initialize referral data when wallet connects
  useEffect(() => {
    if (wallet.isConnected) {
      generateReferralData();
      loadReferralStats();
    } else {
      setReferralData({
        referralCode: '',
        inviteLink: '',
        totalReferrals: 0,
        totalEarnings: '0.00',
        pendingRewards: '0.00'
      });
    }
  }, [wallet.isConnected, wallet.address, generateReferralData, loadReferralStats]);

  return {
    referralData,
    isLoading,
    error,
    copyInviteLink,
    shareInviteLink,
    refreshStats
  };
};
