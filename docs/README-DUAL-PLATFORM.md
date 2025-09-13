# LINE Yield - Dual Platform Architecture

This repository implements a comprehensive dual-platform React app architecture that supports both LINE LIFF (Mini App) and standard Web versions with shared components, platform detection, and environment-specific configurations.

## 🏗️ Architecture Overview

The project uses a monorepo structure with three main packages:

- **`packages/shared/`** - Shared components, hooks, and services
- **`packages/web-app/`** - Standard web application
- **`packages/liff-app/`** - LINE LIFF Mini App

## 🚀 Key Features

### Platform Detection
- Automatic detection of LIFF vs Web environment
- Platform-specific UI adaptations
- Touch-friendly optimizations for mobile LIFF

### Universal Wallet Integration
- Works with MetaMask (Web) and LINE Wallet (LIFF)
- Cross-platform account linking
- Persistent wallet state

### Gasless Transactions
- LIFF version uses relayer for gasless transactions
- Web version uses direct wallet transactions
- Unified API for both platforms

### Shared Component Library
- Platform-aware components that adapt to environment
- Consistent UI/UX across both versions
- Responsive design for mobile and desktop

## 📁 Project Structure

```
packages/
├── shared/                 # Shared components and logic
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── hooks/         # React hooks
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utility functions
│   └── package.json
├── web-app/               # Web application
│   ├── src/
│   │   ├── providers/     # Web-specific providers
│   │   └── App.tsx
│   ├── vite.config.ts
│   └── package.json
└── liff-app/              # LIFF Mini App
    ├── src/
    │   ├── providers/     # LIFF-specific providers
    │   └── App.tsx
    ├── vite.config.ts
    └── package.json
```

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# Install dependencies for all packages
npm install

# Build shared package
npm run build:shared

# Start development servers
npm run dev:web    # Web app on port 3001
npm run dev:liff   # LIFF app on port 3000 (HTTPS)
```

### Environment Configuration

#### LIFF App (.env)
```bash
VITE_LIFF_ID=your_liff_id_here
VITE_API_BASE_URL=http://localhost:3000
VITE_RELAYER_API_URL=http://localhost:3000
VITE_VAULT_CONTRACT_ADDRESS=0x...
```

#### Web App (.env)
```bash
VITE_API_BASE_URL=http://localhost:3000
VITE_VAULT_CONTRACT_ADDRESS=0x...
```

## 🎯 Core Components

### Platform Detection Hook
```typescript
const { isLiff, isWeb, isMobile, platform } = usePlatform();
```

### Universal Wallet Hook
```typescript
const { wallet, connectWallet, disconnectWallet } = useUniversalWallet();
```

### Line Yield Hook
```typescript
const { vaultData, deposit, withdraw, isDepositing } = useLineYield();
```

## 🔧 Build & Deployment

### Build Commands
```bash
# Build all packages
npm run build

# Build specific platform
npm run build:web
npm run build:liff

# Build shared package only
npm run build:shared
```

### Deployment
```bash
# Deploy both platforms
./scripts/deploy.sh
```

## 🌐 Platform-Specific Features

### LIFF (Mini App)
- Gasless transactions via relayer
- LINE Wallet integration
- Mobile-optimized UI
- Touch-friendly interactions
- No sourcemaps in production

### Web App
- Direct wallet transactions
- MetaMask integration
- Desktop-optimized features
- Dark mode support
- Full development tools

## 🔐 Security Features

- Cross-platform account linking
- Secure transaction signing
- Relayer service for gasless transactions
- Environment-specific configurations

## 📱 Mobile Optimization

- Responsive design for all screen sizes
- Touch-friendly button sizes
- Safe area handling for iOS
- Platform-specific navigation patterns

## 🚀 Performance

- Code splitting by platform
- Shared component optimization
- Lazy loading for non-critical features
- Optimized bundle sizes

## 🧪 Testing

The architecture supports comprehensive testing across both platforms:

```bash
# Test shared components
npm run test --workspace=@line-yield/shared

# Test platform-specific features
npm run test --workspace=@line-yield/web-app
npm run test --workspace=@line-yield/liff-app
```

## 📚 API Reference

### Shared Hooks
- `usePlatform()` - Platform detection
- `useUniversalWallet()` - Wallet management
- `useLineYield()` - DeFi operations

### Shared Components
- `Button` - Platform-aware button
- `Layout` - Responsive layout
- `Header` - Navigation header
- `Footer` - Page footer (Web only)
- `ConnectWallet` - Wallet connection
- `BalanceDisplay` - Balance information
- `TransactionHistory` - Transaction list

### Services
- `WalletService` - Wallet operations
- `VaultService` - Vault interactions
- `RelayerService` - Gasless transactions
- `AccountService` - Account management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on both platforms
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- [LINE LIFF Documentation](https://developers.line.biz/en/docs/liff/)
- [Kaia Network Documentation](https://docs.kaia.io/)
- [Ethers.js Documentation](https://docs.ethers.io/)
