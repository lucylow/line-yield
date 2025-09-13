import React, { useState, useEffect } from 'react';
import { cn } from '../../src/utils/cn';
import { useT } from '../../src/hooks/useT';

interface ReferralPromotionProps {
  userAddress: string | null;
  className?: string;
}

interface ReferralData {
  referralCode: string;
  referralCount: number;
  totalEarnings: string;
  pendingRewards: string;
}

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: string;
  pendingRewards: string;
}

export const ReferralPromotion: React.FC<ReferralPromotionProps> = ({ 
  userAddress, 
  className = '' 
}) => {
  const t = useT();
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [inputReferralCode, setInputReferralCode] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rewardStatus, setRewardStatus] = useState<string | null>(null);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);

  // Fetch referral data for the connected user
  useEffect(() => {
    if (!userAddress) return;
    
    const fetchReferralData = async () => {
      try {
        const response = await fetch(`/api/referral/data?address=${userAddress}`);
        if (response.ok) {
          const data = await response.json();
          setReferralData(data);
        }
      } catch (error) {
        console.error('Failed to fetch referral data:', error);
      }
    };

    fetchReferralData();
  }, [userAddress]);

  // Fetch referral stats
  useEffect(() => {
    if (!userAddress) return;
    
    const fetchReferralStats = async () => {
      try {
        const response = await fetch(`/api/referral/stats?address=${userAddress}`);
        if (response.ok) {
          const stats = await response.json();
          setReferralStats(stats);
        }
      } catch (error) {
        console.error('Failed to fetch referral stats:', error);
      }
    };

    fetchReferralStats();
  }, [userAddress]);

  // Generate referral link
  const referralLink = referralData?.referralCode
    ? `${window.location.origin}/?ref=${referralData.referralCode}`
    : '';

  // Copy referral link to clipboard
  const copyReferralLink = async () => {
    if (!referralLink) return;
    
    try {
      await navigator.clipboard.writeText(referralLink);
      setMessage('Referral link copied to clipboard!');
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage('Failed to copy link. Please copy manually.');
    }
  };

  // Submit referral code (for new users)
  const handleSubmitReferral = async () => {
    if (!inputReferralCode.trim()) {
      setMessage('Please enter a referral code.');
      return;
    }

    if (!userAddress) {
      setMessage('Please connect your wallet first.');
      return;
    }

    setLoading(true);
    setMessage(null);
    setRewardStatus(null);

    try {
      const response = await fetch('/api/referral/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          referredByCode: inputReferralCode.trim(),
          userAddress: userAddress,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setRewardStatus('🎉 Referral successful! You earned 100 Yield Points.');
        setInputReferralCode('');
        // Refresh referral data
        const refreshResponse = await fetch(`/api/referral/data?address=${userAddress}`);
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setReferralData(data);
        }
      } else {
        setRewardStatus(result.message || 'Referral redemption failed.');
      }
    } catch (error) {
      setRewardStatus('Error redeeming referral. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Share referral link via social media
  const shareReferral = (platform: 'twitter' | 'telegram' | 'line') => {
    if (!referralLink) return;

    const text = `Join LINE Yield and earn high yields on your USDT! Use my referral link to get bonus Yield Points: ${referralLink}`;
    
    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`;
        break;
      case 'line':
        shareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(referralLink)}`;
        break;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  return (
    <div className={cn('bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto', className)}>
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🎁 Invite Friends & Earn Rewards!
        </h2>
        <p className="text-gray-600">
          Share LINE Yield with your friends and earn Yield Points when they deposit USDT
        </p>
      </div>

      {/* Referral Stats */}
      {referralStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{referralStats.totalReferrals}</div>
            <div className="text-sm text-blue-800">Total Referrals</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{referralStats.activeReferrals}</div>
            <div className="text-sm text-green-800">Active Users</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{referralStats.totalEarnings}</div>
            <div className="text-sm text-purple-800">Total Earnings</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{referralStats.pendingRewards}</div>
            <div className="text-sm text-orange-800">Pending Rewards</div>
          </div>
        </div>
      )}

      {/* Your Referral Code */}
      {referralData ? (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Referral Code</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Referral Code:</span>
              <span className="font-mono text-lg font-bold text-blue-600">
                {referralData.referralCode}
              </span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">Referral Link:</span>
              <span className="text-sm text-gray-500 truncate max-w-xs">
                {referralLink}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyReferralLink}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                📋 Copy Link
              </button>
              <button
                onClick={() => shareReferral('twitter')}
                className="bg-sky-500 text-white py-2 px-3 rounded-lg hover:bg-sky-600 transition-colors"
                title="Share on Twitter"
              >
                🐦
              </button>
              <button
                onClick={() => shareReferral('telegram')}
                className="bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors"
                title="Share on Telegram"
              >
                📱
              </button>
              <button
                onClick={() => shareReferral('line')}
                className="bg-green-500 text-white py-2 px-3 rounded-lg hover:bg-green-600 transition-colors"
                title="Share on LINE"
              >
                💬
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 text-center">
          <p className="text-gray-500">Connect your wallet to get your referral code</p>
        </div>
      )}

      {/* Referral Rewards Info */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">💰 How Referral Rewards Work</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-semibold text-green-700 mb-1">For You (Referrer):</h4>
            <ul className="text-green-600 space-y-1">
              <li>• 100 Yield Points when friend signs up</li>
              <li>• 50 Yield Points when friend deposits USDT</li>
              <li>• 10% of friend's yield earnings (ongoing)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-blue-700 mb-1">For Your Friend:</h4>
            <ul className="text-blue-600 space-y-1">
              <li>• 100 Yield Points bonus on signup</li>
              <li>• 50 Yield Points bonus on first deposit</li>
              <li>• Higher APY for first 30 days</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Enter Referral Code */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Got a referral code?</h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Enter referral code"
            value={inputReferralCode}
            onChange={(e) => setInputReferralCode(e.target.value.trim())}
            disabled={!userAddress || loading}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSubmitReferral}
            disabled={!userAddress || loading || !inputReferralCode.trim()}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            {loading ? '⏳ Processing...' : '🎁 Redeem Referral Code'}
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {message && (
        <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded-lg text-blue-700 text-sm">
          {message}
        </div>
      )}
      
      {rewardStatus && (
        <div className={`mt-4 p-3 rounded-lg text-sm ${
          rewardStatus.includes('successful') 
            ? 'bg-green-100 border border-green-300 text-green-700'
            : 'bg-red-100 border border-red-300 text-red-700'
        }`}>
          {rewardStatus}
        </div>
      )}

      {/* Terms */}
      <div className="mt-6 text-xs text-gray-500 text-center">
        <p>
          Referral rewards are subject to terms and conditions. 
          Self-referrals and duplicate accounts are not allowed.
        </p>
      </div>
    </div>
  );
};


