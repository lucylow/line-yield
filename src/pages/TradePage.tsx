import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowUpDown, 
  ArrowRightLeft, 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  Wallet,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ExternalLink,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/useWallet';
import { formatCurrency } from '@/utils/formatters';

interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  balance: number;
  price: number;
  icon: string;
  color: string;
}

interface SwapQuote {
  fromToken: Token;
  toToken: Token;
  fromAmount: number;
  toAmount: number;
  priceImpact: number;
  slippage: number;
  fee: number;
  route: string[];
  gasEstimate: number;
}

interface TradePageProps {
  onNavigate?: (page: string) => void;
}

const TradePage: React.FC<TradePageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'swap' | 'purchase' | 'cashout'>('swap');
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [swapQuote, setSwapQuote] = useState<SwapQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [slippage, setSlippage] = useState(0.5);
  const [deadline, setDeadline] = useState(20);
  
  const { wallet } = useWallet();
  const { toast } = useToast();

  // Available tokens in the Kaia ecosystem
  const availableTokens: Token[] = [
    {
      symbol: 'KLAY',
      name: 'Klaytn',
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      balance: 1250.5,
      price: 0.25,
      icon: '🟣',
      color: 'bg-purple-500'
    },
    {
      symbol: 'USDT',
      name: 'Tether USD',
      address: '0x...',
      decimals: 6,
      balance: 2500.0,
      price: 1.0,
      icon: '💵',
      color: 'bg-green-500'
    },
    {
      symbol: 'KAI',
      name: 'Kaia Token',
      address: '0x...',
      decimals: 18,
      balance: 500.0,
      price: 0.15,
      icon: '⚡',
      color: 'bg-blue-500'
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      address: '0x...',
      decimals: 18,
      balance: 2.5,
      price: 2000.0,
      icon: '🔷',
      color: 'bg-gray-500'
    }
  ];

  // Initialize default tokens
  useEffect(() => {
    if (!fromToken) setFromToken(availableTokens[0]); // KLAY
    if (!toToken) setToToken(availableTokens[1]); // USDT
  }, []);

  // Get quote when tokens or amount change
  useEffect(() => {
    if (fromToken && toToken && fromAmount && parseFloat(fromAmount) > 0) {
      getSwapQuote();
    }
  }, [fromToken, toToken, fromAmount]);

  const getSwapQuote = async () => {
    if (!fromToken || !toToken || !fromAmount) return;

    setIsQuoteLoading(true);
    try {
      // Simulate API call to get swap quote
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const fromAmountNum = parseFloat(fromAmount);
      const estimatedToAmount = fromAmountNum * (fromToken.price / toToken.price);
      const priceImpact = Math.random() * 2; // Simulate price impact
      const fee = fromAmountNum * 0.003; // 0.3% fee
      
      const quote: SwapQuote = {
        fromToken,
        toToken,
        fromAmount: fromAmountNum,
        toAmount: estimatedToAmount,
        priceImpact,
        slippage,
        fee,
        route: [fromToken.symbol, 'KLAY', toToken.symbol],
        gasEstimate: 150000
      };
      
      setSwapQuote(quote);
      setToAmount(estimatedToAmount.toFixed(6));
    } catch (error) {
      console.error('Failed to get quote:', error);
      toast({
        title: 'Quote Error',
        description: 'Failed to get swap quote. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsQuoteLoading(false);
    }
  };

  const handleSwapTokens = () => {
    if (fromToken && toToken) {
      setFromToken(toToken);
      setToToken(fromToken);
      setFromAmount(toAmount);
      setToAmount(fromAmount);
    }
  };

  const handleSwap = async () => {
    if (!swapQuote || !wallet.connected) return;

    setIsLoading(true);
    try {
      // Simulate swap transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Swap Successful',
        description: `Successfully swapped ${swapQuote.fromAmount} ${swapQuote.fromToken.symbol} for ${swapQuote.toAmount.toFixed(6)} ${swapQuote.toToken.symbol}`,
      });
      
      // Reset form
      setFromAmount('');
      setToAmount('');
      setSwapQuote(null);
    } catch (error) {
      console.error('Swap failed:', error);
      toast({
        title: 'Swap Failed',
        description: 'Transaction failed. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!fromToken || !toToken || !fromAmount) return;

    setIsLoading(true);
    try {
      // Simulate purchase transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Purchase Successful',
        description: `Successfully purchased ${toAmount} ${toToken.symbol} with ${fromAmount} ${fromToken.symbol}`,
      });
      
      // Reset form
      setFromAmount('');
      setToAmount('');
    } catch (error) {
      console.error('Purchase failed:', error);
      toast({
        title: 'Purchase Failed',
        description: 'Transaction failed. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCashOut = async () => {
    if (!fromToken || !toToken || !fromAmount) return;

    setIsLoading(true);
    try {
      // Simulate cash out transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Cash Out Successful',
        description: `Successfully cashed out ${fromAmount} ${fromToken.symbol} to ${toAmount} ${toToken.symbol}`,
      });
      
      // Reset form
      setFromAmount('');
      setToAmount('');
    } catch (error) {
      console.error('Cash out failed:', error);
      toast({
        title: 'Cash Out Failed',
        description: 'Transaction failed. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getActionButton = () => {
    const isDisabled = !fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0 || isLoading;
    
    switch (activeTab) {
      case 'swap':
        return (
          <Button 
            onClick={handleSwap} 
            disabled={isDisabled}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                Swapping...
              </>
            ) : (
              <>
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                Swap Tokens
              </>
            )}
          </Button>
        );
      case 'purchase':
        return (
          <Button 
            onClick={handlePurchase} 
            disabled={isDisabled}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                Purchasing...
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4 mr-2" />
                Purchase Tokens
              </>
            )}
          </Button>
        );
      case 'cashout':
        return (
          <Button 
            onClick={handleCashOut} 
            disabled={isDisabled}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                Cashing Out...
              </>
            ) : (
              <>
                <TrendingDown className="h-4 w-4 mr-2" />
                Cash Out
              </>
            )}
          </Button>
        );
      default:
        return null;
    }
  };

  const TokenSelector = ({ 
    token, 
    onTokenSelect, 
    label, 
    amount, 
    onAmountChange,
    isToToken = false 
  }: {
    token: Token | null;
    onTokenSelect: (token: Token) => void;
    label: string;
    amount: string;
    onAmountChange: (amount: string) => void;
    isToToken?: boolean;
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      <div className="flex gap-2">
        <Select value={token?.symbol || ''} onValueChange={(value) => {
          const selectedToken = availableTokens.find(t => t.symbol === value);
          if (selectedToken) onTokenSelect(selectedToken);
        }}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Select token" />
          </SelectTrigger>
          <SelectContent>
            {availableTokens.map((t) => (
              <SelectItem key={t.symbol} value={t.symbol}>
                <div className="flex items-center gap-2">
                  <span>{t.icon}</span>
                  <span>{t.symbol}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="flex-1 relative">
          <Input
            type="number"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="0.00"
            step="0.000001"
            min="0"
            className="pr-16"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="absolute right-1 top-1 h-8 px-2 text-xs"
            onClick={() => {
              if (token) {
                onAmountChange(token.balance.toString());
              }
            }}
          >
            MAX
          </Button>
        </div>
      </div>
      
      {token && (
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Balance: {formatCurrency(token.balance)}</span>
          <span>≈ ${formatCurrency(token.balance * token.price)}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Trade Center</h1>
        <p className="text-muted-foreground">
          Swap, purchase, and cash out tokens on the Kaia ecosystem
        </p>
      </div>

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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5" />
                Token Swap
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <TokenSelector
                token={fromToken}
                onTokenSelect={setFromToken}
                label="From"
                amount={fromAmount}
                onAmountChange={setFromAmount}
              />

              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSwapTokens}
                  className="rounded-full p-2"
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>

              <TokenSelector
                token={toToken}
                onTokenSelect={setToToken}
                label="To"
                amount={toAmount}
                onAmountChange={setToAmount}
                isToToken={true}
              />

              {swapQuote && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Rate</span>
                        <span className="text-sm font-medium">
                          1 {swapQuote.fromToken.symbol} = {(swapQuote.fromToken.price / swapQuote.toToken.price).toFixed(6)} {swapQuote.toToken.symbol}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Price Impact</span>
                        <span className={`text-sm font-medium ${swapQuote.priceImpact > 1 ? 'text-red-500' : 'text-green-500'}`}>
                          {swapQuote.priceImpact.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Fee</span>
                        <span className="text-sm font-medium">
                          {swapQuote.fee.toFixed(6)} {swapQuote.fromToken.symbol}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Route</span>
                        <span className="text-sm font-medium">
                          {swapQuote.route.join(' → ')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {getActionButton()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchase" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Purchase Tokens
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <TokenSelector
                token={fromToken}
                onTokenSelect={setFromToken}
                label="Pay with"
                amount={fromAmount}
                onAmountChange={setFromAmount}
              />

              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSwapTokens}
                  className="rounded-full p-2"
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>

              <TokenSelector
                token={toToken}
                onTokenSelect={setToToken}
                label="Receive"
                amount={toAmount}
                onAmountChange={setToAmount}
                isToToken={true}
              />

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Purchase Information</p>
                    <p>You're buying tokens directly from the DApp Portal. This is a secure way to acquire new tokens.</p>
                  </div>
                </div>
              </div>

              {getActionButton()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cashout" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                Cash Out
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <TokenSelector
                token={fromToken}
                onTokenSelect={setFromToken}
                label="Sell"
                amount={fromAmount}
                onAmountChange={setFromAmount}
              />

              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSwapTokens}
                  className="rounded-full p-2"
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>

              <TokenSelector
                token={toToken}
                onTokenSelect={setToToken}
                label="Receive"
                amount={toAmount}
                onAmountChange={setToAmount}
                isToToken={true}
              />

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <div className="text-sm text-green-800">
                    <p className="font-medium">Cash Out Information</p>
                    <p>Convert your DApp Portal tokens back to KLAY or other base tokens. Instant settlement.</p>
                  </div>
                </div>
              </div>

              {getActionButton()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Settings Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Trade Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Slippage Tolerance</label>
              <Select value={slippage.toString()} onValueChange={(value) => setSlippage(parseFloat(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.1">0.1%</SelectItem>
                  <SelectItem value="0.5">0.5%</SelectItem>
                  <SelectItem value="1.0">1.0%</SelectItem>
                  <SelectItem value="2.0">2.0%</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Transaction Deadline</label>
              <Select value={deadline.toString()} onValueChange={(value) => setDeadline(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="20">20 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradePage;

