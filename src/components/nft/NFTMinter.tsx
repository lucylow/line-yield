import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  Zap, 
  Clock, 
  Star, 
  TrendingUp, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Gift,
  Crown,
  Gem
} from 'lucide-react';

interface NFTTier {
  id: number;
  name: string;
  description: string;
  icon: string;
  threshold: number;
  maxSupply: number;
  currentSupply: number;
  mintPrice: number;
  rarity: string;
  benefits: string[];
  color: string;
}

interface NFTMinterProps {
  userAddress?: string | null;
  onMintSuccess?: (tokenId: number, tier: number) => void;
}

export const NFTMinter: React.FC<NFTMinterProps> = ({ userAddress, onMintSuccess }) => {
  const [tiers, setTiers] = useState<NFTTier[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [minting, setMinting] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const rarityColors = {
    'Common': 'bg-gray-500',
    'Rare': 'bg-blue-500',
    'Epic': 'bg-purple-500',
    'Legendary': 'bg-yellow-500',
    'Mythic': 'bg-red-500',
    'Transcendent': 'bg-gradient-to-r from-purple-500 to-pink-500'
  };

  const tierIcons = {
    0: '🌱',
    1: '🚀', 
    2: '⭐',
    3: '👑',
    4: '🏆',
    5: '💎'
  };

  useEffect(() => {
    fetchTiersAndUserData();
  }, [userAddress]);

  const fetchTiersAndUserData = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API calls
      const mockTiers: NFTTier[] = [
        {
          id: 0,
          name: 'Yield Novice',
          description: 'Your first step into the LINE Yield ecosystem',
          icon: '🌱',
          threshold: 1000,
          maxSupply: 10000,
          currentSupply: 2500,
          mintPrice: 0,
          rarity: 'Common',
          benefits: ['Basic staking rewards', 'Community access', 'Early notifications'],
          color: 'bg-gray-500'
        },
        {
          id: 1,
          name: 'Yield Explorer',
          description: 'For those exploring DeFi opportunities',
          icon: '🚀',
          threshold: 5000,
          maxSupply: 5000,
          currentSupply: 1200,
          mintPrice: 0,
          rarity: 'Rare',
          benefits: ['Enhanced staking rewards', 'Priority support', 'Beta feature access'],
          color: 'bg-blue-500'
        },
        {
          id: 2,
          name: 'Yield Pioneer',
          description: 'Leading the way in yield farming innovation',
          icon: '⭐',
          threshold: 15000,
          maxSupply: 2500,
          currentSupply: 800,
          mintPrice: 0,
          rarity: 'Epic',
          benefits: ['Premium staking rewards', 'Governance voting', 'Exclusive events'],
          color: 'bg-purple-500'
        },
        {
          id: 3,
          name: 'Yield Master',
          description: 'Master of the yield farming arts',
          icon: '👑',
          threshold: 50000,
          maxSupply: 1000,
          currentSupply: 300,
          mintPrice: 0,
          rarity: 'Legendary',
          benefits: ['Maximum staking rewards', 'VIP support', 'Early access to new features'],
          color: 'bg-yellow-500'
        },
        {
          id: 4,
          name: 'Yield Legend',
          description: 'Legendary status in the yield farming community',
          icon: '🏆',
          threshold: 100000,
          maxSupply: 500,
          currentSupply: 150,
          mintPrice: 0,
          rarity: 'Mythic',
          benefits: ['Legendary staking rewards', 'Direct team access', 'Custom NFT designs'],
          color: 'bg-red-500'
        },
        {
          id: 5,
          name: 'Yield Titan',
          description: 'The ultimate achievement in LINE Yield',
          icon: '💎',
          threshold: 250000,
          maxSupply: 100,
          currentSupply: 25,
          mintPrice: 0,
          rarity: 'Transcendent',
          benefits: ['Transcendent rewards', 'Co-founder privileges', 'Revenue sharing'],
          color: 'bg-gradient-to-r from-purple-500 to-pink-500'
        }
      ];

      setTiers(mockTiers);
      setUserPoints(12500); // Mock user points
    } catch (error) {
      console.error('Failed to fetch tiers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableTiers = () => {
    return tiers.filter(tier => userPoints >= tier.threshold && tier.currentSupply < tier.maxSupply);
  };

  const getNextTier = () => {
    const availableTiers = tiers.filter(tier => userPoints < tier.threshold);
    return availableTiers.length > 0 ? availableTiers[0] : null;
  };

  const getProgressToNextTier = () => {
    const nextTier = getNextTier();
    if (!nextTier) return 100;
    
    const currentTier = tiers.find(tier => tier.threshold <= userPoints && tier.threshold === Math.max(...tiers.filter(t => t.threshold <= userPoints).map(t => t.threshold)));
    const progress = ((userPoints - (currentTier?.threshold || 0)) / (nextTier.threshold - (currentTier?.threshold || 0))) * 100;
    return Math.min(progress, 100);
  };

  const handleMint = async (tierId: number) => {
    try {
      setMinting(true);
      setSelectedTier(tierId);
      
      // Mock minting process - replace with actual contract interaction
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate mock token ID
      const tokenId = Math.floor(Math.random() * 1000000);
      
      setMintSuccess(true);
      onMintSuccess?.(tokenId, tierId);
      
      // Reset after success
      setTimeout(() => {
        setMintSuccess(false);
        setSelectedTier(null);
      }, 5000);
      
    } catch (error) {
      console.error('Minting failed:', error);
    } finally {
      setMinting(false);
    }
  };

  const formatPoints = (points: number) => {
    if (points >= 1000000) {
      return `${(points / 1000000).toFixed(1)}M`;
    } else if (points >= 1000) {
      return `${(points / 1000).toFixed(1)}K`;
    }
    return points.toString();
  };

  const getCurrentTier = () => {
    return tiers.find(tier => tier.threshold <= userPoints && tier.threshold === Math.max(...tiers.filter(t => t.threshold <= userPoints).map(t => t.threshold)));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading NFT tiers...</p>
        </div>
      </div>
    );
  }

  const availableTiers = getAvailableTiers();
  const nextTier = getNextTier();
  const currentTier = getCurrentTier();

  return (
    <div className="space-y-6">
      {/* User Status */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Your Yield Journey
              </h2>
              <div className="flex items-center space-x-4">
                <div className="text-3xl font-bold text-blue-600">
                  {formatPoints(userPoints)} Points
                </div>
                {currentTier && (
                  <Badge className={`${rarityColors[currentTier.rarity as keyof typeof rarityColors]} text-white`}>
                    {tierIcons[currentTier.id as keyof typeof tierIcons]} {currentTier.name}
                  </Badge>
                )}
              </div>
            </div>
            
            {nextTier && (
              <div className="text-center md:text-right">
                <p className="text-sm text-gray-600 mb-2">Progress to {nextTier.name}</p>
                <div className="w-48">
                  <Progress value={getProgressToNextTier()} className="h-2" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatPoints(userPoints)} / {formatPoints(nextTier.threshold)} points
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Available Tiers */}
      {availableTiers.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Gift className="w-5 h-5 mr-2 text-green-500" />
            Available to Mint
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableTiers.map((tier) => (
              <Card key={tier.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <div className={`absolute top-0 left-0 right-0 h-1 ${tier.color}`}></div>
                
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{tier.icon}</div>
                      <div>
                        <CardTitle className="text-lg">{tier.name}</CardTitle>
                        <Badge className={`${rarityColors[tier.rarity as keyof typeof rarityColors]} text-white`}>
                          {tier.rarity}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Tier {tier.id}</div>
                      <div className="text-xs text-gray-400">
                        {tier.currentSupply}/{tier.maxSupply} minted
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-gray-600 text-sm">{tier.description}</p>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Benefits:</h4>
                    <ul className="space-y-1">
                      {tier.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-gray-500">Supply Progress</span>
                      <span className="text-sm font-medium">
                        {Math.round((tier.currentSupply / tier.maxSupply) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={(tier.currentSupply / tier.maxSupply) * 100} 
                      className="h-2"
                    />
                  </div>
                  
                  <Button
                    className="w-full"
                    onClick={() => handleMint(tier.id)}
                    disabled={minting && selectedTier === tier.id}
                  >
                    {minting && selectedTier === tier.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Minting NFT...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Mint NFT
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Next Tier Preview */}
      {nextTier && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
            Next Achievement
          </h3>
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="text-4xl opacity-50">{nextTier.icon}</div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-700">{nextTier.name}</h4>
                  <p className="text-gray-600 text-sm mb-2">{nextTier.description}</p>
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline" className="opacity-50">
                      {nextTier.rarity}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      Requires {formatPoints(nextTier.threshold)} points
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 mb-1">Progress</div>
                  <div className="w-24">
                    <Progress value={getProgressToNextTier()} className="h-2" />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {formatPoints(userPoints)} / {formatPoints(nextTier.threshold)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* All Tiers Overview */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">All NFT Tiers</h3>
        <div className="space-y-3">
          {tiers.map((tier) => {
            const isUnlocked = userPoints >= tier.threshold;
            const isAvailable = isUnlocked && tier.currentSupply < tier.maxSupply;
            const isCurrent = tier.id === currentTier?.id;
            
            return (
              <Card 
                key={tier.id} 
                className={`transition-all ${
                  isCurrent ? 'ring-2 ring-blue-500 bg-blue-50' : 
                  isAvailable ? 'hover:shadow-md' : 'opacity-60'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`text-2xl ${isUnlocked ? '' : 'opacity-50'}`}>
                        {tier.icon}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold">{tier.name}</h4>
                          {isCurrent && (
                            <Badge className="bg-blue-500 text-white">Current</Badge>
                          )}
                          {isAvailable && !isCurrent && (
                            <Badge className="bg-green-500 text-white">Available</Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={`${rarityColors[tier.rarity as keyof typeof rarityColors]} text-white`}>
                            {tier.rarity}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {formatPoints(tier.threshold)} points
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">
                        {tier.currentSupply}/{tier.maxSupply} minted
                      </div>
                      <div className="w-24">
                        <Progress 
                          value={(tier.currentSupply / tier.maxSupply) * 100} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Mint Success Modal */}
      {mintSuccess && selectedTier !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-6 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">NFT Minted Successfully!</h3>
              <p className="text-gray-600 mb-4">
                You've successfully minted your {tiers[selectedTier]?.name} NFT
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="text-2xl mb-2">{tiers[selectedTier]?.icon}</div>
                <div className="font-semibold">{tiers[selectedTier]?.name}</div>
                <Badge className={`${rarityColors[tiers[selectedTier]?.rarity as keyof typeof rarityColors]} text-white mt-2`}>
                  {tiers[selectedTier]?.rarity}
                </Badge>
              </div>
              <Button onClick={() => setMintSuccess(false)} className="w-full">
                Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default NFTMinter;

