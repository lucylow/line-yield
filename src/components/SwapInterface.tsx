import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowUpDown, 
  ArrowRightLeft, 
  TrendingUp,
  TrendingDown,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Info,
  Settings,
  Shield
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
  liquidity: number;
  volume24h: number;
  change24h: number;
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
  minimumReceived: number;
  executionPrice: number;
}

interface SwapInterfaceProps {
  onSwapComplete?: (swapData: any) => void;
  className?: string;
}

const SwapInterface: React.FC<SwapInterfaceProps> = ({ onSwapComplete, className }) => {
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [swapQuote, setSwapQuote] = useState<SwapQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [slippage, setSlippage] = useState(0.5);
  const [deadline, setDeadline] = useState(20);
  const [showSettings, setShowSettings] = useState(false);
  
  const { wallet } = useWallet();
  const { toast } = useToast();

  // Enhanced token list with more data
  const availableTokens: Token[] = [
    {
      symbol: 'KLAY',
      name: 'Klaytn',
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      balance: 1250.5,
      price: 0.25,
      icon: '🟣',
      color: 'bg-purple-500',
      liquidity: 50000000,
      volume24h: 15000000,
      change24h: 2.5
    },
    {
      symbol: 'USDT',
      name: 'Tether USD',
      address: '0x...',
      decimals: 6,
      balance: 2500.0,
      price: 1.0,
      icon: '💵',
      color: 'bg-green-500',
      liquidity: 30000000,
      volume24h: 8000000,
      change24h: 0.1
    },
    {
      symbol: 'KAI',
      name: 'Kaia Token',
      address: '0x...',
      decimals: 18,
      balance: 500.0,
      price: 0.15,
      icon: '⚡',
      color: 'bg-blue-500',
      liquidity: 15000000,
      volume24h: 3000000,
      change24h: 5.2
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      address: '0x...',
      decimals: 18,
      balance: 2.5,
      price: 2000.0,
      icon: '🔷',
      color: 'bg-gray-500',
      liquidity: 25000000,
      volume24h: 5000000,
      change24h: -1.2
    },
    {
      symbol: 'WBTC',
      name: 'Wrapped Bitcoin',
      address: '0x...',
      decimals: 8,
      balance: 0.1,
      price: 45000.0,
      icon: '🟠',
      color: 'bg-orange-500',
      liquidity: 20000000,
      volume24h: 2000000,
      change24h: 3.8
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
  }, [fromToken, toToken, fromAmount, slippage]);

  const getSwapQuote = async () => {
    if (!fromToken || !toToken || !fromAmount) return;

    setIsQuoteLoading(true);
    try {
      // Simulate API call to get swap quote
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const fromAmountNum = parseFloat(fromAmount);
      const estimatedToAmount = fromAmountNum * (fromToken.price / toToken.price);
      const priceImpact = Math.random() * 3; // Simulate price impact
      const fee = fromAmountNum * 0.003; // 0.3% fee
      const minimumReceived = estimatedToAmount * (1 - slippage / 100);
      
      const quote: SwapQuote = {
        fromToken,
        toToken,
        fromAmount: fromAmountNum,
        toAmount: estimatedToAmount,
        priceImpact,
        slippage,
        fee,
        route: [fromToken.symbol, 'KLAY', toToken.symbol],
        gasEstimate: 150000,
        minimumReceived,
        executionPrice: fromToken.price / toToken.price
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
      
      // Call completion callback
      onSwapComplete?.({
        fromToken: swapQuote.fromToken,
        toToken: swapQuote.toToken,
        fromAmount: swapQuote.fromAmount,
        toAmount: swapQuote.toAmount,
        timestamp: new Date().toISOString()
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
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
        {token && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {formatCurrency(token.balance)} {token.symbol}
            </Badge>
            <Badge 
              variant={token.change24h >= 0 ? "default" : "destructive"} 
              className="text-xs"
            >
              {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
            </Badge>
          </div>
        )}
      </div>
      
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
                  <Badge variant="outline" className="text-xs">
                    ${formatCurrency(t.price)}
                  </Badge>
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
            disabled={isToToken && isQuoteLoading}
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
            disabled={isToToken}
          >
            MAX
          </Button>
        </div>
      </div>
      
      {token && (
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>≈ ${formatCurrency(parseFloat(amount || '0') * token.price)}</span>
          <span>Liquidity: ${formatCurrency(token.liquidity)}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5" />
              Token Swap
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Settings Panel */}
          {showSettings && (
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
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
          )}

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

          {/* Quote Details */}
          {swapQuote && (
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Rate</span>
                    <span className="text-sm font-medium">
                      1 {swapQuote.fromToken.symbol} = {swapQuote.executionPrice.toFixed(6)} {swapQuote.toToken.symbol}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Price Impact</span>
                    <span className={`text-sm font-medium ${swapQuote.priceImpact > 1 ? 'text-red-500' : 'text-green-500'}`}>
                      {swapQuote.priceImpact.toFixed(2)}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Minimum Received</span>
                    <span className="text-sm font-medium">
                      {swapQuote.minimumReceived.toFixed(6)} {swapQuote.toToken.symbol}
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
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Gas Estimate</span>
                    <span className="text-sm font-medium">
                      {swapQuote.gasEstimate.toLocaleString()} gas
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Notice */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Secure Swap</p>
                <p>Your transaction is protected by Kaia's security features. Gas fees are sponsored.</p>
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <Button 
            onClick={handleSwap} 
            disabled={!swapQuote || !wallet.connected || isLoading || isQuoteLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                Swapping...
              </>
            ) : isQuoteLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                Getting Quote...
              </>
            ) : (
              <>
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                {!wallet.connected ? 'Connect Wallet' : 'Swap Tokens'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SwapInterface;

