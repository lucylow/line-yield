import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PaymentModal from './PaymentModal';
import PaymentHistory from './PaymentHistory';
import { usePayments } from '@/hooks/usePayments';
import { useWallet } from '@/hooks/useWallet';
import { CreditCard, Coins, TrendingUp, DollarSign } from 'lucide-react';

export const PaymentIntegrationExample: React.FC = () => {
  const { wallet } = useWallet();
  const { paymentStats, getPaymentStats } = usePayments(wallet.address);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(10);

  const handlePaymentSuccess = (payment: any) => {
    console.log('Payment successful:', payment);
    // Refresh payment stats
    getPaymentStats();
    // Show success message
    alert(`Payment of $${payment.amount} ${payment.currency.toUpperCase()} successful!`);
  };

  const quickAmounts = [10, 25, 50, 100];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">💳 Payment System</h1>
        <p className="text-gray-600">Make payments with Stripe or Crypto</p>
      </div>

      {/* Payment Stats */}
      {paymentStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Payments</p>
                  <p className="text-2xl font-bold text-blue-600">{paymentStats.totalPayments}</p>
                </div>
                <CreditCard className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${paymentStats.totalAmount.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {paymentStats.successRate.toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Payment Methods</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      Stripe: {paymentStats.stripePayments}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Crypto: {paymentStats.cryptoPayments}
                    </Badge>
                  </div>
                </div>
                <Coins className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Make Payment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Make Payment
            </CardTitle>
            <CardDescription>
              Choose your preferred payment method
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quick Amount Selection */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Quick Amounts</h4>
              <div className="grid grid-cols-2 gap-3">
                {quickAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant={selectedAmount === amount ? "default" : "outline"}
                    onClick={() => setSelectedAmount(amount)}
                    className="h-12"
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Custom Amount</h4>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={selectedAmount}
                  onChange={(e) => setSelectedAmount(Number(e.target.value))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter amount"
                  min="1"
                  max="10000"
                />
                <span className="px-3 py-2 bg-gray-100 rounded-md text-sm text-gray-600">
                  USD
                </span>
              </div>
            </div>

            {/* Payment Button */}
            <Button
              onClick={() => setShowPaymentModal(true)}
              className="w-full h-12 text-lg"
              disabled={!wallet.isConnected}
            >
              {wallet.isConnected ? (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Pay ${selectedAmount}
                </>
              ) : (
                'Connect Wallet to Pay'
              )}
            </Button>

            {!wallet.isConnected && (
              <p className="text-sm text-gray-500 text-center">
                Please connect your wallet to make payments
              </p>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="w-5 h-5" />
              Supported Payment Methods
            </CardTitle>
            <CardDescription>
              Choose from our supported payment options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Stripe Payments */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Stripe Payments
              </h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Credit & Debit Cards
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Apple Pay & Google Pay
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Instant Processing
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  PCI Compliant
                </div>
              </div>
            </div>

            {/* Crypto Payments */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Coins className="w-4 h-4" />
                Crypto Payments
              </h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  USDC & USDT
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  KAIA Network
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Ethereum & Polygon
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Low Fees
                </div>
              </div>
            </div>

            {/* Security Features */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Security Features</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  End-to-End Encryption
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Secure Key Management
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Real-time Fraud Detection
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Audit Trail
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <PaymentHistory />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={selectedAmount}
        currency="usd"
        description="LINE Yield Deposit"
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default PaymentIntegrationExample;


