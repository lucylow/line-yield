import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp,
  DollarSign,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Info,
  Shield,
  CreditCard,
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
  available: boolean;
  minPurchase: number;
  maxPurchase: number;
  description: string;
  category: string;
}

interface PurchaseQuote {
  fromToken: Token;
  toToken: Token;
  fromAmount: number;
  toAmount: number;
  fee: number;
  totalCost: number;
  discount: number;
  gasEstimate: number;
  estimatedTime: string;
}

interface PurchaseInterfaceProps {
  onPurchaseComplete?: (purchaseData: any) => void;
  className?: string;
}

const PurchaseInterface: React.FC<PurchaseInterfaceProps> = ({ onPurchaseComplete, className }) => {
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [purchaseQuote, setPurchaseQuote] = useState<PurchaseQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'card'>('wallet');
  
  const { wallet } = useWallet();
  const { toast } = useToast();

  // Payment tokens (what user pays with)
  const paymentTokens: Token[] = [
    {
      symbol: 'KLAY',
      name: 'Klaytn',
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      balance: 1250.5,
      price: 0.25,
      icon: '🟣',
      color: 'bg-purple-500',
      available: true,
      minPurchase: 0,
      maxPurchase: 0,
      description: 'Native Kaia token',
      category: 'payment'
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
      available: true,
      minPurchase: 0,
      maxPurchase: 0,
      description: 'Stablecoin',
      category: 'payment'
    }
  ];

  // Available tokens to purchase from DApp Portal
  const purchasableTokens: Token[] = [
    {
      symbol: 'KAI',
      name: 'Kaia Token',
      address: '0x...',
      decimals: 18,
      balance: 0,
      price: 0.15,
      icon: '⚡',
      color: 'bg-blue-500',
      available: true,
      minPurchase: 10,
      maxPurchase: 10000,
      description: 'Official Kaia ecosystem token',
      category: 'ecosystem'
    },
    {
      symbol: 'GAME',
      name: 'GameFi Token',
      address: '0x...',
      decimals: 18,
      balance: 0,
      price: 0.05,
      icon: '🎮',
      color: 'bg-pink-500',
      available: true,
      minPurchase: 50,
      maxPurchase: 50000,
      description: 'Gaming ecosystem token',
      category: 'gaming'
    },
    {
      symbol: 'DEFI',
      name: 'DeFi Protocol Token',
      address: '0x...',
      decimals: 18,
      balance: 0,
      price: 0.08,
      icon: '🏦',
      color: 'bg-indigo-500',
      available: true,
      minPurchase: 25,
      maxPurchase: 25000,
      description: 'DeFi protocol governance token',
      category: 'defi'
    },
    {
      symbol: 'NFT',
      name: 'NFT Marketplace Token',
      address: '0x...',
      decimals: 18,
      balance: 0,
      price: 0.12,
      icon: '🖼️',
      color: 'bg-purple-500',
      available: true,
      minPurchase: 20,
      maxPurchase: 20000,
      description: 'NFT marketplace utility token',
      category: 'nft'
    }
  ];

  // Initialize default tokens
  useEffect(() => {
    if (!fromToken) setFromToken(paymentTokens[0]); // KLAY
    if (!toToken) setToToken(purchasableTokens[0]); // KAI
  }, []);

  // Get quote when tokens or amount change
  useEffect(() => {
    if (fromToken && toToken && fromAmount && parseFloat(fromAmount) > 0) {
      getPurchaseQuote();
    }
  }, [fromToken, toToken, fromAmount]);

  const getPurchaseQuote = async () => {
    if (!fromToken || !toToken || !fromAmount) return;

    setIsQuoteLoading(true);
    try {
      // Simulate API call to get purchase quote
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const fromAmountNum = parseFloat(fromAmount);
      const estimatedToAmount = fromAmountNum * (fromToken.price / toToken.price);
      const fee = fromAmountNum * 0.002; // 0.2% fee for DApp Portal purchases
      const discount = fromAmountNum * 0.01; // 1% discount for early adopters
      const totalCost = fromAmountNum + fee - discount;
      
      const quote: PurchaseQuote = {
        fromToken,
        toToken,
        fromAmount: fromAmountNum,
        toAmount: estimatedToAmount,
        fee,
        totalCost,
        discount,
        gasEstimate: 120000,
        estimatedTime: '2-5 minutes'
      };
      
      setPurchaseQuote(quote);
      setToAmount(estimatedToAmount.toFixed(6));
    } catch (error) {
      console.error('Failed to get quote:', error);
      toast({
        title: 'Quote Error',
        description: 'Failed to get purchase quote. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsQuoteLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!purchaseQuote || !wallet.connected) return;

    setIsLoading(true);
    try {
      // Simulate purchase transaction
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: 'Purchase Successful',
        description: `Successfully purchased ${purchaseQuote.toAmount.toFixed(6)} ${purchaseQuote.toToken.symbol} for ${purchaseQuote.totalCost.toFixed(6)} ${purchaseQuote.fromToken.symbol}`,
      });
      
      // Call completion callback
      onPurchaseComplete?.({
        fromToken: purchaseQuote.fromToken,
        toToken: purchaseQuote.toToken,
        fromAmount: purchaseQuote.fromAmount,
        toAmount: purchaseQuote.toAmount,
        totalCost: purchaseQuote.totalCost,
        timestamp: new Date().toISOString()
      });
      
      // Reset form
      setFromAmount('');
      setToAmount('');
      setPurchaseQuote(null);
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
            {isToToken && (
              <Badge variant="secondary" className="text-xs">
                {token.category.toUpperCase()}
              </Badge>
            )}
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
            min={isToToken ? token?.minPurchase || 0 : 0}
            max={isToToken ? token?.maxPurchase || undefined : undefined}
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
          {isToToken && (
            <span>
              Min: {formatCurrency(token.minPurchase)} | Max: {formatCurrency(token.maxPurchase)}
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
            <TrendingUp className="h-5 w-5" />
            Purchase Tokens
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Payment Method Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Payment Method</label>
            <div className="flex gap-2">
              <Button
                variant={paymentMethod === 'wallet' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPaymentMethod('wallet')}
                className="flex-1"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Wallet
              </Button>
              <Button
                variant={paymentMethod === 'card' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPaymentMethod('card')}
                className="flex-1"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Credit Card
              </Button>
            </div>
          </div>

          <TokenSelector
            token={fromToken}
            onTokenSelect={setFromToken}
            label="Pay with"
            amount={fromAmount}
            onAmountChange={setFromAmount}
            tokens={paymentTokens}
          />

          <div className="flex justify-center">
            <div className="text-2xl">↓</div>
          </div>

          <TokenSelector
            token={toToken}
            onTokenSelect={setToToken}
            label="Purchase"
            amount={toAmount}
            onAmountChange={setToAmount}
            tokens={purchasableTokens}
            isToToken={true}
          />

          {/* Token Information */}
          {toToken && (
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{toToken.icon}</span>
                    <div>
                      <h4 className="font-medium">{toToken.name}</h4>
                      <p className="text-sm text-muted-foreground">{toToken.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{toToken.category.toUpperCase()}</Badge>
                    <Badge variant="secondary">${formatCurrency(toToken.price)}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Purchase Quote Details */}
          {purchaseQuote && (
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Purchase Amount</span>
                    <span className="text-sm font-medium">
                      {purchaseQuote.toAmount.toFixed(6)} {purchaseQuote.toToken.symbol}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Fee</span>
                    <span className="text-sm font-medium">
                      {purchaseQuote.fee.toFixed(6)} {purchaseQuote.fromToken.symbol}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Discount</span>
                    <span className="text-sm font-medium text-green-600">
                      -{purchaseQuote.discount.toFixed(6)} {purchaseQuote.fromToken.symbol}
                    </span>
                  </div>
                  
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-sm font-medium">Total Cost</span>
                    <span className="text-sm font-medium">
                      {purchaseQuote.totalCost.toFixed(6)} {purchaseQuote.fromToken.symbol}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Estimated Time</span>
                    <span className="text-sm font-medium">
                      {purchaseQuote.estimatedTime}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* DApp Portal Notice */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">DApp Portal Purchase</p>
                <p>You're buying tokens directly from the official DApp Portal. This is a secure way to acquire new tokens with early adopter discounts.</p>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-green-600 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-medium">Secure Purchase</p>
                <p>Your transaction is protected by Kaia's security features. Gas fees are sponsored and you get early adopter discounts.</p>
              </div>
            </div>
          </div>

          {/* Purchase Button */}
          <Button 
            onClick={handlePurchase} 
            disabled={!purchaseQuote || !wallet.connected || isLoading || isQuoteLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                Purchasing...
              </>
            ) : isQuoteLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                Getting Quote...
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4 mr-2" />
                {!wallet.connected ? 'Connect Wallet' : 'Purchase Tokens'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseInterface;

