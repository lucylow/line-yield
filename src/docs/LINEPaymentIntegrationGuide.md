# LINE Mini-Dapp Payment Integration Guide

This guide explains how to integrate LINE's Mini-Dapp payment system into the Kaia Yield Optimizer, enabling users to purchase premium features and services using both fiat and crypto payments.

## Overview

The LINE payment integration provides:

1. **Fiat Payments**: Credit card payments through Stripe integration
2. **Crypto Payments**: Direct blockchain payments for KAIA and USDT
3. **Payment History**: Complete transaction history and status tracking
4. **Webhook Handling**: Real-time payment status updates
5. **Security**: Signature verification and secure payment processing

## Architecture

### Core Components

#### 1. `LINEPaymentIntegration.tsx` - Main Payment Interface
- Complete payment store interface
- Wallet connection and management
- Payment item display and selection
- Payment history viewing
- Error handling and user feedback

#### 2. `PaymentService.ts` - Backend Payment Service
- Payment creation and management
- Webhook handling for status updates
- Payment validation and security
- Fee calculation and formatting

#### 3. API Endpoints
- `/api/payment/create` - Create new payments
- `/api/payment-status-callback` - Handle payment status changes
- `/api/payment-lock-callback` - Handle payment locks
- `/api/payment-unlock-callback` - Handle payment unlocks

## Configuration

### Environment Variables

```bash
# LINE Mini-Dapp Configuration
LINE_CLIENT_ID=56008383-b17f-4d26-a035-f6a60daddb06
LINE_CLIENT_SECRET=f1b39121-a0fb-4f66-a9e7-064acedbb8f8

# Payment URLs
PAYMENT_BASE_URL=https://payment.dappportal.io/api/payment-v1
PAYMENT_TEST_URL=https://payment-test.dappportal.io/api/payment-v1

# Webhook URLs
PAYMENT_STATUS_CALLBACK_URL=https://yourserver.com/api/payment-status-callback
PAYMENT_LOCK_CALLBACK_URL=https://yourserver.com/api/payment-lock-callback
PAYMENT_UNLOCK_CALLBACK_URL=https://yourserver.com/api/payment-unlock-callback
```

### Payment Items Configuration

```typescript
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
  // ... more items
];
```

## Payment Flow

### 1. Wallet Connection

```typescript
const connectWallet = async () => {
  try {
    setConnectingWallet(true);
    
    if (!wallet.connected) {
      await wallet.connect();
    }
    
    if (wallet.address) {
      setUserAddress(wallet.address);
      // Show success notification
    }
  } catch (error) {
    // Handle connection error
  } finally {
    setConnectingWallet(false);
  }
};
```

### 2. Payment Creation

```typescript
const createPayment = async (item: PaymentItem): Promise<string> => {
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

  const response = await fetch('/api/payment/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Id': CLIENT_ID,
      'X-Client-Secret': CLIENT_SECRET,
    },
    body: JSON.stringify(paymentRequest),
  });

  const data: PaymentResponse = await response.json();
  return data.id;
};
```

### 3. Payment Processing

```typescript
const startPayment = async (paymentId: string): Promise<void> => {
  try {
    // Call LINE Mini-Dapp SDK payment method
    await paymentProvider.startPayment(paymentId);
    
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
    
  } catch (error) {
    setPaymentError(error.message || 'Payment failed');
  }
};
```

## Webhook Handling

### Payment Status Callback

```typescript
// /api/payment-status-callback.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { paymentId, status, transactionHash } = req.body;

    // Verify webhook signature
    const signature = req.headers['x-line-signature'] as string;
    if (!paymentService.verifyWebhookSignature(JSON.stringify(req.body), signature)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Handle the payment status change
    await paymentService.handlePaymentStatusChange(paymentId, status, transactionHash);

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to handle payment status change' });
  }
}
```

### Payment Lock Callback

```typescript
// /api/payment-lock-callback.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const lockRequest: PaymentLockRequest = req.body;

    // Verify webhook signature
    const signature = req.headers['x-line-signature'] as string;
    if (!paymentService.verifyWebhookSignature(JSON.stringify(req.body), signature)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Handle the payment lock
    await paymentService.handlePaymentLock(lockRequest);

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to handle payment lock' });
  }
}
```

## Security Features

### Webhook Signature Verification

```typescript
verifyWebhookSignature(payload: string, signature: string): boolean {
  // Implement HMAC signature verification
  const expectedSignature = crypto
    .createHmac('sha256', this.clientSecret)
    .update(payload)
    .digest('hex');
  
  return signature === expectedSignature;
}
```

### Payment Validation

```typescript
validatePaymentRequest(request: PaymentRequest): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!request.buyerDappPortalAddress) {
    errors.push('Buyer address is required');
  }

  if (!request.pgType || !['STRIPE', 'CRYPTO'].includes(request.pgType)) {
    errors.push('Valid payment gateway type is required');
  }

  if (!request.price || parseFloat(request.price) <= 0) {
    errors.push('Valid price is required');
  }

  // ... more validations

  return {
    isValid: errors.length === 0,
    errors
  };
}
```

## Usage Examples

### Basic Payment Integration

```typescript
import LINEPaymentIntegration from '@/components/LINEPaymentIntegration';

const MyApp = () => {
  const handlePaymentComplete = (paymentData) => {
    console.log('Payment completed:', paymentData);
    // Handle payment completion (unlock features, etc.)
  };

  return (
    <LINEPaymentIntegration 
      onPaymentComplete={handlePaymentComplete}
    />
  );
};
```

### Combined Trading and Payment System

```typescript
import TradingWithPayments from '@/components/TradingWithPayments';

const MyApp = () => {
  return <TradingWithPayments />;
};
```

### Custom Payment Items

```typescript
const customItems: PaymentItem[] = [
  {
    itemIdentifier: "custom-feature",
    name: "Custom Feature",
    imageUrl: "https://example.com/image.png",
    price: "5",
    currencyCode: "USDT",
    pgType: "CRYPTO",
    priceInSmallestUnit: "5.00",
    description: "Custom feature description",
    category: "custom"
  }
];
```

## Error Handling

### Payment Errors

```typescript
const handlePaymentError = (error: any) => {
  if (error.code === 'INSUFFICIENT_FUNDS') {
    toast({
      title: 'Insufficient Funds',
      description: 'You don\'t have enough balance for this purchase',
      variant: 'destructive'
    });
  } else if (error.code === 'PAYMENT_CANCELLED') {
    toast({
      title: 'Payment Cancelled',
      description: 'Payment was cancelled by user',
      variant: 'destructive'
    });
  } else {
    toast({
      title: 'Payment Failed',
      description: 'An unexpected error occurred',
      variant: 'destructive'
    });
  }
};
```

### Network Errors

```typescript
const handleNetworkError = (error: any) => {
  if (error.name === 'NetworkError') {
    toast({
      title: 'Network Error',
      description: 'Please check your internet connection and try again',
      variant: 'destructive'
    });
  }
};
```

## Testing

### Test Mode Configuration

```typescript
const TEST_MODE = process.env.NODE_ENV !== 'production';

// Use test payment URLs in development
const paymentUrl = TEST_MODE 
  ? 'https://payment-test.dappportal.io/api/payment-v1'
  : 'https://payment.dappportal.io/api/payment-v1';
```

### Mock Payment Data

```typescript
const mockPaymentHistory: PaymentHistoryItem[] = [
  {
    id: 'pay_test_123',
    itemName: 'Test Item',
    amount: '10',
    currency: 'USDT',
    status: 'COMPLETED',
    timestamp: new Date().toISOString(),
    transactionHash: '0x1234567890abcdef'
  }
];
```

## Production Deployment

### Environment Setup

1. **Obtain Production Credentials**
   - Register your app with LINE DApp Portal
   - Get production client ID and secret
   - Configure production webhook URLs

2. **Configure Webhooks**
   - Set up secure webhook endpoints
   - Implement signature verification
   - Handle all webhook events properly

3. **Security Measures**
   - Use HTTPS for all endpoints
   - Implement rate limiting
   - Monitor for suspicious activity
   - Regular security audits

### Monitoring

```typescript
// Payment monitoring
const monitorPayments = () => {
  // Track payment success rates
  // Monitor webhook delivery
  // Alert on payment failures
  // Generate payment reports
};
```

## Compliance

### Non-Refundable Policy

All payment items must display the non-refundable notice:

```typescript
<Alert>
  <AlertCircle className="h-4 w-4" />
  <AlertDescription className="text-xs">
    <strong>Non-refundable:</strong> You agree that this product is non-refundable.
    {item.pgType === 'STRIPE' && (
      <span> If paid via LINE IAP, you agree to providing encrypted ID info to LY Corporation.</span>
    )}
  </AlertDescription>
</Alert>
```

### Data Privacy

- Encrypt sensitive payment data
- Comply with GDPR and local privacy laws
- Implement data retention policies
- Provide user data export/deletion

## Troubleshooting

### Common Issues

1. **Wallet Connection Failed**
   - Check wallet provider availability
   - Verify network connection
   - Ensure proper wallet permissions

2. **Payment Creation Failed**
   - Validate payment request data
   - Check API credentials
   - Verify webhook URLs

3. **Webhook Delivery Failed**
   - Check webhook endpoint availability
   - Verify signature validation
   - Monitor webhook logs

### Debug Tools

```typescript
// Enable debug logging
const DEBUG_MODE = process.env.NODE_ENV === 'development';

if (DEBUG_MODE) {
  console.log('Payment request:', paymentRequest);
  console.log('Payment response:', paymentResponse);
  console.log('Webhook payload:', webhookPayload);
}
```

## Conclusion

The LINE Mini-Dapp payment integration provides a comprehensive solution for handling both fiat and crypto payments within the Kaia Yield Optimizer. With proper implementation of security measures, webhook handling, and error management, it offers a professional-grade payment experience that integrates seamlessly with the LINE ecosystem.

The system is designed to scale with your application and can easily accommodate new payment methods, currencies, and features as they become available through the LINE DApp Portal.

