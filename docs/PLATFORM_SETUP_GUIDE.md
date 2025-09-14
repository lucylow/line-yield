# LINE Yield Platform Setup Guide

## Overview

This guide provides step-by-step instructions for setting up the LINE Yield platform to meet all requirements for both LIFF (LINE) and Web versions.

## Prerequisites

- Node.js 18+ and npm/pnpm
- LINE Developers account
- Reown (WalletConnect) account
- Kaia blockchain access
- PostgreSQL database
- Redis cache (optional)

## 1. Platform Support ✅

### LIFF (LINE) Version
- ✅ LIFF SDK integration implemented
- ✅ LINE Login support
- ✅ ShareTargetPicker for inviting friends
- ✅ LINE-specific UI components

### Web Version
- ✅ Standard web browser support
- ✅ Wallet connection via MetaMask/OKX/Bitget
- ✅ Copy invite link functionality
- ✅ Responsive design

## 2. SDK Setup

### Mini Dapp SDK
```bash
# Install latest LIFF SDK
npm install @line/liff
```

### Reown ProjectId Setup
1. Go to [Reown Cloud](https://cloud.reown.com)
2. Create a new project
3. Copy the ProjectId
4. Add to environment variables:
```env
VITE_PROJECT_ID=your-project-id-here
```

### Domain Verification
1. Add your domain to Reown project
2. Verify domain ownership
3. Update environment variables:
```env
VITE_DOMAIN=https://your-domain.com
```

## 3. Wallet Connect Flow

### LIFF Flow Implementation
```typescript
// Access Mini Dapp (LIFF) → Consent to Channel → Add Official Account → Launch Dapp → Wallet Connect
const liffFlow = {
  1: 'User accesses LIFF app',
  2: 'Consent to channel permissions',
  3: 'Add Official Account',
  4: 'Launch Dapp',
  5: 'Wallet Connect at payment/reward step'
};
```

### Web Flow Implementation
```typescript
// Access Mini Dapp (Web) → Wallet Connect → Launch Dapp
const webFlow = {
  1: 'User accesses web app',
  2: 'Wallet Connect',
  3: 'Launch Dapp'
};
```

### Wallet Address Display
```typescript
// Implemented in ConnectedWalletDisplay component
const displayAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
```

### Disconnect Wallet Feature
```typescript
// Implemented in useUniversalWallet hook
const disconnectWallet = () => {
  setWallet({
    isConnected: false,
    address: null,
    provider: null
  });
};
```

## 4. Payment Features

### In-App Item Payment Support
- ✅ Crypto payments (KAIA/USDT)
- ✅ Stripe fiat payments
- ✅ Payment flow implementation
- ✅ Purchase precautions
- ✅ Payment status notifications
- ✅ Payment history feature

### Real-Time Price Display
```typescript
// Implemented with CoinMarketCap API
const getRealTimePrice = async (currency: string) => {
  const response = await fetch(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${currency}`);
  return response.json();
};
```

## 5. LINE Integration

### LINE Login Setup
1. Go to [LINE Developers Console](https://developers.line.biz)
2. Create LINE Login channel
3. Configure LIFF app
4. Set environment variables:
```env
VITE_LIFF_ID=your-liff-id-here
VITE_LINE_CHANNEL_ID=your-channel-id-here
```

### Messaging API Setup
1. Create Messaging API channel
2. Configure webhook URL
3. Set environment variables:
```env
LINE_CHANNEL_ACCESS_TOKEN=your-access-token
LINE_CHANNEL_SECRET=your-channel-secret
```

### Official Account Configuration
1. Go to LINE Developers > LINE Login Channel > LIFF
2. Set "Add friend option" to On (aggressive)
3. Configure Rich Menu according to design guide

## 6. Invite Friends

### ShareTargetPicker (LIFF)
```typescript
// Implemented in InviteFriends component
const shareTargetPicker = async (message: string) => {
  if (liff.isApiAvailable('shareTargetPicker')) {
    await liff.shareTargetPicker([{
      type: 'text',
      text: message
    }]);
  }
};
```

### Copy Invite Link (Web)
```typescript
// Implemented in web version
const copyInviteLink = async () => {
  const inviteLink = `${window.location.origin}?ref=${userId}`;
  await navigator.clipboard.writeText(inviteLink);
};
```

## 7. UX/UI Requirements

### Language Localization ✅
- ✅ English and Japanese support
- ✅ Browser language detection
- ✅ IP-based geolocation
- ✅ Manual language selection
- ✅ Persistent preferences

### Document Title Format ✅
```typescript
// Implemented in useDocumentTitle hook
const formatTitle = (miniDappName: string) => {
  return `${miniDappName} | Mini Dapp`;
};
```

### OpenGraph Meta Tags ✅
```typescript
// Implemented in metaTagsUtils
const setOpenGraphTags = (config: MetaTagConfig) => {
  updateMetaTag('property', 'og:title', config.title);
  updateMetaTag('property', 'og:description', config.description);
  updateMetaTag('property', 'og:image', config.image);
  updateMetaTag('property', 'og:url', config.url);
};
```

### Close Confirmation Dialog ✅
```typescript
// Implemented in ConfirmationDialog component
const showCloseConfirmation = () => {
  return confirm('Are you sure you want to leave? Your progress will be lost.');
};
```

### Connect Button Design ✅
- ✅ Compliant with Dapp Portal design guidelines
- ✅ Proper styling and animations
- ✅ Clear call-to-action text

## 8. Security Implementation

### Credential Protection ✅
- ✅ No private keys in frontend code
- ✅ No client secrets in frontend code
- ✅ Environment variables properly configured
- ✅ Backend-only sensitive data

### Security Audit
```typescript
// Implemented in security-audit.ts
const performSecurityAudit = () => {
  // Check for sensitive patterns
  // Validate environment variables
  // Verify API security
  // Check wallet security
};
```

## Environment Configuration

### Required Environment Variables
```env
# LINE Integration
VITE_LIFF_ID=your-liff-id-here
VITE_LINE_CHANNEL_ID=your-channel-id-here

# WalletConnect/Reown
VITE_PROJECT_ID=your-project-id-here

# Blockchain
VITE_RPC_URL=https://rpc.kaia.one
VITE_CHAIN_ID=100

# API
VITE_API_BASE_URL=http://localhost:3001/api

# Backend Only (NEVER expose in frontend)
LINE_CHANNEL_ACCESS_TOKEN=your-access-token
LINE_CHANNEL_SECRET=your-channel-secret
API_SECRET_KEY=your-api-secret
JWT_SECRET=your-jwt-secret
STRIPE_SECRET_KEY=your-stripe-secret
DATABASE_URL=your-database-url
```

## Installation Steps

### 1. Clone Repository
```bash
git clone https://github.com/your-org/line-yield.git
cd line-yield
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Environment Setup
```bash
cp env.example .env
# Edit .env with your actual values
```

### 4. Database Setup
```bash
# Create PostgreSQL database
createdb line_yield

# Run migrations
pnpm run db:migrate
```

### 5. Start Development
```bash
# Start backend
pnpm run dev:backend

# Start frontend
pnpm run dev:frontend

# Start LIFF app
pnpm run dev:liff
```

## Verification Checklist

Use the PlatformVerificationChecklist component to verify all requirements:

```typescript
import { PlatformVerificationChecklist } from './components/PlatformVerificationChecklist';

// Add to your app
<PlatformVerificationChecklist />
```

## Testing

### LIFF Testing
1. Deploy to LINE Developers Console
2. Test in LINE app
3. Verify ShareTargetPicker functionality
4. Test wallet connection flow

### Web Testing
1. Test in web browsers
2. Verify wallet connection
3. Test copy invite link
4. Verify responsive design

### Payment Testing
1. Test crypto payments
2. Test Stripe payments
3. Verify payment notifications
4. Test payment history

## Deployment

### LIFF Deployment
1. Build LIFF app: `pnpm run build:liff`
2. Deploy to LINE Developers Console
3. Configure domain and permissions
4. Test in LINE app

### Web Deployment
1. Build web app: `pnpm run build:web`
2. Deploy to hosting service
3. Configure domain and SSL
4. Test in web browsers

### Backend Deployment
1. Build backend: `pnpm run build:backend`
2. Deploy to cloud service
3. Configure environment variables
4. Set up database and cache
5. Configure monitoring

## Monitoring and Maintenance

### Security Monitoring
- Regular security audits
- Monitor for exposed credentials
- Check for vulnerabilities
- Update dependencies

### Performance Monitoring
- Monitor API response times
- Check wallet connection success rates
- Monitor payment success rates
- Track user engagement

### Compliance
- Regular compliance checks
- Update terms of service
- Monitor data privacy
- Ensure regulatory compliance

## Troubleshooting

### Common Issues

1. **LIFF not initializing**
   - Check LIFF ID configuration
   - Verify domain permissions
   - Check LINE Developers Console settings

2. **Wallet connection failing**
   - Check RPC URL configuration
   - Verify network settings
   - Check wallet provider availability

3. **Payment processing errors**
   - Check Stripe configuration
   - Verify API keys
   - Check webhook configuration

4. **Localization not working**
   - Check browser language settings
   - Verify translation files
   - Check IP geolocation service

### Support

For technical support:
- Check documentation
- Review error logs
- Contact development team
- Submit issue on GitHub

## Conclusion

The LINE Yield platform is now fully configured with all required features:

✅ **Platform Support**: Both LIFF and Web versions supported
✅ **SDK**: Latest Mini Dapp SDK with Reown ProjectId
✅ **Wallet Connect**: Proper flow implementation for both platforms
✅ **Payment Features**: Crypto and Stripe payments with real-time rates
✅ **LINE Integration**: Login, Messaging API, and Official Account setup
✅ **Invite Friends**: ShareTargetPicker and copy link features
✅ **UX/UI**: Localization, meta tags, and design compliance
✅ **Security**: No exposed credentials, proper security implementation

The platform is ready for production deployment and meets all LINE Mini Dapp requirements.
