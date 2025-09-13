# LINE Mini Dapp Payment Implementation

This document describes the complete implementation of payment functionality for the LINE Yield Mini Dapp, supporting both Crypto ($KAIA) and Stripe fiat payments using the LINE Mini Dapp SDK payment provider.

## 🚀 Features Implemented

### 1. Payment Types Support
- **Crypto Payments**: Support for KAIA and USDT cryptocurrencies
- **Fiat Payments**: Stripe integration for traditional payment methods
- **Unified API**: Single interface for both payment types

### 2. LINE Mini Dapp Compliance
- **Purchase Precautions**: Mandatory non-refundable notices with user consent checkboxes
- **Payment Notifications**: Clear, intuitive status messages for all payment outcomes
- **Wallet Display**: Prominent display of connected wallet address and balance

### 3. User Experience
- **Real-time Status Updates**: Payment status polling and notifications
- **Error Handling**: Comprehensive error states and user feedback
- **Responsive Design**: Mobile-first design optimized for LINE Messenger

## 📁 File Structure

```
packages/shared/src/
├── types/
│   └── payment.ts                 # Payment type definitions
├── services/
│   └── paymentService.ts          # Payment API integration
├── components/
│   ├── PurchasePrecautions.tsx    # LINE compliance notices
│   ├── ConnectedWalletDisplay.tsx # Wallet connection UI
│   ├── PaymentNotification.tsx    # Payment status notifications
│   └── PaymentFlow.tsx           # Complete payment flow
├── hooks/
│   └── usePayment.ts             # Payment state management
└── utils/
    └── index.ts                  # Utility functions

packages/liff-app/src/
└── components/
    └── PaymentDemo.tsx           # LIFF payment demo

packages/web-app/src/
└── components/
    └── PaymentDemo.tsx           # Web payment demo
```

## 🔧 Core Components

### 1. Payment Service (`paymentService.ts`)

```typescript
// Initiates payment for both crypto and fiat
export async function initiatePayment(
  itemId: string,
  amount: number,
  paymentType: 'crypto' | 'stripe',
  currency: string,
  userWalletAddress: string
): Promise<string>

// Checks payment status
export async function checkPaymentStatus(paymentId: string): Promise<PaymentStatus>
```

### 2. Purchase Precautions (`PurchasePrecautions.tsx`)

Implements LINE's mandatory requirements:
- Non-refundable product notice
- Encrypted ID information consent for LINE IAP
- Required checkboxes before payment enablement
- Detailed policy information popups

### 3. Connected Wallet Display (`ConnectedWalletDisplay.tsx`)

Shows wallet information clearly:
- Truncated wallet address display
- Balance information
- Connection status
- Connect/Disconnect functionality

### 4. Payment Notifications (`PaymentNotification.tsx`)

Provides clear feedback for all payment states:
- ✅ Success: "Payment successful! Your item has been delivered."
- ❌ Failed: "Payment failed. Please check your payment method and try again."
- ⚠️ Canceled: "Payment canceled by user."
- 💰 Insufficient Balance: "Payment failed: insufficient crypto balance."
- 🚨 Error: "An unexpected error occurred. Please try again later."

### 5. Complete Payment Flow (`PaymentFlow.tsx`)

Orchestrates the entire payment experience:
- Item details display
- Payment method selection
- Wallet connection
- Purchase precautions
- Payment processing
- Status polling
- Notifications

## 🎯 Usage Examples

### Basic Payment Flow

```typescript
import { PaymentFlow } from '@line-yield/shared';

function MyComponent() {
  const handlePaymentComplete = (paymentId: string, status: PaymentStatus) => {
    console.log('Payment completed:', { paymentId, status });
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
  };

  return (
    <PaymentFlow
      itemId="premium-strategy"
      itemName="Premium Strategy Access"
      amount={100}
      currency="USDT"
      onPaymentComplete={handlePaymentComplete}
      onPaymentError={handlePaymentError}
    />
  );
}
```

### Using Payment Hook

```typescript
import { usePayment } from '@line-yield/shared';

function PaymentComponent() {
  const {
    loading,
    paymentId,
    status,
    error,
    walletInfo,
    processPayment,
    connectWallet
  } = usePayment();

  const handlePayment = async () => {
    const paymentId = await processPayment(
      'item-123',
      100,
      'crypto',
      'USDT'
    );
  };

  return (
    <div>
      {walletInfo ? (
        <button onClick={handlePayment}>Pay Now</button>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
}
```

## 🔒 LINE Mini Dapp Compliance

### Purchase Precautions Implementation

The implementation includes all required LINE Mini Dapp purchase precautions:

1. **Non-refundable Notice**: Clear display that products are non-refundable
2. **Encrypted ID Consent**: Agreement to provide encrypted ID to LY Corporation for LINE IAP
3. **User Consent**: Required checkboxes that must be checked before payment
4. **Detailed Information**: Popup dialogs with complete policy details

### Payment Notifications

Follows LINE guidelines for payment notifications:
- Clear, immediate feedback for all payment states
- User-friendly language and appropriate icons
- Auto-dismissing notifications with manual close option
- Consistent styling and positioning

## 🚀 Getting Started

### 1. Install Dependencies

```bash
# Install in shared package
cd packages/shared
npm install @dappportal/mini-dapp-sdk

# Install in LIFF app
cd packages/liff-app
npm install @dappportal/mini-dapp-sdk

# Install in web app
cd packages/web-app
npm install @dappportal/mini-dapp-sdk
```

### 2. Build Shared Package

```bash
npm run build:shared
```

### 3. Run Applications

```bash
# Run LIFF app
npm run dev:liff

# Run web app
npm run dev:web
```

### 4. Access Payment Demo

- LIFF App: Navigate to the main dashboard and click "Try Payment Demo"
- Web App: Navigate to `/payment-demo` route

## 🔧 Configuration

### Environment Variables

```env
# Payment provider configuration
VITE_PAYMENT_PROVIDER_URL=https://api.dappportal.io
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_KAIA_NETWORK_ID=8217
```

### Mini Dapp SDK Integration

Replace mock implementations in `paymentService.ts` with actual SDK calls:

```typescript
import { createPayment, getPaymentStatus } from '@dappportal/mini-dapp-sdk/payment-provider';

// Replace mock functions with actual SDK calls
const paymentResponse = await createPayment(paymentRequest);
const statusResponse = await getPaymentStatus(paymentId);
```

## 📱 Platform Support

### LINE Mini App (LIFF)
- Full payment functionality
- LINE-specific UI optimizations
- Integrated wallet connection
- Push notification support

### Web Application
- Cross-platform compatibility
- Responsive design
- MetaMask integration
- Desktop and mobile support

## 🧪 Testing

### Manual Testing Scenarios

1. **Wallet Connection**
   - Connect wallet successfully
   - Display wallet address and balance
   - Handle connection errors

2. **Payment Flow**
   - Select payment method (crypto/stripe)
   - Agree to purchase precautions
   - Complete payment process
   - Verify status notifications

3. **Error Handling**
   - Test insufficient balance
   - Test payment failures
   - Test network errors
   - Verify error notifications

### Test Payment Items

- Premium Strategy Access (100 USDT)
- Yield Boost (50 USDT)
- Custom amounts and currencies

## 🔄 Status Polling

The implementation includes automatic payment status polling:

```typescript
// Polls every 2 seconds until payment is complete
useEffect(() => {
  if (paymentId && status === 'pending') {
    const interval = setInterval(async () => {
      const newStatus = await pollPaymentStatus(paymentId);
      if (newStatus !== 'pending') {
        clearInterval(interval);
        // Handle completion
      }
    }, 2000);
    return () => clearInterval(interval);
  }
}, [paymentId, status]);
```

## 📊 Payment History

Both demo applications include payment history tracking:
- Payment ID and timestamp
- Amount and currency
- Status (completed/failed/pending)
- Transaction hash (when available)

## 🎨 Styling

The implementation uses:
- Tailwind CSS for consistent styling
- Responsive design principles
- LINE design guidelines compliance
- Accessible color schemes and contrast

## 🔐 Security Considerations

- Wallet address validation
- Payment amount verification
- Secure API communication
- User consent verification
- Error state handling

## 📈 Future Enhancements

1. **Real SDK Integration**: Replace mocks with actual Mini Dapp SDK
2. **Webhook Support**: Real-time payment status updates
3. **Multi-currency**: Support for additional cryptocurrencies
4. **Payment Analytics**: Track payment success rates
5. **Refund Handling**: Support for refundable products

## 🤝 Contributing

When extending the payment functionality:

1. Follow LINE Mini Dapp guidelines
2. Maintain TypeScript type safety
3. Include comprehensive error handling
4. Add appropriate user notifications
5. Test on both LIFF and web platforms

## 📚 References

- [LINE Mini Dapp SDK Documentation](https://docs.dappportal.io/mini-dapp/mini-dapp-sdk/payment-provider)
- [Payment Policy Guidelines](https://docs.dappportal.io/mini-dapp/mini-dapp-sdk/payment/policy/payment)
- [Refund Policy Requirements](https://docs.dappportal.io/mini-dapp/mini-dapp-sdk/payment/policy/refund)
- [Successful Mini Dapp Guide](https://docs.dappportal.io/lines-mini-dapp-and-dapp-portal/how-to-build-successful-mini-dapp)


