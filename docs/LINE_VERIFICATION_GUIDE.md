# LINE Integration Verification Guide

This guide provides comprehensive instructions for setting up and verifying your LINE integration for the LINE Yield protocol. It includes both manual setup steps and automated verification tools.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [LINE Developers Console Setup](#line-developers-console-setup)
3. [Environment Configuration](#environment-configuration)
4. [Automated Verification](#automated-verification)
5. [API Endpoints](#api-endpoints)
6. [Frontend Integration](#frontend-integration)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

## 🚀 Prerequisites

Before starting the LINE integration setup, ensure you have:

- A LINE Developer Account
- Access to LINE Developers Console
- Node.js 18+ installed
- Basic understanding of LINE Messaging API and LIFF

## 🔧 LINE Developers Console Setup

### Step 1: Create a Provider

1. Go to [LINE Developers Console](https://developers.line.biz/console/)
2. Create a new Provider or use an existing one
3. Note down the **Provider ID**

### Step 2: Create LINE Login Channel

1. In your provider, click "Create a new channel"
2. Select "LINE Login"
3. Fill in the required information:
   - **Channel name**: Your application name
   - **Channel description**: Brief description of your app
   - **Category**: Select appropriate category
   - **Email address**: Your contact email
4. Configure LINE Login settings:
   - **Callback URL**: `https://yourdomain.com/callback`
   - **Scope**: Select `profile`, `openid`
5. Save the configuration and note down the **Channel ID**

### Step 3: Create Messaging API Channel

1. In your provider, click "Create a new channel"
2. Select "Messaging API"
3. Fill in the required information:
   - **Channel name**: Your bot name
   - **Channel description**: Brief description of your bot
   - **Category**: Select appropriate category
   - **Subcategory**: Select appropriate subcategory
   - **Email address**: Your contact email
4. After creation, note down the **Channel ID** and **Channel Secret**
5. Go to the "Messaging API" tab
6. Generate a **Channel Access Token** (long-lived)
7. Enable "Allow bot to join group chats" if needed
8. Set up your **Webhook URL**: `https://yourdomain.com/webhook`

### Step 4: Create and Publish LIFF App

1. Go to your LINE Login Channel
2. Navigate to the "LIFF" tab
3. Click "Add" to create a new LIFF app
4. Configure the LIFF app:
   - **LIFF app name**: Your mini app name
   - **Size**: Full (recommended for DeFi apps)
   - **Endpoint URL**: `https://yourdomain.com/liff`
   - **Scope**: Select `profile`, `openid`
   - **Bot link feature**: Enable if needed
5. Click "Add" to create the LIFF app
6. **Important**: Click "Publish" to make the LIFF app accessible
7. Note down the **LIFF ID**

### Step 5: Configure Add Friend Option (Aggressive)

1. In your LINE Login Channel, go to the "LIFF" tab
2. Find your published LIFF app and click "Edit"
3. Scroll down to "Add friend option"
4. **Set to "On (aggressive)"** - This is crucial for automatic friend prompting
5. Save the configuration
6. **Important**: This setting enables automatic friend prompting when users access your LIFF app

### Step 6: Link Official Account to Messaging API

1. Go to your Messaging API Channel
2. Ensure the Official Account is properly linked
3. Configure webhook URL: `https://yourdomain.com/webhook`
4. Test the webhook to ensure it's working
5. Verify that the Official Account can send and receive messages

## ⚙️ Environment Configuration

Create a `.env` file in your backend directory with the following variables:

```bash
# LINE Integration Configuration
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token_here
LINE_CHANNEL_ID=your_line_login_channel_id_here
LINE_PROVIDER_ID=your_provider_id_here
LINE_LIFF_ID=your_liff_app_id_here
```

### How to Get Each Value

| Variable | Where to Find | Description |
|----------|---------------|-------------|
| `LINE_CHANNEL_ACCESS_TOKEN` | Messaging API Channel → Messaging API tab | Long-lived token for API access |
| `LINE_CHANNEL_ID` | LINE Login Channel → Basic settings | Numeric channel identifier |
| `LINE_PROVIDER_ID` | Provider settings | Organization identifier |
| `LINE_LIFF_ID` | LINE Login Channel → LIFF tab | Published LIFF app identifier |

## 🤖 Automated Verification

### Using the Verification Script

The project includes a comprehensive verification script that checks your LINE setup:

```bash
# Navigate to backend directory
cd backend

# Run verification with environment variables
npm run verify-line-setup

# Or run with custom parameters
npm run verify-line-setup -- --token YOUR_TOKEN --channel-id YOUR_CHANNEL_ID
```

### Verification Script Options

```bash
npm run verify-line-setup [options]

Options:
  -t, --token <token>        LINE Channel Access Token
  -c, --channel-id <id>      LINE Channel ID
  -p, --provider-id <id>     LINE Provider ID (optional)
  -v, --verbose              Verbose output
  -h, --help                 Show help message
```

### What the Script Checks

1. **Messaging API Channel**
   - Channel exists and is accessible
   - Bot is active and properly configured
   - Channel Access Token has correct permissions

2. **LIFF Apps**
   - LIFF apps are created and published
   - Apps have valid URLs and configurations
   - At least one published LIFF app exists

3. **Official Account**
   - Official Account is linked to Messaging API Channel
   - Account can send and receive messages
   - Webhook is properly configured and active
   - Friend prompt configuration is set (manual verification)

4. **Overall Status**
   - `healthy`: All components working correctly
   - `warning`: Minor issues that don't prevent development
   - `error`: Critical issues that must be fixed

## 🔌 API Endpoints

The backend provides several API endpoints for LINE verification:

### POST `/api/line/verify`
Verify LINE setup with custom credentials

**Request Body:**
```json
{
  "channelAccessToken": "your_token",
  "channelId": "your_channel_id",
  "providerId": "your_provider_id"
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "success": true,
    "messagingApiChannel": {
      "exists": true,
      "active": true,
      "info": {
        "bot": {
          "id": "bot_id",
          "name": "Bot Name"
        },
        "channelId": "channel_id"
      }
    },
    "liffApps": {
      "exists": true,
      "count": 1,
      "apps": [...]
    },
    "overallStatus": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z"
  },
  "recommendations": ["Setup is ready for development"]
}
```

### GET `/api/line/verify/status`
Check LINE status using environment variables

### GET `/api/line/verify/messaging-api`
Verify only Messaging API Channel

### GET `/api/line/verify/liff-apps`
Verify only LIFF Apps

### GET `/api/line/verify/health`
Service health check

## 🎨 Frontend Integration

### Using the Verification Component

```tsx
import { LineVerificationStatus } from '@/components/LineVerificationStatus';

function App() {
  return (
    <div>
      <LineVerificationStatus 
        autoRefresh={true}
        refreshInterval={30000}
      />
    </div>
  );
}
```

### Programmatic Friend Prompting

To complement the manual "Add friend option" setting, you can implement programmatic friend prompting in your LIFF app:

```tsx
import { LineFriendPrompt } from '@/components/LineFriendPrompt';

function App() {
  return (
    <div>
      <LineFriendPrompt 
        liffId="YOUR_LIFF_ID"
        officialAccountUserId="YOUR_OA_USER_ID"
        autoPrompt={true}
        showStatus={true}
        onFriendAdded={() => console.log('Friend prompt sent!')}
        onError={(error) => console.error('Friend prompt failed:', error)}
      />
    </div>
  );
}
```

### Using LIFF SDK Directly

For more control, use the LIFF SDK directly:

```typescript
import liff from '@line/liff';

// Initialize LIFF
await liff.init({ liffId: 'YOUR_LIFF_ID' });

// Check if user is in LINE client
if (liff.isInClient() && liff.isLoggedIn()) {
  // Prompt user to add Official Account
  await liff.follow('YOUR_OA_USER_ID');
  
  // Send welcome message
  await liff.sendMessages([{
    type: 'text',
    text: 'Welcome to LINE Yield!'
  }]);
}
```

### Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | string | `''` | CSS classes to apply |
| `autoRefresh` | boolean | `false` | Enable automatic status refresh |
| `refreshInterval` | number | `30000` | Refresh interval in milliseconds |

### Component Features

- Real-time status display
- Automatic refresh capability
- Detailed error reporting
- Responsive design
- Integration with your existing UI components

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. "Unauthorized: Invalid or expired Channel Access Token"

**Cause:** Invalid or expired token
**Solution:**
- Generate a new Channel Access Token in LINE Developers Console
- Ensure you're using the long-lived token, not the short-lived one
- Verify the token has the correct permissions

#### 2. "Not Found: Channel or resource does not exist"

**Cause:** Incorrect Channel ID
**Solution:**
- Double-check the Channel ID in LINE Developers Console
- Ensure you're using the LINE Login Channel ID, not the Messaging API Channel ID
- Verify the channel exists and is active

#### 3. "No LIFF apps found"

**Cause:** LIFF apps not created or not published
**Solution:**
- Create a LIFF app in your LINE Login Channel
- **Important**: Click "Publish" after creating the LIFF app
- Verify the LIFF app URL is accessible
- Check that the LIFF app is in the correct channel

#### 4. "Network Error: Unable to reach LINE API servers"

**Cause:** Network connectivity issues
**Solution:**
- Check your internet connection
- Verify LINE API endpoints are accessible
- Check for firewall or proxy restrictions
- Try again after a few minutes

#### 5. "Rate Limited: Too many requests"

**Cause:** Too many API requests
**Solution:**
- Wait a few minutes before retrying
- Implement exponential backoff in your application
- Consider caching verification results

### Debug Mode

Enable verbose logging by setting the environment variable:

```bash
LOG_LEVEL=debug
```

Or use the verbose flag with the verification script:

```bash
npm run verify-line-setup -- --verbose
```

## 📚 Best Practices

### Security

1. **Never commit credentials** to version control
2. **Use environment variables** for all sensitive data
3. **Rotate tokens regularly** for security
4. **Limit token permissions** to only what's needed
5. **Monitor API usage** for unusual activity

### Development

1. **Test in development environment** before production
2. **Use separate channels** for development and production
3. **Implement proper error handling** in your application
4. **Cache verification results** to reduce API calls
5. **Monitor LINE API status** for outages

### Production

1. **Set up monitoring** for LINE API endpoints
2. **Implement fallback mechanisms** for API failures
3. **Use HTTPS** for all webhook URLs
4. **Implement rate limiting** in your application
5. **Keep documentation updated** with any changes

## 🔗 Additional Resources

- [LINE Developers Documentation](https://developers.line.biz/en/docs/)
- [Messaging API Reference](https://developers.line.biz/en/reference/messaging-api/)
- [LIFF Documentation](https://developers.line.biz/en/docs/liff/)
- [LINE Login Documentation](https://developers.line.biz/en/docs/line-login/)

## 📞 Support

If you encounter issues not covered in this guide:

1. Check the [LINE Developers FAQ](https://developers.line.biz/en/faq/)
2. Review the [LINE API Status](https://status.line.me/)
3. Contact LINE support through the Developers Console
4. Create an issue in this project's repository

---

**Last Updated:** January 2024  
**Version:** 1.0.0
