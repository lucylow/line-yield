# LINE Yield Frontend

A modern React application built with Vite, integrating Reown AppKit for seamless wallet connectivity and comprehensive DeFi functionality including lending, NFT rewards, and referral systems.

## 🚀 Features

- **Wallet Integration**: Seamless connection with 300+ wallets via Reown AppKit
- **Multi-Chain Support**: Kaia, Ethereum, Polygon, Arbitrum, Base networks
- **Lending Platform**: Multiple loan types with flexible terms and collateral management
- **NFT Rewards**: Gamified rewards system with tiered NFT badges
- **Referral System**: Comprehensive referral program with tracking and rewards
- **Smart Contract Interaction**: Direct interaction with blockchain contracts
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **TypeScript**: Full type safety and better developer experience

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, CSS Modules
- **Wallet**: Reown AppKit (WalletConnect v3), Wagmi, Viem
- **State Management**: React Query (TanStack Query)
- **Build Tool**: Vite
- **Package Manager**: npm

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

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_REOWN_PROJECT_ID` | Reown AppKit project ID | Yes |
| `VITE_APP_URL` | Application URL | Yes |
| `VITE_API_BASE_URL` | Backend API URL | Yes |
| `VITE_USDT_CONTRACT_ADDRESS` | USDT contract address | No |
| `VITE_LOAN_MANAGER_CONTRACT_ADDRESS` | Loan manager contract | No |
| `VITE_NFT_CONTRACT_ADDRESS` | NFT contract address | No |

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

## 🔌 Wallet Integration

### Supported Wallets

- **Browser Wallets**: MetaMask, Coinbase Wallet, Rainbow, etc.
- **Mobile Wallets**: WalletConnect compatible wallets
- **Hardware Wallets**: Ledger, Trezor
- **Social Login**: Google, Twitter, Discord, GitHub

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

## 🔒 Security

### Best Practices

1. **Environment Variables**: Never commit sensitive data
2. **Network Validation**: Always validate user's network
3. **Input Validation**: Validate all user inputs
4. **Error Handling**: Proper error boundaries and handling
5. **HTTPS**: Always use HTTPS in production

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

## 🆘 Support

- **Documentation**: Check the docs folder
- **Issues**: Create an issue on GitHub
- **Discord**: Join our Discord community
- **Email**: Contact support@line-yield.com

---

**Built with ❤️ by the LINE Yield team**