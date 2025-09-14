import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  Image, 
  Settings, 
  Eye, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Copy,
  Share2,
  TrendingUp,
  Users,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NFTCollection {
  id: string;
  name: string;
  description: string;
  artwork: string[];
  pricing: {
    mintPrice: number;
    currency: string;
    royaltyPercentage: number;
  };
  supply: {
    maxSupply: number;
    currentMinted: number;
    mintingSchedule: Date[];
  };
  metadata: {
    category: string;
    tags: string[];
    attributes: Record<string, any>;
  };
  blockchain: {
    network: string;
    contractAddress?: string;
  };
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'active' | 'paused';
  submissionDate: Date;
  reviewNotes?: string;
  stats: {
    totalMinted: number;
    totalRevenue: number;
    uniqueHolders: number;
    floorPrice: number;
    volume24h: number;
  };
}

interface NFTCollectionManagerProps {
  userAddress?: string;
  walletType: 'liff' | 'web';
}

export const NFTCollectionManager: React.FC<NFTCollectionManagerProps> = ({
  userAddress,
  walletType
}) => {
  const [collections, setCollections] = useState<NFTCollection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<NFTCollection | null>(null);
  const [newCollection, setNewCollection] = useState<Partial<NFTCollection>>({
    name: '',
    description: '',
    artwork: [],
    pricing: {
      mintPrice: 0,
      currency: 'USDT',
      royaltyPercentage: 5
    },
    supply: {
      maxSupply: 1000,
      currentMinted: 0,
      mintingSchedule: []
    },
    metadata: {
      category: 'Art',
      tags: [],
      attributes: {}
    },
    blockchain: {
      network: 'kaia'
    },
    status: 'draft'
  });
  const { toast } = useToast();

  // Mock data for demonstration
  useEffect(() => {
    const mockCollections: NFTCollection[] = [
      {
        id: 'collection-1',
        name: 'Kaia Wave Warriors',
        description: 'Epic warriors from the Kaia blockchain universe',
        artwork: ['/images/nft1.jpg', '/images/nft2.jpg'],
        pricing: {
          mintPrice: 50,
          currency: 'USDT',
          royaltyPercentage: 5
        },
        supply: {
          maxSupply: 1000,
          currentMinted: 250,
          mintingSchedule: [new Date('2024-01-15'), new Date('2024-02-15')]
        },
        metadata: {
          category: 'Gaming',
          tags: ['warriors', 'fantasy', 'kaia'],
          attributes: { rarity: 'common', power: 100 }
        },
        blockchain: {
          network: 'kaia',
          contractAddress: '0x1234...5678'
        },
        status: 'active',
        submissionDate: new Date('2024-01-01'),
        stats: {
          totalMinted: 250,
          totalRevenue: 12500,
          uniqueHolders: 180,
          floorPrice: 45,
          volume24h: 500
        }
      },
      {
        id: 'collection-2',
        name: 'DeFi Yield Masters',
        description: 'NFTs representing DeFi yield farming strategies',
        artwork: ['/images/nft3.jpg'],
        pricing: {
          mintPrice: 100,
          currency: 'USDT',
          royaltyPercentage: 7
        },
        supply: {
          maxSupply: 500,
          currentMinted: 0,
          mintingSchedule: [new Date('2024-02-01')]
        },
        metadata: {
          category: 'DeFi',
          tags: ['yield', 'farming', 'defi'],
          attributes: { apy: '12%', risk: 'medium' }
        },
        blockchain: {
          network: 'kaia'
        },
        status: 'under_review',
        submissionDate: new Date('2024-01-15'),
        stats: {
          totalMinted: 0,
          totalRevenue: 0,
          uniqueHolders: 0,
          floorPrice: 0,
          volume24h: 0
        }
      }
    ];
    setCollections(mockCollections);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'submitted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'under_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'paused': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit className="w-4 h-4" />;
      case 'submitted': return <Clock className="w-4 h-4" />;
      case 'under_review': return <Eye className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <AlertTriangle className="w-4 h-4" />;
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'paused': return <AlertTriangle className="w-4 h-4" />;
      default: return <Edit className="w-4 h-4" />;
    }
  };

  const handleCreateCollection = async () => {
    if (!userAddress) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to create NFT collections.",
        variant: "destructive"
      });
      return;
    }

    if (!newCollection.name || !newCollection.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Mock collection creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const collection: NFTCollection = {
        id: `collection-${Date.now()}`,
        name: newCollection.name!,
        description: newCollection.description!,
        artwork: newCollection.artwork || [],
        pricing: newCollection.pricing!,
        supply: newCollection.supply!,
        metadata: newCollection.metadata!,
        blockchain: newCollection.blockchain!,
        status: 'submitted',
        submissionDate: new Date(),
        stats: {
          totalMinted: 0,
          totalRevenue: 0,
          uniqueHolders: 0,
          floorPrice: 0,
          volume24h: 0
        }
      };

      setCollections(prev => [...prev, collection]);
      setShowCreateForm(false);
      setNewCollection({
        name: '',
        description: '',
        artwork: [],
        pricing: {
          mintPrice: 0,
          currency: 'USDT',
          royaltyPercentage: 5
        },
        supply: {
          maxSupply: 1000,
          currentMinted: 0,
          mintingSchedule: []
        },
        metadata: {
          category: 'Art',
          tags: [],
          attributes: {}
        },
        blockchain: {
          network: 'kaia'
        },
        status: 'draft'
      });

      toast({
        title: "Collection Created",
        description: "Your NFT collection has been submitted for review.",
      });
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "There was an error creating your collection. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitToOpsSupport = async (collection: NFTCollection) => {
    setIsLoading(true);
    try {
      // Mock submission to ops support
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Submitted to Ops Support",
        description: "Your collection has been submitted for review by our operations team.",
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your collection. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Copied",
      description: "Contract address copied to clipboard.",
    });
  };

  const totalCollections = collections.length;
  const activeCollections = collections.filter(c => c.status === 'active').length;
  const totalRevenue = collections.reduce((sum, c) => sum + c.stats.totalRevenue, 0);
  const totalMinted = collections.reduce((sum, c) => sum + c.stats.totalMinted, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">NFT Collection Manager</h2>
          <p className="text-gray-600">
            Create and manage your NFT collections on Kaia blockchain
            {walletType === 'liff' ? ' via LINE LIFF' : ' via web wallet'}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Revenue</p>
            <p className="text-lg font-semibold text-green-600">
              ${totalRevenue.toLocaleString()}
            </p>
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Collection
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Image className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Collections</p>
                <p className="text-xl font-bold">{totalCollections}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Collections</p>
                <p className="text-xl font-bold">{activeCollections}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Minted</p>
                <p className="text-xl font-bold">{totalMinted.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-xl font-bold">${totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {collections.map((collection) => (
          <Card key={collection.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg">{collection.name}</CardTitle>
                    <Badge className={getStatusColor(collection.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(collection.status)}
                        {collection.status.replace('_', ' ')}
                      </div>
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{collection.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {collection.pricing.mintPrice} {collection.pricing.currency}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {collection.supply.currentMinted}/{collection.supply.maxSupply}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Collection Stats */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Revenue</span>
                  <span className="font-medium">${collection.stats.totalRevenue.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Unique Holders</span>
                  <span className="font-medium">{collection.stats.uniqueHolders}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Floor Price</span>
                  <span className="font-medium">${collection.stats.floorPrice}</span>
                </div>
                
                <Progress 
                  value={(collection.supply.currentMinted / collection.supply.maxSupply) * 100} 
                  className="h-2" 
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {collection.status === 'draft' && (
                  <Button
                    size="sm"
                    onClick={() => handleSubmitToOpsSupport(collection)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Submit for Review
                  </Button>
                )}
                
                {collection.status === 'active' && collection.blockchain.contractAddress && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyAddress(collection.blockchain.contractAddress!)}
                    className="flex-1"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy Address
                  </Button>
                )}
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedCollection(collection)}
                  className="px-3"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Collection Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Create NFT Collection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Collection Name *</label>
                <input
                  type="text"
                  value={newCollection.name || ''}
                  onChange={(e) => setNewCollection(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter collection name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea
                  value={newCollection.description || ''}
                  onChange={(e) => setNewCollection(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Describe your collection"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Mint Price (USDT)</label>
                  <input
                    type="number"
                    value={newCollection.pricing?.mintPrice || 0}
                    onChange={(e) => setNewCollection(prev => ({
                      ...prev,
                      pricing: { ...prev.pricing!, mintPrice: parseFloat(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Max Supply</label>
                  <input
                    type="number"
                    value={newCollection.supply?.maxSupply || 0}
                    onChange={(e) => setNewCollection(prev => ({
                      ...prev,
                      supply: { ...prev.supply!, maxSupply: parseInt(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="1000"
                  />
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreateCollection}
                  disabled={isLoading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {isLoading ? 'Creating...' : 'Create Collection'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Collection Details Modal */}
      {selectedCollection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5" />
                {selectedCollection.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600">
                <p><strong>Description:</strong> {selectedCollection.description}</p>
                <p><strong>Category:</strong> {selectedCollection.metadata.category}</p>
                <p><strong>Mint Price:</strong> {selectedCollection.pricing.mintPrice} {selectedCollection.pricing.currency}</p>
                <p><strong>Royalty:</strong> {selectedCollection.pricing.royaltyPercentage}%</p>
                <p><strong>Supply:</strong> {selectedCollection.supply.currentMinted}/{selectedCollection.supply.maxSupply}</p>
                <p><strong>Status:</strong> {selectedCollection.status}</p>
                {selectedCollection.blockchain.contractAddress && (
                  <p><strong>Contract:</strong> {selectedCollection.blockchain.contractAddress}</p>
                )}
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => setSelectedCollection(null)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

