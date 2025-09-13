import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRightLeft, 
  TrendingUp,
  TrendingDown,
  BarChart3,
  Wallet,
  ExternalLink
} from 'lucide-react';
import TradeDashboard from './TradeDashboard';
import SwapInterface from './SwapInterface';
import PurchaseInterface from './PurchaseInterface';
import CashOutInterface from './CashOutInterface';

/**
 * Example showing how to integrate the trading system into your existing app
 */
export const TradingIntegrationExample: React.FC = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'swap' | 'purchase' | 'cashout'>('dashboard');

  const handleTradeComplete = (tradeData: any) => {
    console.log('Trade completed:', tradeData);
    // You can add your own logic here, such as:
    // - Update user balance
    // - Send analytics events
    // - Update transaction history
    // - Show success notifications
  };

  const QuickActionButton = ({ 
    icon: Icon, 
    title, 
    description, 
    onClick, 
    variant = 'outline' 
  }: {
    icon: React.ComponentType<any>;
    title: string;
    description: string;
    onClick: () => void;
    variant?: 'default' | 'outline';
  }) => (
    <Button
      variant={variant}
      onClick={onClick}
      className="h-24 flex flex-col gap-2 p-4"
    >
      <Icon className="h-6 w-6" />
      <div className="text-center">
        <div className="font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
    </Button>
  );

  if (activeView === 'dashboard') {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Trading Center</h1>
          <p className="text-muted-foreground">
            Access the complete trading system for the Kaia ecosystem
          </p>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <QuickActionButton
                icon={ArrowRightLeft}
                title="Token Swap"
                description="Exchange tokens directly"
                onClick={() => setActiveView('swap')}
              />
              <QuickActionButton
                icon={TrendingUp}
                title="Purchase Tokens"
                description="Buy from DApp Portal"
                onClick={() => setActiveView('purchase')}
              />
              <QuickActionButton
                icon={TrendingDown}
                title="Cash Out"
                description="Convert to base tokens"
                onClick={() => setActiveView('cashout')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Trading Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Volume</p>
                  <p className="text-lg font-semibold">$125,000</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Trades</p>
                  <p className="text-lg font-semibold">45</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Tokens</p>
                  <p className="text-lg font-semibold">8</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-lg font-semibold">98.5%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <ArrowRightLeft className="h-4 w-4" />
                  <div>
                    <p className="font-medium">1000 KLAY → 4000 USDT</p>
                    <p className="text-sm text-muted-foreground">2 minutes ago</p>
                  </div>
                </div>
                <Badge variant="outline">Completed</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-4 w-4" />
                  <div>
                    <p className="font-medium">500 USDT → 3333 KAI</p>
                    <p className="text-sm text-muted-foreground">1 hour ago</p>
                  </div>
                </div>
                <Badge variant="outline">Completed</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingDown className="h-4 w-4" />
                  <div>
                    <p className="font-medium">2000 KAI → 300 KLAY</p>
                    <p className="text-sm text-muted-foreground">3 hours ago</p>
                  </div>
                </div>
                <Badge variant="outline">Completed</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Full Dashboard Button */}
        <div className="text-center">
          <Button 
            onClick={() => setActiveView('dashboard')}
            size="lg"
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Open Full Trading Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="outline" 
          onClick={() => setActiveView('dashboard')}
        >
          ← Back to Dashboard
        </Button>
        
        <div className="flex gap-2">
          <Button
            variant={activeView === 'swap' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveView('swap')}
          >
            Swap
          </Button>
          <Button
            variant={activeView === 'purchase' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveView('purchase')}
          >
            Purchase
          </Button>
          <Button
            variant={activeView === 'cashout' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveView('cashout')}
          >
            Cash Out
          </Button>
        </div>
      </div>

      {/* Trading Interface */}
      {activeView === 'swap' && (
        <SwapInterface 
          onSwapComplete={handleTradeComplete}
        />
      )}

      {activeView === 'purchase' && (
        <PurchaseInterface 
          onPurchaseComplete={handleTradeComplete}
        />
      )}

      {activeView === 'cashout' && (
        <CashOutInterface 
          onCashOutComplete={handleTradeComplete}
        />
      )}
    </div>
  );
};

export default TradingIntegrationExample;

