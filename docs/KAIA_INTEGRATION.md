# Kaia Wallet Integration Documentation

This document provides comprehensive documentation for the Kaia Wallet Provider integration in the LINE Yield Mini Dapp, including wallet connection, transaction handling, and LINE SDK integration.

## Overview

The Kaia integration provides:
- **Wallet Connection**: Seamless connection to Kaia wallets using `kaia_requestAccounts`
- **Balance Fetching**: Real-time KAIA and USDT balance queries
- **Transaction Sending**: Gas fee delegation for zero-cost transactions
- **LINE Integration**: Friend invitation and social sharing features
- **Session Management**: Automatic reconnection and state persistence

## Components

### 1. useKaiaWallet Hook

Core hook for Kaia wallet functionality:

```typescript
const {
  isConnected,
  account,
  kaiaBalance,
  usdtBalance,
  isLoading,
  error,
  network,
  connectWallet,
  disconnectWallet,
  refreshBalances,
  sendTransaction,
  signMessage,
  connectAndSign,
  switchNetwork
} = useKaiaWallet();
```

**Location**: `src/hooks/useKaiaWallet.ts`

**Key Features**:
- Automatic wallet detection and reconnection
- Real-time balance updates
- Gas fee delegation support
- Network switching (Testnet/Mainnet)
- Error handling and user feedback

### 2. KaiaWalletConnection Component

User interface for wallet connection and management:

```typescript
<KaiaWalletConnection 
  showDetails={true}
  className="custom-class"
/>
```

**Location**: `src/components/KaiaWalletConnection.tsx`

**Features**:
- Connect/disconnect wallet
- Display balances (KAIA and USDT)
- Network switching
- Address copying and explorer links
- Real-time balance refresh

### 3. KaiaTransactionPanel Component

Transaction interface for deposits and withdrawals:

```typescript
<KaiaTransactionPanel className="custom-class" />
```

**Location**: `src/components/KaiaTransactionPanel.tsx`

**Features**:
- Deposit/withdraw USDT
- Gas fee delegation (zero cost to user)
- Transaction progress tracking
- Real-time transaction status
- Explorer integration

### 4. useLineInvite Hook

LINE Mini Dapp SDK integration for social features:

```typescript
const {
  isInviteAvailable,
  isLoading,
  error,
  inviteFriends,
  shareToLine,
  shareToFriends
} = useLineInvite();
```

**Location**: `src/hooks/useLineInvite.ts`

**Features**:
- Friend invitation via LINE SDK
- Social sharing to LINE
- Referral link generation
- Cross-platform sharing fallbacks

### 5. LineInvitePanel Component

Social sharing and referral interface:

```typescript
<LineInvitePanel 
  userAddress={account}
  className="custom-class"
/>
```

**Location**: `src/components/LineInvitePanel.tsx`

**Features**:
- Generate referral links
- Invite friends via LINE
- Share to social platforms
- Referral statistics
- Custom message support

## Kaia SDK Methods

### Wallet Connection

#### kaia_requestAccounts()
Triggers wallet connection UI and returns connected addresses:

```javascript
const accounts = await window.kaia_requestAccounts();
if (accounts.length > 0) {
  const primaryAccount = accounts[0];
  console.log('Connected:', primaryAccount);
}
```

#### kaia_accounts()
Query currently connected addresses without triggering UI:

```javascript
const accounts = await window.kaia_accounts();
// Returns array of connected addresses
```

### Balance Queries

#### kaia_getBalance()
Get native KAIA balance:

```javascript
const balanceHex = await window.kaia_getBalance(account);
const balance = BigInt(balanceHex) / BigInt(10**18); // Convert from wei
```

#### getErc20TokenBalance()
Get ERC-20 token balance (USDT):

```javascript
const balanceHex = await window.getErc20TokenBalance({
  account: account,
  contractAddress: usdtContractAddress
});
const balance = BigInt(balanceHex) / BigInt(10**6); // USDT has 6 decimals
```

### Transaction Sending

#### kaia_sendTransaction()
Send transaction with gas fee delegation:

```javascript
const txHash = await window.kaia_sendTransaction({
  from: account,
  to: contractAddress,
  data: encodedFunctionCall,
  value: '0x0',
  gasLimit: '0x186A0',
  gasPrice: '0x0' // Gas fee delegation
});
```

#### kaia_signTransaction()
Sign transaction for gas fee delegation:

```javascript
const signedTx = await window.kaia_signTransaction({
  from: account,
  to: contractAddress,
  data: encodedFunctionCall,
  value: '0x0'
});
```

### Message Signing

#### kaia_signMessage()
Sign arbitrary message:

```javascript
const signature = await window.kaia_signMessage('Hello World');
```

#### kaia_connectAndSign()
Connect wallet and sign message in one flow:

```javascript
const signature = await window.kaia_connectAndSign('Authentication message');
```

### Wallet Management

#### disconnectWallet()
Disconnect wallet session:

```javascript
await window.disconnectWallet();
```

#### kaia_switchNetwork()
Switch between networks:

```javascript
const success = await window.kaia_switchNetwork('0x3e9'); // Testnet
const success = await window.kaia_switchNetwork('0x2015'); // Mainnet
```

## LINE Mini Dapp SDK Integration

### Friend Invitation

#### inviteFriends()
Invite friends via LINE Mini Dapp SDK:

```javascript
const success = await window.lineMiniApp.inviteFriends({
  message: 'Join me on LINE Yield!',
  url: 'https://your-dapp-url.com',
  imageUrl: 'https://your-image-url.com'
});
```

#### shareToLine()
Share content to LINE:

```javascript
const success = await window.lineMiniApp.shareToLine(
  'Check out LINE Yield!',
  'https://your-dapp-url.com'
);
```

#### shareToFriends()
Share with friends:

```javascript
const success = await window.lineMiniApp.shareToFriends(
  'Join me on LINE Yield!',
  'https://your-dapp-url.com'
);
```

### LIFF SDK Fallback

For environments without LINE Mini Dapp SDK:

```javascript
// Using LIFF SDK
const success = await window.liff.shareTargetPicker([{
  type: 'text',
  text: 'Join me on LINE Yield!'
}]);
```

## Network Configuration

### Testnet Configuration
```javascript
const TESTNET = {
  chainId: '0x3e9', // 1001 in hex
  chainName: 'Kaia Testnet',
  rpcUrls: ['https://api.baobab.klaytn.net:8651'],
  blockExplorerUrls: ['https://baobab.klaytnscope.com'],
  nativeCurrency: {
    name: 'KAIA',
    symbol: 'KAIA',
    decimals: 18
  }
};
```

### Mainnet Configuration
```javascript
const MAINNET = {
  chainId: '0x2015', // 8217 in hex
  chainName: 'Kaia Mainnet',
  rpcUrls: ['https://public-en-cypress.klaytn.net'],
  blockExplorerUrls: ['https://klaytnscope.com'],
  nativeCurrency: {
    name: 'KAIA',
    symbol: 'KAIA',
    decimals: 18
  }
};
```

## Token Addresses

### USDT Contract Addresses
```javascript
const TOKEN_ADDRESSES = {
  TESTNET: {
    USDT: '0xceE8FAF64bE97bF70b95FE6537A2CFC48a5E7F75'
  },
  MAINNET: {
    USDT: '0xceE8FAF64bE97bF70b95FE6537A2CFC48a5E7F75'
  }
};
```

## Gas Fee Delegation

### Implementation
The app leverages Kaia's gas fee delegation feature to provide zero-cost transactions for users:

1. **Transaction Preparation**: Encode function calls for deposit/withdraw
2. **Gas Delegation**: Set `gasPrice: '0x0'` to delegate gas fees
3. **User Approval**: User signs transaction in wallet
4. **Broadcasting**: Transaction sent with delegated gas fees

### Benefits
- **Zero Cost**: Users pay no gas fees
- **Better UX**: Seamless transaction experience
- **Higher Adoption**: Removes barrier to entry
- **Viral Growth**: Easy sharing and onboarding

## Error Handling

### Wallet Connection Errors
```javascript
try {
  const accounts = await window.kaia_requestAccounts();
} catch (error) {
  if (error.code === 4001) {
    // User rejected connection
  } else if (error.code === -32002) {
    // Already processing request
  } else {
    // Other error
  }
}
```

### Transaction Errors
```javascript
try {
  const txHash = await window.kaia_sendTransaction(params);
} catch (error) {
  if (error.code === 4001) {
    // User rejected transaction
  } else if (error.code === -32603) {
    // Internal error
  } else {
    // Other error
  }
}
```

## Usage Examples

### Complete Wallet Integration
```typescript
import { useKaiaWallet } from '@/hooks/useKaiaWallet';

function MyComponent() {
  const {
    isConnected,
    account,
    kaiaBalance,
    usdtBalance,
    connectWallet,
    sendTransaction
  } = useKaiaWallet();

  const handleDeposit = async (amount: string) => {
    if (!isConnected) {
      await connectWallet();
      return;
    }

    const txHash = await sendTransaction({
      to: vaultAddress,
      data: encodeDepositFunction(amount),
      value: '0x0'
    });

    console.log('Transaction hash:', txHash);
  };

  return (
    <div>
      {isConnected ? (
        <div>
          <p>Account: {account}</p>
          <p>KAIA Balance: {kaiaBalance}</p>
          <p>USDT Balance: {usdtBalance}</p>
          <button onClick={() => handleDeposit('100')}>
            Deposit 100 USDT
          </button>
        </div>
      ) : (
        <button onClick={connectWallet}>
          Connect Wallet
        </button>
      )}
    </div>
  );
}
```

### LINE Integration
```typescript
import { useLineInvite } from '@/hooks/useLineInvite';

function InviteComponent() {
  const { inviteFriends, shareToLine } = useLineInvite();

  const handleInvite = async () => {
    await inviteFriends({
      message: 'Join me on LINE Yield!',
      url: 'https://your-dapp-url.com'
    });
  };

  return (
    <button onClick={handleInvite}>
      Invite Friends
    </button>
  );
}
```

## Testing

### Development Environment
1. Install Kaia Wallet browser extension
2. Switch to Kaia Testnet
3. Get testnet KAIA from faucet
4. Get testnet USDT tokens
5. Test wallet connection and transactions

### Production Deployment
1. Ensure proper network configuration
2. Update contract addresses
3. Configure gas fee delegation
4. Test on mainnet with small amounts
5. Monitor transaction success rates

## Security Considerations

### Wallet Security
- Never store private keys in the app
- Use official Kaia Wallet Provider only
- Validate all transaction parameters
- Implement proper error handling

### Transaction Security
- Validate contract addresses
- Check transaction parameters
- Implement transaction limits
- Monitor for suspicious activity

### LINE Integration Security
- Validate referral links
- Implement rate limiting
- Monitor for spam/abuse
- Secure API endpoints

## Troubleshooting

### Common Issues

#### Wallet Not Detected
```javascript
if (typeof window.kaia_requestAccounts !== 'function') {
  console.error('Kaia Wallet Provider not found');
  // Show install wallet message
}
```

#### Transaction Fails
```javascript
// Check network
if (network !== expectedNetwork) {
  await switchNetwork('testnet');
}

// Check balance
if (parseFloat(usdtBalance) < amount) {
  console.error('Insufficient balance');
}
```

#### LINE Invite Not Working
```javascript
if (!window.lineMiniApp) {
  // Fallback to LIFF SDK or manual sharing
  await navigator.clipboard.writeText(inviteLink);
}
```

## Best Practices

1. **Always check wallet availability** before making calls
2. **Handle errors gracefully** with user-friendly messages
3. **Provide loading states** for async operations
4. **Validate inputs** before sending transactions
5. **Use proper network configuration** for each environment
6. **Implement proper error boundaries** for React components
7. **Monitor transaction success rates** in production
8. **Provide clear user feedback** for all operations

## API Reference

### useKaiaWallet Hook
- `connectWallet()`: Connect to Kaia wallet
- `disconnectWallet()`: Disconnect wallet
- `refreshBalances()`: Refresh token balances
- `sendTransaction(params)`: Send transaction with gas delegation
- `signMessage(message)`: Sign arbitrary message
- `connectAndSign(message)`: Connect and sign in one flow
- `switchNetwork(network)`: Switch between testnet/mainnet

### useLineInvite Hook
- `inviteFriends(options)`: Invite friends via LINE
- `shareToLine(message, url)`: Share to LINE
- `shareToFriends(message, url)`: Share with friends

## Support

For issues or questions:
- Check Kaia Wallet documentation
- Review LINE Mini Dapp SDK docs
- Test in development environment first
- Monitor browser console for errors
- Use proper error handling patterns
