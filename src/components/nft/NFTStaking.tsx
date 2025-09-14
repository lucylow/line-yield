import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  Clock, 
  TrendingUp, 
  Star,
  Zap,
  Crown,
  Gem,
  CheckCircle,
  AlertCircle,
  Loader2,
  Calendar,
  DollarSign,
  Users,
  Award
} from 'lucide-react';

interface StakedNFT {
  id: string;
  name: string;
  image: string;
  tier: number;
  rarity: string;
  stakedAt: string;
  rewards: number;
  totalRewards: number;
  stakingDuration: number;
  multiplier: number;
}

interface StakingStats {
  totalStaked: number;
  totalRewards: number;
  dailyRewards: number;
  avgMultiplier: number;
  topStakers: {
    address: string;
    stakedCount: number;
    totalRewards: number;
  }[];
}

interface TierRewardRate {
  baseRate: number;
  bonusRate: number;
  multiplier: number;
}

export const NFTStaking: React.FC = () => {
  const [stakedNFTs, setStakedNFTs] = useState<StakedNFT[]>([]);
  const [stakingStats, setStakingStats] = useState<StakingStats | null>(null);
  const [tierRates, setTierRates] = useState<Record<number, TierRewardRate>>({});
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [unstaking, setUnstaking] = useState<string | null>(null);

  const rarityColors = {
    'Common': 'bg-gray-500',
    'Rare': 'bg-blue-500',
    'Epic': 'bg-purple-500',
    'Legendary': 'bg-yellow-500',
    'Mythic': 'bg-red-500',
    'Transcendent': 'bg-gradient-to-r from-purple-500 to-pink-500'
  };

  const tierIcons = ['🌱', '🚀', '⭐', '👑', '🏆', '💎'];

  useEffect(() => {
    fetchStakingData();
  }, []);

  const fetchStakingData = async () => {
    try {
      setLoading(true);
      
      // Mock staked NFTs data
      const mockStakedNFTs: StakedNFT[] = [
        {
          id: '1',
          name: 'Yield Pioneer #001',
          image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=400&h=400&fit=crop',
          tier: 2,
          rarity: 'Epic',
          stakedAt: '2024-01-15T10:30:00Z',
          rewards: 25.5,
          totalRewards: 125.5,
          stakingDuration: 10, // days
          multiplier: 1.5
        },
        {
          id: '2',
          name: 'DeFi Master #042',
          image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=400&h=400&fit=crop',
          tier: 4,
          rarity: 'Legendary',
          stakedAt: '2024-01-10T15:45:00Z',
          rewards: 85.2,
          totalRewards: 425.2,
          stakingDuration: 15, // days
          multiplier: 2.0
        },
        {
          id: '3',
          name: 'Yield Farmer #128',
          image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=400&h=400&fit=crop',
          tier: 1,
          rarity: 'Rare',
          stakedAt: '2024-01-20T08:15:00Z',
          rewards: 12.8,
          totalRewards: 45.8,
          stakingDuration: 5, // days
          multiplier: 1.2
        }
      ];

      const mockStakingStats: StakingStats = {
        totalStaked: 1250,
        totalRewards: 125000,
        dailyRewards: 2500,
        avgMultiplier: 1.8,
        topStakers: [
          { address: '0x742d...8b6', stakedCount: 15, totalRewards: 2500 },
          { address: '0x1234...5678', stakedCount: 12, totalRewards: 2200 },
          { address: '0xabcd...efgh', stakedCount: 10, totalRewards: 1800 },
          { address: '0x9876...5432', stakedCount: 8, totalRewards: 1500 },
          { address: '0x5678...9abc', stakedCount: 7, totalRewards: 1200 }
        ]
      };

      const mockTierRates: Record<number, TierRewardRate> = {
        0: { baseRate: 1, bonusRate: 0, multiplier: 100 },
        1: { baseRate: 2, bonusRate: 0.5, multiplier: 120 },
        2: { baseRate: 5, bonusRate: 1, multiplier: 150 },
        3: { baseRate: 10, bonusRate: 2, multiplier: 200 },
        4: { baseRate: 20, bonusRate: 5, multiplier: 300 },
        5: { baseRate: 50, bonusRate: 10, multiplier: 500 }
      };

      setStakedNFTs(mockStakedNFTs);
      setStakingStats(mockStakingStats);
      setTierRates(mockTierRates);
    } catch (error) {
      console.error('Failed to fetch staking data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimRewards = async (nftId: string) => {
    try {
      setClaiming(nftId);
      // Mock claim process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update rewards to 0 after claiming
      setStakedNFTs(prev => prev.map(nft => 
        nft.id === nftId ? { ...nft, rewards: 0, totalRewards: nft.totalRewards + nft.rewards } : nft
      ));
    } catch (error) {
      console.error('Failed to claim rewards:', error);
    } finally {
      setClaiming(null);
    }
  };

  const handleUnstake = async (nftId: string) => {
    try {
      setUnstaking(nftId);
      // Mock unstake process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Remove NFT from staked list
      setStakedNFTs(prev => prev.filter(nft => nft.id !== nftId));
    } catch (error) {
      console.error('Failed to unstake NFT:', error);
    } finally {
      setUnstaking(null);
    }
  };

  const handleClaimAll = async () => {
    try {
      setClaiming('all');
      // Mock claim all process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update all rewards to 0
      setStakedNFTs(prev => prev.map(nft => ({ 
        ...nft, 
        rewards: 0, 
        totalRewards: nft.totalRewards + nft.rewards 
      })));
    } catch (error) {
      console.error('Failed to claim all rewards:', error);
    } finally {
      setClaiming(null);
    }
  };

  const formatRewards = (rewards: number) => {
    return `$${rewards.toFixed(2)}`;
  };

  const getTotalPendingRewards = () => {
    return stakedNFTs.reduce((total, nft) => total + nft.rewards, 0);
  };

  const getMultiplierBonus = (duration: number) => {
    if (duration >= 30) return 2.0;
    if (duration >= 14) return 1.5;
    if (duration >= 7) return 1.2;
    return 1.0;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading staking data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">NFT Staking</h2>
          <p className="text-gray-600 mt-1">Stake your NFTs to earn passive rewards</p>
        </div>
        
        {getTotalPendingRewards() > 0 && (
          <Button
            onClick={handleClaimAll}
            disabled={claiming === 'all'}
            className="flex items-center space-x-2"
          >
            {claiming === 'all' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Claiming...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Claim All ({formatRewards(getTotalPendingRewards())})</span>
              </>
            )}
          </Button>
        )}
      </div>

      {/* Staking Stats */}
      {stakingStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Staked</p>
                  <p className="text-2xl font-bold text-gray-900">{stakingStats.totalStaked}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Rewards</p>
                  <p className="text-2xl font-bold text-gray-900">{formatRewards(stakingStats.totalRewards)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Daily Rewards</p>
                  <p className="text-2xl font-bold text-gray-900">{formatRewards(stakingStats.dailyRewards)}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Multiplier</p>
                  <p className="text-2xl font-bold text-gray-900">{stakingStats.avgMultiplier}x</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tier Reward Rates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Crown className="w-5 h-5 mr-2" />
            Tier Reward Rates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(tierRates).map(([tier, rates]) => (
              <div key={tier} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="text-2xl">{tierIcons[Number(tier)]}</div>
                  <div>
                    <h4 className="font-semibold">Tier {tier}</h4>
                    <Badge className={`${rarityColors[Object.keys(rarityColors)[Number(tier)] as keyof typeof rarityColors]} text-white`}>
                      {Object.keys(rarityColors)[Number(tier)]}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Rate:</span>
                    <span className="font-medium">${rates.baseRate}/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bonus Rate:</span>
                    <span className="font-medium">${rates.bonusRate}/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Multiplier:</span>
                    <span className="font-medium">{rates.multiplier / 100}x</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Staked NFTs */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Your Staked NFTs</h3>
        {stakedNFTs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stakedNFTs.map((nft) => (
              <Card key={nft.id} className="hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className="w-full aspect-square object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge className={`${rarityColors[nft.rarity as keyof typeof rarityColors]} text-white`}>
                      {nft.rarity}
                    </Badge>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-black/50 text-white">
                      {tierIcons[nft.tier]} Tier {nft.tier}
                    </Badge>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <Badge className="bg-green-500 text-white">
                      <Clock className="w-3 h-3 mr-1" />
                      Staked
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <h4 className="font-semibold text-lg mb-2">{nft.name}</h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Pending Rewards</span>
                      <span className="font-semibold text-green-600">{formatRewards(nft.rewards)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Rewards</span>
                      <span className="text-sm">{formatRewards(nft.totalRewards)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Staking Duration</span>
                      <span className="text-sm">{nft.stakingDuration} days</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Multiplier</span>
                      <span className="text-sm font-medium">{nft.multiplier}x</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    <Button
                      className="flex-1"
                      size="sm"
                      onClick={() => handleClaimRewards(nft.id)}
                      disabled={claiming === nft.id || nft.rewards === 0}
                    >
                      {claiming === nft.id ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Claiming...
                        </>
                      ) : (
                        <>
                          <Zap className="w-3 h-3 mr-1" />
                          Claim ({formatRewards(nft.rewards)})
                        </>
                      )}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUnstake(nft.id)}
                      disabled={unstaking === nft.id}
                    >
                      {unstaking === nft.id ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Unstaking...
                        </>
                      ) : (
                        'Unstake'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-500">
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="text-lg font-semibold mb-2">No NFTs Staked</h3>
                <p>Stake your NFTs to start earning passive rewards</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Top Stakers */}
      {stakingStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Top Stakers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stakingStats.topStakers.map((staker, index) => (
                <div key={staker.address} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{staker.address}</p>
                      <p className="text-sm text-gray-600">{staker.stakedCount} NFTs staked</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatRewards(staker.totalRewards)}</div>
                    <div className="text-sm text-gray-500">Total Rewards</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NFTStaking;

