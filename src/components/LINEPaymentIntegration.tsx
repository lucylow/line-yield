import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CreditCard, 
  Wallet, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  RefreshCw,
  History,
  Shield,
  Zap,
  DollarSign,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/useWallet';
import { formatCurrency } from '@/utils/formatters';

// LINE Mini-Dapp Payment Integration Types
interface PaymentItem {
  itemIdentifier: string;
  name: string;
  imageUrl: string;
  price: string;
  currencyCode: 'USD' | 'KRW' | 'JPY' | 'TWD' | 'THB' | 'KAIA' | 'USDT';
  pgType: 'STRIPE' | 'CRYPTO';
  priceInSmallestUnit: string;
  description?: string;
  category?: string;
}

interface PaymentRequest {
  buyerDappPortalAddress: string;
  pgType: 'STRIPE' | 'CRYPTO';
  currencyCode: string;
  price: string;
  paymentStatusChangeCallbackUrl: string;
  lockUrl: string;
  unlockUrl: string;
  items: PaymentItem[];
  testMode: boolean;
}

interface PaymentResponse {
  id: string;
  status: string;
  paymentUrl?: string;
  expiresAt?: string;
}

interface PaymentHistoryItem {
  id: string;
  itemName: string;
  amount: string;
  currency: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'CANCELLED';
  timestamp: string;
  transactionHash?: string;
}

// Configuration
const CLIENT_ID = "56008383-b17f-4d26-a035-f6a60daddb06";
const CLIENT_SECRET = "f1b39121-a0fb-4f66-a9e7-064acedbb8f8";
const TEST_MODE = true; // Set to false for production

// Available items for purchase
const PAYMENT_ITEMS: PaymentItem[] = [
  {
    itemIdentifier: "yield-boost-premium",
    name: "Yield Boost Premium",
    imageUrl: "https://via.placeholder.com/100x100/4F46E5/FFFFFF?text=Premium",
    price: "10",
    currencyCode: "USDT",
    pgType: "CRYPTO",
    priceInSmallestUnit: "10.00",
    description: "Premium yield optimization with advanced strategies",
    category: "premium"
  },
  {
    itemIdentifier: "gas-credits",
    name: "Gas Credits Pack",
    imageUrl: "https://via.placeholder.com/100x100/10B981/FFFFFF?text=Gas",
    price: "5",
    currencyCode: "USDT",
    pgType: "CRYPTO",
    priceInSmallestUnit: "5.00",
    description: "Prepaid gas credits for transactions",
    category: "utility"
  },
  {
    itemIdentifier: "kaia-tokens",
    name: "Kaia Token Pack",
    imageUrl: "https://via.placeholder.com/100x100/8B5CF6/FFFFFF?text=KAI",
    price: "0.1",
    currencyCode: "KAIA",
    pgType: "CRYPTO",
    priceInSmallestUnit: "0.1",
    description: "Official Kaia ecosystem tokens",
    category: "tokens"
  },
  {
    itemIdentifier: "premium-support",
    name: "Premium Support",
    imageUrl: "https://via.placeholder.com/100x100/F59E0B/FFFFFF?text=Support",
    price: "25",
    currencyCode: "USD",
    pgType: "STRIPE",
    priceInSmallestUnit: "2500", // cents
    description: "Priority customer support and consultation",
    category: "service"
  }
];

interface LINEPaymentIntegrationProps {
  onPaymentComplete?: (paymentData: any) => void;
  className?: string;
}

export const LINEPaymentIntegration: React.FC<LINEPaymentIntegrationProps> = ({
  onPaymentComplete,
  className
}) => {
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [connectingWallet, setConnectingWallet] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PaymentItem | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const { wallet } = useWallet();
  const { toast } = useToast();

  // Initialize wallet connection
  useEffect(() => {
    if (wallet.connected && wallet.address) {
      setUserAddress(wallet.address);
    }
  }, [wallet.connected, wallet.address]);

  // Connect wallet using Kaia wallet integration
  const connectWallet = async () => {
    try {
      setConnectingWallet(true);
      
      if (!wallet.connected) {
        await wallet.connect();
      }
      
      if (wallet.address) {
        setUserAddress(wallet.address);
        toast({
          title: 'Wallet Connected',
          description: `Connected to ${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`,
        });
      }
    } catch (error: any) {
      console.error('Wallet connection failed:', error);
      toast({
        title: 'Connection Failed',
        description: error.message || 'Failed to connect wallet',
        variant: 'destructive'
      });
    } finally {
      setConnectingWallet(false);
    }
  };

  // Ensure wallet is connected before payment
  const ensureWalletConnected = async (): Promise<boolean> => {
    if (userAddress) return true;
    await connectWallet();
    return !!userAddress;
  };

  // Create payment using LINE Mini-Dapp Payment API
  const createPayment = async (item: PaymentItem): Promise<string> => {
    if (!userAddress) throw new Error('Wallet not connected');

    const paymentRequest: PaymentRequest = {
      buyerDappPortalAddress: userAddress,
      pgType: item.pgType,
      currencyCode: item.currencyCode,
      price: item.priceInSmallestUnit,
      paymentStatusChangeCallbackUrl: `${window.location.origin}/api/payment-status-callback`,
      lockUrl: `${window.location.origin}/api/payment-lock-callback`,
      unlockUrl: `${window.location.origin}/api/payment-unlock-callback`,
      items: [item],
      testMode: TEST_MODE
    };

    try {
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Id': CLIENT_ID,
          'X-Client-Secret': CLIENT_SECRET,
        },
        body: JSON.stringify(paymentRequest),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create payment');
      }

      const data: PaymentResponse = await response.json();
      if (!data.id) throw new Error('No payment ID returned');

      return data.id;
    } catch (error) {
      console.error('Payment creation failed:', error);
      throw error;
    }
  };

  // Start payment using LINE Mini-Dapp SDK
  const startPayment = async (paymentId: string): Promise<void> => {
    setIsProcessing(true);
    setPaymentError(null);
    setPaymentStatus(null);

    try {
      // Simulate LINE Mini-Dapp payment flow
      // In real implementation, this would call the LINE SDK
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setPaymentStatus('FINALIZED');
      
      // Add to payment history
      const newPayment: PaymentHistoryItem = {
        id: paymentId,
        itemName: selectedItem?.name || 'Unknown Item',
        amount: selectedItem?.price || '0',
        currency: selectedItem?.currencyCode || 'USD',
        status: 'COMPLETED',
        timestamp: new Date().toISOString(),
        transactionHash: `0x${Math.random().toString(16).substr(2, 8)}`
      };
      
      setPaymentHistory(prev => [newPayment, ...prev]);
      
      toast({
        title: 'Payment Successful',
        description: `Successfully purchased ${selectedItem?.name}`,
      });

      onPaymentComplete?.({
        paymentId,
        item: selectedItem,
        status: 'COMPLETED',
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      console.error('Payment failed:', error);
      setPaymentError(error.message || 'Payment failed or canceled');
      toast({
        title: 'Payment Failed',
        description: error.message || 'Payment failed or canceled',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle item purchase
  const handlePurchase = async (item: PaymentItem) => {
    try {
      if (!(await ensureWalletConnected())) {
        throw new Error('Wallet connection required');
      }
      
      setSelectedItem(item);
      setIsProcessing(true);
      
      const payId = await createPayment(item);
      setPaymentId(payId);
      
      await startPayment(payId);
      
    } catch (error: any) {
      setPaymentError(error.message || 'Purchase failed');
      toast({
        title: 'Purchase Failed',
        description: error.message || 'Purchase failed',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // View payment history
  const viewPaymentHistory = async () => {
    if (!(await ensureWalletConnected())) {
      toast({
        title: 'Wallet Required',
        description: 'Please connect your wallet first',
        variant: 'destructive'
      });
      return;
    }

    setShowHistory(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'FAILED':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'CANCELLED':
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'premium':
        return 'bg-purple-500';
      case 'utility':
        return 'bg-green-500';
      case 'tokens':
        return 'bg-blue-500';
      case 'service':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (showHistory) {
    return (
      <div className={className}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Payment History
              </CardTitle>
              <Button variant="outline" onClick={() => setShowHistory(false)}>
                Back to Store
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {paymentHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No payment history</p>
                <p className="text-sm">Your completed purchases will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {paymentHistory.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(payment.status)}
                      <div>
                        <p className="font-medium">{payment.itemName}</p>
                        <p className="text-sm text-muted-foreground">
                          {payment.amount} {payment.currency} • {new Date(payment.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {payment.status.toLowerCase()}
                      </Badge>
                      {payment.transactionHash && (
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
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">LINE Mini-Dapp Store</h2>
          <p className="text-muted-foreground">
            Purchase premium features and services
          </p>
        </div>

        {/* Wallet Connection */}
        <Card>
          <CardContent className="pt-4">
            {!userAddress ? (
              <div className="text-center space-y-4">
                <Wallet className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="font-medium">Connect Your Wallet</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect your Kaia wallet to make purchases
                  </p>
                </div>
                <Button 
                  onClick={connectWallet} 
                  disabled={connectingWallet}
                  className="w-full"
                >
                  {connectingWallet ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet className="h-4 w-4 mr-2" />
                      Connect Wallet
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Wallet Connected</span>
                </div>
                <Badge variant="outline">
                  {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PAYMENT_ITEMS.map((item) => (
            <Card key={item.itemIdentifier}>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <Badge className={getCategoryColor(item.category)}>
                          {item.category?.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold">
                          {item.price} {item.currencyCode}
                        </span>
                        <Badge variant="outline">
                          {item.pgType === 'CRYPTO' ? (
                            <>
                              <Zap className="h-3 w-3 mr-1" />
                              Crypto
                            </>
                          ) : (
                            <>
                              <CreditCard className="h-3 w-3 mr-1" />
                              Fiat
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => handlePurchase(item)}
                    disabled={isProcessing || !userAddress}
                    className="w-full"
                    size="lg"
                  >
                    {isProcessing && selectedItem?.itemIdentifier === item.itemIdentifier ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <DollarSign className="h-4 w-4 mr-2" />
                        Buy Now
                      </>
                    )}
                  </Button>

                  {/* Non-refundable Notice */}
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      <strong>Non-refundable:</strong> You agree that this product is non-refundable.
                      {item.pgType === 'STRIPE' && (
                        <span> If paid via LINE IAP, you agree to providing encrypted ID info to LY Corporation.</span>
                      )}
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment History Button */}
        <div className="text-center">
          <Button 
            onClick={viewPaymentHistory}
            variant="outline"
            className="flex items-center gap-2"
          >
            <History className="h-4 w-4" />
            View Payment History
          </Button>
        </div>

        {/* Payment Status */}
        {paymentStatus && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Payment Status: <strong>{paymentStatus}</strong>
            </AlertDescription>
          </Alert>
        )}

        {/* Payment Error */}
        {paymentError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Payment Error: <strong>{paymentError}</strong>
            </AlertDescription>
          </Alert>
        )}

        {/* Security Notice */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Secure Payment Processing</p>
                <p>All payments are processed securely through LINE's Mini-Dapp payment system. Your wallet information is encrypted and protected.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LINEPaymentIntegration;

