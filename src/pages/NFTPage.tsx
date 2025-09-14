import React, { useState, useEffect } from 'react';
import { NFTCollection } from '../components/nft/NFTCollection';
import { NFTMinter } from '../components/nft/NFTMinter';
import { NFTMarketplace } from '../components/nft/NFTMarketplace';
import { NFTAnalytics } from '../components/nft/NFTAnalytics';
import { NFTStaking } from '../components/nft/NFTStaking';
import { cn } from '../lib/utils';

interface NFTTier {
  tier: number;
  threshold: number;
  name: string;
  uri: string;
  maxSupply: number;
  currentSupply: number;
}

interface NFTStats {
  totalMinted: number;
  totalSupply: number;
  rarityDistribution: Record<string, number>;
}

export const NFTPage: React.FC = () => {
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [nftTiers, setNftTiers] = useState<NFTTier[]>([]);
  const [nftStats, setNftStats] = useState<NFTStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'collection' | 'mint' | 'marketplace' | 'staking' | 'analytics' | 'tiers'>('collection');

  // Mock wallet connection - in real app this would come from wallet context
  useEffect(() => {
    // Simulate wallet connection
    const mockAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
    setUserAddress(mockAddress);
  }, []);

  // Fetch NFT tiers and stats
  useEffect(() => {
    const fetchNFTData = async () => {
      try {
        setLoading(true);

        // Fetch NFT tiers
        const tiersResponse = await fetch('/api/nft/tiers');
        if (tiersResponse.ok) {
          const tiersData = await tiersResponse.json();
          setNftTiers(tiersData.data);
          
          // Calculate stats
          const totalMinted = tiersData.data.reduce((sum: number, tier: NFTTier) => sum + tier.currentSupply, 0);
          const totalSupply = tiersData.data.reduce((sum: number, tier: NFTTier) => sum + tier.maxSupply, 0);
          
          const rarityDistribution: Record<string, number> = {};
          tiersData.data.forEach((tier: NFTTier) => {
            const rarity = tier.maxSupply <= 100 ? 'Legendary' :
                          tier.maxSupply <= 1000 ? 'Epic' :
                          tier.maxSupply <= 2500 ? 'Rare' : 'Common';
            rarityDistribution[rarity] = (rarityDistribution[rarity] || 0) + tier.currentSupply;
          });

          setNftStats({
            totalMinted,
            totalSupply,
            rarityDistribution
          });
        }
      } catch (error) {
        console.error('Failed to fetch NFT data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTData();
  }, []);

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

  const getRarityColor = (rarity: string) => {
    const colors = {
      'Common': 'bg-gray-500',
      'Rare': 'bg-blue-500',
      'Epic': 'bg-purple-500',
      'Legendary': 'bg-yellow-500'
    };
    return colors[rarity as keyof typeof colors] || 'bg-gray-500';
  };

  const handleMintSuccess = (tokenId: number, tier: number) => {
    // Refresh the collection after successful mint
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🎨 NFT Rewards
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                Earn and collect unique NFT badges based on your Yield Points
              </p>
            </div>
            {nftStats && (
              <div className="hidden md:block">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg">
                  <div className="text-sm font-medium">Total Minted</div>
                  <div className="text-2xl font-bold">
                    {nftStats.totalMinted.toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        {nftStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{nftStats.totalMinted}</div>
              <div className="text-sm text-gray-600">Total Minted</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{nftStats.totalSupply}</div>
              <div className="text-sm text-gray-600">Total Supply</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round((nftStats.totalMinted / nftStats.totalSupply) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Minted</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Object.keys(nftStats.rarityDistribution).length}
              </div>
              <div className="text-sm text-gray-600">Rarity Types</div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'collection', label: 'My Collection', icon: '🏆' },
                { id: 'mint', label: 'Mint NFT', icon: '🎨' },
                { id: 'marketplace', label: 'Marketplace', icon: '🛒' },
                { id: 'staking', label: 'Staking', icon: '⚡' },
                { id: 'analytics', label: 'Analytics', icon: '📊' },
                { id: 'tiers', label: 'All Tiers', icon: '⭐' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {activeTab === 'collection' && (
            <div className="lg:col-span-3">
              <NFTCollection userAddress={userAddress} />
            </div>
          )}

          {activeTab === 'mint' && (
            <div className="lg:col-span-3">
              <NFTMinter 
                userAddress={userAddress} 
                onMintSuccess={handleMintSuccess}
              />
            </div>
          )}

          {activeTab === 'marketplace' && (
            <div className="lg:col-span-3">
              <NFTMarketplace />
            </div>
          )}

          {activeTab === 'staking' && (
            <div className="lg:col-span-3">
              <NFTStaking />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="lg:col-span-3">
              <NFTAnalytics />
            </div>
          )}

          {activeTab === 'tiers' && (
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  🌟 All NFT Tiers
                </h2>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 rounded-lg h-48"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {nftTiers.map((tier) => {
                      const rarity = tier.maxSupply <= 100 ? 'Legendary' :
                                   tier.maxSupply <= 1000 ? 'Epic' :
                                   tier.maxSupply <= 2500 ? 'Rare' : 'Common';
                      const mintPercentage = (tier.currentSupply / tier.maxSupply) * 100;

                      return (
                        <div key={tier.tier} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="text-center">
                            <div className={cn('w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl', getTierColor(tier.tier))}>
                              {getTierIcon(tier.tier)}
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{tier.name}</h3>
                            <div className={cn('inline-block px-3 py-1 rounded-full text-white text-sm font-medium mb-3', getRarityColor(rarity))}>
                              {rarity}
                            </div>
                            
                            <div className="space-y-2 text-sm text-gray-600">
                              <div className="flex justify-between">
                                <span>Threshold:</span>
                                <span className="font-medium">{tier.threshold.toLocaleString()} points</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Supply:</span>
                                <span className="font-medium">{tier.currentSupply}/{tier.maxSupply}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Minted:</span>
                                <span className="font-medium">{mintPercentage.toFixed(1)}%</span>
                              </div>
                            </div>

                            <div className="mt-4">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={cn('h-2 rounded-full', getTierColor(tier.tier))}
                                  style={{ width: `${mintPercentage}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Rarity Distribution */}
                {nftStats && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Rarity Distribution</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(nftStats.rarityDistribution).map(([rarity, count]) => (
                        <div key={rarity} className="text-center">
                          <div className={cn('w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold', getRarityColor(rarity))}>
                            {count}
                          </div>
                          <div className="text-sm font-medium text-gray-900">{rarity}</div>
                          <div className="text-xs text-gray-500">minted</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* How It Works Section */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            How NFT Rewards Work
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Earn Points</h3>
              <p className="text-gray-600">
                Earn Yield Points by depositing USDT, referring friends, and participating in yield farming.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Reach Thresholds</h3>
              <p className="text-gray-600">
                Each NFT tier has a points threshold. Reach the threshold to unlock minting for that tier.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Mint NFT</h3>
              <p className="text-gray-600">
                Mint your NFT badge once you've reached the required points threshold for that tier.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">4. Collect & Trade</h3>
              <p className="text-gray-600">
                Collect rare NFT badges, display them in your profile, and trade them with other users.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


