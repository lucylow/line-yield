import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/useWallet';
import { X, Coins, Calculator, Clock, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

interface KaiaPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerAddress?: string;
  productId?: string;
  description?: string;
  amount?: string;
  onSuccess?: (payment: any) => void;
}

interface PaymentFees {
  platformFee: string;
  loyaltyFee: string;
  sellerPayout: string;
}

export const KaiaPaymentModal: React.FC<KaiaPaymentModalProps> = ({
  isOpen,
  onClose,
  sellerAddress = '',
  productId = '',
  description = '',
  amount = '0',
  onSuccess
}) => {
  const [paymentAmount, setPaymentAmount] = useState(amount);
  const [sellerAddr, setSellerAddr] = useState(sellerAddress);
  const [product, setProduct] = useState(productId);
  const [desc, setDesc] = useState(description);
  const [fees, setFees] = useState<PaymentFees | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { wallet } = useWallet();
  const { toast } = useToast();

  // Calculate fees when amount changes
  useEffect(() => {
    if (paymentAmount && parseFloat(paymentAmount) > 0) {
      calculateFees();
    } else {
      setFees(null);
    }
  }, [paymentAmount]);

  const calculateFees = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) return;
    
    setIsCalculating(true);
    try {
      const response = await fetch('/api/kaia-payments/fees/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: paymentAmount })
      });
      
      const data = await response.json();
      if (data.success) {
        setFees(data.data);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error('Error calculating fees:', err);
      toast({
        title: "Error",
        description: "Failed to calculate fees",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleCreatePayment = async () => {
    if (!wallet.isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!sellerAddr || !product || !paymentAmount) {
      setError('Please fill in all required fields');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/kaia-payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerAddress: sellerAddr,
          amount: paymentAmount,
          productId: product,
          description: desc,
          buyerAddress: wallet.address
        })
      });

      const data = await response.json();
      if (data.success) {
        setPaymentResult(data.data);
        toast({
          title: "Payment Created",
          description: `Payment ID: ${data.data.paymentId}`,
        });
        
        if (onSuccess) {
          onSuccess(data.data);
        }
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create payment';
      setError(errorMessage);
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setPaymentResult(null);
    setError(null);
    setFees(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-blue-600" />
              KAIA Payment
            </CardTitle>
            <CardDescription>
              Create a secure KAIA payment with automatic fee calculation
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {paymentResult ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-600">Payment Created!</h3>
                <p className="text-gray-600 mt-2">
                  Payment ID: <Badge variant="outline">{paymentResult.paymentId}</Badge>
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Amount: {paymentAmount} KAIA
                </p>
              </div>
              <div className="space-y-2">
                <Button onClick={handleClose} className="w-full">
                  Close
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open(`https://scope.klaytn.com/tx/${paymentResult.txHash}`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Transaction
                </Button>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="seller-address">Seller Address *</Label>
                  <Input
                    id="seller-address"
                    placeholder="0x..."
                    value={sellerAddr}
                    onChange={(e) => setSellerAddr(e.target.value)}
                    disabled={!!sellerAddress}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product-id">Product ID *</Label>
                  <Input
                    id="product-id"
                    placeholder="product-123"
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    disabled={!!productId}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Payment for..."
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    disabled={!!description}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (KAIA) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.001"
                    min="0.001"
                    placeholder="0.001"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    disabled={!!amount}
                  />
                </div>
              </div>

              {fees && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Calculator className="w-4 h-4" />
                      Fee Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Payment Amount:</span>
                      <span className="font-medium">{paymentAmount} KAIA</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Platform Fee (2.5%):</span>
                      <span className="text-red-600">-{fees.platformFee} KAIA</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Loyalty Fee (1.0%):</span>
                      <span className="text-red-600">-{fees.loyaltyFee} KAIA</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center font-semibold">
                      <span>Seller Payout:</span>
                      <span className="text-green-600">{fees.sellerPayout} KAIA</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                <Button
                  onClick={handleCreatePayment}
                  disabled={!wallet.isConnected || isProcessing || isCalculating || !fees}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Payment...
                    </>
                  ) : (
                    <>
                      <Coins className="w-4 h-4 mr-2" />
                      Create KAIA Payment
                    </>
                  )}
                </Button>

                {!wallet.isConnected && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Please connect your wallet to create payments.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default KaiaPaymentModal;

