import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowRightLeft, 
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  CreditCard,
  Wallet,
  Zap,
  CheckCircle,
  Info
} from 'lucide-react';
import SwapInterface from './SwapInterface';
import PurchaseInterface from './PurchaseInterface';
import CashOutInterface from './CashOutInterface';
import LINEPaymentIntegration from './LINEPaymentIntegration';

interface TradingWithPaymentsProps {
  className?: string;
}

export const TradingWithPayments: React.FC<TradingWithPaymentsProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState<'trading' | 'store'>('trading');

  const handlePaymentComplete = (paymentData: any) => {
    console.log('Payment completed:', paymentData);
    // Handle payment completion logic here
    // For example, unlock premium features, add gas credits, etc.
  };

  const handleTradeComplete = (tradeData: any) => {
    console.log('Trade completed:', tradeData);
    // Handle trade completion logic here
  };

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Kaia Yield Optimizer</h1>
          <p className="text-muted-foreground">
            Trade tokens and purchase premium features
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Swaps</p>
                  <p className="text-lg font-semibold">45</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Purchases</p>
                  <p className="text-lg font-semibold">12</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Store Items</p>
                  <p className="text-lg font-semibold">4</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Gas Saved</p>
                  <p className="text-lg font-semibold">$125</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Interface */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="trading" className="flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4" />
              Trading
            </TabsTrigger>
            <TabsTrigger value="store" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Store
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trading" className="space-y-6">
            {/* Trading Sub-tabs */}
            <Tabs defaultValue="swap" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="swap" className="flex items-center gap-2">
                  <ArrowRightLeft className="h-4 w-4" />
                  Swap
                </TabsTrigger>
                <TabsTrigger value="purchase" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Purchase
                </TabsTrigger>
                <TabsTrigger value="cashout" className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  Cash Out
                </TabsTrigger>
              </TabsList>

              <TabsContent value="swap">
                <SwapInterface onSwapComplete={handleTradeComplete} />
              </TabsContent>

              <TabsContent value="purchase">
                <PurchaseInterface onPurchaseComplete={handleTradeComplete} />
              </TabsContent>

              <TabsContent value="cashout">
                <CashOutInterface onCashOutComplete={handleTradeComplete} />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="store" className="space-y-6">
            <LINEPaymentIntegration onPaymentComplete={handlePaymentComplete} />
          </TabsContent>
        </Tabs>

        {/* Integration Benefits */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-lg">Integrated Trading & Payment System</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Trading Features
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Token swapping with real-time quotes</li>
                    <li>• DApp Portal token purchasing</li>
                    <li>• Instant cash out to base tokens</li>
                    <li>• Gas abstraction for zero fees</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Payment Features
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• LINE Mini-Dapp payment integration</li>
                    <li>• Fiat and crypto payment support</li>
                    <li>• Premium feature purchases</li>
                    <li>• Secure payment processing</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-green-600 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-medium">Secure & Compliant</p>
                <p>All transactions are processed securely through LINE's Mini-Dapp payment system with proper webhook handling and signature verification. Your funds and data are protected.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TradingWithPayments;

