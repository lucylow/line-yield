import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUniversalWallet } from '@shared/hooks/useUniversalWallet';
import { usePlatform } from '@shared/hooks/usePlatform';
import { 
  ShoppingCart, 
  CreditCard, 
  Coins, 
  Star,
  Heart,
  Share2,
  Filter,
  Search,
  TrendingUp,
  Users,
  DollarSign,
  Zap,
  Gift,
  Crown,
  Sparkles,
  ExternalLink,
  Wallet,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface MarketplaceItem {
  itemId: string;
  nftContract: string;
  tokenId: string;
  seller: string;
  price: string;
  fiatPrice: string;
  isInAppItem: boolean;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

interface InAppItem {
  itemId: string;
  name: string;
  description: string;
  imageUrl: string;
  cryptoPrice: string;
  fiatPrice: string;
  maxSupply: number;
  currentSupply: number;
  isActive: boolean;
  creator: string;
}

interface PaymentRequest {
  paymentId: string;
  buyer: string;
  fiatAmount: string;
  cryptoAmount: string;
  currency: string;
  stablecoin: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  createdAt: number;
  completedAt?: number;
  lineTransactionId?: string;
}

interface MiniDappStoreProps {
  onBack?: () => void;
}

export const MiniDappStore: React.FC<MiniDappStoreProps> = ({ onBack }) => {
  const { wallet, connectWallet } = useUniversalWallet();
  const { isLiff } = usePlatform();
  
  const [activeTab, setActiveTab] = useState('nfts');
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | InAppItem | null>(null);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'fiat' | 'crypto'>('fiat');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Mock data for LINE mini dapp store
  const [nftItems, setNftItems] = useState<MarketplaceItem[]>([
    {
      itemId: '1',
      nftContract: '0x1234567890123456789012345678901234567890',
      tokenId: '1',
      seller: '0x742d35Cc6634C0532925a3b8D0C4C4C4C4C4C4C4',
      price: '100.00',
      fiatPrice: '15000.00',
      isInAppItem: false,
      isActive: true,
      createdAt: Date.now() - 86400000,
      updatedAt: Date.now() - 86400000,
    },
    {
      itemId: '2',
      nftContract: '0x1234567890123456789012345678901234567890',
      tokenId: '2',
      seller: '0x742d35Cc6634C0532925a3b8D0C4C4C4C4C4C4C4',
      price: '150.00',
      fiatPrice: '22500.00',
      isInAppItem: false,
      isActive: true,
      createdAt: Date.now() - 172800000,
      updatedAt: Date.now() - 172800000,
    },
  ]);

  const [inAppItems, setInAppItems] = useState<InAppItem[]>([
    {
      itemId: '1',
      name: 'Premium LINE Sticker Pack',
      description: 'Exclusive LINE stickers for your chats',
      imageUrl: 'https://via.placeholder.com/200x200/4F46E5/FFFFFF?text=Stickers',
      cryptoPrice: '10.00',
      fiatPrice: '1500.00',
      maxSupply: 1000,
      currentSupply: 250,
      isActive: true,
      creator: '0x742d35Cc6634C0532925a3b8D0C4C4C4C4C4C4C4',
    },
    {
      itemId: '2',
      name: 'LINE Theme Collection',
      description: 'Beautiful themes for your LINE app',
      imageUrl: 'https://via.placeholder.com/200x200/10B981/FFFFFF?text=Themes',
      cryptoPrice: '5.00',
      fiatPrice: '750.00',
      maxSupply: 500,
      currentSupply: 120,
      isActive: true,
      creator: '0x742d35Cc6634C0532925a3b8D0C4C4C4C4C4C4C4',
    },
    {
      itemId: '3',
      name: 'VIP LINE Badge',
      description: 'Exclusive VIP badge for your profile',
      imageUrl: 'https://via.placeholder.com/200x200/F59E0B/FFFFFF?text=VIP',
      cryptoPrice: '25.00',
      fiatPrice: '3750.00',
      maxSupply: 100,
      currentSupply: 45,
      isActive: true,
      creator: '0x742d35Cc6634C0532925a3b8D0C4C4C4C4C4C4C4',
    },
  ]);

  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);

  // LINE-specific wallet connection
  const handleConnectWallet = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (isLiff) {
        // Check if LIFF is available
        if (typeof window !== 'undefined' && (window as any).liff) {
          const liff = (window as any).liff;
          
          if (!liff.isLoggedIn()) {
            liff.login();
            return;
          }

          // Get LINE user profile
          const profile = await liff.getProfile();
          console.log('LINE Profile:', profile);

          // Try to connect to LINE mini dapp wallet or external wallet
          if ((window as any).ethereum) {
            const provider = (window as any).ethereum;
            const accounts = await provider.request({ method: 'eth_requestAccounts' });
            const address = accounts[0];
            
            setWallet({
              isConnected: true,
              address,
              provider
            });
          } else {
            // Fallback to mock wallet for demo
            setWallet({
              isConnected: true,
              address: '0x742d35Cc6634C0532925a3b8D0C4C4C4C4C4C4C4',
              provider: null
            });
          }
        } else {
          await connectWallet();
        }
      } else {
        await connectWallet();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      console.error('Wallet connection failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchaseItem = async (item: MarketplaceItem | InAppItem) => {
    if (!wallet?.address) {
      setError('Please connect your wallet first');
      return;
    }

    setSelectedItem(item);
    setShowPurchaseDialog(true);
  };

  const handlePaymentMethodSelect = (method: 'fiat' | 'crypto') => {
    setPaymentMethod(method);
    setShowPurchaseDialog(false);
    setShowPaymentDialog(true);
  };

  const handleFiatPayment = async () => {
    if (!selectedItem || !wallet?.address) {
      setError('Missing required information');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Simulate LINE payment processing
      const paymentId = `payment_${Date.now()}`;
      const paymentRequest: PaymentRequest = {
        paymentId,
        buyer: wallet.address,
        fiatAmount: selectedItem.fiatPrice,
        cryptoAmount: selectedItem.cryptoPrice || selectedItem.price,
        currency: 'JPY',
        stablecoin: '0x1234567890123456789012345678901234567890',
        status: 'processing',
        createdAt: Date.now(),
      };

      setPaymentRequests(prev => [paymentRequest, ...prev]);

      // Simulate payment completion
      setTimeout(() => {
        setPaymentRequests(prev => prev.map(p => 
          p.paymentId === paymentId 
            ? { ...p, status: 'completed', completedAt: Date.now() }
            : p
        ));
        setShowPaymentDialog(false);
        setSelectedItem(null);
      }, 3000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      console.error('Payment failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCryptoPayment = async () => {
    if (!selectedItem || !wallet?.address) {
      setError('Missing required information');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Simulate crypto payment
      const transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      
      setShowPaymentDialog(false);
      setSelectedItem(null);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      console.error('Payment failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareToLine = async (item: MarketplaceItem | InAppItem) => {
    if (isLiff && typeof window !== 'undefined' && (window as any).liff) {
      try {
        const liff = (window as any).liff;
        const shareMessage = `Check out this amazing item in LINE Yield Store: ${item.name || `NFT #${item.tokenId}`}`;
        
        await liff.shareTargetPicker([
          {
            type: 'text',
            text: shareMessage,
          },
        ]);
      } catch (error) {
        console.error('Failed to share to LINE:', error);
      }
    }
  };

  const formatAmount = (amount: string, decimals: number = 2): string => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return '0';
    
    return numAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: decimals,
    });
  };

  const formatFiatAmount = (amount: string): string => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return '0';
    
    return `¥${numAmount.toLocaleString('ja-JP')}`;
  };

  const getItemImage = (item: MarketplaceItem | InAppItem): string => {
    if ('imageUrl' in item && item.imageUrl) {
      return item.imageUrl;
    }
    return `https://via.placeholder.com/200x200/6366F1/FFFFFF?text=NFT+${item.tokenId}`;
  };

  const getItemName = (item: MarketplaceItem | InAppItem): string => {
    if ('name' in item && item.name) {
      return item.name;
    }
    return `NFT #${item.tokenId}`;
  };

  const getItemDescription = (item: MarketplaceItem | InAppItem): string => {
    if ('description' in item && item.description) {
      return item.description;
    }
    return 'A unique NFT from the LINE Yield collection';
  };

  const filteredNftItems = nftItems.filter(item => {
    const matchesSearch = item.tokenId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && item.isActive;
  });

  const filteredInAppItems = inAppItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && item.isActive;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              {onBack && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="mr-3"
                >
                  ← Back
                </Button>
              )}
              <h1 className="text-xl font-bold text-blue-600">LINE Yield Store</h1>
              {isLiff && (
                <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                  LIFF
                </span>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {wallet.isConnected ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                  </span>
                  <Badge variant="outline" className="text-green-600">
                    <Wallet className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                </div>
              ) : (
                <Button 
                  onClick={handleConnectWallet}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet className="h-4 w-4 mr-2" />
                      Connect Wallet
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            LINE Yield Mini Dapp Store
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Discover NFTs and in-app items with LINE payment integration
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50 mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Error</span>
              </div>
              <p className="text-red-600 mt-1">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setError(null)}
                className="mt-2"
              >
                Dismiss
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Sort
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="nfts" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              NFTs
            </TabsTrigger>
            <TabsTrigger value="in-app" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              In-App Items
            </TabsTrigger>
            <TabsTrigger value="my-items" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              My Items
            </TabsTrigger>
          </TabsList>

          {/* NFTs Tab */}
          <TabsContent value="nfts">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNftItems.map((item) => (
                <Card key={item.itemId} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={getItemImage(item)}
                      alt={getItemName(item)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{getItemName(item)}</h3>
                      <Badge variant="outline" className="text-blue-600">
                        NFT
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{getItemDescription(item)}</p>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-semibold text-lg">{formatAmount(item.price)} USDT</div>
                        <div className="text-sm text-gray-600">{formatFiatAmount(item.fiatPrice)}</div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShareToLine(item)}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePurchaseItem(item)}
                          disabled={!wallet?.address}
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      onClick={() => handlePurchaseItem(item)}
                      disabled={!wallet?.address}
                      className="w-full"
                    >
                      {wallet?.address ? 'Buy Now' : 'Connect Wallet to Buy'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* In-App Items Tab */}
          <TabsContent value="in-app">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInAppItems.map((item) => (
                <Card key={item.itemId} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={getItemImage(item)}
                      alt={getItemName(item)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{getItemName(item)}</h3>
                      <Badge variant="outline" className="text-green-600">
                        In-App
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{getItemDescription(item)}</p>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-semibold text-lg">{formatAmount(item.cryptoPrice)} USDT</div>
                        <div className="text-sm text-gray-600">{formatFiatAmount(item.fiatPrice)}</div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShareToLine(item)}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePurchaseItem(item)}
                          disabled={!wallet?.address}
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {item.maxSupply > 0 && (
                      <div className="mb-3">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Supply</span>
                          <span>{item.currentSupply} / {item.maxSupply}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(item.currentSupply / item.maxSupply) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    <Button
                      onClick={() => handlePurchaseItem(item)}
                      disabled={!wallet?.address || (item.maxSupply > 0 && item.currentSupply >= item.maxSupply)}
                      className="w-full"
                    >
                      {!wallet?.address 
                        ? 'Connect Wallet to Buy'
                        : item.maxSupply > 0 && item.currentSupply >= item.maxSupply
                        ? 'Sold Out'
                        : 'Buy Now'
                      }
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* My Items Tab */}
          <TabsContent value="my-items">
            <Card>
              <CardHeader>
                <CardTitle>My Purchased Items</CardTitle>
              </CardHeader>
              <CardContent>
                {!wallet?.address ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Connect your wallet to view your items</p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No items purchased yet</p>
                    <p className="text-sm">Start shopping to see your items here!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Purchase Method Selection Dialog */}
        <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Choose Payment Method</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                How would you like to pay for {selectedItem ? getItemName(selectedItem) : 'this item'}?
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => handlePaymentMethodSelect('fiat')}
                  className="h-20 flex flex-col items-center justify-center gap-2"
                >
                  <CreditCard className="h-6 w-6" />
                  <span>LINE Pay</span>
                  <span className="text-xs text-muted-foreground">
                    {selectedItem ? formatFiatAmount(selectedItem.fiatPrice) : ''}
                  </span>
                </Button>
                
                <Button
                  onClick={() => handlePaymentMethodSelect('crypto')}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center gap-2"
                >
                  <Coins className="h-6 w-6" />
                  <span>Crypto</span>
                  <span className="text-xs text-muted-foreground">
                    {selectedItem ? `${formatAmount(selectedItem.cryptoPrice || selectedItem.price)} USDT` : ''}
                  </span>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Payment Processing Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {paymentMethod === 'fiat' ? 'LINE Pay Processing' : 'Crypto Payment'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {paymentMethod === 'fiat' ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Processing LINE Pay payment...
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Please wait</span>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Coins className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Confirm the transaction in your wallet
                  </p>
                  <Button
                    onClick={handleCryptoPayment}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Complete Payment'
                    )}
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 LINE Yield Store. All rights reserved.</p>
            <div className="mt-4 space-x-6">
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Privacy Policy</a>
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Terms of Service</a>
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

