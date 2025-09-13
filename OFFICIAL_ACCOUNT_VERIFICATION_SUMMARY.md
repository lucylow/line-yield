# Official Account (OA) Verification & Friend Prompting - Complete Solution

## 🎯 Overview

This document provides a comprehensive solution for verifying that your LINE Official Account (OA) is properly linked and has the "Add friend option" aggressively set. It includes both **manual configuration steps** and **programmatic verification tools**.

## 🔧 Manual Configuration (Required)

### Step 1: Set "Add friend option" to Aggressive

**This is a manual step that must be done in the LINE Developers Console:**

1. Go to [LINE Developers Console](https://developers.line.biz/console/)
2. Navigate to your **LINE Login Channel**
3. Go to the **LIFF** tab
4. Find your published LIFF app and click **"Edit"**
5. Scroll down to **"Add friend option"**
6. **Set to "On (aggressive)"** ⚠️ **This is crucial!**
7. Click **"Save"**

**Why this is important:**
- Enables automatic friend prompting when users access your LIFF app
- Works together with programmatic friend prompting for maximum effectiveness
- Cannot be configured programmatically - must be done manually in the console

### Step 2: Verify Official Account Linking

1. Ensure your Official Account is properly linked to your Messaging API Channel
2. Configure webhook URL for messaging functionality
3. Test that the Official Account can send and receive messages

## 🤖 Programmatic Verification

### Enhanced Verification Service

Our verification system now includes Official Account checks:

```typescript
// Check Official Account status
const verificationService = new LineVerificationService(
  channelAccessToken,
  channelId,
  providerId
);

const result = await verificationService.verifyCompleteSetup();
console.log('Official Account Status:', result.officialAccount);
```

### What Gets Verified

✅ **Official Account Exists**: Checks if OA is properly linked  
✅ **Messaging Capability**: Verifies OA can send/receive messages  
✅ **Webhook Status**: Confirms webhook is active and configured  
✅ **Friend Prompt Configuration**: Validates manual setting (requires manual check)  

### CLI Verification

```bash
cd backend
npm run verify-line-setup
```

**Sample Output:**
```
🤖 Official Account:
  ✅ Status: Active and linked
  🆔 Bot ID: 1234567890
  💬 Can Send Messages: Yes
  🔗 Webhook Active: Yes
  👥 Friend Prompt Configured: Yes

💡 Recommendations:
  IMPORTANT: Manually configure "Add friend option" in LINE Developers Console
  Go to LINE Login Channel > LIFF > Add friend option > Set to "On (aggressive)"
```

## 📱 Programmatic Friend Prompting

### React Component

```tsx
import { LineFriendPrompt } from '@/components/LineFriendPrompt';

function App() {
  return (
    <LineFriendPrompt 
      liffId="YOUR_LIFF_ID"
      officialAccountUserId="YOUR_OA_USER_ID"
      autoPrompt={true}
      showStatus={true}
      onFriendAdded={() => console.log('Friend prompt sent!')}
    />
  );
}
```

### LIFF SDK Implementation

```typescript
import liff from '@line/liff';

// Initialize LIFF
await liff.init({ liffId: 'YOUR_LIFF_ID' });

// Check if user is in LINE client and logged in
if (liff.isInClient() && liff.isLoggedIn()) {
  // Prompt user to add Official Account
  await liff.follow('YOUR_OA_USER_ID');
  
  // Send welcome message
  await liff.sendMessages([{
    type: 'text',
    text: 'Welcome to LINE Yield! Start earning yield on your crypto assets.'
  }]);
}
```

### Complete Service Class

```typescript
import { LiffFriendPromptService } from './examples/liff-friend-prompt-example';

const liffService = new LiffFriendPromptService(LIFF_ID, OFFICIAL_ACCOUNT_USER_ID);

// Initialize and auto-prompt
await liffService.initialize();

// Get user profile
const profile = await liffService.getUserProfile();

// Send welcome message
await liffService.sendWelcomeMessage();
```

## 🔍 API Endpoints

### Check Official Account Status

```bash
curl -X POST http://localhost:3000/api/line/verify \
  -H "Content-Type: application/json" \
  -d '{
    "channelAccessToken": "YOUR_TOKEN",
    "channelId": "YOUR_CHANNEL_ID",
    "providerId": "YOUR_PROVIDER_ID"
  }'
```

**Response includes:**
```json
{
  "result": {
    "officialAccount": {
      "exists": true,
      "active": true,
      "info": {
        "botId": "1234567890",
        "isActive": true,
        "canSendMessages": true,
        "webhookActive": true
      },
      "friendPromptConfigured": true
    }
  }
}
```

## 🎯 Frontend Integration

### Verification Status Component

```tsx
import { LineVerificationStatus } from '@/components/LineVerificationStatus';

function Dashboard() {
  return (
    <div className="space-y-4">
      <LineVerificationStatus 
        autoRefresh={true}
        refreshInterval={30000}
      />
      
      <LineFriendPrompt 
        liffId={process.env.REACT_APP_LIFF_ID}
        officialAccountUserId={process.env.REACT_APP_OA_USER_ID}
        autoPrompt={true}
      />
    </div>
  );
}
```

## 📋 Complete Checklist

### Manual Configuration ✅
- [ ] LINE Login Channel created
- [ ] Messaging API Channel created and linked
- [ ] LIFF app created and published
- [ ] **"Add friend option" set to "On (aggressive)"** ⚠️ **CRITICAL**
- [ ] Official Account linked to Messaging API Channel
- [ ] Webhook URL configured and tested

### Programmatic Implementation ✅
- [ ] Environment variables configured
- [ ] Verification service integrated
- [ ] Friend prompting component implemented
- [ ] LIFF SDK properly initialized
- [ ] Error handling implemented
- [ ] User feedback mechanisms in place

### Testing ✅
- [ ] Run verification script: `npm run verify-line-setup`
- [ ] Test friend prompting in LINE client
- [ ] Verify welcome messages are sent
- [ ] Test error handling scenarios
- [ ] Validate user experience flow

## 🚨 Important Notes

### Manual vs Programmatic

1. **"Add friend option" aggressive setting**: **MANUAL ONLY** - Must be configured in LINE Developers Console
2. **Friend prompting code**: **PROGRAMMATIC** - Can be implemented in your LIFF app
3. **Both work together**: Manual setting enables automatic prompts, code provides additional control

### Best Practices

1. **Always set manual configuration first** - The console setting is the foundation
2. **Implement programmatic prompting as enhancement** - Don't rely on code alone
3. **Test in real LINE environment** - Friend prompting only works in LINE client
4. **Handle errors gracefully** - Users might not be in LINE client or might reject friend requests
5. **Monitor and track friend additions** - Use analytics to measure effectiveness

## 🔗 Related Files

- **Backend Service**: `backend/src/services/line-verification-service.ts`
- **API Routes**: `backend/src/routes/line-verification.ts`
- **Verification Script**: `backend/scripts/verify-line-setup.ts`
- **Frontend Component**: `src/components/LineVerificationStatus.tsx`
- **Friend Prompt Component**: `src/components/LineFriendPrompt.tsx`
- **LIFF Example**: `examples/liff-friend-prompt-example.ts`
- **Documentation**: `docs/LINE_VERIFICATION_GUIDE.md`

## 📞 Support

If you need help:

1. **Check verification script output** for specific error messages
2. **Review LINE Developers Console** for manual configuration
3. **Test in LINE client environment** for friend prompting
4. **Check LINE API documentation** for latest updates
5. **Create an issue** in the project repository

---

**Remember**: The "Add friend option" aggressive setting is **manually configured** in LINE Developers Console, while the friend prompting code is **programmatically implemented** in your LIFF app. Both work together to provide the best user experience!


