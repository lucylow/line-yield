import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';
import { 
  Plus,
  Clock,
  Users,
  Zap,
  Crown,
  Star,
  Calendar,
  DollarSign,
  Settings,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Copy,
  Eye,
  Edit,
  Trash2,
  Upload,
  Image as ImageIcon,
  FileText,
  Target,
  Gift,
  Lock,
  Unlock
} from 'lucide-react';

interface DropCampaign {
  id: string;
  name: string;
  description: string;
  image: string;
  banner: string;
  nftContract: string;
  startTime: string;
  endTime: string;
  status: 'created' | 'airdrop' | 'presale' | 'public' | 'completed' | 'cancelled';
  stage: 'airdrop' | 'presale' | 'public';
  maxParticipants: number;
  airdropAmount: number;
  presalePrice: string;
  publicPrice: string;
  whitelistRequired: boolean;
  totalMinted: number;
  totalAirdropped: number;
  createdAt: string;
  updatedAt: string;
}

interface DropStage {
  id: string;
  dropId: string;
  stageType: 'airdrop' | 'presale' | 'public';
  startTime: string;
  endTime: string;
  price: string;
  maxSupply: number;
  minted: number;
  active: boolean;
}

interface WhitelistEntry {
  address: string;
  maxMints: number;
  minted: number;
  active: boolean;
}

interface AirdropRecipient {
  address: string;
  amount: number;
  claimed: boolean;
  tier: number;
}

export const NFTDropManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'stages' | 'whitelist' | 'airdrop' | 'analytics'>('overview');
  const [drops, setDrops] = useState<DropCampaign[]>([]);
  const [selectedDrop, setSelectedDrop] = useState<DropCampaign | null>(null);
  const [stages, setStages] = useState<DropStage[]>([]);
  const [whitelist, setWhitelist] = useState<WhitelistEntry[]>([]);
  const [airdropRecipients, setAirdropRecipients] = useState<AirdropRecipient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    nftContract: '',
    startTime: '',
    endTime: '',
    maxParticipants: 0,
    airdropAmount: 0,
    presalePrice: '',
    publicPrice: '',
    whitelistRequired: false
  });

  useEffect(() => {
    fetchDropsData();
  }, []);

  const fetchDropsData = async () => {
    try {
      setLoading(true);
      
      // Mock data for drop campaigns
      const mockDrops: DropCampaign[] = [
        {
          id: 'drop_1',
          name: 'LINE Yield Legends',
          description: 'Legendary NFTs with special powers and utilities',
          image: '/images/drops/legends.jpg',
          banner: '/images/banners/legends.jpg',
          nftContract: '0x1234567890abcdef...',
          startTime: '2024-01-25T00:00:00Z',
          endTime: '2024-02-25T00:00:00Z',
          status: 'presale',
          stage: 'presale',
          maxParticipants: 5000,
          airdropAmount: 500,
          presalePrice: '0.3',
          publicPrice: '0.5',
          whitelistRequired: true,
          totalMinted: 1250,
          totalAirdropped: 500,
          createdAt: '2024-01-20T10:00:00Z',
          updatedAt: '2024-01-20T10:00:00Z'
        },
        {
          id: 'drop_2',
          name: 'Crypto Warriors Genesis',
          description: 'The first generation of crypto warriors',
          image: '/images/drops/warriors.jpg',
          banner: '/images/banners/warriors.jpg',
          nftContract: '0xabcdef1234567890...',
          startTime: '2024-02-01T00:00:00Z',
          endTime: '2024-03-01T00:00:00Z',
          status: 'created',
          stage: 'airdrop',
          maxParticipants: 3000,
          airdropAmount: 300,
          presalePrice: '0.2',
          publicPrice: '0.4',
          whitelistRequired: false,
          totalMinted: 0,
          totalAirdropped: 0,
          createdAt: '2024-01-22T14:00:00Z',
          updatedAt: '2024-01-22T14:00:00Z'
        }
      ];

      setDrops(mockDrops);
      if (mockDrops.length > 0) {
        setSelectedDrop(mockDrops[0]);
        fetchDropDetails(mockDrops[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch drops data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropDetails = async (dropId: string) => {
    try {
      // Mock data for stages
      const mockStages: DropStage[] = [
        {
          id: 'stage_1',
          dropId: dropId,
          stageType: 'airdrop',
          startTime: '2024-01-25T00:00:00Z',
          endTime: '2024-01-26T00:00:00Z',
          price: '0',
          maxSupply: 500,
          minted: 500,
          active: false
        },
        {
          id: 'stage_2',
          dropId: dropId,
          stageType: 'presale',
          startTime: '2024-01-26T00:00:00Z',
          endTime: '2024-02-10T00:00:00Z',
          price: '0.3',
          maxSupply: 2000,
          minted: 750,
          active: true
        },
        {
          id: 'stage_3',
          dropId: dropId,
          stageType: 'public',
          startTime: '2024-02-10T00:00:00Z',
          endTime: '2024-02-25T00:00:00Z',
          price: '0.5',
          maxSupply: 2500,
          minted: 0,
          active: false
        }
      ];

      // Mock data for whitelist
      const mockWhitelist: WhitelistEntry[] = [
        {
          address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          maxMints: 5,
          minted: 2,
          active: true
        },
        {
          address: '0x1234567890abcdef1234567890abcdef12345678',
          maxMints: 3,
          minted: 0,
          active: true
        }
      ];

      // Mock data for airdrop recipients
      const mockAirdropRecipients: AirdropRecipient[] = [
        {
          address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          amount: 2,
          claimed: true,
          tier: 1
        },
        {
          address: '0x1234567890abcdef1234567890abcdef12345678',
          amount: 1,
          claimed: true,
          tier: 2
        }
      ];

      setStages(mockStages);
      setWhitelist(mockWhitelist);
      setAirdropRecipients(mockAirdropRecipients);
    } catch (error) {
      console.error('Failed to fetch drop details:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'created':
        return 'bg-gray-100 text-gray-800';
      case 'airdrop':
        return 'bg-blue-100 text-blue-800';
      case 'presale':
        return 'bg-yellow-100 text-yellow-800';
      case 'public':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'created':
        return <Clock className="w-4 h-4" />;
      case 'airdrop':
        return <Gift className="w-4 h-4" />;
      case 'presale':
        return <Lock className="w-4 h-4" />;
      case 'public':
        return <Unlock className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleCreateDrop = async () => {
    try {
      // Create new drop campaign
      const newDrop: DropCampaign = {
        id: `drop_${Date.now()}`,
        name: formData.name,
        description: formData.description,
        image: '/images/drops/default.jpg',
        banner: '/images/banners/default.jpg',
        nftContract: formData.nftContract,
        startTime: formData.startTime,
        endTime: formData.endTime,
        status: 'created',
        stage: 'airdrop',
        maxParticipants: formData.maxParticipants,
        airdropAmount: formData.airdropAmount,
        presalePrice: formData.presalePrice,
        publicPrice: formData.publicPrice,
        whitelistRequired: formData.whitelistRequired,
        totalMinted: 0,
        totalAirdropped: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setDrops(prev => [newDrop, ...prev]);
      setShowCreateModal(false);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        nftContract: '',
        startTime: '',
        endTime: '',
        maxParticipants: 0,
        airdropAmount: 0,
        presalePrice: '',
        publicPrice: '',
        whitelistRequired: false
      });
    } catch (error) {
      console.error('Failed to create drop:', error);
    }
  };

  const handleStartStage = async (dropId: string, stage: string) => {
    try {
      // Update drop status
      setDrops(prev => prev.map(drop => 
        drop.id === dropId 
          ? { ...drop, status: stage as any, stage: stage as any, updatedAt: new Date().toISOString() }
          : drop
      ));

      if (selectedDrop?.id === dropId) {
        setSelectedDrop(prev => prev ? { ...prev, status: stage as any, stage: stage as any } : null);
      }
    } catch (error) {
      console.error('Failed to start stage:', error);
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {selectedDrop && (
        <>
          {/* Drop Header */}
          <Card>
            <div className="relative">
              <img src={selectedDrop.banner} alt={selectedDrop.name} className="w-full h-48 object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-center text-white">
                  <h1 className="text-3xl font-bold mb-2">{selectedDrop.name}</h1>
                  <p className="text-lg opacity-90">{selectedDrop.description}</p>
                </div>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{selectedDrop.totalMinted}</p>
                  <p className="text-gray-600">Total Minted</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{selectedDrop.totalAirdropped}</p>
                  <p className="text-gray-600">Airdropped</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{selectedDrop.maxParticipants}</p>
                  <p className="text-gray-600">Max Supply</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {((selectedDrop.totalMinted / selectedDrop.maxParticipants) * 100).toFixed(1)}%
                  </p>
                  <p className="text-gray-600">Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={() => handleStartStage(selectedDrop.id, 'airdrop')}
                  disabled={selectedDrop.status !== 'created'}
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <Gift className="w-6 h-6 mb-2" />
                  Start Airdrop
                </Button>
                <Button 
                  onClick={() => handleStartStage(selectedDrop.id, 'presale')}
                  disabled={selectedDrop.status !== 'airdrop'}
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <Lock className="w-6 h-6 mb-2" />
                  Start Presale
                </Button>
                <Button 
                  onClick={() => handleStartStage(selectedDrop.id, 'public')}
                  disabled={selectedDrop.status !== 'presale'}
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <Unlock className="w-6 h-6 mb-2" />
                  Start Public Sale
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );

  const renderStagesTab = () => (
    <div className="space-y-6">
      {stages.map((stage) => (
        <Card key={stage.id}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Badge className={getStatusColor(stage.active ? 'active' : 'inactive')}>
                  {stage.stageType.toUpperCase()}
                </Badge>
                <h3 className="text-lg font-semibold">
                  {stage.stageType === 'airdrop' ? 'Airdrop Stage' :
                   stage.stageType === 'presale' ? 'Presale Stage' :
                   'Public Sale Stage'}
                </h3>
              </div>
              <Badge className={stage.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {stage.active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Start Time</p>
                <p className="font-semibold">{new Date(stage.startTime).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">End Time</p>
                <p className="font-semibold">{new Date(stage.endTime).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Price</p>
                <p className="font-semibold">{stage.price} ETH</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Supply</p>
                <p className="font-semibold">{stage.minted}/{stage.maxSupply}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span>{((stage.minted / stage.maxSupply) * 100).toFixed(1)}%</span>
              </div>
              <Progress value={(stage.minted / stage.maxSupply) * 100} className="h-2" />
            </div>
            
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Configure
              </Button>
              <Button size="sm" variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderWhitelistTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Whitelist Management</h2>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add to Whitelist
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {whitelist.map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{entry.address}</p>
                    <p className="text-sm text-gray-600">
                      {entry.minted}/{entry.maxMints} minted
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={entry.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {entry.active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button size="sm" variant="outline">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAirdropTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Airdrop Recipients</h2>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Recipients
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {airdropRecipients.map((recipient, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Gift className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{recipient.address}</p>
                    <p className="text-sm text-gray-600">
                      Amount: {recipient.amount} | Tier: {recipient.tier}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={recipient.claimed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {recipient.claimed ? 'Claimed' : 'Pending'}
                  </Badge>
                  <Button size="sm" variant="outline">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Drop Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">1,250</p>
            <p className="text-gray-600">Total Participants</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">375 ETH</p>
            <p className="text-gray-600">Total Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Target className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">25%</p>
            <p className="text-gray-600">Conversion Rate</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading drop manager...</p>
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
            <h1 className="text-xl font-bold text-gray-900">NFT Drop Manager</h1>
            <div className="flex items-center space-x-4">
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Drop
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Drop Campaigns</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-2">
                  {drops.map((drop) => (
                    <div
                      key={drop.id}
                      onClick={() => {
                        setSelectedDrop(drop);
                        fetchDropDetails(drop.id);
                      }}
                      className={`p-4 cursor-pointer hover:bg-gray-50 border-l-4 ${
                        selectedDrop?.id === drop.id ? 'border-purple-500 bg-purple-50' : 'border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-sm">{drop.name}</h3>
                        <Badge className={getStatusColor(drop.status)}>
                          {getStatusIcon(drop.status)}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">{drop.totalMinted}/{drop.maxParticipants}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedDrop ? (
              <>
                {/* Tab Navigation */}
                <div className="mb-6">
                  <nav className="flex space-x-8">
                    {[
                      { id: 'overview', label: 'Overview', icon: Eye },
                      { id: 'stages', label: 'Stages', icon: Calendar },
                      { id: 'whitelist', label: 'Whitelist', icon: Users },
                      { id: 'airdrop', label: 'Airdrop', icon: Gift },
                      { id: 'analytics', label: 'Analytics', icon: BarChart3 }
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

                {/* Tab Content */}
                {activeTab === 'overview' && renderOverviewTab()}
                {activeTab === 'stages' && renderStagesTab()}
                {activeTab === 'whitelist' && renderWhitelistTab()}
                {activeTab === 'airdrop' && renderAirdropTab()}
                {activeTab === 'analytics' && renderAnalyticsTab()}
              </>
            ) : (
              <div className="text-center py-12">
                <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No Drop Selected</h2>
                <p className="text-gray-600 mb-6">Select a drop campaign from the sidebar to view details</p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Drop
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Drop Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Create New Drop Campaign</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Drop Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter drop name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter drop description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">NFT Contract Address</label>
                <Input
                  value={formData.nftContract}
                  onChange={(e) => setFormData(prev => ({ ...prev, nftContract: e.target.value }))}
                  placeholder="0x..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                  <Input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                  <Input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Participants</label>
                  <Input
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Airdrop Amount</label>
                  <Input
                    type="number"
                    value={formData.airdropAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, airdropAmount: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Presale Price (ETH)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.presalePrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, presalePrice: e.target.value }))}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Public Price (ETH)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.publicPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, publicPrice: e.target.value }))}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="whitelistRequired"
                  checked={formData.whitelistRequired}
                  onChange={(e) => setFormData(prev => ({ ...prev, whitelistRequired: e.target.checked }))}
                />
                <label htmlFor="whitelistRequired" className="text-sm font-medium text-gray-700">
                  Require Whitelist for Presale
                </label>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateDrop}>
                  Create Drop
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default NFTDropManager;

