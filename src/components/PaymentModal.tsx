import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePayments } from '@/hooks/usePayments';
import { useWallet } from '@/hooks/useWallet';
import { X, CreditCard, Coins, CheckCircle, AlertCircle } from 'lucide-react';

// Load Stripe publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key_here');

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount?: number;
  currency?: string;
  description?: string;
  onSuccess?: (payment: any) => void;
}

interface StripePaymentFormProps {
  amount: number;
  currency: string;
  description: string;
  onSuccess: (payment: any) => void;
  onError: (error: string) => void;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  amount,
  currency,
  description,
  onSuccess,
  onError
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { createStripePayment, confirmStripePayment, isLoading } = usePayments();
  const { wallet } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState<any>(null);

  useEffect(() => {
    // Create payment intent when component mounts
    const createIntent = async () => {
      if (wallet.address) {
        const intent = await createStripePayment(amount, currency, {
          description,
          wallet_address: wallet.address
        });
        setPaymentIntent(intent);
      }
    };

    createIntent();
  }, [amount, currency, description, wallet.address, createStripePayment]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !paymentIntent) {
      return;
    }

    setIsProcessing(true);

    try {
      // Confirm the payment with Stripe
      const result = await stripe.confirmCardPayment(paymentIntent.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (result.error) {
        onError(`Payment failed: ${result.error.message}`);
      } else if (result.paymentIntent.status === 'succeeded') {
        // Confirm payment on our backend
        const confirmedPayment = await confirmStripePayment(paymentIntent.id);
        onSuccess(confirmedPayment);
      }
    } catch (error) {
      onError(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="card-element">Card Details</Label>
        <div className="p-3 border border-gray-300 rounded-md">
          <CardElement
            id="card-element"
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
              },
            }}
          />
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-medium">Total Amount:</span>
          <span className="text-lg font-bold">
            ${amount.toFixed(2)} {currency.toUpperCase()}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>

      <Button
        type="submit"
        disabled={!stripe || !elements || isProcessing || isLoading}
        className="w-full"
      >
        {isProcessing || isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Pay with Card
          </>
        )}
      </Button>
    </form>
  );
};

const CryptoPaymentForm: React.FC<{
  amount: number;
  currency: string;
  description: string;
  onSuccess: (payment: any) => void;
  onError: (error: string) => void;
}> = ({ amount, currency, description, onSuccess, onError }) => {
  const { createCryptoPayment, isLoading } = usePayments();
  const { wallet } = useWallet();
  const [selectedToken, setSelectedToken] = useState('USDC');
  const [selectedNetwork, setSelectedNetwork] = useState<'kaia' | 'ethereum' | 'polygon'>('kaia');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!wallet.address) {
      onError('Please connect your wallet first');
      return;
    }

    setIsProcessing(true);

    try {
      const cryptoPayment = await createCryptoPayment(
        amount.toString(),
        selectedToken,
        wallet.address, // Using wallet address as recipient for demo
        selectedNetwork
      );

      if (cryptoPayment) {
        onSuccess(cryptoPayment);
      }
    } catch (error) {
      onError(`Crypto payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="token">Token</Label>
        <Select value={selectedToken} onValueChange={setSelectedToken}>
          <SelectTrigger>
            <SelectValue placeholder="Select token" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USDC">USDC</SelectItem>
            <SelectItem value="USDT">USDT</SelectItem>
            <SelectItem value="KLAY">KLAY</SelectItem>
            <SelectItem value="ETH">ETH</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="network">Network</Label>
        <Select value={selectedNetwork} onValueChange={(value: any) => setSelectedNetwork(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select network" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="kaia">KAIA</SelectItem>
            <SelectItem value="ethereum">Ethereum</SelectItem>
            <SelectItem value="polygon">Polygon</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-medium">Total Amount:</span>
          <span className="text-lg font-bold">
            {amount} {selectedToken}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
        <p className="text-xs text-gray-500 mt-2">
          Network: {selectedNetwork.toUpperCase()}
        </p>
      </div>

      <Button
        type="submit"
        disabled={!wallet.isConnected || isProcessing || isLoading}
        className="w-full"
      >
        {isProcessing || isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Processing...
          </>
        ) : (
          <>
            <Coins className="w-4 h-4 mr-2" />
            Pay with Crypto
          </>
        )}
      </Button>

      {!wallet.isConnected && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please connect your wallet to make crypto payments.
          </AlertDescription>
        </Alert>
      )}
    </form>
  );
};

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  amount = 10,
  currency = 'usd',
  description = 'LINE Yield Deposit',
  onSuccess
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'crypto'>('stripe');
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPaymentResult(null);
      setError(null);
    }
  }, [isOpen]);

  const handleSuccess = (payment: any) => {
    setPaymentResult(payment);
    if (onSuccess) {
      onSuccess(payment);
    }
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Make Payment</CardTitle>
            <CardDescription>
              Choose your preferred payment method
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent>
          {paymentResult ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-600">Payment Successful!</h3>
                <p className="text-gray-600 mt-2">
                  Your payment of ${amount} {currency.toUpperCase()} has been processed.
                </p>
                {paymentResult.txHash && (
                  <p className="text-sm text-gray-500 mt-2">
                    Transaction: {paymentResult.txHash.slice(0, 10)}...
                  </p>
                )}
              </div>
              <Button onClick={onClose} className="w-full">
                Close
              </Button>
            </div>
          ) : (
            <>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Tabs value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="stripe" className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Card
                  </TabsTrigger>
                  <TabsTrigger value="crypto" className="flex items-center gap-2">
                    <Coins className="w-4 h-4" />
                    Crypto
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="stripe" className="mt-4">
                  <Elements stripe={stripePromise}>
                    <StripePaymentForm
                      amount={amount}
                      currency={currency}
                      description={description}
                      onSuccess={handleSuccess}
                      onError={handleError}
                    />
                  </Elements>
                </TabsContent>

                <TabsContent value="crypto" className="mt-4">
                  <CryptoPaymentForm
                    amount={amount}
                    currency={currency}
                    description={description}
                    onSuccess={handleSuccess}
                    onError={handleError}
                  />
                </TabsContent>
              </Tabs>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentModal;


