import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  TrendingUp, 
  Clock, 
  Star,
  Eye,
  Heart,
  Share2,
  MoreHorizontal
} from 'lucide-react';

interface NFT {
  id: string;
  name: string;
  description: string;
  image: string;
  tier: number;
  rarity: string;
  price: number;
  lastSalePrice?: number;
  owner: string;
  isListed: boolean;
  isStaked: boolean;
  stakingRewards?: number;
  tradeCount: number;
  createdAt: string;
  attributes: {
    trait_type: string;
    value: string;
  }[];
}

interface NFTCollectionProps {
  userAddress?: string | null;
}

export const NFTCollection: React.FC<NFTCollectionProps> = ({ userAddress }) => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [filteredNfts, setFilteredNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price' | 'rarity' | 'trades'>('newest');

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
    fetchNFTs();
  }, [userAddress]);

  useEffect(() => {
    filterAndSortNFTs();
  }, [nfts, searchQuery, selectedRarity, selectedTier, sortBy]);

  const fetchNFTs = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockNFTs: NFT[] = [
        {
          id: '1',
          name: 'Yield Pioneer #001',
          description: 'The first NFT minted on LINE Yield platform',
          image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=400&h=400&fit=crop',
          tier: 2,
          rarity: 'Epic',
          price: 150,
          lastSalePrice: 120,
          owner: userAddress || '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          isListed: true,
          isStaked: false,
          tradeCount: 3,
          createdAt: '2024-01-15T10:30:00Z',
          attributes: [
            { trait_type: 'Background', value: 'Cosmic' },
            { trait_type: 'Eyes', value: 'Laser' },
            { trait_type: 'Accessory', value: 'Golden Crown' }
          ]
        },
        {
          id: '2',
          name: 'DeFi Master #042',
          description: 'A legendary NFT for DeFi masters',
          image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=400&h=400&fit=crop',
          tier: 4,
          rarity: 'Legendary',
          price: 500,
          lastSalePrice: 450,
          owner: userAddress || '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          isListed: true,
          isStaked: true,
          stakingRewards: 25.5,
          tradeCount: 7,
          createdAt: '2024-01-10T15:45:00Z',
          attributes: [
            { trait_type: 'Background', value: 'Galaxy' },
            { trait_type: 'Eyes', value: 'Diamond' },
            { trait_type: 'Accessory', value: 'Crystal Staff' }
          ]
        },
        {
          id: '3',
          name: 'Yield Farmer #128',
          description: 'A rare NFT for dedicated yield farmers',
          image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=400&h=400&fit=crop',
          tier: 1,
          rarity: 'Rare',
          price: 75,
          owner: userAddress || '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          isListed: false,
          isStaked: false,
          tradeCount: 1,
          createdAt: '2024-01-20T08:15:00Z',
          attributes: [
            { trait_type: 'Background', value: 'Forest' },
            { trait_type: 'Eyes', value: 'Green' },
            { trait_type: 'Accessory', value: 'Farming Hat' }
          ]
        }
      ];

      setNfts(mockNFTs);
    } catch (error) {
      console.error('Failed to fetch NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortNFTs = () => {
    let filtered = [...nfts];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(nft =>
        nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nft.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Rarity filter
    if (selectedRarity !== 'all') {
      filtered = filtered.filter(nft => nft.rarity === selectedRarity);
    }

    // Tier filter
    if (selectedTier !== 'all') {
      filtered = filtered.filter(nft => nft.tier === selectedTier);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'price':
          return b.price - a.price;
        case 'rarity':
          const rarityOrder = ['Common', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Transcendent'];
          return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
        case 'trades':
          return b.tradeCount - a.tradeCount;
        default:
          return 0;
      }
    });

    setFilteredNfts(filtered);
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">My NFT Collection</h2>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" disabled>
              <Grid className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" disabled>
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My NFT Collection</h2>
          <p className="text-gray-600 mt-1">
            {filteredNfts.length} of {nfts.length} NFTs
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search NFTs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Rarity Filter */}
            <select
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Rarities</option>
              <option value="Common">Common</option>
              <option value="Rare">Rare</option>
              <option value="Epic">Epic</option>
              <option value="Legendary">Legendary</option>
              <option value="Mythic">Mythic</option>
              <option value="Transcendent">Transcendent</option>
            </select>

            {/* Tier Filter */}
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Tiers</option>
              <option value="0">Tier 0</option>
              <option value="1">Tier 1</option>
              <option value="2">Tier 2</option>
              <option value="3">Tier 3</option>
              <option value="4">Tier 4</option>
              <option value="5">Tier 5</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="newest">Newest First</option>
              <option value="price">Price: High to Low</option>
              <option value="rarity">Rarity</option>
              <option value="trades">Most Traded</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* NFT Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredNfts.map((nft) => (
            <Card key={nft.id} className="group hover:shadow-lg transition-shadow">
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
                {nft.isStaked && (
                  <div className="absolute bottom-2 left-2">
                    <Badge className="bg-green-500 text-white">
                      <Clock className="w-3 h-3 mr-1" />
                      Staked
                    </Badge>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-t-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    <Button size="sm" variant="secondary">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="secondary">
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="secondary">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg truncate">{nft.name}</h3>
                  <Button size="sm" variant="ghost">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{nft.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Price</span>
                    <span className="font-semibold">{formatPrice(nft.price)}</span>
                  </div>
                  
                  {nft.lastSalePrice && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Last Sale</span>
                      <span className="text-sm">{formatPrice(nft.lastSalePrice)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Trades</span>
                    <span className="text-sm">{nft.tradeCount}</span>
                  </div>
                  
                  {nft.isStaked && nft.stakingRewards && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Staking Rewards</span>
                      <span className="text-sm text-green-600 font-semibold">
                        {formatPrice(nft.stakingRewards)}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 flex space-x-2">
                  {nft.isListed ? (
                    <Button className="flex-1" size="sm">
                      View Listing
                    </Button>
                  ) : (
                    <Button className="flex-1" size="sm" variant="outline">
                      List for Sale
                    </Button>
                  )}
                  
                  {!nft.isStaked ? (
                    <Button size="sm" variant="outline">
                      Stake
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline">
                      Unstake
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNfts.map((nft) => (
            <Card key={nft.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{nft.name}</h3>
                        <p className="text-gray-600 text-sm">{nft.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">{formatPrice(nft.price)}</div>
                        <div className="flex space-x-2">
                          <Badge className={`${rarityColors[nft.rarity as keyof typeof rarityColors]} text-white`}>
                            {nft.rarity}
                          </Badge>
                          <Badge variant="secondary">
                            {tierIcons[nft.tier]} Tier {nft.tier}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-4 text-sm text-gray-500">
                        <span>Trades: {nft.tradeCount}</span>
                        <span>Created: {formatDate(nft.createdAt)}</span>
                        {nft.isStaked && (
                          <span className="text-green-600 font-semibold">
                            Staking Rewards: {formatPrice(nft.stakingRewards || 0)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        {nft.isListed ? (
                          <Button size="sm">View Listing</Button>
                        ) : (
                          <Button size="sm" variant="outline">List for Sale</Button>
                        )}
                        
                        {!nft.isStaked ? (
                          <Button size="sm" variant="outline">Stake</Button>
                        ) : (
                          <Button size="sm" variant="outline">Unstake</Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredNfts.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-500">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-lg font-semibold mb-2">No NFTs found</h3>
              <p>Try adjusting your filters or search terms</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NFTCollection;

