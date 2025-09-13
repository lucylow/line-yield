# LINE Yield Payment Integration Guide

This comprehensive guide covers the complete payment system implementation for LINE Yield, supporting both Stripe (traditional) and crypto payments with Supabase integration.

## 💳 System Overview

The LINE Yield payment system provides a unified interface for both traditional and crypto payments:

- **Stripe Payments**: Credit/debit card payments with full PCI compliance
- **Crypto Payments**: Direct blockchain transactions on KAIA, Ethereum, and Polygon
- **Unified UI**: Single interface for both payment methods
- **Supabase Integration**: Complete payment tracking and history
- **Security**: End-to-end encryption and secure key management

## 🏗️ Architecture

### Backend Components

1. **PaymentService** (`backend/src/services/PaymentService.ts`)
   - Core payment processing logic
   - Stripe integration with webhooks
   - Crypto payment management
   - Supabase data persistence

2. **Payment API Routes** (`backend/src/routes/payments.ts`)
   - RESTful API endpoints for all payment operations
   - Rate limiting and input validation
   - Webhook handling for Stripe events

3. **Database Schema** (`database-schema-payments.sql`)
   - Complete payment tracking schema
   - Row Level Security (RLS) policies
   - Optimized indexes and functions

### Frontend Components

1. **PaymentApiClient** (`src/services/PaymentApiClient.ts`)
   - Frontend API client for payment operations
   - Error handling and response management

2. **usePayments Hook** (`src/hooks/usePayments.ts`)
   - React hook for payment operations
   - State management and user feedback

3. **UI Components**
   - `PaymentModal`: Unified payment interface
   - `PaymentHistory`: Payment tracking and history

## 💰 Payment Methods

### 1. Stripe Payments

#### Features
- **Credit/Debit Cards**: Visa, Mastercard, American Express
- **Automatic Payment Methods**: Apple Pay, Google Pay, etc.
- **PCI Compliance**: Fully compliant payment processing
- **Webhook Support**: Real-time payment status updates
- **Refund Support**: Automated refund processing

#### Implementation
```typescript
// Create payment intent
const paymentIntent = await paymentService.createStripePaymentIntent(
  amount: 10.00,
  currency: 'usd',
  userId: 'user123',
  metadata: { description: 'LINE Yield Deposit' }
);

// Confirm payment on frontend
const result = await stripe.confirmCardPayment(clientSecret, {
  payment_method: { card: cardElement }
});
```

### 2. Crypto Payments

#### Supported Networks
- **KAIA**: Native network for LINE Yield
- **Ethereum**: ETH and ERC-20 tokens
- **Polygon**: MATIC and Polygon tokens

#### Supported Tokens
- **USDC**: USD Coin (most popular)
- **USDT**: Tether USD
- **KLAY**: KAIA native token
- **ETH**: Ethereum native token

#### Implementation
```typescript
// Create crypto payment
const cryptoPayment = await paymentService.createCryptoPayment(
  amount: '10.0',
  token: 'USDC',
  recipientAddress: '0x...',
  userId: 'user123',
  network: 'kaia'
);

// Update with transaction hash
await paymentService.updateCryptoPayment(
  paymentId: 'crypto_123',
  txHash: '0x...',
  status: 'confirmed'
);
```

## 🎮 Usage Examples

### Frontend Integration

#### Payment Modal
```typescript
import { PaymentModal } from '@/components/PaymentModal';

function DepositPage() {
  const [showPayment, setShowPayment] = useState(false);

  return (
    <div>
      <Button onClick={() => setShowPayment(true)}>
        Make Deposit
      </Button>
      
      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        amount={100}
        currency="usd"
        description="LINE Yield Deposit"
        onSuccess={(payment) => {
          console.log('Payment successful:', payment);
          setShowPayment(false);
        }}
      />
    </div>
  );
}
```

#### Payment History
```typescript
import { PaymentHistory } from '@/components/PaymentHistory';

function Dashboard() {
  return (
    <div className="space-y-6">
      <PaymentHistory />
    </div>
  );
}
```

#### Using the Payment Hook
```typescript
import { usePayments } from '@/hooks/usePayments';

function PaymentComponent() {
  const {
    createStripePayment,
    createCryptoPayment,
    paymentHistory,
    isLoading,
    error
  } = usePayments('user123');

  const handleStripePayment = async () => {
    const payment = await createStripePayment(50, 'usd', {
      description: 'Premium subscription'
    });
    console.log('Stripe payment created:', payment);
  };

  const handleCryptoPayment = async () => {
    const payment = await createCryptoPayment(
      '100',
      'USDC',
      '0x...',
      'kaia'
    );
    console.log('Crypto payment created:', payment);
  };

  return (
    <div>
      <button onClick={handleStripePayment} disabled={isLoading}>
        Pay with Card
      </button>
      <button onClick={handleCryptoPayment} disabled={isLoading}>
        Pay with Crypto
      </button>
    </div>
  );
}
```

### Backend API Usage

#### Create Stripe Payment Intent
```bash
POST /api/payments/stripe/create-intent
Content-Type: application/json

{
  "amount": 10.00,
  "currency": "usd",
  "userId": "user123",
  "metadata": {
    "description": "LINE Yield Deposit"
  }
}
```

#### Create Crypto Payment
```bash
POST /api/payments/crypto/create
Content-Type: application/json

{
  "amount": "10.0",
  "token": "USDC",
  "recipientAddress": "0x...",
  "userId": "user123",
  "network": "kaia"
}
```

#### Get Payment History
```bash
GET /api/payments/history/user123?limit=50
```

#### Process Refund
```bash
POST /api/payments/payment123/refund
Content-Type: application/json

{
  "reason": "Customer requested refund"
}
```

## 🗄️ Database Schema

### Core Tables

#### payments
```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('stripe', 'crypto')),
    amount DECIMAL(18, 8) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    payment_intent_id VARCHAR(255), -- Stripe payment intent ID
    tx_hash VARCHAR(255), -- Blockchain transaction hash
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### payment_methods
```sql
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('stripe', 'crypto')),
    method_data JSONB NOT NULL, -- Encrypted payment method data
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### refunds
```sql
CREATE TABLE refunds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID NOT NULL REFERENCES payments(id),
    refund_id VARCHAR(255), -- Stripe refund ID
    amount DECIMAL(18, 8) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    reason TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Database Functions

#### Update Payment Status
```sql
SELECT update_payment_status(
    'payment-uuid',
    'completed',
    '0x1234567890abcdef...'
);
```

#### Get Payment Statistics
```sql
SELECT * FROM get_payment_stats('user123');
```

#### Process Refund
```sql
SELECT process_refund(
    'payment-uuid',
    10.00,
    'Customer requested refund'
);
```

## 🔧 Configuration

### Environment Variables

#### Backend
```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key

# API Configuration
API_BASE_URL=http://localhost:3000
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend
```bash
VITE_API_BASE_URL=http://localhost:3000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Stripe Configuration
```typescript
const stripeConfig = {
  apiVersion: '2023-10-16',
  automaticPaymentMethods: {
    enabled: true,
  },
  paymentMethodTypes: ['card'],
  supportedCurrencies: ['usd', 'eur', 'gbp'],
  webhookEvents: [
    'payment_intent.succeeded',
    'payment_intent.payment_failed',
    'payment_intent.canceled'
  ]
};
```

## 🎨 UI Components

### PaymentModal
Unified payment interface with:
- **Tabbed Interface**: Switch between Stripe and crypto
- **Real-time Validation**: Input validation and error handling
- **Loading States**: Smooth loading indicators
- **Success/Error States**: Clear feedback for users
- **Responsive Design**: Works on all device sizes

### PaymentHistory
Comprehensive payment tracking with:
- **Payment Statistics**: Total payments, amounts, success rates
- **Filter Options**: Filter by payment type (Stripe/Crypto)
- **Status Indicators**: Visual status badges
- **Transaction Details**: Full transaction information
- **Refresh Functionality**: Real-time updates

### Key Features
- **Unified Experience**: Same interface for both payment types
- **Real-time Updates**: Payment status updates immediately
- **Error Handling**: Comprehensive error states and recovery
- **Accessibility**: Screen reader friendly
- **Mobile Optimized**: Touch-friendly interface

## 🔒 Security Features

### Backend Security
- **Rate Limiting**: Prevents payment abuse
- **Input Validation**: All inputs validated and sanitized
- **Webhook Verification**: Stripe webhook signature verification
- **Encrypted Storage**: Sensitive data encrypted at rest
- **Audit Logging**: Complete payment audit trail

### Database Security
- **Row Level Security**: Users see only their own payments
- **Encrypted Fields**: Payment method data encrypted
- **Access Control**: Proper role-based permissions
- **Backup Strategy**: Regular encrypted backups

### Frontend Security
- **HTTPS Only**: All API calls use HTTPS
- **Input Sanitization**: Client-side validation
- **Error Handling**: Secure error messages
- **Token Management**: Secure API key handling

## 📊 Analytics and Monitoring

### Tracked Events
- Payment creation and completion
- Payment failures and retries
- Refund processing
- User payment preferences
- Payment method usage patterns

### Metrics
- Payment success rates by method
- Average payment amounts
- Payment volume trends
- User payment behavior
- Error rates and types

### Monitoring
- API response times
- Payment processing times
- Database performance
- Webhook delivery rates
- Error rates and alerts

## 🚀 Deployment

### Database Setup
1. Run the payment schema script
2. Set up Row Level Security policies
3. Create necessary indexes
4. Set up webhook endpoints

### Backend Deployment
1. Set environment variables
2. Deploy API routes
3. Configure webhook endpoints
4. Set up monitoring

### Frontend Deployment
1. Build with environment variables
2. Deploy to CDN
3. Configure API endpoints
4. Test payment flows

### Stripe Setup
1. Create Stripe account
2. Get API keys
3. Set up webhook endpoints
4. Configure payment methods
5. Test in sandbox mode

## 🧪 Testing

### Unit Tests
- Payment service functions
- API endpoint responses
- Database functions
- UI component behavior

### Integration Tests
- End-to-end payment flows
- Webhook processing
- Database operations
- API integration

### Load Tests
- High-volume payments
- Concurrent transactions
- Database performance
- API response times

### Test Data
```sql
-- Sample test payments
INSERT INTO payments (user_id, type, amount, currency, status, payment_intent_id) VALUES
('user123', 'stripe', 10.00, 'usd', 'completed', 'pi_test_123'),
('user123', 'crypto', 0.1, 'eth', 'completed', NULL),
('user456', 'stripe', 25.00, 'usd', 'pending', 'pi_test_456');
```

## 📈 Future Enhancements

### Planned Features
- **Subscription Payments**: Recurring payment support
- **Multi-currency**: Support for more currencies
- **Payment Plans**: Installment payment options
- **Loyalty Integration**: Payment-based rewards
- **Advanced Analytics**: Detailed payment insights

### Scalability Improvements
- **Payment Queues**: Background payment processing
- **Microservices**: Separate payment service
- **Caching**: Redis for frequently accessed data
- **CDN**: Global content delivery

## 🆘 Troubleshooting

### Common Issues

#### Stripe Payment Failures
- Check API key configuration
- Verify webhook endpoint setup
- Review payment intent status
- Check card validation

#### Crypto Payment Issues
- Verify network connectivity
- Check transaction hash validity
- Review gas fee settings
- Validate recipient address

#### Database Issues
- Check connection strings
- Verify RLS policies
- Review index performance
- Check backup status

### Debug Tools
- Payment API health checks
- Database query monitoring
- Webhook event logging
- Error tracking and alerts

## 📞 Support

For issues or questions regarding the payment system:

1. Check the troubleshooting section
2. Review error logs
3. Test with sample data
4. Contact the development team

### Useful Resources
- [Stripe Documentation](https://stripe.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [KAIA Network Documentation](https://docs.kaia.network)
- [React Stripe.js Documentation](https://stripe.com/docs/stripe-js/react)

---

**Note**: This payment system is designed to be secure, scalable, and user-friendly. Regular security audits and updates ensure optimal performance and compliance.


