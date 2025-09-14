import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Clock, 
  Star,
  Eye,
  Heart,
  Share2,
  Gavel,
  DollarSign,
  Calendar,
  Users,
  BarChart3
} from 'lucide-react';

interface MarketplaceNFT {
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
  isAuction: boolean;
  auctionEndTime?: string;
  currentBid?: number;
  bidCount?: number;
  tradeCount: number;
  createdAt: string;
  attributes: {
    trait_type: string;
    value: string;
  }[];
}

interface VolumeStats {
  dailyVolume: number;
  weeklyVolume: number;
  monthlyVolume: number;
  totalVolume: number;
  transactionCount: number;
}

export const NFTMarketplace: React.FC = () => {
  const [nfts, setNfts] = useState<MarketplaceNFT[]>([]);
  const [filteredNfts, setFilteredNfts] = useState<MarketplaceNFT[]>([]);
  const [volumeStats, setVolumeStats] = useState<VolumeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'all' | 'listings' | 'auctions'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price' | 'rarity' | 'trades' | 'ending'>('newest');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 10000 });

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
    fetchMarketplaceData();
  }, []);

  useEffect(() => {
    filterAndSortNFTs();
  }, [nfts, viewMode, searchQuery, selectedRarity, selectedTier, sortBy, priceRange]);

  const fetchMarketplaceData = async () => {
    try {
      setLoading(true);
      
      // Mock marketplace data
      const mockNFTs: MarketplaceNFT[] = [
        {
          id: '1',
          name: 'Yield Pioneer #001',
          description: 'The first NFT minted on LINE Yield platform',
          image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=400&h=400&fit=crop',
          tier: 2,
          rarity: 'Epic',
          price: 150,
          lastSalePrice: 120,
          owner: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          isListed: true,
          isAuction: false,
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
          owner: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          isListed: true,
          isAuction: true,
          auctionEndTime: '2024-01-25T15:00:00Z',
          currentBid: 520,
          bidCount: 12,
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
          owner: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          isListed: true,
          isAuction: false,
          tradeCount: 1,
          createdAt: '2024-01-20T08:15:00Z',
          attributes: [
            { trait_type: 'Background', value: 'Forest' },
            { trait_type: 'Eyes', value: 'Green' },
            { trait_type: 'Accessory', value: 'Farming Hat' }
          ]
        },
        {
          id: '4',
          name: 'Yield Titan #007',
          description: 'The ultimate achievement in LINE Yield',
          image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=400&h=400&fit=crop',
          tier: 5,
          rarity: 'Transcendent',
          price: 2500,
          lastSalePrice: 2000,
          owner: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          isListed: true,
          isAuction: true,
          auctionEndTime: '2024-01-30T20:00:00Z',
          currentBid: 2800,
          bidCount: 25,
          tradeCount: 15,
          createdAt: '2024-01-05T12:00:00Z',
          attributes: [
            { trait_type: 'Background', value: 'Void' },
            { trait_type: 'Eyes', value: 'Cosmic' },
            { trait_type: 'Accessory', value: 'Infinity Crown' }
          ]
        }
      ];

      const mockVolumeStats: VolumeStats = {
        dailyVolume: 12500,
        weeklyVolume: 87500,
        monthlyVolume: 350000,
        totalVolume: 1250000,
        transactionCount: 1250
      };

      setNfts(mockNFTs);
      setVolumeStats(mockVolumeStats);
    } catch (error) {
      console.error('Failed to fetch marketplace data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortNFTs = () => {
    let filtered = [...nfts];

    // View mode filter
    if (viewMode === 'listings') {
      filtered = filtered.filter(nft => nft.isListed && !nft.isAuction);
    } else if (viewMode === 'auctions') {
      filtered = filtered.filter(nft => nft.isListed && nft.isAuction);
    }

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

    // Price range filter
    filtered = filtered.filter(nft => nft.price >= priceRange.min && nft.price <= priceRange.max);

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
        case 'ending':
          if (a.auctionEndTime && b.auctionEndTime) {
            return new Date(a.auctionEndTime).getTime() - new Date(b.auctionEndTime).getTime();
          }
          return 0;
        default:
          return 0;
      }
    });

    setFilteredNfts(filtered);
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(1)}K`;
    }
    return `$${volume}`;
  };

  const getTimeRemaining = (endTime: string) => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const diff = end - now;
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Volume Stats */}
      {volumeStats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{formatVolume(volumeStats.dailyVolume)}</div>
              <div className="text-sm text-gray-600">24h Volume</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{formatVolume(volumeStats.weeklyVolume)}</div>
              <div className="text-sm text-gray-600">7d Volume</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{formatVolume(volumeStats.monthlyVolume)}</div>
              <div className="text-sm text-gray-600">30d Volume</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{formatVolume(volumeStats.totalVolume)}</div>
              <div className="text-sm text-gray-600">Total Volume</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">{volumeStats.transactionCount}</div>
              <div className="text-sm text-gray-600">Total Sales</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">NFT Marketplace</h2>
          <p className="text-gray-600 mt-1">
            {filteredNfts.length} NFTs available
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant={viewMode === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('all')}
          >
            All NFTs
          </Button>
          <Button
            variant={viewMode === 'listings' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('listings')}
          >
            <DollarSign className="w-4 h-4 mr-1" />
            Buy Now
          </Button>
          <Button
            variant={viewMode === 'auctions' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('auctions')}
          >
            <Gavel className="w-4 h-4 mr-1" />
            Auctions
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
              <option value="ending">Ending Soon</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* NFT Grid */}
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
              {nft.isAuction && (
                <div className="absolute bottom-2 left-2">
                  <Badge className="bg-orange-500 text-white">
                    <Gavel className="w-3 h-3 mr-1" />
                    Auction
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
              <h3 className="font-semibold text-lg mb-2 truncate">{nft.name}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{nft.description}</p>
              
              <div className="space-y-2">
                {nft.isAuction ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Current Bid</span>
                      <span className="font-semibold text-orange-600">
                        {formatPrice(nft.currentBid || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Bids</span>
                      <span className="text-sm">{nft.bidCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Time Left</span>
                      <span className="text-sm text-red-600 font-semibold">
                        {nft.auctionEndTime ? getTimeRemaining(nft.auctionEndTime) : 'N/A'}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
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
                  </>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Trades</span>
                  <span className="text-sm">{nft.tradeCount}</span>
                </div>
              </div>
              
              <div className="mt-4 flex space-x-2">
                {nft.isAuction ? (
                  <Button className="flex-1" size="sm">
                    Place Bid
                  </Button>
                ) : (
                  <Button className="flex-1" size="sm">
                    Buy Now
                  </Button>
                )}
                <Button size="sm" variant="outline">
                  Make Offer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredNfts.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-500">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold mb-2">No NFTs found</h3>
              <p>Try adjusting your filters or search terms</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NFTMarketplace;

