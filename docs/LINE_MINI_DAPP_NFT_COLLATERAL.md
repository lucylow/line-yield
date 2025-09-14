# LINE Mini Dapp NFT Collateral System

A comprehensive NFT collateral system integrated with LINE's mini dapp platform, allowing LINE users to use their NFTs as collateral to borrow stablecoins through LIFF (LINE Front-end Framework) with support for multiple wallets.

## 🚀 Features

### LINE Integration
- **LIFF Integration**: Native LINE mini dapp experience
- **LINE Profile**: Access to LINE user profile and authentication
- **Share to LINE**: Share NFT collateral information with friends
- **LINE Wallet**: Native LINE wallet integration
- **External Wallet Support**: OKX, Bitget, MetaMask compatibility

### NFT Collateral Features
- **NFT Selection**: Choose from supported NFT collections
- **Collateral Valuation**: Real-time NFT price assessment
- **Borrowing**: Instant stablecoin loans against NFT collateral
- **Repayment**: Flexible repayment options
- **Position Management**: Track and manage collateral positions
- **Liquidation Protection**: Advanced risk management

### Wallet Support
- **LINE Mini Dapp Wallet**: Native LINE wallet integration
- **OKX Wallet**: Multi-chain wallet support
- **Bitget Wallet**: Exchange wallet integration
- **MetaMask**: Browser extension wallet
- **WalletConnect**: Universal wallet connector

## 🏗️ Architecture

### Frontend Components

#### LIFF App Structure (`packages/liff-app/`)
```
packages/liff-app/
├── src/
│   ├── App.tsx                    # Main LIFF app component
│   ├── components/
│   │   └── NFTCollateralMiniDapp.tsx  # NFT collateral component
│   ├── liff-config.ts             # LIFF configuration and utilities
│   └── main.tsx                   # App entry point
├── package.json                   # LIFF app dependencies
└── vite.config.ts                 # Vite configuration
```

#### Key Components

**NFTCollateralMiniDapp.tsx**
- Complete NFT collateral interface optimized for LINE mini dapp
- Wallet connection with LINE, OKX, Bitget support
- NFT selection and borrowing interface
- Position management and repayment
- Real-time status updates

**liff-config.ts**
- LIFF configuration and utilities
- Wallet detection and connection
- NFT utilities and price fetching
- LINE-specific features (sharing, external links)
- Error handling utilities

### Backend Integration

The LINE mini dapp connects to the same backend services as the web version:

- **NFT Collateral Service**: `backend/src/services/nft-collateral-service.ts`
- **NFT API Routes**: `backend/src/routes/nft.ts`
- **Price Oracle**: Real-time NFT valuation
- **Liquidation Engine**: Risk management and liquidation

### Smart Contracts

The same smart contracts are used for both web and LINE mini dapp:

- **NFTCollateralVault.sol**: Main collateral vault contract
- **NFTPriceOracle.sol**: Price oracle for NFT valuation
- **LiquidationEngine.sol**: Liquidation logic and risk management

## 📱 LINE Mini Dapp Setup

### LIFF Configuration

1. **Create LIFF App**:
   ```bash
   # In LINE Developers Console
   # Create new LIFF app with these settings:
   # - App type: Mini app
   # - Size: Full
   # - Endpoint URL: https://your-domain.com/liff
   # - Scope: profile, openid, chat_message.write, share_target_picker
   ```

2. **Environment Variables**:
   ```bash
   # .env.local
   VITE_LIFF_ID=your-liff-id-here
   VITE_LIFF_REDIRECT_URI=https://your-domain.com/liff
   VITE_API_URL=https://api.line-yield.com/api
   ```

3. **Deploy LIFF App**:
   ```bash
   # Build and deploy to your hosting service
   npm run build:liff
   # Deploy dist/ folder to your LIFF endpoint
   ```

### Wallet Integration

#### LINE Wallet Integration
```typescript
// Connect to LINE wallet
const connectLineWallet = async () => {
  const liff = window.liff;
  
  if (!liff.isLoggedIn()) {
    liff.login();
    return;
  }
  
  const profile = await liff.getProfile();
  
  // Connect to LINE's built-in wallet or external wallet
  if (window.ethereum) {
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    return accounts[0];
  }
};
```

#### OKX Wallet Integration
```typescript
// Connect to OKX wallet
const connectOKXWallet = async () => {
  if (!window.okxwallet) {
    throw new Error('OKX Wallet not available');
  }
  
  const accounts = await window.okxwallet.request({ 
    method: 'eth_requestAccounts' 
  });
  return accounts[0];
};
```

#### Bitget Wallet Integration
```typescript
// Connect to Bitget wallet
const connectBitgetWallet = async () => {
  if (!window.bitget) {
    throw new Error('Bitget Wallet not available');
  }
  
  const accounts = await window.bitget.request({ 
    method: 'eth_requestAccounts' 
  });
  return accounts[0];
};
```

## 🔧 Development

### Local Development

1. **Install Dependencies**:
   ```bash
   cd packages/liff-app
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Test LIFF Integration**:
   ```bash
   # Use ngrok or similar to expose local server
   ngrok http 3000
   # Update LIFF endpoint URL in LINE Developers Console
   ```

### Building for Production

1. **Build LIFF App**:
   ```bash
   npm run build:liff
   ```

2. **Deploy to Hosting**:
   ```bash
   # Deploy dist/ folder to your hosting service
   # Update LIFF endpoint URL in LINE Developers Console
   ```

## 📱 User Experience

### LINE Mini Dapp Flow

1. **Access**: User opens LINE mini dapp from LINE chat or browser
2. **Authentication**: LIFF handles LINE authentication automatically
3. **Wallet Connection**: User connects LINE wallet or external wallet
4. **NFT Selection**: User selects NFT from their wallet
5. **Borrowing**: User specifies borrow amount and confirms transaction
6. **Position Management**: User can view and manage their positions
7. **Repayment**: User can repay loans to reclaim NFTs
8. **Sharing**: User can share their NFT collateral experience with friends

### Mobile Optimization

- **Responsive Design**: Optimized for mobile devices
- **Touch Interactions**: Touch-friendly interface elements
- **Fast Loading**: Optimized for mobile network conditions
- **Offline Support**: Basic offline functionality
- **Push Notifications**: LINE push notification integration

## 🔒 Security Considerations

### LIFF Security
- **HTTPS Required**: All LIFF apps must use HTTPS
- **Domain Validation**: LIFF endpoint URL validation
- **Scope Limitations**: Limited access to LINE user data
- **Token Management**: Secure token handling

### Wallet Security
- **Private Key Protection**: Never store private keys
- **Transaction Signing**: User-controlled transaction signing
- **Address Validation**: Comprehensive address validation
- **Phishing Protection**: Clear wallet connection indicators

### Smart Contract Security
- **Access Control**: Role-based access control
- **Reentrancy Protection**: ReentrancyGuard implementation
- **Input Validation**: Comprehensive input validation
- **Emergency Controls**: Emergency pause and withdrawal functions

## 🧪 Testing

### LIFF Testing

1. **Local Testing**:
   ```bash
   # Use ngrok to expose local server
   ngrok http 3000
   # Test LIFF app in LINE Developers Console
   ```

2. **Staging Testing**:
   ```bash
   # Deploy to staging environment
   # Test with real LINE users
   ```

3. **Production Testing**:
   ```bash
   # Deploy to production
   # Monitor user feedback and analytics
   ```

### Wallet Testing

1. **LINE Wallet**: Test with LINE mini dapp wallet
2. **OKX Wallet**: Test with OKX mobile app
3. **Bitget Wallet**: Test with Bitget mobile app
4. **MetaMask**: Test with MetaMask mobile app

## 📊 Analytics and Monitoring

### LINE Analytics
- **LIFF Analytics**: Built-in LINE analytics
- **User Engagement**: Track user interactions
- **Conversion Rates**: Monitor conversion funnels
- **Error Tracking**: Monitor and track errors

### Custom Analytics
- **Wallet Connections**: Track wallet connection success rates
- **NFT Transactions**: Monitor NFT collateral transactions
- **User Behavior**: Track user journey and behavior
- **Performance Metrics**: Monitor app performance

## 🚀 Deployment

### LIFF App Deployment

1. **Build Application**:
   ```bash
   npm run build:liff
   ```

2. **Deploy to Hosting**:
   ```bash
   # Deploy dist/ folder to your hosting service
   # Examples: Vercel, Netlify, AWS S3, etc.
   ```

3. **Update LIFF Configuration**:
   ```bash
   # Update LIFF endpoint URL in LINE Developers Console
   # Test the deployed app
   ```

### Backend Deployment

1. **Deploy Backend Services**:
   ```bash
   cd backend
   npm run build
   npm start
   ```

2. **Deploy Smart Contracts**:
   ```bash
   # Deploy contracts to Kaia network
   npm run deploy:testnet
   npm run deploy:mainnet
   ```

3. **Update Configuration**:
   ```bash
   # Update contract addresses in backend config
   # Update API endpoints in frontend config
   ```

## 📚 API Reference

### LIFF API

```typescript
// Initialize LIFF
liff.init({ liffId: 'your-liff-id' });

// Check login status
const isLoggedIn = liff.isLoggedIn();

// Get user profile
const profile = await liff.getProfile();

// Share to LINE
await liff.shareTargetPicker([{
  type: 'text',
  text: 'Check out my NFT collateral!'
}]);

// Open external link
liff.openWindow({
  url: 'https://example.com',
  external: true
});
```

### NFT Collateral API

```typescript
// Get user positions
GET /api/nft/positions/:userAddress

// Get NFT value
GET /api/nft/value/:nftContract/:tokenId

// Calculate max borrow
GET /api/nft/max-borrow/:nftContract/:tokenId

// Mock borrow (for testing)
POST /api/nft/mock-borrow

// Mock repay (for testing)
POST /api/nft/mock-repay
```

## 🤝 Contributing

### Development Setup

1. **Clone Repository**:
   ```bash
   git clone https://github.com/line-yield/line-yield.git
   cd line-yield
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   cd packages/liff-app && npm install
   ```

3. **Set up LIFF**:
   ```bash
   # Create LIFF app in LINE Developers Console
   # Update environment variables
   ```

4. **Start Development**:
   ```bash
   npm run dev:liff
   ```

### Code Style

- **TypeScript**: Strict type checking
- **ESLint**: Comprehensive linting rules
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks

### Testing Requirements

- **Unit Tests**: Component and utility testing
- **Integration Tests**: LIFF and wallet integration
- **E2E Tests**: Complete user flow testing
- **Security Tests**: Security vulnerability testing

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- **LIFF Documentation**: [LINE Developers Documentation](https://developers.line.biz/en/docs/liff/)
- **API Documentation**: `/api` endpoint for complete API reference
- **Component Documentation**: Inline JSDoc comments

### Community
- **GitHub Issues**: Report bugs and request features
- **LINE Developer Community**: Join LINE developer discussions
- **Discord**: Join our community for support

### Troubleshooting

#### Common Issues

1. **LIFF Not Loading**:
   - Check LIFF ID configuration
   - Verify HTTPS endpoint
   - Check browser console for errors

2. **Wallet Connection Failed**:
   - Check wallet availability
   - Verify network connection
   - Check wallet permissions

3. **NFT Not Found**:
   - Verify NFT contract address
   - Check token ID validity
   - Ensure NFT is in user's wallet

#### Debug Mode

Enable debug mode for detailed logging:

```bash
# LIFF Debug
VITE_DEBUG=true npm run dev:liff

# Wallet Debug
VITE_WALLET_DEBUG=true npm run dev:liff
```

## 🔮 Future Enhancements

### Planned Features
- **Multi-language Support**: Japanese, Korean, English
- **Advanced Analytics**: Detailed user behavior tracking
- **Social Features**: NFT sharing and social interactions
- **Gamification**: NFT collection and achievement system
- **Cross-chain Support**: Multi-blockchain NFT support

### Integration Opportunities
- **LINE Pay**: Integration with LINE Pay for payments
- **LINE Blockchain**: Integration with LINE's blockchain services
- **LINE Games**: Integration with LINE Games platform
- **LINE Shopping**: Integration with LINE Shopping platform

---

For more information, visit our [documentation](https://docs.line-yield.com) or contact our team at [support@line-yield.com](mailto:support@line-yield.com).

