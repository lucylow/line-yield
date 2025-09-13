import React, { useState, useEffect } from 'react';
import { usePayments } from '@/hooks/usePayments';
import { useWallet } from '@/hooks/useWallet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, Coins, RefreshCw, ExternalLink } from 'lucide-react';

interface PaymentHistoryProps {
  className?: string;
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({ className = '' }) => {
  const { wallet } = useWallet();
  const {
    isLoading,
    error,
    paymentHistory,
    paymentStats,
    getPaymentHistory,
    getPaymentStats,
    clearError,
    formatAmount,
    getStatusColor,
    getStatusIcon
  } = usePayments(wallet.address);

  const [selectedFilter, setSelectedFilter] = useState<'all' | 'stripe' | 'crypto'>('all');

  useEffect(() => {
    if (wallet.isConnected && wallet.address) {
      getPaymentHistory();
      getPaymentStats();
    }
  }, [wallet.isConnected, wallet.address, getPaymentHistory, getPaymentStats]);

  const filteredHistory = paymentHistory.filter(payment => {
    if (selectedFilter === 'all') return true;
    return payment.type === selectedFilter;
  });

  const handleRefresh = () => {
    if (wallet.address) {
      getPaymentHistory();
      getPaymentStats();
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'stripe' ? (
      <CreditCard className="w-4 h-4" />
    ) : (
      <Coins className="w-4 h-4" />
    );
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

  if (!wallet.isConnected) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <CreditCard className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Wallet</h3>
          <p className="text-gray-600">Connect your wallet to view payment history</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Payment Stats */}
      {paymentStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {paymentStats.totalPayments}
              </div>
              <div className="text-sm text-gray-600">Total Payments</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {formatAmount(paymentStats.totalAmount, 'usd')}
              </div>
              <div className="text-sm text-gray-600">Total Amount</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                {paymentStats.successRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">
                {paymentStats.stripePayments}/{paymentStats.cryptoPayments}
              </div>
              <div className="text-sm text-gray-600">Stripe/Crypto</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                Your recent payment transactions
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All</option>
                <option value="stripe">Stripe</option>
                <option value="crypto">Crypto</option>
              </select>
              <Button
                onClick={handleRefresh}
                disabled={isLoading}
                size="sm"
                variant="outline"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                {error}
                <Button onClick={clearError} variant="link" className="ml-2 p-0 h-auto">
                  Clear
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading payment history...</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No Payments Yet</h3>
              <p>Your payment history will appear here once you make your first payment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-full">
                      {getTypeIcon(payment.type)}
                    </div>
                    <div>
                      <div className="font-medium">
                        {payment.type === 'stripe' ? 'Card Payment' : 'Crypto Payment'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatDate(payment.createdAt)}
                      </div>
                      {payment.txHash && (
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <ExternalLink className="w-3 h-3" />
                          {payment.txHash.slice(0, 10)}...
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatAmount(payment.amount, payment.currency)}
                    </div>
                    <Badge className={`text-xs ${getStatusColor(payment.status)}`}>
                      {getStatusIcon(payment.status)} {payment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentHistory;


