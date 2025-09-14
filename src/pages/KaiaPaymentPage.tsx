import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useKaiaPayments, KaiaPayment } from '@/hooks/useKaiaPayments';
import { useWallet } from '@/hooks/useWallet';
import KaiaPaymentModal from '@/components/KaiaPaymentModal';
import { 
  Coins, 
  Plus, 
  TrendingUp, 
  Wallet, 
  Clock, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  ExternalLink,
  Calculator
} from 'lucide-react';

export default function KaiaPaymentPage() {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<KaiaPayment | null>(null);
  
  const { wallet } = useWallet();
  const {
    isLoading,
    error,
    payments,
    stats,
    balance,
    getUserPayments,
    getPaymentStats,
    getKaiaBalance,
    formatAmount,
    getStatusColor,
    getStatusIcon,
    clearError
  } = useKaiaPayments();

  // Load data on component mount
  useEffect(() => {
    if (wallet.isConnected) {
      getUserPayments();
      getPaymentStats();
      getKaiaBalance();
    }
  }, [wallet.isConnected, getUserPayments, getPaymentStats, getKaiaBalance]);

  const handleRefresh = () => {
    if (wallet.isConnected) {
      getUserPayments();
      getPaymentStats();
      getKaiaBalance();
    }
  };

  const handlePaymentClick = (payment: KaiaPayment) => {
    setSelectedPayment(payment);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionUrl = (txHash: string) => {
    return `https://scope.klaytn.com/tx/${txHash}`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Coins className="w-8 h-8 text-blue-600" />
            KAIA Payments
          </h1>
          <p className="text-gray-600 mt-2">
            Manage KAIA-based payments with automatic fee calculation and secure transactions
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setIsPaymentModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Payment
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button variant="link" onClick={clearError} className="ml-2 p-0 h-auto">
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatAmount(stats.totalVolumeProcessed)} KAIA</div>
              <p className="text-xs text-muted-foreground">All time processed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatAmount(stats.totalFeesCollected)} KAIA</div>
              <p className="text-xs text-muted-foreground">Platform + Loyalty fees</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPayments}</div>
              <p className="text-xs text-muted-foreground">All transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Balance</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatAmount(balance)} KAIA</div>
              <p className="text-xs text-muted-foreground">Available for payments</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                Your recent KAIA payment transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <div className="text-center py-8">
                  <Coins className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No payments yet</h3>
                  <p className="text-gray-500 mb-4">Create your first KAIA payment to get started</p>
                  <Button onClick={() => setIsPaymentModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Payment
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <Card 
                      key={payment.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handlePaymentClick(payment)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Coins className="w-5 h-5 text-blue-600" />
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">Payment #{payment.paymentId}</h3>
                                <Badge className={getStatusColor(payment.status)}>
                                  {getStatusIcon(payment.status)} {payment.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">
                                {payment.description || payment.productId}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDate(payment.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatAmount(payment.amount)} KAIA</div>
                            <div className="text-sm text-gray-600">
                              {payment.buyerAddress === wallet.address ? 'Sent' : 'Received'}
                            </div>
                            {payment.txHash && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mt-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(getTransactionUrl(payment.txHash), '_blank');
                                }}
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                View TX
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fee Structure</CardTitle>
              <CardDescription>
                Current fee percentages and structure
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {stats.platformFeePercent / 100}%
                    </div>
                    <div className="text-sm text-gray-600">Platform Fee</div>
                    <div className="text-xs text-gray-500 mt-1">LINE NEXT Platform</div>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {stats.loyaltyFeePercent / 100}%
                    </div>
                    <div className="text-sm text-gray-600">Loyalty Fee</div>
                    <div className="text-xs text-gray-500 mt-1">Rewards Program</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {(100 - stats.platformFeePercent / 100 - stats.loyaltyFeePercent / 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Seller Payout</div>
                    <div className="text-xs text-gray-500 mt-1">Net to Seller</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Loading fee structure...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Modal */}
      <KaiaPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={() => {
          setIsPaymentModalOpen(false);
          handleRefresh();
        }}
      />

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>Payment #{selectedPayment.paymentId}</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedPayment(null)}>
                <XCircle className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Amount:</span>
                  <span className="font-medium">{formatAmount(selectedPayment.amount)} KAIA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Platform Fee:</span>
                  <span className="text-red-600">-{formatAmount(selectedPayment.platformFee)} KAIA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Loyalty Fee:</span>
                  <span className="text-red-600">-{formatAmount(selectedPayment.loyaltyFee)} KAIA</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Seller Payout:</span>
                  <span className="text-green-600">{formatAmount(selectedPayment.sellerPayout)} KAIA</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge className={getStatusColor(selectedPayment.status)}>
                    {getStatusIcon(selectedPayment.status)} {selectedPayment.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Created:</span>
                  <span className="text-sm">{formatDate(selectedPayment.createdAt)}</span>
                </div>
                {selectedPayment.completedAt && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Completed:</span>
                    <span className="text-sm">{formatDate(selectedPayment.completedAt)}</span>
                  </div>
                )}
              </div>

              {selectedPayment.txHash && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(getTransactionUrl(selectedPayment.txHash), '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Transaction
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

