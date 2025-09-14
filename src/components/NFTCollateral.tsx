import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNFTCollateral } from '../hooks/useNFTCollateral';
import { useWallet } from '../hooks/useWallet';
import { 
  Image, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Shield,
  Zap,
  RefreshCw,
  Eye,
  Download,
  Plus,
  Minus,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NFTCollateralProps {
  className?: string;
}

export const NFTCollateral: React.FC<NFTCollateralProps> = ({ className }) => {
  const { wallet } = useWallet();
  const { toast } = useToast();
  const {
    positions,
    collections,
    userNFTs,
    vaultStats,
    liquidationParams,
    isLoading,
    error,
    loadUserPositions,
    loadUserNFTs,
    mockBorrow,
    mockRepay,
    clearError,
    refresh,
    formatAmount,
    formatLTV,
    formatInterestRate,
    calculateTotalDebt,
    getPositionStatus,
    getStatusColor,
    getStatusIcon,
  } = useNFTCollateral();

  const [activeTab, setActiveTab] = useState('borrow');
  const [selectedNFT, setSelectedNFT] = useState<{ contract: string; tokenId: string } | null>(null);
  const [borrowAmount, setBorrowAmount] = useState('');
  const [repayAmount, setRepayAmount] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [showBorrowDialog, setShowBorrowDialog] = useState(false);
  const [showRepayDialog, setShowRepayDialog] = useState(false);

  // Load user data when wallet connects
  React.useEffect(() => {
    if (wallet?.address) {
      loadUserPositions(wallet.address);
      loadUserNFTs(wallet.address);
    }
  }, [wallet?.address, loadUserPositions, loadUserNFTs]);

  const handleBorrow = async () => {
    if (!wallet?.address || !selectedNFT || !borrowAmount) {
      toast({
        title: 'Missing Information',
        description: 'Please select an NFT and enter borrow amount',
        variant: 'destructive',
      });
      return;
    }

    try {
      await mockBorrow({
        nftContract: selectedNFT.contract,
        tokenId: selectedNFT.tokenId,
        borrowAmount,
        userAddress: wallet.address,
      });

      toast({
        title: 'Borrow Successful',
        description: `Borrowed ${formatAmount(borrowAmount)} USDT against NFT`,
      });

      setBorrowAmount('');
      setSelectedNFT(null);
      setShowBorrowDialog(false);
    } catch (err) {
      console.error('Borrow failed:', err);
    }
  };

  const handleRepay = async () => {
    if (!wallet?.address || !selectedPosition || !repayAmount) {
      toast({
        title: 'Missing Information',
        description: 'Please select a position and enter repay amount',
        variant: 'destructive',
      });
      return;
    }

    try {
      await mockRepay({
        positionId: selectedPosition,
        repayAmount,
        userAddress: wallet.address,
      });

      toast({
        title: 'Repay Successful',
        description: `Repaid ${formatAmount(repayAmount)} USDT`,
      });

      setRepayAmount('');
      setSelectedPosition(null);
      setShowRepayDialog(false);
    } catch (err) {
      console.error('Repay failed:', err);
    }
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

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">NFT Collateral</h2>
        <p className="text-muted-foreground">
          Use your NFTs as collateral to borrow stablecoins
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-red-600 mt-1">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={clearError}
              className="mt-2"
            >
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Vault Statistics */}
      {vaultStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
      )}

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
          <TabsTrigger value="collections" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Collections
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
                  onClick={() => wallet?.address && loadUserPositions(wallet.address)}
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
                    const status = getPositionStatus(position, collection?.liquidationThreshold || 8000);
                    
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

        {/* Collections Tab */}
        <TabsContent value="collections">
          <Card>
            <CardHeader>
              <CardTitle>Supported Collections</CardTitle>
            </CardHeader>
            <CardContent>
              {collections.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No supported collections found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {collections.map((collection) => (
                    <div
                      key={collection.contractAddress}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-medium">
                          {collection.contractAddress.slice(0, 10)}...
                        </div>
                        <Badge className={collection.active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}>
                          {collection.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Max LTV</div>
                          <div className="font-medium">{formatLTV(collection.maxLTV)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Liquidation Threshold</div>
                          <div className="font-medium">{formatLTV(collection.liquidationThreshold)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Interest Rate</div>
                          <div className="font-medium">{formatInterestRate(collection.interestRate)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
    </div>
  );
};

