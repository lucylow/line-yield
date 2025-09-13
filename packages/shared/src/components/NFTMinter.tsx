import React, { useState, useEffect } from 'react';
import { cn } from '../../src/utils/cn';
import { useT } from '../../src/hooks/useT';

interface MintEligibility {
  canMint: boolean;
  reason?: string;
  nextTier?: {
    tier: number;
    threshold: number;
    name: string;
    uri: string;
    maxSupply: number;
    currentSupply: number;
  };
}

interface NFTMinterProps {
  userAddress: string | null;
  className?: string;
  onMintSuccess?: (tokenId: number, tier: number) => void;
}

export const NFTMinter: React.FC<NFTMinterProps> = ({ 
  userAddress, 
  className = '',
  onMintSuccess
}) => {
  const t = useT();
  const [mintEligibility, setMintEligibility] = useState<MintEligibility | null>(null);
  const [loading, setLoading] = useState(false);
  const [minting, setMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check mint eligibility
  useEffect(() => {
    if (!userAddress) {
      setMintEligibility(null);
      return;
    }

    const checkMintEligibility = async () => {
      try {
        const response = await fetch(`/api/nft/user/${userAddress}/can-mint`);
        if (response.ok) {
          const data = await response.json();
          setMintEligibility(data.data);
        }
      } catch (err) {
        console.error('Error checking mint eligibility:', err);
      }
    };

    checkMintEligibility();
  }, [userAddress]);

  const handleMintNFT = async () => {
    if (!userAddress || !mintEligibility?.canMint) return;

    setMinting(true);
    setError(null);
    setSuccess(null);

    try {
      // Prepare mint transaction
      const response = await fetch('/api/nft/mint-reward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: userAddress,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to prepare mint transaction');
      }

      // In a real implementation, you would:
      // 1. Show the transaction to the user
      // 2. Let them sign it with their wallet
      // 3. Wait for confirmation
      // 4. Update the UI

      // For this demo, we'll simulate the minting process
      setSuccess(`🎉 NFT mint transaction prepared! You're about to mint: ${result.data.tierName}`);
      
      // Simulate successful mint
      setTimeout(() => {
        setSuccess(`🎉 Successfully minted ${result.data.tierName} NFT!`);
        if (onMintSuccess && result.data.tier) {
          onMintSuccess(0, result.data.tier); // Mock token ID
        }
        
        // Refresh eligibility
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mint NFT');
    } finally {
      setMinting(false);
    }
  };

  const getTierIcon = (tier: number) => {
    const icons = [
      '🌱',  // Novice
      '🚀',  // Explorer
      '⭐',  // Pioneer
      '👑',  // Master
      '🏆',  // Legend
      '💎'   // Titan
    ];
    return icons[tier] || '🌱';
  };

  const getTierColor = (tier: number) => {
    const colors = [
      'bg-gray-500',      // Novice
      'bg-green-500',     // Explorer
      'bg-blue-500',      // Pioneer
      'bg-purple-500',    // Master
      'bg-yellow-500',    // Legend
      'bg-red-500'        // Titan
    ];
    return colors[tier] || 'bg-gray-500';
  };

  if (!userAddress) {
    return (
      <div className={cn('bg-white rounded-lg shadow-lg p-6 text-center', className)}>
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Wallet</h3>
        <p className="text-gray-500">Connect your wallet to mint NFT rewards</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={cn('bg-white rounded-lg shadow-lg p-6', className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-lg shadow-lg p-6', className)}>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        🎨 Mint NFT Rewards
      </h2>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-700 font-medium">Error</span>
          </div>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-green-700 font-medium">Success</span>
          </div>
          <p className="text-green-600 mt-1">{success}</p>
        </div>
      )}

      {mintEligibility ? (
        <div>
          {mintEligibility.canMint && mintEligibility.nextTier ? (
            <div className="text-center">
              <div className="mb-6">
                <div className={cn('w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-4xl', getTierColor(mintEligibility.nextTier.tier))}>
                  {getTierIcon(mintEligibility.nextTier.tier)}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Ready to Mint!
                </h3>
                <p className="text-gray-600 mb-4">
                  You've earned enough Yield Points to mint your <strong>{mintEligibility.nextTier.name}</strong> NFT badge.
                </p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">NFT Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Tier:</span>
                    <span className="ml-2 font-medium">{mintEligibility.nextTier.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Supply:</span>
                    <span className="ml-2 font-medium">
                      {mintEligibility.nextTier.currentSupply}/{mintEligibility.nextTier.maxSupply}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Threshold:</span>
                    <span className="ml-2 font-medium">
                      {mintEligibility.nextTier.threshold.toLocaleString()} points
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Rarity:</span>
                    <span className="ml-2 font-medium">
                      {mintEligibility.nextTier.maxSupply <= 100 ? 'Legendary' :
                       mintEligibility.nextTier.maxSupply <= 1000 ? 'Epic' :
                       mintEligibility.nextTier.maxSupply <= 2500 ? 'Rare' : 'Common'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleMintNFT}
                disabled={minting}
                className={cn(
                  'w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors',
                  minting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                )}
              >
                {minting ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Minting NFT...
                  </div>
                ) : (
                  `🎨 Mint ${mintEligibility.nextTier.name} NFT`
                )}
              </button>

              <p className="text-xs text-gray-500 mt-4">
                Minting an NFT requires a small gas fee. The NFT will be added to your collection once the transaction is confirmed.
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No NFT Available</h3>
              <p className="text-gray-500 mb-4">{mintEligibility.reason}</p>
              <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
                <p className="font-medium mb-1">How to earn NFT rewards:</p>
                <ul className="text-left space-y-1">
                  <li>• Deposit USDT to earn Yield Points</li>
                  <li>• Refer friends to earn bonus points</li>
                  <li>• Participate in yield farming activities</li>
                  <li>• Complete daily challenges and milestones</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      )}
    </div>
  );
};


