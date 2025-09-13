# LINE Yield Security Implementation Guide

This document provides a comprehensive guide to the secure implementation of LINE Yield using Supabase and backend services, following industry best practices for credential management and sensitive operations.

## 🔒 Security Architecture Overview

Our security implementation follows the principle of **separation of concerns**:

- **Frontend**: Only handles user interactions and displays data
- **Backend**: Handles all sensitive operations, private keys, and API credentials
- **Database**: Stores encrypted data with proper access controls

## 🛡️ Core Security Principles

### 1. Never Expose Sensitive Credentials in Frontend

❌ **NEVER DO THIS:**
```typescript
// DON'T: Expose private keys in frontend
const PRIVATE_KEY = "0x1234567890abcdef..."; // SECURITY RISK!
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."; // SECURITY RISK!
```

✅ **DO THIS INSTEAD:**
```typescript
// Frontend only uses anon keys
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."; // Safe for frontend
```

### 2. Backend-Only Sensitive Operations

All operations involving private keys, service role keys, or sensitive data are handled exclusively on the backend:

- Wallet signing
- Database operations requiring elevated privileges
- API calls with sensitive credentials
- Transaction broadcasting

### 3. Secure Communication

- All API communication uses HTTPS
- Request/response validation
- Rate limiting to prevent abuse
- User signature verification for authentication

## 📁 File Structure

```
├── backend/
│   ├── src/
│   │   ├── config/index.ts              # Environment variable management
│   │   ├── services/SecureApiService.ts # Backend wallet operations
│   │   └── routes/secure.ts             # Secure API endpoints
├── src/
│   ├── services/SecureApiClient.ts      # Frontend API client
│   ├── hooks/useSecureApi.ts            # React hook for secure operations
│   └── integrations/supabase/
│       └── secure-client.ts             # Secure Supabase configuration
└── env.example.frontend                 # Frontend environment template
```

## 🔧 Implementation Details

### Backend Configuration (`backend/src/config/index.ts`)

```typescript
export const CONFIG: AppConfig = {
  // ... other config
  
  security: {
    jwtSecret: process.env['JWT_SECRET'] || 'your-secret-key-change-in-production',
    rateLimitWindowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '60000'),
    rateLimitMaxRequests: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100'),
    encryptionKey: process.env['ENCRYPTION_KEY'] || '',
    apiRateLimitSecret: process.env['API_RATE_LIMIT_SECRET'] || 'rate-limit-secret'
  },
  
  supabase: {
    url: process.env['SUPABASE_URL'] || '',
    serviceRoleKey: process.env['SUPABASE_SERVICE_ROLE_KEY'] || '', // Backend only
    anonKey: process.env['SUPABASE_ANON_KEY'] || ''
  },
  
  lovable: {
    clientSecret: process.env['LOVABLE_CLIENT_SECRET'] || '', // Backend only
    apiKey: process.env['LOVABLE_API_KEY'] || '' // Backend only
  }
};
```

### Secure API Service (`backend/src/services/SecureApiService.ts`)

```typescript
export class SecureApiService {
  private wallet: ethers.Wallet;
  private provider: ethers.JsonRpcProvider;

  private constructor() {
    // Initialize wallet with private key from environment variables
    this.provider = new ethers.JsonRpcProvider(CONFIG.kaia.rpcUrl);
    this.wallet = new ethers.Wallet(CONFIG.kaia.walletPrivateKey, this.provider);
  }

  public async signTransaction(txData: any): Promise<SignedTransaction> {
    // Sign transaction with backend wallet
    const signedTx = await this.wallet.signTransaction(transaction);
    return { signedTx, txHash, gasEstimate, nonce };
  }
}
```

### Frontend API Client (`src/services/SecureApiClient.ts`)

```typescript
export class SecureApiClient {
  private api: AxiosInstance;

  public async createDepositTransaction(
    userAddress: string,
    amount: string,
    signer: ethers.Signer
  ): Promise<SignedTransaction> {
    // Get user nonce
    const userNonce = await this.getUserNonce(userAddress);
    
    // Generate message for signing
    const message = this.generateSignMessage(userAddress, userNonce.nonce);
    
    // Sign the message
    const signature = await this.signMessage(message, signer);
    
    // Send to backend for transaction signing
    const response = await this.api.post('/deposit', {
      userAddress,
      amount,
      method: 'deposit',
      nonce: userNonce.nonce,
      signature,
      message
    });
    
    return response.data.data;
  }
}
```

### Secure Supabase Configuration (`src/integrations/supabase/secure-client.ts`)

```typescript
// Frontend Supabase configuration - ONLY uses anon key
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Security validation
export function validateSupabaseConfig(): void {
  // Check that we're not accidentally using service role key
  if (SUPABASE_ANON_KEY.includes('eyJ')) {
    const decoded = JSON.parse(atob(SUPABASE_ANON_KEY.split('.')[1]));
    if (decoded.role === 'service_role') {
      throw new Error('SECURITY ERROR: Service role key detected in frontend!');
    }
  }
}
```

## 🔐 Environment Variables

### Backend Environment Variables (`backend/env.example`)

```bash
# Sensitive credentials (Backend Only)
WALLET_PRIVATE_KEY=your_wallet_private_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
LOVABLE_CLIENT_SECRET=your_lovable_client_secret
ENCRYPTION_KEY=your_32_character_encryption_key

# Public configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Frontend Environment Variables (`env.example.frontend`)

```bash
# Public configuration only
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_API_BASE_URL=http://localhost:3000
VITE_LIFF_ID=your_liff_app_id_here
```

## 🚀 Usage Examples

### 1. Secure Deposit Transaction

```typescript
import { useSecureApi } from '@/hooks/useSecureApi';

function DepositComponent() {
  const { createDepositTransaction, broadcastTransaction, isLoading } = useSecureApi();

  const handleDeposit = async (amount: string) => {
    try {
      // 1. Create and sign transaction on backend
      const signedTx = await createDepositTransaction(amount);
      
      // 2. Broadcast to network
      const txHash = await broadcastTransaction(signedTx.signedTx);
      
      console.log('Transaction successful:', txHash);
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };

  return (
    <button onClick={() => handleDeposit('100')} disabled={isLoading}>
      {isLoading ? 'Processing...' : 'Deposit 100 USDC'}
    </button>
  );
}
```

### 2. User Authentication with Signature

```typescript
import { useSecureApi } from '@/hooks/useSecureApi';

function AuthComponent() {
  const { verifySignature } = useSecureApi();

  const authenticateUser = async (userAddress: string, message: string, signature: string) => {
    try {
      const isValid = await verifySignature(userAddress, message, signature);
      
      if (isValid) {
        console.log('User authenticated successfully');
      } else {
        console.log('Authentication failed');
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };
}
```

### 3. Secure Supabase Operations

```typescript
import { supabase } from '@/integrations/supabase/secure-client';

// Safe frontend operations (using anon key)
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId);

// Sensitive operations are handled by backend API
const response = await fetch('/api/secure/user-data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId })
});
```

## 🛡️ Security Best Practices

### 1. Environment Variable Management

- ✅ Store sensitive credentials in backend environment variables
- ✅ Use `.env` files for development (never commit to version control)
- ✅ Use secure secret managers in production (AWS Secrets Manager, Azure Key Vault, etc.)
- ❌ Never commit `.env` files to version control
- ❌ Never expose private keys in frontend code

### 2. API Security

- ✅ Use HTTPS for all API communication
- ✅ Implement rate limiting to prevent abuse
- ✅ Validate all input data
- ✅ Use proper authentication (signature verification)
- ✅ Log all sensitive operations for audit trails

### 3. Database Security

- ✅ Use Row Level Security (RLS) in Supabase
- ✅ Implement proper access controls
- ✅ Encrypt sensitive data at rest
- ✅ Use service role key only on backend
- ✅ Use anon key only on frontend

### 4. Wallet Security

- ✅ Never expose private keys in frontend
- ✅ Use hardware wallets when possible
- ✅ Implement proper nonce management
- ✅ Validate all transactions before signing
- ✅ Use secure random number generation

## 🔍 Security Checklist

### Development Setup

- [ ] Backend environment variables configured with secure values
- [ ] Frontend environment variables contain only public keys
- [ ] `.env` files added to `.gitignore`
- [ ] Supabase RLS policies configured
- [ ] API rate limiting implemented
- [ ] Input validation implemented
- [ ] Error handling implemented

### Production Deployment

- [ ] All sensitive credentials stored in secure secret manager
- [ ] HTTPS enabled for all endpoints
- [ ] Database access controls configured
- [ ] Monitoring and logging enabled
- [ ] Security headers configured
- [ ] Regular security audits scheduled

### Code Review

- [ ] No private keys in frontend code
- [ ] No service role keys in frontend code
- [ ] All API calls use HTTPS
- [ ] Input validation on all endpoints
- [ ] Proper error handling
- [ ] Audit logging implemented

## 🚨 Security Warnings

### Critical Security Issues

1. **Never expose private keys in frontend code**
   ```typescript
   // ❌ CRITICAL SECURITY RISK
   const PRIVATE_KEY = "0x1234567890abcdef...";
   ```

2. **Never use service role keys in frontend**
   ```typescript
   // ❌ CRITICAL SECURITY RISK
   const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
   ```

3. **Never commit `.env` files with real credentials**
   ```bash
   # ❌ CRITICAL SECURITY RISK
   WALLET_PRIVATE_KEY=0x1234567890abcdef...
   ```

### Common Mistakes to Avoid

- Exposing sensitive credentials in client-side code
- Using service role keys in frontend applications
- Storing private keys in version control
- Not validating user input
- Not implementing proper error handling
- Not using HTTPS for API communication
- Not implementing rate limiting
- Not logging security events

## 📚 Additional Resources

- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [Ethereum Security Best Practices](https://consensys.github.io/smart-contract-best-practices/)
- [OWASP Security Guidelines](https://owasp.org/www-project-top-ten/)
- [LINE Mini App Security](https://developers.line.biz/en/docs/liff/security/)

## 🆘 Security Incident Response

If you discover a security vulnerability or incident:

1. **Immediately** revoke any exposed credentials
2. **Notify** the development team
3. **Document** the incident and response
4. **Update** security measures to prevent recurrence
5. **Conduct** a security audit

## 📞 Support

For security-related questions or concerns:

- Create a private issue in the repository
- Contact the development team directly
- Follow responsible disclosure practices

---

**Remember**: Security is an ongoing process, not a one-time implementation. Regular audits, updates, and monitoring are essential for maintaining a secure application.
