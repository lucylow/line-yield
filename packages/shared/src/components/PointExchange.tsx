import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRightLeft, 
  Coins, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Calculator,
  Zap
} from 'lucide-react';
import { PointExchangeRate } from '../types/gamification';
import { useT } from '../hooks/useLocalization';
import { cn } from '../utils/cn';

interface PointExchangeProps {
  exchangeRates: PointExchangeRate[];
  userPoints: number;
  onExchange: (points: number, toCurrency: string) => Promise<boolean>;
  loading?: boolean;
  className?: string;
}

export const PointExchange: React.FC<PointExchangeProps> = ({
  exchangeRates,
  userPoints,
  onExchange,
  loading = false,
  className = ''
}) => {
  const t = useT();
  const [selectedRate, setSelectedRate] = useState<PointExchangeRate | null>(
    exchangeRates[0] || null
  );
  const [pointsToExchange, setPointsToExchange] = useState<number>(0);
  const [isExchanging, setIsExchanging] = useState(false);
  const [exchangeResult, setExchangeResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const calculateExchange = (points: number, rate: PointExchangeRate) => {
    const exchangeAmount = points * rate.rate;
    const fee = exchangeAmount * rate.fee;
    const finalAmount = exchangeAmount - fee;
    return { exchangeAmount, fee, finalAmount };
  };

  const handleExchange = async () => {
    if (!selectedRate || pointsToExchange <= 0) return;

    if (pointsToExchange < selectedRate.minAmount) {
      setExchangeResult({
        success: false,
        message: `Minimum exchange amount is ${selectedRate.minAmount} points`
      });
      return;
    }

    if (pointsToExchange > selectedRate.maxAmount) {
      setExchangeResult({
        success: false,
        message: `Maximum exchange amount is ${selectedRate.maxAmount} points`
      });
      return;
    }

    if (pointsToExchange > userPoints) {
      setExchangeResult({
        success: false,
        message: 'Insufficient points balance'
      });
      return;
    }

    setIsExchanging(true);
    setExchangeResult(null);

    try {
      const success = await onExchange(pointsToExchange, selectedRate.toCurrency);
      setExchangeResult({
        success,
        message: success 
          ? `Successfully exchanged ${pointsToExchange} points for ${calculateExchange(pointsToExchange, selectedRate).finalAmount.toFixed(4)} ${selectedRate.toCurrency}`
          : 'Exchange failed. Please try again.'
      });

      if (success) {
        setPointsToExchange(0);
      }
    } catch (error) {
      setExchangeResult({
        success: false,
        message: 'Exchange failed. Please try again.'
      });
    } finally {
      setIsExchanging(false);
    }
  };

  const exchangeCalculation = selectedRate 
    ? calculateExchange(pointsToExchange, selectedRate)
    : { exchangeAmount: 0, fee: 0, finalAmount: 0 };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <ArrowRightLeft className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-xl">Point Exchange</CardTitle>
            <CardDescription>
              Exchange your LINE Yield points for KAIA tokens
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* User Balance */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-600" />
              <span className="font-medium">Your Points Balance</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {userPoints.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Exchange Rates */}
        {exchangeRates.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Select Exchange Rate</Label>
            <div className="grid gap-2">
              {exchangeRates.map((rate) => (
                <div
                  key={`${rate.fromCurrency}-${rate.toCurrency}`}
                  className={cn(
                    'p-3 border rounded-lg cursor-pointer transition-colors',
                    selectedRate?.fromCurrency === rate.fromCurrency && 
                    selectedRate?.toCurrency === rate.toCurrency
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                  onClick={() => setSelectedRate(rate)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {rate.fromCurrency} → {rate.toCurrency}
                      </div>
                      <div className="text-sm text-gray-600">
                        Rate: 1 {rate.fromCurrency} = {rate.rate} {rate.toCurrency}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        Fee: {(rate.fee * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        Min: {rate.minAmount} | Max: {rate.maxAmount}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Exchange Input */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="points-input">Points to Exchange</Label>
            <div className="relative">
              <Input
                id="points-input"
                type="number"
                value={pointsToExchange || ''}
                onChange={(e) => setPointsToExchange(Number(e.target.value))}
                placeholder="Enter amount"
                min={selectedRate?.minAmount || 0}
                max={selectedRate?.maxAmount || userPoints}
                className="pr-20"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                Points
              </div>
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPointsToExchange(selectedRate?.minAmount || 0)}
            >
              Min
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPointsToExchange(Math.floor(userPoints * 0.25))}
            >
              25%
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPointsToExchange(Math.floor(userPoints * 0.5))}
            >
              50%
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPointsToExchange(Math.floor(userPoints * 0.75))}
            >
              75%
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPointsToExchange(userPoints)}
            >
              Max
            </Button>
          </div>
        </div>

        {/* Exchange Calculation */}
        {selectedRate && pointsToExchange > 0 && (
          <div className="p-4 bg-blue-50 rounded-lg space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800">Exchange Calculation</span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Exchange Amount:</span>
                <span className="font-medium">
                  {exchangeCalculation.exchangeAmount.toFixed(4)} {selectedRate.toCurrency}
                </span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Fee ({(selectedRate.fee * 100).toFixed(1)}%):</span>
                <span className="font-medium">
                  -{exchangeCalculation.fee.toFixed(4)} {selectedRate.toCurrency}
                </span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-blue-800">
                <span>You Receive:</span>
                <span>
                  {exchangeCalculation.finalAmount.toFixed(4)} {selectedRate.toCurrency}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Exchange Result */}
        {exchangeResult && (
          <div className={cn(
            'p-4 rounded-lg flex items-center gap-3',
            exchangeResult.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          )}>
            {exchangeResult.success ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span className={cn(
              'text-sm font-medium',
              exchangeResult.success ? 'text-green-800' : 'text-red-800'
            )}>
              {exchangeResult.message}
            </span>
          </div>
        )}

        {/* Exchange Button */}
        <Button
          onClick={handleExchange}
          disabled={!selectedRate || pointsToExchange <= 0 || isExchanging || loading}
          className="w-full"
          size="lg"
        >
          {isExchanging ? (
            <>
              <Zap className="w-4 h-4 mr-2 animate-pulse" />
              Exchanging...
            </>
          ) : (
            <>
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              Exchange Points
            </>
          )}
        </Button>

        {/* Exchange Info */}
        <div className="text-xs text-gray-500 space-y-1">
          <div>• Exchange rates are updated in real-time</div>
          <div>• Transactions are processed on the KAIA blockchain</div>
          <div>• Exchange fees help maintain the ecosystem</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PointExchange;
