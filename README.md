# LINE Yield Platform

A comprehensive DeFi platform built on Kaia blockchain, featuring multi-platform support (LIFF/LINE integration and web version), advanced wallet connectivity, payment systems, NFT marketplace, and social features. The platform combines traditional DeFi functionality with modern social integration and gamification.

## 🌟 Platform Overview

LINE Yield is a next-generation DeFi platform that bridges traditional finance with blockchain technology, offering users seamless access to yield farming, lending, NFT trading, and social features across multiple platforms.

### Key Differentiators
- **Multi-Platform Support**: Native LIFF integration for LINE users + full web version
- **Social-First Approach**: Built-in referral system and social features
- **Gamified Experience**: NFT rewards and tiered progression system
- **Enterprise-Grade Security**: Multi-signature wallets and advanced security measures
- **Cross-Chain Compatibility**: Support for multiple blockchain networks

## 🚀 Core Features

### 💰 Yield Farming & Lending
- **Multi-Strategy Vaults**: Automated yield optimization across multiple protocols
- **Flexible Loan Types**: Personal, business, and collateralized loans
- **Dynamic Interest Rates**: Market-responsive APY calculations
- **Risk Management**: Advanced risk assessment and portfolio diversification
- **Liquidity Mining**: Rewards for providing liquidity to various pools

### 🎨 NFT Ecosystem
- **Tiered NFT System**: 6-tier progression from Common to Transcendent
- **NFT Marketplace**: Buy, sell, and auction NFTs with volume tracking
- **NFT Staking**: Earn passive rewards by staking NFTs
- **Governance Rights**: NFT holders gain voting power in platform decisions
- **Rarity System**: Dynamic rarity based on supply and demand

### 👥 Social Features
- **Referral System**: Multi-level referral program with rewards
- **Social Login**: LINE, Google, Twitter, Discord integration
- **Community Features**: User profiles, achievements, and leaderboards
- **Invite Friends**: Seamless friend invitation through LINE and social media

### 💳 Payment Integration
- **Multi-Currency Support**: USDT, USDC, ETH, and native tokens
- **Fiat On-Ramp**: Credit card and bank transfer integration
- **Cross-Chain Payments**: Seamless transfers across supported networks
- **Payment Analytics**: Comprehensive transaction tracking and reporting

## 🏗️ Technical Architecture

### Frontend Stack
```
React 18 + TypeScript
├── Vite (Build Tool)
├── Tailwind CSS (Styling)
├── Radix UI (Component Library)
├── React Router (Navigation)
├── TanStack Query (State Management)
├── Wagmi + Viem (Blockchain Integration)
└── Reown AppKit (Wallet Connectivity)
```

### Backend Infrastructure
```
Node.js + TypeScript
├── Express.js (API Framework)
├── Supabase (Database & Auth)
├── PostgreSQL (Primary Database)
├── Redis (Caching Layer)
├── WebSocket (Real-time Updates)
└── Docker (Containerization)
```

### Smart Contracts
```
Solidity ^0.8.19
├── USDTYieldVault (ERC-4626 Vault)
├── AdvancedStrategyManager (Yield Optimization)
├── YieldNFT (ERC-721 NFT Contract)
├── NFTMarketplace (Trading Platform)
├── NFTStaking (Rewards System)
├── ReferralManager (Social Features)
└── SecurityOracle (Risk Management)
```

## 📦 Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd line-yield-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```bash
   VITE_REOWN_PROJECT_ID=your_project_id_here
   VITE_APP_URL=http://localhost:5173
   VITE_API_BASE_URL=http://localhost:3000
   ```

4. **Get Reown Project ID**
   - Visit [Reown Dashboard](https://dashboard.reown.com)
   - Create a new project
   - Copy your Project ID to the `.env` file

5. **Start development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`

## 📱 Platform Support

### LIFF (LINE Front-end Framework) Integration

#### Technical Implementation
```typescript
// LIFF Integration
import liff from '@line/liff';

const initializeLIFF = async () => {
  await liff.init({
    liffId: process.env.VITE_LIFF_ID,
    withLoginOnExternalBrowser: true
  });
  
  if (liff.isLoggedIn()) {
    const profile = await liff.getProfile();
    const accessToken = liff.getAccessToken();
    // Handle LINE user authentication
  }
};
```

#### LIFF-Specific Features
- **Native LINE Integration**: Seamless login with LINE account
- **LINE Pay Integration**: Direct payment processing through LINE Pay
- **Social Sharing**: Share achievements and referrals through LINE
- **Push Notifications**: Real-time updates via LINE messaging
- **QR Code Generation**: Easy friend invitations via QR codes
- **Deep Linking**: Direct navigation to specific features

#### LIFF Configuration
```javascript
// LIFF App Configuration
{
  "liffId": "your-liff-id",
  "features": {
    "ble": false,
    "qrCode": true,
    "shareTargetPicker": true
  },
  "permissions": [
    "profile",
    "openid",
    "email"
  ]
}
```

### Web Version Features
- **Progressive Web App (PWA)**: Installable web application
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Offline Support**: Cached functionality for offline use
- **Cross-Browser Compatibility**: Support for all modern browsers
- **Performance Optimization**: Lazy loading and code splitting

## 🏗️ Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── WalletConnectButton.tsx
│   ├── NetworkBanner.tsx
│   └── SmartContractInteraction.tsx
├── hooks/               # Custom React hooks
│   ├── useWallet.ts
│   ├── useT.ts
│   └── useNetworkCheck.ts
├── pages/               # Page components
│   ├── LoanPage.tsx
│   ├── ReferralPage.tsx
│   └── NFTPage.tsx
├── providers/           # Context providers
│   └── AppKitProvider.tsx
├── utils/               # Utility functions
│   └── cn.ts
├── App.tsx              # Main application component
├── main.tsx             # Application entry point
└── index.css            # Global styles

packages/shared/src/components/  # Shared components
├── LoanTypes.tsx
├── LoanCreator.tsx
├── LoanManager.tsx
├── ReferralPromotion.tsx
├── NFTCollection.tsx
└── NFTMinter.tsx
```

## 🔧 Configuration

### Environment Variables

#### Frontend (.env)
```bash
# Wallet Integration
VITE_REOWN_PROJECT_ID=your_project_id
VITE_APP_URL=http://localhost:5173

# API Configuration
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000

# LINE Integration
VITE_LIFF_ID=your_liff_id
VITE_LINE_CHANNEL_ID=your_channel_id

# Smart Contracts
VITE_USDT_CONTRACT_ADDRESS=0x...
VITE_LOAN_MANAGER_CONTRACT_ADDRESS=0x...
VITE_NFT_CONTRACT_ADDRESS=0x...
VITE_MARKETPLACE_CONTRACT_ADDRESS=0x...
VITE_STAKING_CONTRACT_ADDRESS=0x...

# Analytics
VITE_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
VITE_MIXPANEL_TOKEN=your_mixpanel_token
```

#### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/line_yield
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

# LINE Integration
LINE_CHANNEL_ACCESS_TOKEN=your_access_token
LINE_CHANNEL_SECRET=your_channel_secret
LINE_PAY_CHANNEL_ID=your_pay_channel_id
LINE_PAY_CHANNEL_SECRET=your_pay_secret

# Payment Processing
STRIPE_SECRET_KEY=sk_test_...
PAYPAL_CLIENT_ID=your_paypal_id
PAYPAL_CLIENT_SECRET=your_paypal_secret

# Blockchain
PRIVATE_KEY=your_private_key
RPC_URL=https://rpc.kaia.one
ETHERSCAN_API_KEY=your_api_key

# Security
ENCRYPTION_KEY=your_encryption_key
CORS_ORIGIN=http://localhost:5173
```

### Network Configuration

The application supports multiple networks:

- **Kaia** (Main network): Chain ID 8217
- **Ethereum**: Chain ID 1
- **Polygon**: Chain ID 137
- **Arbitrum**: Chain ID 42161
- **Base**: Chain ID 8453

## 🎨 UI Components

### Wallet Components

- **WalletConnectButton**: Custom wallet connection button
- **NetworkBanner**: Network switching notifications
- **AppKitButton**: Simple AppKit web component wrapper

### Lending Components

- **LoanTypes**: Display available loan types
- **LoanCreator**: Interactive loan creation
- **LoanManager**: Loan management dashboard

### NFT Components

- **NFTCollection**: Display user's NFT collection
- **NFTMinter**: NFT minting interface

### Referral Components

- **ReferralPromotion**: Referral link generation and sharing

## 🔌 Wallet Connect Flow

### Supported Wallet Types
```typescript
// Wallet Configuration
const supportedWallets = {
  browser: ['MetaMask', 'Coinbase Wallet', 'Rainbow', 'Brave Wallet'],
  mobile: ['WalletConnect', 'Trust Wallet', 'Coinbase Wallet'],
  hardware: ['Ledger', 'Trezor'],
  social: ['Google', 'Twitter', 'Discord', 'GitHub', 'LINE']
};
```

### Connection Flow Architecture
```mermaid
graph TD
    A[User Clicks Connect] --> B{Platform Check}
    B -->|LIFF| C[LINE Social Login]
    B -->|Web| D[Wallet Selection]
    C --> E[LINE Profile Integration]
    D --> F[Wallet Connect Modal]
    F --> G[Wallet Authorization]
    G --> H[Account Connection]
    E --> I[Account Creation/Linking]
    H --> J[Network Validation]
    I --> J
    J --> K[Smart Contract Interaction Ready]
```

### Wallet Integration Code
```typescript
// Wallet Connection Hook
import { useConnect, useAccount, useDisconnect } from 'wagmi';

export const useWalletConnection = () => {
  const { connect, connectors } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const connectWallet = async (connectorId: string) => {
    const connector = connectors.find(c => c.id === connectorId);
    if (connector) {
      await connect({ connector });
    }
  };

  return {
    connectWallet,
    disconnect,
    address,
    isConnected,
    connectors
  };
};
```

### Multi-Chain Support
```typescript
// Network Configuration
export const networks = [
  {
    id: 8217,
    name: 'Kaia',
    rpcUrl: 'https://rpc.kaia.one',
    nativeCurrency: { name: 'Kaia', symbol: 'KAI', decimals: 18 },
    blockExplorer: 'https://explorer.kaia.one'
  },
  {
    id: 1,
    name: 'Ethereum',
    rpcUrl: 'https://eth.llamarpc.com',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    blockExplorer: 'https://etherscan.io'
  }
  // ... other networks
];
```

## 💳 Payment Features

### Payment Processing Architecture
```typescript
// Payment Service
class PaymentService {
  async processPayment(paymentData: PaymentRequest) {
    const { amount, currency, method, recipient } = paymentData;
    
    switch (method) {
      case 'crypto':
        return await this.processCryptoPayment(amount, currency, recipient);
      case 'fiat':
        return await this.processFiatPayment(amount, currency, recipient);
      case 'line_pay':
        return await this.processLinePayPayment(amount, currency, recipient);
      default:
        throw new Error('Unsupported payment method');
    }
  }
}
```

### Supported Payment Methods
- **Cryptocurrency**: USDT, USDC, ETH, KAI, and other supported tokens
- **Fiat On-Ramp**: Credit cards, bank transfers, SEPA
- **LINE Pay**: Direct integration with LINE Pay for LIFF users
- **Cross-Chain**: Atomic swaps and bridge transactions
- **Stablecoins**: USDT, USDC with automatic conversion

### Payment Security
```typescript
// Security Measures
const paymentSecurity = {
  encryption: 'AES-256-GCM',
  validation: 'Multi-signature verification',
  monitoring: 'Real-time fraud detection',
  compliance: 'PCI DSS Level 1',
  backup: 'Multi-signature wallet recovery'
};
```

### Smart Contract Interaction

```typescript
import { useReadContract, useWriteContract } from 'wagmi';

// Read contract data
const { data: balance } = useReadContract({
  address: '0x...',
  abi: USDT_ABI,
  functionName: 'balanceOf',
  args: [userAddress],
});

// Write to contract
const { writeContract } = useWriteContract();
writeContract({
  address: '0x...',
  abi: USDT_ABI,
  functionName: 'transfer',
  args: [recipient, amount],
});
```

## 📱 LINE Integration

### LINE Bot Integration
```typescript
// LINE Bot Service
import { Client } from '@line/bot-sdk';

class LINEBotService {
  private client: Client;

  constructor() {
    this.client = new Client({
      channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
      channelSecret: process.env.LINE_CHANNEL_SECRET
    });
  }

  async sendNotification(userId: string, message: string) {
    await this.client.pushMessage(userId, {
      type: 'text',
      text: message
    });
  }

  async sendRichMessage(userId: string, template: any) {
    await this.client.pushMessage(userId, template);
  }
}
```

### LINE Features
- **Account Linking**: Connect LINE account with blockchain wallet
- **Push Notifications**: Real-time transaction and reward notifications
- **Rich Messages**: Interactive cards for loan status, NFT achievements
- **QR Code Sharing**: Easy referral link sharing
- **Social Login**: One-click authentication with LINE account
- **Payment Integration**: Direct LINE Pay processing

### LINE Pay Integration
```typescript
// LINE Pay Service
class LINEPayService {
  async createPayment(amount: number, currency: string) {
    const response = await fetch('/api/line-pay/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, currency })
    });
    return response.json();
  }

  async confirmPayment(transactionId: string) {
    const response = await fetch('/api/line-pay/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionId })
    });
    return response.json();
  }
}
```

## 👥 Invite Friends System

### Referral Architecture
```typescript
// Referral System
interface ReferralData {
  referrerId: string;
  refereeId: string;
  referralCode: string;
  level: number;
  rewards: {
    referrer: number;
    referee: number;
  };
  status: 'pending' | 'active' | 'completed';
}

class ReferralService {
  async generateReferralCode(userId: string): Promise<string> {
    const code = `${userId.slice(0, 8)}-${Date.now().toString(36)}`;
    await this.saveReferralCode(userId, code);
    return code;
  }

  async processReferral(referralCode: string, newUserId: string) {
    const referrer = await this.getUserByReferralCode(referralCode);
    if (referrer) {
      await this.createReferralRelationship(referrer.id, newUserId);
      await this.distributeRewards(referrer.id, newUserId);
    }
  }
}
```

### Social Sharing Features
- **Multi-Platform Sharing**: LINE, Twitter, Facebook, WhatsApp
- **Custom Referral Links**: Personalized invitation URLs
- **QR Code Generation**: Easy mobile sharing
- **Social Media Integration**: Direct posting to social platforms
- **Achievement Sharing**: Share NFT achievements and milestones

### Referral Rewards Structure
```typescript
// Reward Tiers
const referralRewards = {
  level1: { referrer: 50, referee: 25 }, // Direct referral
  level2: { referrer: 25, referee: 10 },  // Second level
  level3: { referrer: 10, referee: 5 },  // Third level
  bonus: {
    milestone: { users: 10, reward: 100 },
    volume: { threshold: 1000, reward: 200 }
  }
};
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Deploy to Vercel

1. Install Vercel CLI
   ```bash
   npm i -g vercel
   ```

2. Deploy
   ```bash
   vercel
   ```

### Deploy to Netlify

1. Build the project
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to Netlify

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Code Style

- **ESLint**: Configured with React and TypeScript rules
- **Prettier**: Code formatting (configure as needed)
- **TypeScript**: Strict mode enabled

### Testing

```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm test -- --watch
```

## 🎨 UX/UI Design

### Design System
```typescript
// Design Tokens
export const designTokens = {
  colors: {
    primary: {
      50: '#eff6ff',
      500: '#3b82f6',
      900: '#1e3a8a'
    },
    secondary: {
      50: '#f0f9ff',
      500: '#0ea5e9',
      900: '#0c4a6e'
    }
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace']
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  }
};
```

### Component Library
- **Atomic Design**: Atoms, molecules, organisms, templates
- **Accessibility**: WCAG 2.1 AA compliance
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: System preference detection
- **Animation**: Smooth transitions and micro-interactions
- **Loading States**: Skeleton screens and progress indicators

### User Experience Features
- **Onboarding Flow**: Guided setup for new users
- **Progressive Disclosure**: Information revealed as needed
- **Contextual Help**: In-app tooltips and guidance
- **Error Handling**: User-friendly error messages
- **Success Feedback**: Clear confirmation of actions
- **Performance**: Optimized for fast loading and smooth interactions

## 🔒 Security Implementation

### Multi-Layer Security Architecture
```typescript
// Security Configuration
const securityConfig = {
  authentication: {
    method: 'JWT + Refresh Token',
    expiration: '15 minutes',
    refreshExpiration: '7 days',
    mfa: 'TOTP + SMS backup'
  },
  authorization: {
    rbac: 'Role-Based Access Control',
    permissions: 'Granular permission system',
    audit: 'Comprehensive audit logging'
  },
  encryption: {
    atRest: 'AES-256',
    inTransit: 'TLS 1.3',
    keyManagement: 'HSM-backed key storage'
  },
  monitoring: {
    fraudDetection: 'Real-time ML models',
    anomalyDetection: 'Behavioral analysis',
    alerting: 'Multi-channel notifications'
  }
};
```

### Smart Contract Security
```solidity
// Security Patterns
contract SecureVault {
    using SafeERC20 for IERC20;
    
    // Multi-signature requirements
    uint256 public requiredSignatures = 2;
    mapping(bytes32 => uint256) public signatureCount;
    
    // Timelock for critical operations
    uint256 public constant TIMELOCK_DELAY = 2 days;
    
    // Emergency controls
    bool public emergencyMode;
    
    // Access control
    modifier onlyAuthorized() {
        require(hasRole(ADMIN_ROLE, msg.sender), "Unauthorized");
        _;
    }
    
    // Reentrancy protection
    modifier nonReentrant() {
        require(!locked, "Reentrant call");
        locked = true;
        _;
        locked = false;
    }
}
```

### Security Features
- **Multi-Signature Wallets**: Critical operations require multiple signatures
- **Timelock Contracts**: Delayed execution for sensitive changes
- **Emergency Pause**: Circuit breakers for emergency situations
- **Access Control**: Role-based permissions and restrictions
- **Audit Logging**: Comprehensive transaction and access logging
- **Penetration Testing**: Regular security assessments
- **Bug Bounty Program**: Community-driven security testing

### Compliance & Standards
- **PCI DSS**: Payment card industry compliance
- **SOC 2**: Security and availability controls
- **GDPR**: Data protection and privacy compliance
- **ISO 27001**: Information security management
- **Financial Regulations**: Compliance with local financial laws

### Wallet Security

- Users maintain full control of their private keys
- No private keys are stored in the application
- All transactions require user approval
- Network switching requires user confirmation

## 📱 Mobile Support

The application is fully responsive and supports:

- **Mobile Wallets**: WalletConnect compatible mobile wallets
- **Responsive Design**: Mobile-first design approach
- **Touch Interactions**: Optimized for touch devices
- **Progressive Web App**: Can be installed as PWA

## 🔍 Troubleshooting

### Common Issues

1. **"Invalid Project ID"**
   - Verify your Reown Project ID is correct
   - Check that your domain is added to allowed origins

2. **"Network not supported"**
   - Ensure the network is included in your networks array
   - Check network configuration

3. **"Transaction failed"**
   - Verify user has sufficient balance
   - Check contract address and ABI
   - Ensure user is on correct network

4. **"Wallet not connecting"**
   - Check browser console for errors
   - Verify wallet is installed and unlocked
   - Try refreshing the page

### Debug Mode

Enable debug mode in development:

```typescript
// In AppKitProvider.tsx
createAppKit({
  // ... other config
  enableAnalytics: false, // Disable in development
  enableNetworkView: true, // Show network selection
});
```

## 📚 Documentation

- [Reown AppKit Documentation](https://docs.reown.com/appkit)
- [Wagmi Documentation](https://wagmi.sh)
- [Viem Documentation](https://viem.sh)
- [React Query Documentation](https://tanstack.com/query)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📚 Documentation

### API Documentation
- [REST API Reference](https://docs.line-yield.com/api)
- [WebSocket Events](https://docs.line-yield.com/websocket)
- [Smart Contract ABIs](https://docs.line-yield.com/contracts)

### Integration Guides
- [LIFF Integration Guide](https://docs.line-yield.com/liff)
- [Wallet Integration](https://docs.line-yield.com/wallet)
- [Payment Processing](https://docs.line-yield.com/payments)
- [NFT Marketplace](https://docs.line-yield.com/nft)

### Developer Resources
- [SDK Documentation](https://docs.line-yield.com/sdk)
- [Code Examples](https://github.com/line-yield/examples)
- [Best Practices](https://docs.line-yield.com/best-practices)

## 🆘 Support

### Community Channels
- **Discord**: [Join our Discord community](https://discord.gg/line-yield)
- **Telegram**: [Telegram group](https://t.me/lineyield)
- **Twitter**: [Follow us on Twitter](https://twitter.com/lineyield)
- **GitHub**: [GitHub Discussions](https://github.com/line-yield/platform/discussions)

### Support Channels
- **Technical Support**: support@line-yield.com
- **Business Inquiries**: business@line-yield.com
- **Security Issues**: security@line-yield.com
- **Bug Reports**: [GitHub Issues](https://github.com/line-yield/platform/issues)

### Documentation
- **API Docs**: [docs.line-yield.com](https://docs.line-yield.com)
- **Smart Contracts**: [contracts.line-yield.com](https://contracts.line-yield.com)
- **Integration Guides**: [guides.line-yield.com](https://guides.line-yield.com)

---

**Built with ❤️ by the LINE Yield team**

*Empowering the future of decentralized finance through social integration and innovative technology.*