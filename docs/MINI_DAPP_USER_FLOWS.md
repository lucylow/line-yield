# Mini Dapp User Flows Documentation

This document explains the two different user flows implemented for the LINE Yield Mini Dapp, following LINE's official guidelines for Mini Dapp development.

## Overview

The LINE Yield project implements two versions of the Mini Dapp:

1. **LINE Version** (`/line-mini-dapp`) - Deferred wallet connection
2. **Web Version** (`/web-mini-dapp`) - Immediate wallet connection

## LINE Version User Flow

**Flow**: Access Mini Dapp (LIFF) → Consent to Channel → Add Official Account → Play Mini Dapp → Wallet Connect (when needed)

### Implementation Details

- **Route**: `/line-mini-dapp`
- **LIFF Integration**: Uses `@line/liff` SDK for LINE-specific functionality
- **Wallet Connection**: Deferred until user needs to perform wallet-dependent actions (deposit, withdraw, claim rewards)
- **User Experience**: Reduces early drop-off by allowing users to explore the app before connecting wallet

### Step-by-Step Flow

1. **Access Mini Dapp (LIFF)**
   - User opens Mini Dapp within LINE Messenger
   - LIFF SDK initializes and checks authentication status
   - Shows loading screen while initializing

2. **Consent to Channel**
   - User must consent to the channel to continue
   - Shows progress indicator with current step highlighted
   - One-click consent process

3. **Add Official Account**
   - User adds the official LINE account
   - Required for Mini Dapp functionality
   - Simulated process for demonstration

4. **Play Mini Dapp**
   - User can explore the app without wallet connection
   - Shows yield strategies, performance metrics, and demo content
   - Wallet connect button appears only when needed

5. **Wallet Connect (When Needed)**
   - Triggered when user wants to deposit, withdraw, or claim rewards
   - Uses Kaia Mini Dapp SDK functions (`kaia_requestAccounts`, `kaia_accounts`)
   - Seamless integration with Kaia Wallet or MetaMask

### Key Features

- **Deferred Connection**: Wallet connection only when necessary
- **Progressive Disclosure**: Users can explore before committing
- **LINE Integration**: Native LIFF SDK integration
- **Mobile Optimized**: Designed for LINE Messenger environment

## Web Version User Flow

**Flow**: Access Mini Dapp (Web) → Wallet Connect → Play Mini Dapp

### Implementation Details

- **Route**: `/web-mini-dapp`
- **Web Integration**: Standard web application without LIFF
- **Wallet Connection**: Required immediately upon access
- **User Experience**: Direct access to full functionality after wallet connection

### Step-by-Step Flow

1. **Access Mini Dapp (Web)**
   - User opens Mini Dapp in web browser
   - No LIFF initialization required
   - Shows welcome screen with wallet connection prompt

2. **Wallet Connect**
   - Immediate wallet connection required
   - Uses Kaia Mini Dapp SDK functions
   - Supports Kaia Wallet, MetaMask, and other Web3 wallets
   - Shows connection progress and error handling

3. **Play Mini Dapp**
   - Full access to all Mini Dapp features
   - Complete dashboard with deposit/withdraw functionality
   - Real-time balance and transaction history

### Key Features

- **Immediate Connection**: Wallet required for access
- **Cross-Platform**: Works with any Web3 wallet
- **Full Functionality**: Complete feature set available
- **Web Optimized**: Designed for web browser environment

## Technical Implementation

### Mini Dapp SDK Service

The `MiniDappSDK` service (`src/services/MiniDappSDK.ts`) provides:

- **Wallet Functions**: `kaia_accounts()`, `kaia_requestAccounts()`, `kaia_getBalance()`
- **Transaction Functions**: `kaia_sendTransaction()`, `kaia_signMessage()`
- **Network Functions**: `kaia_switchNetwork()`, `kaia_addNetwork()`
- **Environment Detection**: `isLineEnvironment()`, `isWebEnvironment()`

### LIFF Integration

The `useLiff` hook (`src/hooks/useLiff.ts`) provides:

- **Initialization**: LIFF SDK setup and configuration
- **Authentication**: User login status and profile management
- **Error Handling**: Comprehensive error management
- **Context Provider**: React context for LIFF state

### Routing Configuration

Both Mini Dapp versions are accessible via:

- **LINE Version**: `http://localhost:3000/line-mini-dapp`
- **Web Version**: `http://localhost:3000/web-mini-dapp`

## Usage Examples

### LINE Version Usage

```typescript
// Access LINE Mini Dapp
// 1. User opens in LINE Messenger
// 2. LIFF initializes automatically
// 3. User consents to channel
// 4. User adds official account
// 5. User explores app without wallet
// 6. User connects wallet when needed (deposit/withdraw)
```

### Web Version Usage

```typescript
// Access Web Mini Dapp
// 1. User opens in web browser
// 2. Wallet connection prompt appears
// 3. User connects wallet immediately
// 4. Full app functionality available
```

## Best Practices

### LINE Version
- ✅ Defer wallet connection until needed
- ✅ Show progress indicators for onboarding steps
- ✅ Provide demo content before wallet connection
- ✅ Use LIFF SDK for LINE-specific features
- ✅ Optimize for mobile LINE Messenger environment

### Web Version
- ✅ Require immediate wallet connection
- ✅ Provide clear connection instructions
- ✅ Support multiple wallet types
- ✅ Show connection status and errors
- ✅ Optimize for web browser environment

## Environment Variables

Required environment variables:

```env
VITE_LIFF_ID=your_liff_id_here
```

## Dependencies

Key dependencies for Mini Dapp functionality:

```json
{
  "@line/liff": "^2.27.2",
  "ethers": "^6.14.0"
}
```

## Testing

To test both versions:

1. **LINE Version**: 
   - Requires LINE Developer Console setup
   - Test in LINE Messenger or LINE Developer Tools
   - Simulate LIFF initialization

2. **Web Version**:
   - Test in web browser with Web3 wallet
   - Use MetaMask or Kaia Wallet
   - Test wallet connection flow

## Conclusion

Both Mini Dapp versions follow LINE's official guidelines:

- **LINE Version**: Optimized for LINE Messenger with deferred wallet connection
- **Web Version**: Optimized for web browsers with immediate wallet connection

The implementation provides a seamless user experience while respecting the different requirements of each platform.

