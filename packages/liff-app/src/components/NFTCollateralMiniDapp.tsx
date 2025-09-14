import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUniversalWallet } from '@shared/hooks/useUniversalWallet';
import { usePlatform } from '@shared/hooks/usePlatform';
import { 
  Image, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Shield,
  Zap,
  RefreshCw,
  Eye,
  Plus,
  Minus,
  Info,
  Wallet,
  ExternalLink
} from 'lucide-react';

interface NFTOwnership {
  contractAddress: string;
  tokenId: string;
  name?: string;
  image?: string;
  metadata?: any;
}

interface NFTCollateralPosition {
  positionId: string;
  owner: string;
  nftContract: string;
  tokenId: string;
  collateralValue: string;
  loanAmount: string;
  interestAccrued: string;
  lastInterestUpdate: number;
  createdAt: number;
  active: boolean;
  liquidated: boolean;
}

interface NFTCollection {
  contractAddress: string;
  supported: boolean;
  maxLTV: number;
  liquidationThreshold: number;
  interestRate: number;
  active: boolean;
}

interface NFTCollateralMiniDappProps {
  onBack?: () => void;
}

export const NFTCollateralMiniDapp: React.FC<NFTCollateralMiniDappProps> = ({ onBack }) => {
  const { wallet, connectWallet } = useUniversalWallet();
  const { isLiff } = usePlatform();
  
  const [activeTab, setActiveTab] = useState('borrow');
  const [selectedNFT, setSelectedNFT] = useState<{ contract: string; tokenId: string } | null>(null);
  const [borrowAmount, setBorrowAmount] = useState('');
  const [repayAmount, setRepayAmount] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [showBorrowDialog, setShowBorrowDialog] = useState(false);
  const [showRepayDialog, setShowRepayDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for LINE mini dapp
  const [userNFTs, setUserNFTs] = useState<NFTOwnership[]>([
    {
      contractAddress: '0x1234567890123456789012345678901234567890',
      tokenId: '1',
      name: 'LINE NFT #1',
      image: 'https://via.placeholder.com/200x200/4F46E5/FFFFFF?text=LINE+NFT+1',
    },
    {
      contractAddress: '0x1234567890123456789012345678901234567890',
      tokenId: '2',
      name: 'LINE NFT #2',
      image: 'https://via.placeholder.com/200x200/10B981/FFFFFF?text=LINE+NFT+2',
    },
  ]);

  const [positions, setPositions] = useState<NFTCollateralPosition[]>([]);
  const [collections] = useState<NFTCollection[]>([
    {
      contractAddress: '0x1234567890123456789012345678901234567890',
      supported: true,
      maxLTV: 7000, // 70%
      liquidationThreshold: 8000, // 80%
      interestRate: 500, // 5%
      active: true,
    },
  ]);

  const [vaultStats] = useState({
    totalCollateralValue: '1250000.00',
    totalLoanAmount: '875000.00',
    totalInterestAccrued: '12500.00',
    vaultLiquidity: '2000000.00',
  });

  // LIFF-specific wallet connection
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
            
            // Mock wallet connection for demo
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
          // Fallback for non-LIFF environment
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

  const handleBorrow = async () => {
    if (!wallet?.address || !selectedNFT || !borrowAmount) {
      setError('Please select an NFT and enter borrow amount');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Mock borrow transaction
      const newPosition: NFTCollateralPosition = {
        positionId: `pos-${Date.now()}`,
        owner: wallet.address,
        nftContract: selectedNFT.contract,
        tokenId: selectedNFT.tokenId,
        collateralValue: (parseFloat(borrowAmount) * 1.5).toString(),
        loanAmount: borrowAmount,
        interestAccrued: '0',
        lastInterestUpdate: Date.now(),
        createdAt: Date.now(),
        active: true,
        liquidated: false,
      };

      setPositions(prev => [newPosition, ...prev]);
      setBorrowAmount('');
      setSelectedNFT(null);
      setShowBorrowDialog(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create borrow transaction';
      setError(errorMessage);
      console.error('Borrow failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRepay = async () => {
    if (!wallet?.address || !selectedPosition || !repayAmount) {
      setError('Please select a position and enter repay amount');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Mock repay transaction
      setPositions(prev => prev.map(pos => 
        pos.positionId === selectedPosition 
          ? { ...pos, loanAmount: '0', interestAccrued: '0', active: false }
          : pos
      ));

      setRepayAmount('');
      setSelectedPosition(null);
      setShowRepayDialog(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process repay transaction';
      setError(errorMessage);
      console.error('Repay failed:', err);
    } finally {
      setIsLoading(false);
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

  const formatLTV = (ltv: number): string => {
    return `${(ltv / 100).toFixed(1)}%`;
  };

  const formatInterestRate = (rate: number): string => {
    return `${(rate / 100).toFixed(2)}%`;
  };

  const calculateTotalDebt = (loanAmount: string, interestAccrued: string): string => {
    const loan = parseFloat(loanAmount);
    const interest = parseFloat(interestAccrued);
    return (loan + interest).toString();
  };

  const getCollectionInfo = (contractAddress: string) => {
    return collections.find(c => c.contractAddress.toLowerCase() === contractAddress.toLowerCase());
  };

  const getPositionById = (positionId: string) => {
    return positions.find(p => p.positionId === positionId);
  };

  const getMaxRepayAmount = (positionId: string) => {
    const position = getPositionById(positionId);
    if (!position) return '0';
    return calculateTotalDebt(position.loanAmount, position.interestAccrued);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'danger':
        return 'text-red-600 bg-red-100';
      case 'liquidated':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'healthy':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'danger':
        return '🚨';
      case 'liquidated':
        return '💀';
      default:
        return '❓';
    }
  };

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
              <h1 className="text-xl font-bold text-blue-600">LINE Yield NFT</h1>
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
            NFT Collateral System
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Use your NFTs as collateral to borrow stablecoins
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

        {/* Vault Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatAmount(vaultStats.totalCollateralValue)}
                </div>
                <div className="text-sm text-muted-foreground">Total Collateral</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatAmount(vaultStats.totalLoanAmount)}
                </div>
                <div className="text-sm text-muted-foreground">Total Loans</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {formatAmount(vaultStats.totalInterestAccrued)}
                </div>
                <div className="text-sm text-muted-foreground">Interest Accrued</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {formatAmount(vaultStats.vaultLiquidity)}
                </div>
                <div className="text-sm text-muted-foreground">Vault Liquidity</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="borrow" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Borrow
            </TabsTrigger>
            <TabsTrigger value="positions" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              My Positions
            </TabsTrigger>
            <TabsTrigger value="info" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Info
            </TabsTrigger>
          </TabsList>

          {/* Borrow Tab */}
          <TabsContent value="borrow">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* NFT Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    Select NFT
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!wallet?.address ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Connect your wallet to view NFTs</p>
                    </div>
                  ) : userNFTs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No NFTs found in your wallet</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {userNFTs.map((nft) => {
                        const collection = getCollectionInfo(nft.contractAddress);
                        const isSupported = collection?.supported;
                        
                        return (
                          <div
                            key={`${nft.contractAddress}-${nft.tokenId}`}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedNFT?.contract === nft.contractAddress && selectedNFT?.tokenId === nft.tokenId
                                ? 'border-blue-500 bg-blue-50'
                                : isSupported
                                ? 'hover:bg-muted'
                                : 'opacity-50 cursor-not-allowed'
                            }`}
                            onClick={() => isSupported && setSelectedNFT({ contract: nft.contractAddress, tokenId: nft.tokenId })}
                          >
                            <div className="flex items-center gap-3">
                              {nft.image && (
                                <img
                                  src={nft.image}
                                  alt={nft.name || `NFT #${nft.tokenId}`}
                                  className="w-12 h-12 rounded object-cover"
                                />
                              )}
                              <div className="flex-1">
                                <div className="font-medium">
                                  {nft.name || `NFT #${nft.tokenId}`}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Contract: {nft.contractAddress.slice(0, 10)}...
                                </div>
                                {collection && (
                                  <div className="text-xs text-muted-foreground">
                                    Max LTV: {formatLTV(collection.maxLTV)} | Interest: {formatInterestRate(collection.interestRate)}
                                  </div>
                                )}
                              </div>
                              {isSupported ? (
                                <Badge variant="outline" className="text-green-600">
                                  Supported
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-red-600">
                                  Not Supported
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Borrow Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Borrow Amount
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedNFT ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="borrowAmount">Amount (USDT)</Label>
                        <Input
                          id="borrowAmount"
                          type="number"
                          placeholder="Enter borrow amount"
                          value={borrowAmount}
                          onChange={(e) => setBorrowAmount(e.target.value)}
                          min="0"
                          step="0.01"
                          disabled={isLoading}
                        />
                      </div>
                      
                      <div className="p-4 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground mb-2">Borrow Details:</div>
                        <div className="space-y-1 text-sm">
                          <div>Selected NFT: {selectedNFT.tokenId}</div>
                          <div>Max LTV: {getCollectionInfo(selectedNFT.contract)?.maxLTV ? formatLTV(getCollectionInfo(selectedNFT.contract)!.maxLTV) : 'N/A'}</div>
                          <div>Interest Rate: {getCollectionInfo(selectedNFT.contract)?.interestRate ? formatInterestRate(getCollectionInfo(selectedNFT.contract)!.interestRate) : 'N/A'}</div>
                        </div>
                      </div>

                      <Button
                        onClick={() => setShowBorrowDialog(true)}
                        disabled={isLoading || !borrowAmount || !wallet?.address}
                        className="w-full"
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4 mr-2" />
                            Borrow USDT
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Select an NFT to borrow against</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Positions Tab */}
          <TabsContent value="positions">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>My Positions</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {/* Refresh positions */}}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {!wallet?.address ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Connect your wallet to view positions</p>
                  </div>
                ) : positions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No active positions found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {positions.map((position) => {
                      const collection = getCollectionInfo(position.nftContract);
                      const totalDebt = calculateTotalDebt(position.loanAmount, position.interestAccrued);
                      const status = position.active ? 'healthy' : 'liquidated';
                      
                      return (
                        <div
                          key={position.positionId}
                          className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="font-medium">
                                NFT #{position.tokenId}
                              </div>
                              <Badge className={getStatusColor(status)}>
                                {getStatusIcon(status)} {status.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">
                                {formatAmount(totalDebt)} USDT
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Total Debt
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">Collateral Value</div>
                              <div className="font-medium">{formatAmount(position.collateralValue)} USDT</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Loan Amount</div>
                              <div className="font-medium">{formatAmount(position.loanAmount)} USDT</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Interest Accrued</div>
                              <div className="font-medium">{formatAmount(position.interestAccrued)} USDT</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Created</div>
                              <div className="font-medium">
                                {new Date(position.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          {position.active && (
                            <div className="flex gap-2 mt-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedPosition(position.positionId);
                                  setRepayAmount(getMaxRepayAmount(position.positionId));
                                  setShowRepayDialog(true);
                                }}
                              >
                                <Minus className="h-4 w-4 mr-2" />
                                Repay
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // View position details
                                }}
                              >
                                <Info className="h-4 w-4 mr-2" />
                                Details
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Info Tab */}
          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>How NFT Collateral Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">For Borrowers:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                      <li>Select an NFT from your wallet that's supported as collateral</li>
                      <li>Choose the amount of stablecoin you want to borrow (up to the LTV limit)</li>
                      <li>Deposit your NFT and receive instant stablecoin liquidity</li>
                      <li>Pay interest on your loan over time</li>
                      <li>Repay the loan to reclaim your NFT</li>
                    </ol>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Supported Wallets:</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">L</span>
                        </div>
                        <div>
                          <div className="font-medium">LINE Mini Dapp Wallet</div>
                          <div className="text-sm text-muted-foreground">Native LINE wallet integration</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">O</span>
                        </div>
                        <div>
                          <div className="font-medium">OKX Wallet</div>
                          <div className="text-sm text-muted-foreground">Multi-chain wallet support</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">B</span>
                        </div>
                        <div>
                          <div className="font-medium">Bitget Wallet</div>
                          <div className="text-sm text-muted-foreground">Exchange wallet integration</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3">Key Features:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>LINE Integration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Multiple Wallets</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Real-time Pricing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Instant Liquidity</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Borrow Confirmation Dialog */}
        <Dialog open={showBorrowDialog} onOpenChange={setShowBorrowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Borrow</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                You are about to borrow {formatAmount(borrowAmount)} USDT against NFT #{selectedNFT?.tokenId}.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleBorrow}
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Confirm Borrow'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowBorrowDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Repay Confirmation Dialog */}
        <Dialog open={showRepayDialog} onOpenChange={setShowRepayDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Repay</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="repayAmount">Repay Amount (USDT)</Label>
                <Input
                  id="repayAmount"
                  type="number"
                  placeholder="Enter repay amount"
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value)}
                  min="0"
                  step="0.01"
                  disabled={isLoading}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleRepay}
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Confirm Repay'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowRepayDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 LINE Yield NFT Collateral. All rights reserved.</p>
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
