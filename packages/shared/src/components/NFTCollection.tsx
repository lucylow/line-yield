import React, { useState, useEffect } from 'react';
import { cn } from '../../src/utils/cn';
import { useT } from '../../src/hooks/useT';

interface NFTTier {
  tier: number;
  threshold: number;
  name: string;
  uri: string;
  maxSupply: number;
  currentSupply: number;
}

interface UserNFT {
  tokenId: number;
  tier: number;
  uri: string;
  name: string;
}

interface UserTierInfo {
  currentTier: number;
  tierName: string;
  points: number;
  nextTier?: {
    tier: number;
    pointsNeeded: number;
    tierName: string;
    tierURI: string;
  };
}

interface NFTCollectionProps {
  userAddress: string | null;
  className?: string;
}

export const NFTCollection: React.FC<NFTCollectionProps> = ({ 
  userAddress, 
  className = '' 
}) => {
  const t = useT();
  const [nftCollection, setNftCollection] = useState<UserNFT[]>([]);
  const [tierInfo, setTierInfo] = useState<UserTierInfo | null>(null);
  const [allTiers, setAllTiers] = useState<NFTTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch NFT data
  useEffect(() => {
    if (!userAddress) {
      setLoading(false);
      return;
    }

    const fetchNFTData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user's NFT collection
        const collectionResponse = await fetch(`/api/nft/user/${userAddress}/collection`);
        if (collectionResponse.ok) {
          const collectionData = await collectionResponse.json();
          setNftCollection(collectionData.data.tokenIds.map((tokenId: number, index: number) => ({
            tokenId,
            tier: collectionData.data.tiers[index],
            uri: collectionData.data.uris[index],
            name: collectionData.data.names[index]
          })));
        }

        // Fetch user's tier info
        const tierResponse = await fetch(`/api/nft/user/${userAddress}/tier`);
        if (tierResponse.ok) {
          const tierData = await tierResponse.json();
          setTierInfo(tierData.data);
        }

        // Fetch all tiers
        const tiersResponse = await fetch('/api/nft/tiers');
        if (tiersResponse.ok) {
          const tiersData = await tiersResponse.json();
          setAllTiers(tiersData.data);
        }
      } catch (err) {
        setError('Failed to load NFT data');
        console.error('Error fetching NFT data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTData();
  }, [userAddress]);

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

  const getTierGradient = (tier: number) => {
    const gradients = [
      'from-gray-400 to-gray-600',      // Novice
      'from-green-400 to-green-600',   // Explorer
      'from-blue-400 to-blue-600',     // Pioneer
      'from-purple-400 to-purple-600', // Master
      'from-yellow-400 to-yellow-600', // Legend
      'from-red-400 to-red-600'        // Titan
    ];
    return gradients[tier] || 'from-gray-400 to-gray-600';
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

  if (loading) {
    return (
      <div className={cn('bg-white rounded-lg shadow-lg p-6', className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('bg-white rounded-lg shadow-lg p-6 text-center', className)}>
        <div className="text-red-500 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading NFTs</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-lg shadow-lg p-6', className)}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🏆 NFT Collection
        </h2>
        {tierInfo && (
          <div className="flex items-center space-x-4">
            <div className={cn('px-3 py-1 rounded-full text-white text-sm font-medium', getTierColor(tierInfo.currentTier))}>
              {getTierIcon(tierInfo.currentTier)} {tierInfo.tierName}
            </div>
            <div className="text-sm text-gray-600">
              {tierInfo.points.toLocaleString()} Yield Points
            </div>
          </div>
        )}
      </div>

      {/* Progress to Next Tier */}
      {tierInfo?.nextTier && (
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Progress to Next Tier
          </h3>
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-sm font-medium text-gray-700">
              {tierInfo.tierName} → {tierInfo.nextTier.tierName}
            </span>
            <span className="text-sm text-gray-500">
              {tierInfo.nextTier.pointsNeeded.toLocaleString()} points needed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={cn('h-2 rounded-full bg-gradient-to-r', getTierGradient(tierInfo.nextTier.tier))}
              style={{ 
                width: `${Math.min(100, ((tierInfo.points / (tierInfo.points + tierInfo.nextTier.pointsNeeded)) * 100))}%` 
              }}
            ></div>
          </div>
        </div>
      )}

      {/* NFT Collection */}
      {nftCollection.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nftCollection.map((nft) => (
            <div key={nft.tokenId} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="text-center">
                <div className={cn('w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-2xl', getTierColor(nft.tier))}>
                  {getTierIcon(nft.tier)}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{nft.name}</h3>
                <p className="text-sm text-gray-600 mb-2">Token ID: #{nft.tokenId}</p>
                <div className="text-xs text-gray-500">
                  Tier {nft.tier} • {allTiers.find(t => t.tier === nft.tier)?.threshold.toLocaleString()} points
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No NFTs Yet</h3>
          <p className="text-gray-500 mb-4">
            Start earning Yield Points to unlock your first NFT badge!
          </p>
          {tierInfo?.nextTier && (
            <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
              Earn {tierInfo.nextTier.pointsNeeded.toLocaleString()} more points to unlock: <strong>{tierInfo.nextTier.tierName}</strong>
            </div>
          )}
        </div>
      )}

      {/* All Tiers Overview */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">All NFT Tiers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {allTiers.map((tier) => {
            const isOwned = nftCollection.some(nft => nft.tier === tier.tier);
            const isCurrentTier = tierInfo?.currentTier === tier.tier;
            const isNextTier = tierInfo?.nextTier?.tier === tier.tier;
            
            return (
              <div 
                key={tier.tier} 
                className={cn(
                  'rounded-lg p-3 border-2 transition-all',
                  isOwned ? 'border-green-500 bg-green-50' :
                  isCurrentTier ? 'border-blue-500 bg-blue-50' :
                  isNextTier ? 'border-purple-500 bg-purple-50' :
                  'border-gray-200 bg-gray-50'
                )}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">{getTierIcon(tier.tier)}</span>
                  <span className="font-medium text-sm">{tier.name}</span>
                  {isOwned && <span className="text-green-600 text-xs">✓ Owned</span>}
                  {isCurrentTier && <span className="text-blue-600 text-xs">Current</span>}
                  {isNextTier && <span className="text-purple-600 text-xs">Next</span>}
                </div>
                <div className="text-xs text-gray-600">
                  {tier.threshold.toLocaleString()} points
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {tier.currentSupply}/{tier.maxSupply} minted
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};


