import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowRightLeft, 
  TrendingUp,
  TrendingDown,
  BarChart3,
  Wallet,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Info,
  Settings,
  History,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/useWallet';
import { formatCurrency } from '@/utils/formatters';
import SwapInterface from './SwapInterface';
import PurchaseInterface from './PurchaseInterface';
import CashOutInterface from './CashOutInterface';

interface TradeStats {
  totalVolume: number;
  totalTrades: number;
  totalFees: number;
  avgGasUsed: number;
  successRate: number;
}

interface RecentTrade {
  id: string;
  type: 'swap' | 'purchase' | 'cashout';
  fromToken: string;
  toToken: string;
  fromAmount: number;
  toAmount: number;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  txHash?: string;
}

interface TradeDashboardProps {
  className?: string;
}

const TradeDashboard: React.FC<TradeDashboardProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState<'swap' | 'purchase' | 'cashout'>('swap');
  const [tradeStats, setTradeStats] = useState<TradeStats>({
    totalVolume: 0,
    totalTrades: 0,
    totalFees: 0,
    avgGasUsed: 0,
    successRate: 0
  });
  const [recentTrades, setRecentTrades] = useState<RecentTrade[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { wallet } = useWallet();
  const { toast } = useToast();

  // Load trade data
  useEffect(() => {
    loadTradeData();
  }, []);

  const loadTradeData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call to load trade data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTradeStats({
        totalVolume: 125000,
        totalTrades: 45,
        totalFees: 375,
        avgGasUsed: 145000,
        successRate: 98.5
      });
      
      setRecentTrades([
        {
          id: '1',
          type: 'swap',
          fromToken: 'KLAY',
          toToken: 'USDT',
          fromAmount: 1000,
          toAmount: 4000,
          timestamp: '2024-01-15T10:30:00Z',
          status: 'completed',
          txHash: '0x...'
        },
        {
          id: '2',
          type: 'purchase',
          fromToken: 'USDT',
          toToken: 'KAI',
          fromAmount: 500,
          toAmount: 3333.33,
          timestamp: '2024-01-15T09:15:00Z',
          status: 'completed',
          txHash: '0x...'
        },
        {
          id: '3',
          type: 'cashout',
          fromToken: 'KAI',
          toToken: 'KLAY',
          fromAmount: 2000,
          toAmount: 300,
          timestamp: '2024-01-15T08:45:00Z',
          status: 'completed',
          txHash: '0x...'
        }
      ]);
    } catch (error) {
      console.error('Failed to load trade data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTradeComplete = (tradeData: any) => {
    // Add new trade to recent trades
    const newTrade: RecentTrade = {
      id: Date.now().toString(),
      type: tradeData.type || 'swap',
      fromToken: tradeData.fromToken.symbol,
      toToken: tradeData.toToken.symbol,
      fromAmount: tradeData.fromAmount,
      toAmount: tradeData.toAmount,
      timestamp: tradeData.timestamp,
      status: 'completed',
      txHash: '0x...'
    };
    
    setRecentTrades(prev => [newTrade, ...prev.slice(0, 9)]); // Keep only 10 most recent
    
    // Update stats
    setTradeStats(prev => ({
      ...prev,
      totalTrades: prev.totalTrades + 1,
      totalVolume: prev.totalVolume + tradeData.fromAmount * tradeData.fromToken.price
    }));
    
    toast({
      title: 'Trade Completed',
      description: `Successfully completed ${newTrade.type} transaction`,
    });
  };

  const getTradeIcon = (type: string) => {
    switch (type) {
      case 'swap':
        return <ArrowRightLeft className="h-4 w-4" />;
      case 'purchase':
        return <TrendingUp className="h-4 w-4" />;
      case 'cashout':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <ArrowRightLeft className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Trade Dashboard</h1>
          <p className="text-muted-foreground">
            Swap, purchase, and cash out tokens on the Kaia ecosystem
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Volume</p>
                  <p className="text-lg font-semibold">${formatCurrency(tradeStats.totalVolume)}</p>
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
                  <p className="text-lg font-semibold">{tradeStats.totalTrades}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Fees</p>
                  <p className="text-lg font-semibold">${formatCurrency(tradeStats.totalFees)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Gas</p>
                  <p className="text-lg font-semibold">{tradeStats.avgGasUsed.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-lg font-semibold">{tradeStats.successRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Trading Interface */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
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

          <TabsContent value="swap" className="space-y-6">
            <SwapInterface 
              onSwapComplete={(data) => handleTradeComplete({ ...data, type: 'swap' })}
            />
          </TabsContent>

          <TabsContent value="purchase" className="space-y-6">
            <PurchaseInterface 
              onPurchaseComplete={(data) => handleTradeComplete({ ...data, type: 'purchase' })}
            />
          </TabsContent>

          <TabsContent value="cashout" className="space-y-6">
            <CashOutInterface 
              onCashOutComplete={(data) => handleTradeComplete({ ...data, type: 'cashout' })}
            />
          </TabsContent>
        </Tabs>

        {/* Recent Trades */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Recent Trades
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentTrades.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent trades</p>
                <p className="text-sm">Start trading to see your transaction history</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTrades.map((trade) => (
                  <div key={trade.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTradeIcon(trade.type)}
                      <div>
                        <p className="font-medium">
                          {trade.fromAmount.toFixed(2)} {trade.fromToken} → {trade.toAmount.toFixed(2)} {trade.toToken}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(trade.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(trade.status)}
                      <Badge variant="outline" className="capitalize">
                        {trade.type}
                      </Badge>
                      {trade.txHash && (
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <ArrowRightLeft className="h-6 w-6" />
                <span>Quick Swap</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <TrendingUp className="h-6 w-6" />
                <span>Buy Tokens</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <TrendingDown className="h-6 w-6" />
                <span>Cash Out</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TradeDashboard;

