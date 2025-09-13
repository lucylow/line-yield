import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingDown,
  DollarSign,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Info,
  Shield,
  ArrowDown,
  Wallet
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
  cashOutFee: number;
  minCashOut: number;
  maxCashOut: number;
}

interface CashOutQuote {
  fromToken: Token;
  toToken: Token;
  fromAmount: number;
  toAmount: number;
  fee: number;
  totalReceived: number;
  priceImpact: number;
  gasEstimate: number;
  estimatedTime: string;
  route: string[];
}

interface CashOutInterfaceProps {
  onCashOutComplete?: (cashOutData: any) => void;
  className?: string;
}

const CashOutInterface: React.FC<CashOutInterfaceProps> = ({ onCashOutComplete, className }) => {
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [cashOutQuote, setCashOutQuote] = useState<CashOutQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  
  const { wallet } = useWallet();
  const { toast } = useToast();

  // Tokens that can be cashed out (user's holdings)
  const cashOutTokens: Token[] = [
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
      change24h: 5.2,
      cashOutFee: 0.001,
      minCashOut: 10,
      maxCashOut: 10000
    },
    {
      symbol: 'GAME',
      name: 'GameFi Token',
      address: '0x...',
      decimals: 18,
      balance: 1200.0,
      price: 0.05,
      icon: '🎮',
      color: 'bg-pink-500',
      liquidity: 8000000,
      volume24h: 1500000,
      change24h: 3.8,
      cashOutFee: 0.002,
      minCashOut: 50,
      maxCashOut: 50000
    },
    {
      symbol: 'DEFI',
      name: 'DeFi Protocol Token',
      address: '0x...',
      decimals: 18,
      balance: 800.0,
      price: 0.08,
      icon: '🏦',
      color: 'bg-indigo-500',
      liquidity: 12000000,
      volume24h: 2000000,
      change24h: -2.1,
      cashOutFee: 0.0015,
      minCashOut: 25,
      maxCashOut: 25000
    },
    {
      symbol: 'NFT',
      name: 'NFT Marketplace Token',
      address: '0x...',
      decimals: 18,
      balance: 300.0,
      price: 0.12,
      icon: '🖼️',
      color: 'bg-purple-500',
      liquidity: 6000000,
      volume24h: 800000,
      change24h: 1.5,
      cashOutFee: 0.002,
      minCashOut: 20,
      maxCashOut: 20000
    }
  ];

  // Tokens that can be received (base tokens)
  const receiveTokens: Token[] = [
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
      change24h: 2.5,
      cashOutFee: 0,
      minCashOut: 0,
      maxCashOut: 0
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
      change24h: 0.1,
      cashOutFee: 0,
      minCashOut: 0,
      maxCashOut: 0
    }
  ];

  // Initialize default tokens
  useEffect(() => {
    if (!fromToken) setFromToken(cashOutTokens[0]); // KAI
    if (!toToken) setToToken(receiveTokens[0]); // KLAY
  }, []);

  // Get quote when tokens or amount change
  useEffect(() => {
    if (fromToken && toToken && fromAmount && parseFloat(fromAmount) > 0) {
      getCashOutQuote();
    }
  }, [fromToken, toToken, fromAmount]);

  const getCashOutQuote = async () => {
    if (!fromToken || !toToken || !fromAmount) return;

    setIsQuoteLoading(true);
    try {
      // Simulate API call to get cash out quote
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const fromAmountNum = parseFloat(fromAmount);
      const estimatedToAmount = fromAmountNum * (fromToken.price / toToken.price);
      const fee = fromAmountNum * fromToken.cashOutFee;
      const priceImpact = Math.random() * 2; // Simulate price impact
      const totalReceived = estimatedToAmount - fee;
      
      const quote: CashOutQuote = {
        fromToken,
        toToken,
        fromAmount: fromAmountNum,
        toAmount: estimatedToAmount,
        fee,
        totalReceived,
        priceImpact,
        gasEstimate: 100000,
        estimatedTime: '1-3 minutes',
        route: [fromToken.symbol, 'KLAY', toToken.symbol]
      };
      
      setCashOutQuote(quote);
      setToAmount(totalReceived.toFixed(6));
    } catch (error) {
      console.error('Failed to get quote:', error);
      toast({
        title: 'Quote Error',
        description: 'Failed to get cash out quote. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsQuoteLoading(false);
    }
  };

  const handleCashOut = async () => {
    if (!cashOutQuote || !wallet.connected) return;

    setIsLoading(true);
    try {
      // Simulate cash out transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Cash Out Successful',
        description: `Successfully cashed out ${cashOutQuote.fromAmount} ${cashOutQuote.fromToken.symbol} for ${cashOutQuote.totalReceived.toFixed(6)} ${cashOutQuote.toToken.symbol}`,
      });
      
      // Call completion callback
      onCashOutComplete?.({
        fromToken: cashOutQuote.fromToken,
        toToken: cashOutQuote.toToken,
        fromAmount: cashOutQuote.fromAmount,
        toAmount: cashOutQuote.totalReceived,
        fee: cashOutQuote.fee,
        timestamp: new Date().toISOString()
      });
      
      // Reset form
      setFromAmount('');
      setToAmount('');
      setCashOutQuote(null);
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

  const TokenSelector = ({ 
    token, 
    onTokenSelect, 
    label, 
    amount, 
    onAmountChange,
    tokens,
    isToToken = false 
  }: {
    token: Token | null;
    onTokenSelect: (token: Token) => void;
    label: string;
    amount: string;
    onAmountChange: (amount: string) => void;
    tokens: Token[];
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
          const selectedToken = tokens.find(t => t.symbol === value);
          if (selectedToken) onTokenSelect(selectedToken);
        }}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Select token" />
          </SelectTrigger>
          <SelectContent>
            {tokens.map((t) => (
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
            min={isToToken ? 0 : token?.minCashOut || 0}
            max={isToToken ? undefined : token?.maxCashOut || undefined}
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
          {!isToToken && (
            <span>
              Min: {formatCurrency(token.minCashOut)} | Max: {formatCurrency(token.maxCashOut)}
            </span>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Cash Out Tokens
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <TokenSelector
            token={fromToken}
            onTokenSelect={setFromToken}
            label="Sell"
            amount={fromAmount}
            onAmountChange={setFromAmount}
            tokens={cashOutTokens}
          />

          <div className="flex justify-center">
            <div className="text-2xl">↓</div>
          </div>

          <TokenSelector
            token={toToken}
            onTokenSelect={setToToken}
            label="Receive"
            amount={toAmount}
            onAmountChange={setToAmount}
            tokens={receiveTokens}
            isToToken={true}
          />

          {/* Cash Out Quote Details */}
          {cashOutQuote && (
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Sell Amount</span>
                    <span className="text-sm font-medium">
                      {cashOutQuote.fromAmount.toFixed(6)} {cashOutQuote.fromToken.symbol}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Gross Amount</span>
                    <span className="text-sm font-medium">
                      {cashOutQuote.toAmount.toFixed(6)} {cashOutQuote.toToken.symbol}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Cash Out Fee</span>
                    <span className="text-sm font-medium">
                      {cashOutQuote.fee.toFixed(6)} {cashOutQuote.fromToken.symbol}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Price Impact</span>
                    <span className={`text-sm font-medium ${cashOutQuote.priceImpact > 1 ? 'text-red-500' : 'text-green-500'}`}>
                      {cashOutQuote.priceImpact.toFixed(2)}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-sm font-medium">Total Received</span>
                    <span className="text-sm font-medium">
                      {cashOutQuote.totalReceived.toFixed(6)} {cashOutQuote.toToken.symbol}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Route</span>
                    <span className="text-sm font-medium">
                      {cashOutQuote.route.join(' → ')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Estimated Time</span>
                    <span className="text-sm font-medium">
                      {cashOutQuote.estimatedTime}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cash Out Information */}
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-medium">Cash Out Information</p>
                <p>Convert your DApp Portal tokens back to base tokens (KLAY/USDT). Instant settlement with minimal fees.</p>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Secure Cash Out</p>
                <p>Your transaction is protected by Kaia's security features. Gas fees are sponsored for cash out operations.</p>
              </div>
            </div>
          </div>

          {/* Cash Out Button */}
          <Button 
            onClick={handleCashOut} 
            disabled={!cashOutQuote || !wallet.connected || isLoading || isQuoteLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                Cashing Out...
              </>
            ) : isQuoteLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                Getting Quote...
              </>
            ) : (
              <>
                <TrendingDown className="h-4 w-4 mr-2" />
                {!wallet.connected ? 'Connect Wallet' : 'Cash Out Tokens'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CashOutInterface;

