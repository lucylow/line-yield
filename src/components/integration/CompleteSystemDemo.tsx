import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  Zap, 
  Image, 
  Users, 
  TrendingUp,
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  Copy,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { walletSDK, WalletType, WalletConnection } from '@/sdk/WalletProviderSDK';
import { BitgetWalletConnect } from '../wallet/WalletConnectProvider';
import { YieldStrategiesPanel } from '../yield/YieldStrategiesPanel';
import { NFTCollectionManager } from '../nft/NFTCollectionManager';

interface SystemStats {
  totalUsers: number;
  totalCollections: number;
  totalYieldEarned: number;
  totalTransactions: number;
  activeStrategies: number;
  governanceProposals: number;
}

export const CompleteSystemDemo: React.FC = () => {
  const [walletConnection, setWalletConnection] = useState<WalletConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 1250,
    totalCollections: 45,
    totalYieldEarned: 125000,
    totalTransactions: 8750,
    activeStrategies: 8,
    governanceProposals: 12
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'yield' | 'nft' | 'governance'>('overview');
  const { toast } = useToast();

  useEffect(() => {
    // Set up wallet event listeners
    walletSDK.on('walletConnected', (connection: WalletConnection) => {
      setWalletConnection(connection);
      toast({
        title: "Wallet Connected",
        description: `Connected to ${connection.walletType} wallet`,
      });
    });

    walletSDK.on('walletDisconnected', () => {
      setWalletConnection(null);
      toast({
        title: "Wallet Disconnected",
        description: "Wallet connection has been closed",
      });
    });

    walletSDK.on('walletError', (error: any) => {
      toast({
        title: "Wallet Error",
        description: error.message || "An error occurred with wallet connection",
        variant: "destructive"
      });
    });

    return () => {
      walletSDK.off('walletConnected', () => {});
      walletSDK.off('walletDisconnected', () => {});
      walletSDK.off('walletError', () => {});
    };
  }, [toast]);

  const handleConnectWallet = async (walletType: WalletType) => {
    setIsConnecting(true);
    try {
      await walletSDK.connectWallet(walletType);
    } catch (error) {
      console.error('Wallet connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      await walletSDK.disconnectWallet();
    } catch (error) {
      console.error('Wallet disconnection failed:', error);
    }
  };

  const getWalletTypeLabel = (walletType: WalletType) => {
    switch (walletType) {
      case WalletType.KAIA_WALLET: return 'KAIA Wallet';
      case WalletType.OKX_WALLET: return 'OKX Wallet';
      case WalletType.BITGET_WALLET: return 'Bitget Wallet';
      case WalletType.MINI_DAPP_WALLET: return 'Mini-DApp Wallet';
      case WalletType.LIFF_WALLET: return 'LINE LIFF Wallet';
      case WalletType.WALLETCONNECT: return 'WalletConnect (Bitget)';
      default: return 'Unknown Wallet';
    }
  };

  const getWalletTypeIcon = (walletType: WalletType) => {
    switch (walletType) {
      case WalletType.LIFF_WALLET: return '📱';
      case WalletType.KAIA_WALLET: return '🔷';
      case WalletType.OKX_WALLET: return '🟠';
      case WalletType.BITGET_WALLET: return '🟡';
      case WalletType.MINI_DAPP_WALLET: return '⚡';
      case WalletType.WALLETCONNECT: return '🔗';
      default: return '💳';
    }
  };

  const copyAddress = () => {
    if (walletConnection?.address) {
      navigator.clipboard.writeText(walletConnection.address);
      toast({
        title: "Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Kaia Wave DeFi Mini-DApp</h1>
              <p className="text-gray-600">Complete DeFi ecosystem with yield strategies, NFT collections, and governance</p>
            </div>
            
            {/* Wallet Connection */}
            <div className="flex items-center gap-4">
              {walletConnection ? (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {getWalletTypeIcon(walletConnection.walletType)} {getWalletTypeLabel(walletConnection.walletType)}
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {walletConnection.address.slice(0, 6)}...{walletConnection.address.slice(-4)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyAddress}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDisconnectWallet}
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleConnectWallet(WalletType.LIFF_WALLET)}
                    disabled={isConnecting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect LINE LIFF
                  </Button>
                  <Button
                    onClick={() => handleConnectWallet(WalletType.KAIA_WALLET)}
                    disabled={isConnecting}
                    variant="outline"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect KAIA
                  </Button>
                  <Button
                    onClick={() => handleConnectWallet(WalletType.WALLETCONNECT)}
                    disabled={isConnecting}
                    variant="outline"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    WalletConnect
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'yield', label: 'Yield Strategies', icon: Zap },
              { id: 'nft', label: 'NFT Collections', icon: Image },
              { id: 'governance', label: 'Governance', icon: Users }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* System Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Users</p>
                      <p className="text-xl font-bold">{systemStats.totalUsers.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Image className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Collections</p>
                      <p className="text-xl font-bold">{systemStats.totalCollections}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Yield Earned</p>
                      <p className="text-xl font-bold">${systemStats.totalYieldEarned.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Transactions</p>
                      <p className="text-xl font-bold">{systemStats.totalTransactions.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Strategies</p>
                      <p className="text-xl font-bold">{systemStats.activeStrategies}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Proposals</p>
                      <p className="text-xl font-bold">{systemStats.governanceProposals}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Architecture Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="w-5 h-5" />
                    Wallet Architecture
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">LINE Users</Badge>
                      <span className="text-sm text-gray-600">LIFF + Mini-DApp Wallet</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800">Web Users</Badge>
                      <span className="text-sm text-gray-600">KAIA, OKX, Bitget Wallets</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Unified wallet provider SDK supporting multiple connection methods with 
                    seamless integration for both LINE ecosystem and web users.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="w-5 h-5" />
                    NFT Collection Flow
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Create Collection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm">Submit to Ops Support</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">Review & Approval</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-purple-600" />
                      <span className="text-sm">DApp Portal Registration</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Streamlined process from collection creation to marketplace listing 
                    with comprehensive ops support and quality assurance.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={() => setActiveTab('yield')}
                    className="h-20 flex flex-col items-center justify-center gap-2"
                  >
                    <Zap className="w-6 h-6" />
                    <span>Yield Strategies</span>
                  </Button>
                  <Button
                    onClick={() => setActiveTab('nft')}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center gap-2"
                  >
                    <Image className="w-6 h-6" />
                    <span>NFT Collections</span>
                  </Button>
                  <Button
                    onClick={() => setActiveTab('governance')}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center gap-2"
                  >
                    <Users className="w-6 h-6" />
                    <span>Governance</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'yield' && (
          <YieldStrategiesPanel
            userAddress={walletConnection?.address}
            totalDeposited={100000}
          />
        )}

        {activeTab === 'nft' && (
          <NFTCollectionManager
            userAddress={walletConnection?.address}
            walletType={walletConnection?.walletType === WalletType.LIFF_WALLET ? 'liff' : 'web'}
          />
        )}

        {activeTab === 'governance' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>DAO Governance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Shield className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Governance System</h3>
                  <p className="text-gray-600 mb-4">
                    Participate in decentralized governance of the Kaia Wave ecosystem.
                  </p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <p>• Create and vote on proposals</p>
                    <p>• Manage treasury allocations</p>
                    <p>• Update protocol parameters</p>
                    <p>• Strategy management</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
