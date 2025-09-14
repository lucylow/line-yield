import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { 
  Search,
  Filter,
  TrendingUp,
  Star,
  Eye,
  Heart,
  ShoppingCart,
  Plus,
  Minus,
  Clock,
  Users,
  Zap,
  Crown,
  Award,
  Flame,
  Globe,
  Wallet,
  Settings,
  User,
  BarChart3,
  Activity,
  DollarSign,
  Calendar,
  ExternalLink
} from 'lucide-react';

interface NFTCollection {
  id: string;
  name: string;
  symbol: string;
  contractAddress: string;
  totalSupply: number;
  floorPrice: string;
  volume24h: string;
  volume7d: string;
  volume30d: string;
  owners: number;
  image: string;
  banner: string;
  description: string;
  verified: boolean;
  featured: boolean;
  category: string;
  socialLinks: {
    website?: string;
    twitter?: string;
    discord?: string;
  };
}

interface NFTItem {
  id: string;
  collectionId: string;
  tokenId: number;
  name: string;
  image: string;
  price: string;
  lastSale: string;
  owner: string;
  rarity: number;
  traits: {
    name: string;
    value: string;
    rarity: number;
  }[];
  listed: boolean;
  auctionEnd?: string;
}

interface DropCampaign {
  id: string;
  name: string;
  description: string;
  image: string;
  startTime: string;
  endTime: string;
  status: 'upcoming' | 'live' | 'ended';
  stage: 'airdrop' | 'presale' | 'public';
  price: string;
  maxSupply: number;
  minted: number;
  whitelistRequired: boolean;
  featured: boolean;
}

export const NFTMarketplace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'market' | 'trade' | 'my'>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('volume');
  const [collections, setCollections] = useState<NFTCollection[]>([]);
  const [nftItems, setNftItems] = useState<NFTItem[]>([]);
  const [dropCampaigns, setDropCampaigns] = useState<DropCampaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchMarketplaceData();
  }, []);

  const fetchMarketplaceData = async () => {
    try {
      setLoading(true);
      
      // Mock data for collections
      const mockCollections: NFTCollection[] = [
        {
          id: 'collection_1',
          name: 'LINE Yield Genesis',
          symbol: 'LYG',
          contractAddress: '0x123...',
          totalSupply: 10000,
          floorPrice: '0.5',
          volume24h: '1250.5',
          volume7d: '8750.3',
          volume30d: '32500.8',
          owners: 2500,
          image: '/images/collections/line-yield-genesis.jpg',
          banner: '/images/banners/line-yield-genesis.jpg',
          description: 'The genesis collection of LINE Yield platform',
          verified: true,
          featured: true,
          category: 'Art',
          socialLinks: {
            website: 'https://lineyield.com',
            twitter: '@lineyield',
            discord: 'discord.gg/lineyield'
          }
        },
        {
          id: 'collection_2',
          name: 'Crypto Warriors',
          symbol: 'CW',
          contractAddress: '0x456...',
          totalSupply: 5000,
          floorPrice: '0.8',
          volume24h: '2100.2',
          volume7d: '15200.5',
          volume30d: '45000.1',
          owners: 1800,
          image: '/images/collections/crypto-warriors.jpg',
          banner: '/images/banners/crypto-warriors.jpg',
          description: 'Epic warriors in the crypto realm',
          verified: true,
          featured: false,
          category: 'Gaming',
          socialLinks: {
            website: 'https://cryptowarriors.com',
            twitter: '@cryptowarriors'
          }
        }
      ];

      // Mock data for NFT items
      const mockNFTItems: NFTItem[] = [
        {
          id: 'nft_1',
          collectionId: 'collection_1',
          tokenId: 1,
          name: 'LINE Yield Genesis #1',
          image: '/images/nfts/genesis-1.jpg',
          price: '0.5',
          lastSale: '0.45',
          owner: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          rarity: 95,
          traits: [
            { name: 'Background', value: 'Gold', rarity: 5 },
            { name: 'Eyes', value: 'Laser', rarity: 10 },
            { name: 'Accessory', value: 'Crown', rarity: 2 }
          ],
          listed: true
        }
      ];

      // Mock data for drop campaigns
      const mockDrops: DropCampaign[] = [
        {
          id: 'drop_1',
          name: 'LINE Yield Legends',
          description: 'Legendary NFTs with special powers',
          image: '/images/drops/legends.jpg',
          startTime: '2024-01-25T00:00:00Z',
          endTime: '2024-02-25T00:00:00Z',
          status: 'live',
          stage: 'presale',
          price: '0.3',
          maxSupply: 5000,
          minted: 1250,
          whitelistRequired: true,
          featured: true
        }
      ];

      setCollections(mockCollections);
      setNftItems(mockNFTItems);
      setDropCampaigns(mockDrops);
    } catch (error) {
      console.error('Failed to fetch marketplace data:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'All', icon: Globe },
    { id: 'art', name: 'Art', icon: Star },
    { id: 'gaming', name: 'Gaming', icon: Zap },
    { id: 'music', name: 'Music', icon: Award },
    { id: 'sports', name: 'Sports', icon: Flame },
    { id: 'collectibles', name: 'Collectibles', icon: Crown }
  ];

  const sortOptions = [
    { id: 'volume', name: 'Volume' },
    { id: 'floor', name: 'Floor Price' },
    { id: 'supply', name: 'Supply' },
    { id: 'owners', name: 'Owners' },
    { id: 'newest', name: 'Newest' }
  ];

  const renderHomeTab = () => (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-4">Discover & Trade NFTs</h1>
          <p className="text-xl mb-6 opacity-90">
            Explore the world's largest NFT marketplace on LINE Yield
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Start Trading
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
              <Plus className="w-5 h-5 mr-2" />
              Create Collection
            </Button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-32 translate-x-32"></div>
      </div>

      {/* Featured Drops */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured Drops</h2>
          <Button variant="outline">View All</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dropCampaigns.filter(drop => drop.featured).map((drop) => (
            <Card key={drop.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img src={drop.image} alt={drop.name} className="w-full h-48 object-cover" />
                <Badge className="absolute top-4 left-4 bg-green-500">
                  {drop.status.toUpperCase()}
                </Badge>
                <Badge className="absolute top-4 right-4 bg-blue-500">
                  {drop.stage.toUpperCase()}
                </Badge>
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-2">{drop.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{drop.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Price:</span>
                    <span className="font-semibold">{drop.price} ETH</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Supply:</span>
                    <span>{drop.minted}/{drop.maxSupply}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(drop.minted / drop.maxSupply) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <Button className="w-full mt-4">
                  {drop.whitelistRequired ? 'Join Whitelist' : 'Mint Now'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Notable Collections */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Notable Collections</h2>
          <Button variant="outline">View All</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {collections.filter(collection => collection.featured).map((collection) => (
            <Card key={collection.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              <div className="relative">
                <img src={collection.image} alt={collection.name} className="w-full h-48 object-cover" />
                {collection.verified && (
                  <Badge className="absolute top-4 right-4 bg-blue-500">
                    <Star className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-2">{collection.name}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Floor:</span>
                    <span className="font-semibold">{collection.floorPrice} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span>24h Vol:</span>
                    <span className="font-semibold">{collection.volume24h} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Owners:</span>
                    <span>{collection.owners.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Market Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">$2.5M</p>
            <p className="text-gray-600">24h Volume</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">15.2K</p>
            <p className="text-gray-600">Active Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <BarChart3 className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">8.5K</p>
            <p className="text-gray-600">Collections</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Activity className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">125K</p>
            <p className="text-gray-600">Total NFTs</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderMarketTab = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search collections, NFTs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  );
                })}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                {sortOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {collections.map((collection) => (
          <Card key={collection.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
            <div className="relative">
              <img src={collection.image} alt={collection.name} className="w-full h-48 object-cover" />
              {collection.verified && (
                <Badge className="absolute top-4 right-4 bg-blue-500">
                  <Star className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="font-bold text-lg mb-2">{collection.name}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Floor:</span>
                  <span className="font-semibold">{collection.floorPrice} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span>24h Vol:</span>
                  <span className="font-semibold">{collection.volume24h} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span>7d Vol:</span>
                  <span className="font-semibold">{collection.volume7d} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span>Supply:</span>
                  <span>{collection.totalSupply.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Owners:</span>
                  <span>{collection.owners.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" className="flex-1">
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <Button size="sm" variant="outline">
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderTradeTab = () => (
    <div className="space-y-6">
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Trading Dashboard</h2>
        <p className="text-gray-600 mb-6">Advanced trading tools and analytics coming soon</p>
        <Button>
          <ExternalLink className="w-4 h-4 mr-2" />
          Learn More
        </Button>
      </div>
    </div>
  );

  const renderMyTab = () => (
    <div className="space-y-6">
      <div className="text-center py-12">
        <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">My NFTs</h2>
        <p className="text-gray-600 mb-6">Connect your wallet to view your NFT collection</p>
        <Button>
          <Wallet className="w-4 h-4 mr-2" />
          Connect Wallet
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-gray-900">NFT Marketplace</h1>
              <nav className="flex space-x-8">
                {[
                  { id: 'home', label: 'Home', icon: Globe },
                  { id: 'market', label: 'Market', icon: BarChart3 },
                  { id: 'trade', label: 'Trade', icon: TrendingUp },
                  { id: 'my', label: 'My', icon: User }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-purple-100 text-purple-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button>
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'home' && renderHomeTab()}
        {activeTab === 'market' && renderMarketTab()}
        {activeTab === 'trade' && renderTradeTab()}
        {activeTab === 'my' && renderMyTab()}
      </div>
    </div>
  );
};

export default NFTMarketplace;

