# LINE Integration Verification System

A comprehensive solution for verifying LINE Developers Console setup, including Messaging API Channels, LIFF Apps, and overall integration health.

## 🚀 Quick Start

### 1. Set up environment variables

```bash
# In backend/.env
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token_here
LINE_CHANNEL_ID=your_line_channel_id_here
LINE_PROVIDER_ID=your_provider_id_here
LINE_LIFF_ID=your_liff_app_id_here
```

### 2. Run verification script

```bash
cd backend
npm run verify-line-setup
```

### 3. Check status via API

```bash
curl http://localhost:3000/api/line/verify/status
```

## 📁 File Structure

```
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   └── line-verification-service.ts    # Core verification logic
│   │   ├── routes/
│   │   │   └── line-verification.ts            # API endpoints
│   │   └── config/
│   │       └── index.ts                        # Configuration with LINE settings
│   ├── scripts/
│   │   └── verify-line-setup.ts               # Standalone verification script
│   └── env.example                            # Environment variables template
├── src/
│   └── components/
│       └── LineVerificationStatus.tsx         # Frontend verification component
├── examples/
│   └── line-verification-example.js           # Usage examples
└── docs/
    └── LINE_VERIFICATION_GUIDE.md             # Comprehensive documentation
```

## 🔧 Features

### Backend Services

- **Complete Setup Verification**: Checks all LINE components
- **Individual Component Checks**: Verify Messaging API or LIFF Apps separately
- **Environment-based Status**: Check using environment variables
- **Health Monitoring**: Service health and endpoint availability
- **Comprehensive Error Handling**: Detailed error messages and recommendations

### Frontend Component

- **Real-time Status Display**: Live verification status
- **Auto-refresh Capability**: Periodic status updates
- **Responsive Design**: Works on all screen sizes
- **Integration Ready**: Easy to integrate into existing React apps

### CLI Tools

- **Standalone Verification Script**: Run independently of the main application
- **Command-line Options**: Flexible parameter passing
- **Detailed Output**: Comprehensive status reporting
- **Exit Codes**: Proper exit codes for automation

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/line/verify` | POST | Full verification with custom credentials |
| `/api/line/verify/status` | GET | Check status using environment variables |
| `/api/line/verify/messaging-api` | GET | Verify Messaging API Channel only |
| `/api/line/verify/liff-apps` | GET | Verify LIFF Apps only |
| `/api/line/verify/health` | GET | Service health check |

## 🎯 What Gets Verified

### Messaging API Channel
- ✅ Channel exists and is accessible
- ✅ Bot is active and properly configured
- ✅ Channel Access Token has correct permissions
- ✅ Bot information is retrievable

### LIFF Apps
- ✅ LIFF apps are created and published
- ✅ Apps have valid URLs and configurations
- ✅ At least one published LIFF app exists
- ✅ App details are accessible

### Overall Status
- 🟢 **Healthy**: All components working correctly
- 🟡 **Warning**: Minor issues that don't prevent development
- 🔴 **Error**: Critical issues that must be fixed

## 🛠️ Usage Examples

### Backend API Usage

```typescript
import { LineVerificationService } from './services/line-verification-service';

const service = new LineVerificationService(
  'your_token',
  'your_channel_id',
  'your_provider_id'
);

const result = await service.verifyCompleteSetup();
console.log('Overall status:', result.overallStatus);
```

### Frontend Component Usage

```tsx
import { LineVerificationStatus } from '@/components/LineVerificationStatus';

function App() {
  return (
    <LineVerificationStatus 
      autoRefresh={true}
      refreshInterval={30000}
    />
  );
}
```

### CLI Usage

```bash
# Basic verification
npm run verify-line-setup

# With custom parameters
npm run verify-line-setup -- --token YOUR_TOKEN --channel-id YOUR_CHANNEL_ID

# Verbose output
npm run verify-line-setup -- --verbose
```

## 🔍 Troubleshooting

### Common Issues

1. **"Unauthorized: Invalid or expired Channel Access Token"**
   - Generate a new Channel Access Token in LINE Developers Console
   - Ensure you're using the long-lived token

2. **"Not Found: Channel or resource does not exist"**
   - Double-check the Channel ID in LINE Developers Console
   - Ensure you're using the LINE Login Channel ID

3. **"No LIFF apps found"**
   - Create a LIFF app in your LINE Login Channel
   - **Important**: Click "Publish" after creating the LIFF app

4. **"Network Error: Unable to reach LINE API servers"**
   - Check your internet connection
   - Verify LINE API endpoints are accessible

### Debug Mode

```bash
# Enable verbose logging
LOG_LEVEL=debug npm run verify-line-setup

# Or use verbose flag
npm run verify-line-setup -- --verbose
```

## 📚 Documentation

- **[Complete Setup Guide](docs/LINE_VERIFICATION_GUIDE.md)**: Step-by-step setup instructions
- **[API Reference](docs/LINE_VERIFICATION_GUIDE.md#api-endpoints)**: Detailed API documentation
- **[Troubleshooting](docs/LINE_VERIFICATION_GUIDE.md#troubleshooting)**: Common issues and solutions
- **[Examples](examples/line-verification-example.js)**: Working code examples

## 🔗 Related Resources

- [LINE Developers Documentation](https://developers.line.biz/en/docs/)
- [Messaging API Reference](https://developers.line.biz/en/reference/messaging-api/)
- [LIFF Documentation](https://developers.line.biz/en/docs/liff/)
- [LINE Login Documentation](https://developers.line.biz/en/docs/line-login/)

## 📄 License

This project is part of the LINE Yield protocol and follows the same licensing terms.

---

**Need help?** Check the [troubleshooting guide](docs/LINE_VERIFICATION_GUIDE.md#troubleshooting) or create an issue in the project repository.


