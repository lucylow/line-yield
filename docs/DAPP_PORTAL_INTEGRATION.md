# Dapp Portal Integration Guide

This guide provides comprehensive documentation for integrating with the Dapp Portal ecosystem, including Mini Dapp development, wallet integration, and payment systems.

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Mini Dapp Development](#mini-dapp-development)
3. [Dapp Portal Features](#dapp-portal-features)
4. [Kaia Wave Program](#kaia-wave-program)
5. [API Reference](#api-reference)
6. [Code Examples](#code-examples)
7. [Design Guidelines](#design-guidelines)
8. [Security Considerations](#security-considerations)

## 🚀 Getting Started

### Prerequisites

- LINE Developer Account
- Kaia-compatible wallet (Kaia Wallet, MetaMask)
- Basic knowledge of React/JavaScript
- Understanding of blockchain concepts

### Quick Setup

1. **Create Mini Dapp Project**
```bash
npx create-react-app my-mini-dapp
cd my-mini-dapp
npm install @line/liff @line/mini-app-sdk
```

2. **Initialize LINE SDK**
```javascript
import { liff } from '@line/liff';

const initLiff = async () => {
  await liff.init({ liffId: 'YOUR_LIFF_ID' });
  if (!liff.isLoggedIn()) {
    liff.login();
  }
};
```

3. **Connect to Dapp Portal**
```javascript
import { DappPortal } from '@line/dapp-portal-sdk';

const portal = new DappPortal({
  chainId: '8217', // Kaia mainnet
  rpcUrl: 'https://public-en-cypress.klaytn.net'
});
```

## 🎯 Mini Dapp Development

### SDK Integration

The Mini Dapp SDK provides essential functionality for building decentralized applications within LINE Messenger.

#### Core Features

- **Wallet Integration**: Seamless connection to Kaia-compatible wallets
- **Payment Processing**: Support for crypto and fiat payments
- **User Authentication**: LINE-based user management
- **Cross-platform Compatibility**: Works on iOS, Android, and Web

#### Installation

```bash
npm install @line/mini-dapp-sdk
```

#### Basic Usage

```javascript
import { MiniDappSDK } from '@line/mini-dapp-sdk';

const sdk = new MiniDappSDK({
  appId: 'YOUR_APP_ID',
  environment: 'production'
});

// Initialize the SDK
await sdk.init();

// Connect wallet
const wallet = await sdk.connectWallet();
console.log('Connected wallet:', wallet.address);
```

### Development Guidelines

#### 1. Tab Naming

- Use descriptive, concise tab names
- Maximum 20 characters
- Avoid special characters
- Use title case

```javascript
const tabConfig = {
  title: 'LINE Yield',
  subtitle: 'Earn Automated Yield',
  icon: 'yield-icon.png'
};
```

#### 2. OpenGraph Settings

```javascript
const openGraphConfig = {
  title: 'LINE Yield - Automated DeFi Earnings',
  description: 'Maximize your USDT earnings through automated yield strategies',
  image: 'https://your-domain.com/og-image.png',
  url: 'https://your-domain.com'
};
```

#### 3. Z-Index Management

```css
/* Recommended z-index values */
.modal-overlay { z-index: 1000; }
.dropdown-menu { z-index: 1001; }
.tooltip { z-index: 1002; }
.notification { z-index: 1003; }
```

## 🔗 Dapp Portal Features

### Wallet Integration

The Dapp Portal provides seamless wallet connectivity for Mini Dapps.

#### Supported Wallets

- **Kaia Wallet**: Native Kaia blockchain wallet
- **MetaMask**: Ethereum-compatible wallet
- **WalletConnect**: Multi-wallet support
- **LINE Wallet**: LINE's native wallet solution

#### Implementation

```javascript
import { WalletManager } from '@line/dapp-portal-sdk';

const walletManager = new WalletManager({
  supportedWallets: ['kaia', 'metamask', 'walletconnect'],
  defaultChain: 'kaia'
});

// Connect wallet
const connection = await walletManager.connect('kaia');
if (connection.success) {
  console.log('Wallet connected:', connection.address);
}
```

### Payment Systems

#### Crypto Payments (KAIA)

```javascript
import { PaymentProcessor } from '@line/dapp-portal-sdk';

const paymentProcessor = new PaymentProcessor({
  chainId: '8217',
  currency: 'KAIA'
});

// Process payment
const payment = await paymentProcessor.createPayment({
  amount: '1000000000000000000', // 1 KAIA in wei
  recipient: '0x...',
  description: 'LINE Yield Deposit'
});

// Execute payment
const result = await paymentProcessor.executePayment(payment.id);
```

#### Fiat Payments (Stripe)

```javascript
import { StripePayment } from '@line/dapp-portal-sdk';

const stripePayment = new StripePayment({
  publishableKey: 'pk_test_...',
  currency: 'USD'
});

// Create payment intent
const intent = await stripePayment.createIntent({
  amount: 10000, // $100.00 in cents
  currency: 'usd',
  description: 'LINE Yield Deposit'
});

// Process payment
const result = await stripePayment.processPayment(intent.client_secret);
```

## 🌊 Kaia Wave Program

### Program Benefits

- **Technical Support**: Direct access to LINE NEXT's development team
- **Marketing Promotion**: Featured placement in Dapp Portal
- **Grant Opportunities**: Funding for innovative projects
- **Community Access**: Exclusive developer community

### Application Process

1. **Submit Project Proposal**
2. **Technical Review**
3. **Community Voting**
4. **Final Approval**

### Requirements

- Innovative use case
- Technical feasibility
- Community value
- Compliance with guidelines

## 📚 API Reference

### Mini Dapp SDK

#### Methods

##### `init(options)`
Initialize the Mini Dapp SDK.

**Parameters:**
- `options.appId` (string): Your Mini Dapp ID
- `options.environment` (string): 'development' or 'production'

**Returns:** Promise<void>

##### `connectWallet()`
Connect to a supported wallet.

**Returns:** Promise<WalletConnection>

##### `sendTransaction(transaction)`
Send a blockchain transaction.

**Parameters:**
- `transaction.to` (string): Recipient address
- `transaction.value` (string): Amount in wei
- `transaction.data` (string): Transaction data

**Returns:** Promise<TransactionResult>

### Dapp Portal SDK

#### Methods

##### `WalletManager.connect(walletType)`
Connect to a specific wallet type.

**Parameters:**
- `walletType` (string): 'kaia', 'metamask', 'walletconnect'

**Returns:** Promise<ConnectionResult>

##### `PaymentProcessor.createPayment(paymentData)`
Create a new payment.

**Parameters:**
- `paymentData.amount` (string): Payment amount
- `paymentData.recipient` (string): Recipient address
- `paymentData.description` (string): Payment description

**Returns:** Promise<Payment>

## 💻 Code Examples

### Complete Mini Dapp Example

```javascript
import React, { useState, useEffect } from 'react';
import { MiniDappSDK } from '@line/mini-dapp-sdk';
import { PaymentProcessor } from '@line/dapp-portal-sdk';

const LineYieldApp = () => {
  const [sdk, setSdk] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState('0');

  useEffect(() => {
    const initSDK = async () => {
      const miniDappSDK = new MiniDappSDK({
        appId: process.env.REACT_APP_LIFF_ID,
        environment: 'production'
      });

      await miniDappSDK.init();
      setSdk(miniDappSDK);
    };

    initSDK();
  }, []);

  const connectWallet = async () => {
    if (!sdk) return;

    try {
      const walletConnection = await sdk.connectWallet();
      setWallet(walletConnection);
      
      // Get balance
      const walletBalance = await sdk.getBalance(walletConnection.address);
      setBalance(walletBalance);
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  const depositFunds = async (amount) => {
    if (!sdk || !wallet) return;

    try {
      const paymentProcessor = new PaymentProcessor({
        chainId: '8217',
        currency: 'USDT'
      });

      const payment = await paymentProcessor.createPayment({
        amount: amount,
        recipient: '0x...', // Vault contract address
        description: 'LINE Yield Deposit'
      });

      const result = await paymentProcessor.executePayment(payment.id);
      
      if (result.success) {
        console.log('Deposit successful:', result.transactionHash);
      }
    } catch (error) {
      console.error('Deposit failed:', error);
    }
  };

  return (
    <div className="line-yield-app">
      <h1>LINE Yield</h1>
      
      {!wallet ? (
        <button onClick={connectWallet}>
          Connect Wallet
        </button>
      ) : (
        <div>
          <p>Wallet: {wallet.address}</p>
          <p>Balance: {balance} USDT</p>
          <button onClick={() => depositFunds('1000000000000000000')}>
            Deposit 1 USDT
          </button>
        </div>
      )}
    </div>
  );
};

export default LineYieldApp;
```

### Wallet Integration Example

```javascript
import { WalletManager } from '@line/dapp-portal-sdk';

class WalletService {
  constructor() {
    this.walletManager = new WalletManager({
      supportedWallets: ['kaia', 'metamask'],
      defaultChain: 'kaia'
    });
  }

  async connectWallet(walletType = 'kaia') {
    try {
      const connection = await this.walletManager.connect(walletType);
      
      if (connection.success) {
        return {
          address: connection.address,
          chainId: connection.chainId,
          walletType: walletType
        };
      } else {
        throw new Error(connection.error);
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw error;
    }
  }

  async getBalance(address) {
    try {
      const balance = await this.walletManager.getBalance(address);
      return balance;
    } catch (error) {
      console.error('Failed to get balance:', error);
      throw error;
    }
  }

  async sendTransaction(transaction) {
    try {
      const result = await this.walletManager.sendTransaction(transaction);
      return result;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  }
}

export default WalletService;
```

## 🎨 Design Guidelines

### Visual Design

#### Color Palette
- **Primary Green**: #10B981 (Emerald-500)
- **Secondary Blue**: #3B82F6 (Blue-500)
- **Accent Purple**: #8B5CF6 (Violet-500)
- **Text Dark**: #1F2937 (Gray-800)
- **Background Light**: #F9FAFB (Gray-50)

#### Typography
- **Headings**: Inter, system-ui, sans-serif
- **Body**: Inter, system-ui, sans-serif
- **Code**: JetBrains Mono, monospace

#### Spacing
- **Small**: 4px
- **Medium**: 8px
- **Large**: 16px
- **Extra Large**: 24px

### Responsive Design

#### Breakpoints
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

#### Layout Guidelines
- Use flexible grid systems
- Implement touch-friendly interfaces
- Optimize for mobile-first design
- Ensure landscape mode compatibility

### Accessibility

#### Requirements
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

#### Implementation
```css
/* Focus indicators */
.focusable:focus {
  outline: 2px solid #10B981;
  outline-offset: 2px;
}

/* High contrast support */
@media (prefers-contrast: high) {
  .button {
    border: 2px solid currentColor;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 🔒 Security Considerations

### Best Practices

#### 1. Input Validation
```javascript
const validateAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

const validateAmount = (amount) => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
};
```

#### 2. Secure Communication
```javascript
// Use HTTPS for all API calls
const apiClient = axios.create({
  baseURL: 'https://api.dappportal.io',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});
```

#### 3. Private Key Management
- Never store private keys in localStorage
- Use secure key management services
- Implement proper session management
- Use hardware wallets when possible

#### 4. Smart Contract Security
```solidity
// Example secure contract pattern
contract SecureVault {
    mapping(address => uint256) private balances;
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }
    
    function deposit() external payable {
        require(msg.value > 0, "Invalid amount");
        balances[msg.sender] += msg.value;
    }
}
```

### Security Checklist

- [ ] Input validation implemented
- [ ] HTTPS enforced
- [ ] Private keys secured
- [ ] Smart contracts audited
- [ ] Error handling implemented
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Content Security Policy set

## 🚀 Deployment

### Production Checklist

- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] CDN configured
- [ ] Monitoring set up
- [ ] Error tracking enabled
- [ ] Performance optimization
- [ ] Security headers configured

### Environment Configuration

```javascript
// Production configuration
const config = {
  apiUrl: 'https://api.dappportal.io',
  chainId: '8217',
  rpcUrl: 'https://public-en-cypress.klaytn.net',
  environment: 'production',
  debug: false
};
```

## 📞 Support

### Resources

- **Documentation**: [docs.dappportal.io](https://docs.dappportal.io)
- **Community**: [Discord](https://discord.gg/dappportal)
- **GitHub**: [github.com/line/dapp-portal](https://github.com/line/dapp-portal)
- **Support**: [support@dappportal.io](mailto:support@dappportal.io)

### Getting Help

1. Check the documentation first
2. Search existing issues
3. Join the community Discord
4. Contact support team

---

*This documentation is automatically generated from the Dapp Portal documentation. For the most up-to-date information, please refer to the official documentation.*
