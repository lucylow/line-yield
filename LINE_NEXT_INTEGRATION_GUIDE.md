# LINE NEXT Integration Guide

This guide explains how LINE Yield is integrated with LINE NEXT ecosystem for enhanced social features and user experience.

## Overview

LINE Yield integrates with LINE NEXT through the LIFF (LINE Front-end Framework) SDK, providing:

- **Social Sharing**: Invite friends and share yield earnings
- **Profile Integration**: Access LINE user profiles and authentication
- **Native LINE Features**: Utilize LINE's built-in sharing and messaging capabilities
- **Cross-Platform**: Works seamlessly in both LINE app and web browsers

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   LINE App      │    │   LINE Yield     │    │   Kaia Network  │
│                 │    │                  │    │                 │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ │ LIFF SDK    │◄┼────┼►│ LIFF Provider │ │    │ │ Smart       │ │
│ │             │ │    │ │              │ │    │ │ Contracts   │ │
│ └─────────────┘ │    │ └──────────────┘ │    │ │             │ │
│                 │    │                  │    │ └─────────────┘ │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │                 │
│ │ Share API   │◄┼────┼►│ Share Service │ │    │                 │
│ │ Profile API │ │    │ │ Profile Hook  │ │    │                 │
│ └─────────────┘ │    │ └──────────────┘ │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Components

### 1. LineNextProvider

**Location**: `src/providers/LineNextProvider.tsx`

Provides LINE NEXT context and functionality:

```typescript
interface LineNextContextType {
  isInitialized: boolean;
  isLoggedIn: boolean;
  userId: string | null;
  displayName: string | null;
  profilePictureUrl: string | null;
  login: () => void;
  logout: () => void;
  shareTargetPicker: (messages: any[], options?: any) => Promise<void>;
  openWindow: (url: string) => void;
}
```

### 2. useLineNext Hook

**Location**: `src/hooks/useLineNext.ts`

Simplifies LINE NEXT integration:

```typescript
const {
  isInitialized,
  isLoggedIn,
  displayName,
  features,
  inviteFriends,
  shareContent,
  openExternalLink
} = useLineNextIntegration();
```

### 3. LineNextIntegration Component

**Location**: `src/components/LineNextIntegration.tsx`

UI component for LINE NEXT features:

- **Connection Status**: Shows LINE login status
- **Invite Friends**: Send invitations to LINE contacts
- **Share Content**: Share yield earnings and app information
- **External Links**: Open documentation and support links

## Features

### 1. Friend Invitations

```typescript
const inviteFriends = async (message: string) => {
  const messages = [{
    type: 'text',
    text: message
  }];

  await lineNext.shareTargetPicker(messages, {
    isMultiple: false // Restrict to single friend
  });
};
```

### 2. Content Sharing

```typescript
const shareContent = async (content: any) => {
  await lineNext.shareTargetPicker([content], {
    isMultiple: true
  });
};
```

### 3. Profile Access

```typescript
const profile = await liff.getProfile();
// Returns: { userId, displayName, pictureUrl, statusMessage }
```

### 4. External Window Opening

```typescript
const openExternalLink = (url: string) => {
  liff.openWindow({ url, external: true });
};
```

## Configuration

### LIFF ID Setup

1. **LINE Developers Console**: Create a new LIFF app
2. **Environment Variables**: Set `VITE_LIFF_ID` in your environment
3. **LIFF Configuration**: Update `packages/liff-app/src/config/liff.ts`

```typescript
export const LIFF_CONFIG = {
  liffId: import.meta.env.VITE_LIFF_ID || 'your-liff-id-here',
  features: {
    shareTargetPicker: true,
    openWindow: true,
    getProfile: true,
    sendMessages: true,
    getIDToken: true,
  }
};
```

### Share Templates

Pre-configured message templates for different sharing scenarios:

```typescript
shareTemplates: {
  inviteFriend: {
    type: 'text',
    text: 'Join me on LINE Yield! Earn yield on your Kaia-USDT safely and easily! 🚀'
  },
  shareYield: {
    type: 'text',
    text: '🚀 LINE Yield - Earn up to 12% APY on Kaia-USDT!\n\n✅ Secure & Audited\n✅ Gasless Transactions\n✅ Mobile Optimized\n\nStart earning today!'
  },
  shareEarnings: (amount: string, apy: string) => ({
    type: 'text',
    text: `💰 I just earned ${amount} with LINE Yield!\n\nAPY: ${apy}\n\nJoin me and start earning today! 🚀`
  })
}
```

## Deployment

### 1. LIFF App Deployment

```bash
# Build LIFF app
pnpm run build:liff

# Deploy to your hosting service
# Update LIFF URL in LINE Developers Console
```

### 2. Environment Setup

```bash
# Copy environment template
cp packages/liff-app/env.example packages/liff-app/.env

# Update with your LIFF ID and configuration
VITE_LIFF_ID=your-actual-liff-id
```

### 3. LINE Developers Console

1. **Create LIFF App**: Register new LIFF application
2. **Set Endpoint URL**: Point to your deployed app URL
3. **Configure Features**: Enable required LIFF APIs
4. **Test Integration**: Use LINE app to test functionality

## Testing

### 1. Local Development

```bash
# Start LIFF app development server
pnpm run dev:liff

# Test in LINE app using ngrok or similar tunneling service
```

### 2. Feature Testing

- **Login/Logout**: Test LINE authentication flow
- **Share Target Picker**: Test friend invitation functionality
- **Profile Access**: Verify user profile data retrieval
- **External Links**: Test window opening functionality

### 3. Error Handling

The integration includes comprehensive error handling:

```typescript
try {
  await liff.shareTargetPicker(messages, options);
  return { success: true };
} catch (error) {
  console.error('Share failed:', error);
  return { success: false, error: error.message };
}
```

## Security Considerations

1. **LIFF ID Protection**: Keep LIFF ID secure and don't expose in client-side code
2. **Profile Data**: Handle user profile data according to privacy regulations
3. **External Links**: Validate URLs before opening external windows
4. **Error Messages**: Don't expose sensitive information in error messages

## Troubleshooting

### Common Issues

1. **LIFF Not Initialized**: Check LIFF ID and network connectivity
2. **Share API Unavailable**: Verify LIFF app configuration in LINE Developers Console
3. **Profile Access Denied**: Check user permissions and LIFF app settings
4. **External Link Blocked**: Ensure URLs are whitelisted in LIFF configuration

### Debug Mode

Enable debug logging:

```typescript
// In liff.ts
console.log('LIFF initialized:', {
  isLoggedIn: liff.isLoggedIn(),
  isInClient: liff.isInClient(),
  os: liff.getOS(),
  version: liff.getVersion(),
});
```

## Future Enhancements

1. **Rich Messages**: Support for LINE's rich message formats
2. **QR Code Scanning**: Integrate with LINE's QR code functionality
3. **Payment Integration**: Utilize LINE Pay for fiat transactions
4. **Social Features**: Implement user rankings and social sharing
5. **Notifications**: Push notifications through LINE messaging

## Support

For LINE NEXT integration support:

- **LINE Developers Documentation**: https://developers.line.biz/en/docs/liff/
- **LINE Yield Support**: https://support.line-yield.com
- **Community**: https://t.me/lineyield
