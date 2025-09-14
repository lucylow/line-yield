import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRightLeft, 
  TrendingUp, 
  AlertTriangle,
  Clock,
  Zap,
  Shield,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: number;
  price: number;
}

interface SwapQuote {
  amountOut: number;
  priceImpact: number;
  fee: number;
  route: string[];
}

interface StablecoinSwapPanelProps {
  userAddress?: string;
  walletBalance: number;
}

export const StablecoinSwapPanel: React.FC<StablecoinSwapPanelProps> = ({
  userAddress,
  walletBalance
}) => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedTokenIn, setSelectedTokenIn] = useState<Token | null>(null);
  const [selectedTokenOut, setSelectedTokenOut] = useState<Token | null>(null);
  const [amountIn, setAmountIn] = useState('');
  const [amountOut, setAmountOut] = useState('');
  const [swapQuote, setSwapQuote] = useState<SwapQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [slippageTolerance, setSlippageTolerance] = useState(0.5);
  const { toast } = useToast();

  // Mock token data
  useEffect(() => {
    const mockTokens: Token[] = [
      {
        address: '0xUSDT',
        symbol: 'USDT',
        name: 'Tether USD',
        decimals: 6,
        balance: 1000,
        price: 1.00
      },
      {
        address: '0xUSDC',
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        balance: 500,
        price: 1.00
      },
      {
        address: '0xDAI',
        symbol: 'DAI',
        name: 'Dai Stablecoin',
        decimals: 18,
        balance: 250,
        price: 1.00
      },
      {
        address: '0xBUSD',
        symbol: 'BUSD',
        name: 'Binance USD',
        decimals: 18,
        balance: 0,
        price: 1.00
      }
    ];
    setTokens(mockTokens);
    setSelectedTokenIn(mockTokens[0]);
    setSelectedTokenOut(mockTokens[1]);
  }, []);

  // Calculate swap quote when inputs change
  useEffect(() => {
    if (selectedTokenIn && selectedTokenOut && amountIn && parseFloat(amountIn) > 0) {
      calculateSwapQuote();
    } else {
      setSwapQuote(null);
      setAmountOut('');
    }
  }, [selectedTokenIn, selectedTokenOut, amountIn]);

  const calculateSwapQuote = async () => {
    if (!selectedTokenIn || !selectedTokenOut || !amountIn) return;

    setIsLoading(true);
    try {
      // Mock API call to get swap quote
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const inputAmount = parseFloat(amountIn);
      const feeRate = 0.003; // 0.3% fee
      const fee = inputAmount * feeRate;
      const swapAmount = inputAmount - fee;
      
      // Mock price impact calculation (simplified)
      const priceImpact = Math.min(swapAmount * 0.001, 5); // Max 5% impact
      const outputAmount = swapAmount * (1 - priceImpact / 100);
      
      const quote: SwapQuote = {
        amountOut: outputAmount,
        priceImpact: priceImpact,
        fee: fee,
        route: [selectedTokenIn.symbol, selectedTokenOut.symbol]
      };
      
      setSwapQuote(quote);
      setAmountOut(outputAmount.toFixed(6));
    } catch (error) {
      console.error('Error calculating swap quote:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwap = async () => {
    if (!userAddress) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to perform swaps.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedTokenIn || !selectedTokenOut || !amountIn || !swapQuote) {
      toast({
        title: "Invalid Swap Parameters",
        description: "Please check your swap parameters and try again.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Mock swap execution
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "Swap Successful",
        description: `Successfully swapped ${amountIn} ${selectedTokenIn.symbol} for ${amountOut} ${selectedTokenOut.symbol}`,
      });
      
      // Reset form
      setAmountIn('');
      setAmountOut('');
      setSwapQuote(null);
    } catch (error) {
      toast({
        title: "Swap Failed",
        description: "There was an error executing the swap. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTokenSwitch = () => {
    if (selectedTokenIn && selectedTokenOut) {
      setSelectedTokenIn(selectedTokenOut);
      setSelectedTokenOut(selectedTokenIn);
      setAmountIn(amountOut);
      setAmountOut(amountIn);
    }
  };

  const getPriceImpactColor = (impact: number) => {
    if (impact < 1) return 'text-green-600';
    if (impact < 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTokenBalance = (token: Token) => {
    return `${token.balance.toLocaleString()} ${token.symbol}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Stablecoin Swap</h2>
          <p className="text-gray-600">Swap between supported stablecoins with optimal pricing</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Gas Fee</p>
            <p className="text-lg font-semibold text-green-600">Free</p>
          </div>
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <Zap className="w-4 h-4 mr-1" />
            Gasless
          </Badge>
        </div>
      </div>

      {/* Swap Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Swap Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-blue-600" />
                Swap Tokens
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Token In */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">From</label>
                <div className="flex gap-2">
                  <select
                    value={selectedTokenIn?.address || ''}
                    onChange={(e) => {
                      const token = tokens.find(t => t.address === e.target.value);
                      setSelectedTokenIn(token || null);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {tokens.map((token) => (
                      <option key={token.address} value={token.address}>
                        {token.symbol} - {formatTokenBalance(token)}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={amountIn}
                    onChange={(e) => setAmountIn(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {selectedTokenIn && (
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Balance: {formatTokenBalance(selectedTokenIn)}</span>
                    <button
                      onClick={() => setAmountIn(selectedTokenIn.balance.toString())}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Max
                    </button>
                  </div>
                )}
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTokenSwitch}
                  className="rounded-full p-2"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </Button>
              </div>

              {/* Token Out */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">To</label>
                <div className="flex gap-2">
                  <select
                    value={selectedTokenOut?.address || ''}
                    onChange={(e) => {
                      const token = tokens.find(t => t.address === e.target.value);
                      setSelectedTokenOut(token || null);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {tokens.map((token) => (
                      <option key={token.address} value={token.address}>
                        {token.symbol} - {formatTokenBalance(token)}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={amountOut}
                    readOnly
                    placeholder="0.00"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>
                {selectedTokenOut && (
                  <div className="text-sm text-gray-500">
                    Balance: {formatTokenBalance(selectedTokenOut)}
                  </div>
                )}
              </div>

              {/* Swap Button */}
              <Button
                onClick={handleSwap}
                disabled={!swapQuote || isLoading || !amountIn || parseFloat(amountIn) <= 0}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Swapping...
                  </>
                ) : (
                  'Swap Tokens'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Swap Details */}
        <div className="space-y-4">
          {/* Swap Quote */}
          {swapQuote && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Swap Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Rate</span>
                  <span className="font-medium">
                    1 {selectedTokenIn?.symbol} = {(swapQuote.amountOut / parseFloat(amountIn)).toFixed(6)} {selectedTokenOut?.symbol}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Fee</span>
                  <span className="font-medium">{swapQuote.fee.toFixed(6)} {selectedTokenIn?.symbol}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Price Impact</span>
                  <span className={`font-medium ${getPriceImpactColor(swapQuote.priceImpact)}`}>
                    {swapQuote.priceImpact.toFixed(2)}%
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Route</span>
                  <span className="font-medium">{swapQuote.route.join(' → ')}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Slippage Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                Slippage Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                {[0.1, 0.5, 1.0].map((slippage) => (
                  <Button
                    key={slippage}
                    variant={slippageTolerance === slippage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSlippageTolerance(slippage)}
                    className={slippageTolerance === slippage ? "bg-blue-600" : ""}
                  >
                    {slippage}%
                  </Button>
                ))}
              </div>
              
              <div className="text-sm text-gray-600">
                <p>Your transaction will revert if the price changes unfavorably by more than this percentage.</p>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-green-600" />
                <span>Gasless transactions</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>Slippage protection</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-purple-600" />
                <span>Optimal pricing</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-orange-600" />
                <span>Instant settlement</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Price Impact Warning */}
      {swapQuote && swapQuote.priceImpact > 3 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">High Price Impact Warning</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              This swap has a high price impact of {swapQuote.priceImpact.toFixed(2)}%. 
              Consider splitting your trade into smaller amounts or increasing slippage tolerance.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};



