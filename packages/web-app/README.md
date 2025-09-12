# LINE Yield Web App

The web version of the LINE Yield stablecoin yield farming platform, built with React and Vite.

## Features

- **Universal Wallet Support**: Connect MetaMask and other Ethereum wallets
- **Cross-Platform Compatibility**: Shared components with LIFF Mini App
- **Real-time Yield Data**: Live updates of vault performance and APY
- **Transaction Management**: Deposit, withdraw, and track transaction history
- **Responsive Design**: Optimized for desktop and mobile browsers

## Architecture

This web app is part of the LINE Yield monorepo and shares components and business logic with the LIFF Mini App through the `@shared` package.

### Key Components

- **Dashboard**: Main interface for managing yield farming
- **ConnectWallet**: Universal wallet connection component
- **BalanceDisplay**: Shows user balance and earned yield
- **TransactionHistory**: Displays transaction records

### Hooks

- **useUniversalWallet**: Handles wallet connections (MetaMask, etc.)
- **useLineYield**: Manages vault operations and data
- **usePlatform**: Detects platform (web vs LIFF)

## Development

### Prerequisites

- Node.js 18+
- npm or yarn
- MetaMask browser extension

### Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3001`

### Build

```bash
npm run build
```

### Environment Variables

Create a `.env.local` file:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_VAULT_CONTRACT_ADDRESS=0x...
VITE_RELAYER_API_URL=http://localhost:3000
VITE_RELAYER_API_KEY=your-api-key
```

## Deployment

The web app is configured to deploy to port 3001, separate from the LIFF app (port 3000).

### Production Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Integration

### Shared Package

This app uses the `@shared` package for:
- UI components (Button, Layout, etc.)
- Business logic hooks
- Service layer (wallet, vault, relayer)
- Platform detection

### API Integration

- **Backend API**: `http://localhost:3000/api`
- **Relayer Service**: For gasless transactions (LIFF only)
- **Vault Contract**: Smart contract for yield farming

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Security

- Wallet connections are handled securely
- Private keys never leave the user's wallet
- All transactions are signed locally
- HTTPS required for production deployment
