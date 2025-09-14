# QR Code Payment System

A comprehensive QR code payment solution for the Line Yield DeFi protocol, enabling instant payments through scannable QR codes.

## 🚀 Features

### Core Functionality
- **Instant QR Generation**: Create QR codes for any payment amount instantly
- **Real-time Status Tracking**: Monitor payment status with automatic updates
- **Multi-token Support**: Support for USDT, KLAY, and other tokens
- **Session Management**: Automatic expiration and cleanup of payment sessions
- **Complete History**: View and export complete payment history

### Security Features
- **Address Validation**: Comprehensive validation of wallet addresses
- **Session Security**: Unique session IDs with expiration times
- **Access Control**: User-specific session access and management
- **Audit Trail**: Complete event logging for all payment activities

### User Experience
- **Mobile Optimized**: Responsive design for mobile and desktop
- **Real-time Updates**: Live status updates without page refresh
- **Export Functionality**: CSV export of payment history
- **Test Mode**: Built-in testing capabilities for development

## 🏗️ Architecture

### Backend Components

#### QR Payment Service (`backend/src/services/qr-payment-service.ts`)
- **Session Management**: Create, update, and manage payment sessions
- **Status Tracking**: Real-time payment status monitoring
- **QR Code Generation**: Generate QR codes with payment data
- **Expiration Handling**: Automatic session expiration and cleanup

#### API Routes (`backend/src/routes/qr-payment.ts`)
- `POST /api/qr-payment/create` - Create new payment session
- `GET /api/qr-payment/status/:sessionId` - Get payment status
- `POST /api/qr-payment/confirm` - Confirm payment (webhook)
- `POST /api/qr-payment/cancel` - Cancel payment session
- `GET /api/qr-payment/sessions/:userAddress` - Get user sessions
- `GET /api/qr-payment/stats` - Get service statistics
- `POST /api/qr-payment/mock-confirm` - Mock confirmation for testing

### Frontend Components

#### QR Payment Service (`src/services/qrPaymentService.ts`)
- **API Integration**: Complete API client for QR payment operations
- **Error Handling**: Comprehensive error handling and user feedback
- **Utility Functions**: Formatting, validation, and status helpers

#### QR Payment Hook (`src/hooks/useQRPayment.ts`)
- **State Management**: Complete state management for payment sessions
- **Real-time Polling**: Automatic status polling with configurable intervals
- **Error Handling**: Built-in error handling and recovery
- **Utility Functions**: Helper functions for UI components

#### QR Payment Component (`src/components/QRPayment.tsx`)
- **Payment Creation**: Form for creating new payment requests
- **QR Code Display**: High-quality QR code rendering with download options
- **Status Monitoring**: Real-time status display with progress indicators
- **Action Controls**: Cancel, confirm, and reset functionality

#### QR Payment History (`src/components/QRPaymentHistory.tsx`)
- **Session List**: Complete list of user payment sessions
- **Filtering & Search**: Advanced filtering and search capabilities
- **Statistics**: Summary statistics and analytics
- **Export**: CSV export functionality

#### QR Payment Page (`src/pages/QRPaymentPage.tsx`)
- **Unified Interface**: Complete payment management interface
- **Tabbed Navigation**: Organized access to create and history views
- **Documentation**: Built-in help and usage instructions

### Database Schema

#### Core Tables
- **qr_payment_sessions**: Main payment session data
- **qr_payment_transactions**: Detailed transaction records
- **qr_payment_events**: Complete audit trail
- **qr_payment_statistics**: Daily aggregated statistics
- **qr_payment_webhooks**: Webhook configuration
- **qr_payment_webhook_logs**: Webhook delivery tracking

#### Key Features
- **Automatic Timestamps**: Triggers for updated_at fields
- **Session Expiration**: Automatic cleanup of expired sessions
- **Daily Statistics**: Automated daily statistics updates
- **Performance Indexes**: Optimized queries for all common operations

## 📱 Usage

### Creating a Payment

1. **Navigate to QR Payments**: Go to `/qr-payment` in the application
2. **Enter Payment Details**: 
   - Amount (required)
   - Description (optional)
   - Expiration time (default: 15 minutes)
3. **Generate QR Code**: Click "Generate QR Code" to create the payment session
4. **Share QR Code**: Share the QR code with the payer via any method
5. **Monitor Status**: Watch real-time status updates

### Scanning a Payment

1. **Scan QR Code**: Use a compatible wallet or app to scan the QR code
2. **Review Details**: Confirm payment amount and recipient
3. **Confirm Transaction**: Complete the transaction in your wallet
4. **Automatic Confirmation**: Payment is automatically confirmed

### Managing Payments

1. **View History**: Access complete payment history in the History tab
2. **Filter & Search**: Use filters to find specific payments
3. **Export Data**: Download payment history as CSV
4. **Monitor Statistics**: View summary statistics and analytics

## 🔧 Configuration

### Environment Variables

#### Backend Configuration
```bash
# API Configuration
VITE_API_URL=http://localhost:3001/api

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=line_yield
DB_USER=postgres
DB_PASSWORD=your_password

# Security Configuration
JWT_SECRET=your_jwt_secret
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend Configuration
```bash
# API Endpoint
VITE_API_URL=http://localhost:3001/api

# QR Code Configuration
VITE_QR_CODE_SIZE=256
VITE_QR_CODE_LEVEL=M
```

### Database Setup

1. **Run Schema Migration**:
   ```bash
   psql -d line_yield -f database-schema-qr-payments.sql
   ```

2. **Set up Automatic Cleanup**:
   ```bash
   # Add to crontab for automatic session expiration
   0 */5 * * * psql -d line_yield -c "SELECT expire_qr_payment_sessions();"
   
   # Add to crontab for daily statistics
   0 1 * * * psql -d line_yield -c "SELECT update_qr_payment_daily_stats();"
   ```

## 🧪 Testing

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
npm test

# Integration tests
npm run test:integration
```

### Test Coverage

- **Unit Tests**: Service functions and utilities
- **Integration Tests**: API endpoints and database operations
- **Component Tests**: React component functionality
- **Security Tests**: Input validation and access control
- **Performance Tests**: Concurrent operations and cleanup

### Mock Testing

The system includes comprehensive mock testing capabilities:

```typescript
// Mock payment confirmation for testing
await qrPaymentService.confirmPayment('test-session-id');

// Mock API responses for development
const mockSession = await qrPaymentService.createPaymentSession({
  amount: '100.50',
  userAddress: '0x742d35Cc6634C0532925a3b8D0C4C4C4C4C4C4C4',
  vaultAddress: '0x1234567890123456789012345678901234567890',
});
```

## 🔒 Security Considerations

### Input Validation
- **Address Validation**: Comprehensive Ethereum address validation
- **Amount Validation**: Positive number validation with decimal precision
- **Session Validation**: Unique session ID generation and validation

### Access Control
- **User Isolation**: Users can only access their own payment sessions
- **Session Ownership**: Only session creators can cancel their sessions
- **Rate Limiting**: API rate limiting to prevent abuse

### Data Protection
- **Secure Storage**: Sensitive data encrypted in database
- **Audit Trail**: Complete logging of all payment activities
- **Session Expiration**: Automatic cleanup of expired sessions

## 📊 Monitoring & Analytics

### Real-time Monitoring
- **Session Statistics**: Live count of active sessions by status
- **Performance Metrics**: Response times and error rates
- **User Activity**: Payment creation and completion rates

### Analytics Dashboard
- **Daily Statistics**: Aggregated daily payment statistics
- **Volume Tracking**: Total payment volume and trends
- **Success Rates**: Payment completion and failure rates
- **User Behavior**: Most common payment amounts and patterns

### Logging
- **Structured Logging**: Comprehensive logging with structured data
- **Error Tracking**: Detailed error logging and tracking
- **Performance Logging**: Request/response time logging
- **Audit Logging**: Complete audit trail for compliance

## 🚀 Deployment

### Production Deployment

1. **Database Setup**:
   ```bash
   # Create production database
   createdb line_yield_prod
   
   # Run migrations
   psql -d line_yield_prod -f database-schema-qr-payments.sql
   ```

2. **Backend Deployment**:
   ```bash
   cd backend
   npm run build
   npm start
   ```

3. **Frontend Deployment**:
   ```bash
   npm run build
   # Deploy dist/ folder to your hosting service
   ```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build individual containers
docker build -t line-yield-backend ./backend
docker build -t line-yield-frontend .
```

### Environment-Specific Configuration

#### Development
```bash
NODE_ENV=development
VITE_API_URL=http://localhost:3001/api
DB_HOST=localhost
```

#### Production
```bash
NODE_ENV=production
VITE_API_URL=https://api.line-yield.com/api
DB_HOST=prod-db-host
DB_SSL=true
```

## 🔄 API Reference

### Create Payment Session
```http
POST /api/qr-payment/create
Content-Type: application/json

{
  "amount": "100.50",
  "token": "USDT",
  "userAddress": "0x742d35Cc6634C0532925a3b8D0C4C4C4C4C4C4C4",
  "vaultAddress": "0x1234567890123456789012345678901234567890",
  "description": "Payment for services",
  "expiresInMinutes": 15
}
```

### Get Payment Status
```http
GET /api/qr-payment/status/{sessionId}
```

### Confirm Payment
```http
POST /api/qr-payment/confirm
Content-Type: application/json

{
  "sessionId": "session-123",
  "transactionHash": "0xabc123...",
  "payerAddress": "0x742d35Cc6634C0532925a3b8D0C4C4C4C4C4C4C4"
}
```

### Get User Sessions
```http
GET /api/qr-payment/sessions/{userAddress}
```

## 🤝 Contributing

### Development Setup

1. **Clone Repository**:
   ```bash
   git clone https://github.com/line-yield/line-yield.git
   cd line-yield
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   cd backend && npm install
   ```

3. **Set up Database**:
   ```bash
   createdb line_yield_dev
   psql -d line_yield_dev -f database-schema-qr-payments.sql
   ```

4. **Start Development Servers**:
   ```bash
   # Backend
   cd backend && npm run dev
   
   # Frontend
   npm run dev
   ```

### Code Style

- **TypeScript**: Strict type checking enabled
- **ESLint**: Comprehensive linting rules
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for quality assurance

### Testing Requirements

- **Unit Tests**: Minimum 80% coverage
- **Integration Tests**: All API endpoints covered
- **E2E Tests**: Critical user flows tested
- **Security Tests**: Input validation and access control tested

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- **API Documentation**: `/api` endpoint for complete API reference
- **Component Documentation**: Inline JSDoc comments for all components
- **Database Schema**: Complete schema documentation in SQL comments

### Community
- **GitHub Issues**: Report bugs and request features
- **Discord**: Join our community for support and discussions
- **Email**: Contact support@line-yield.com for enterprise support

### Troubleshooting

#### Common Issues

1. **QR Code Not Generating**:
   - Check wallet connection
   - Verify amount is valid
   - Ensure backend is running

2. **Payment Status Not Updating**:
   - Check network connection
   - Verify session hasn't expired
   - Check browser console for errors

3. **Database Connection Issues**:
   - Verify database is running
   - Check connection credentials
   - Ensure schema is properly installed

#### Debug Mode

Enable debug mode for detailed logging:

```bash
# Backend
DEBUG=qr-payment:* npm run dev

# Frontend
VITE_DEBUG=true npm run dev
```

## 🔮 Future Enhancements

### Planned Features
- **Multi-currency Support**: Support for additional tokens
- **Payment Templates**: Pre-configured payment templates
- **Bulk Payments**: Support for multiple payment sessions
- **Advanced Analytics**: More detailed analytics and reporting
- **Mobile App**: Dedicated mobile application
- **Webhook Integration**: Enhanced webhook system
- **Payment Scheduling**: Scheduled payment functionality

### Integration Opportunities
- **Wallet Integration**: Direct wallet integration for seamless payments
- **Payment Gateways**: Integration with traditional payment systems
- **Notification System**: Enhanced notification system
- **Analytics Platform**: Integration with analytics platforms
- **Compliance Tools**: Enhanced compliance and reporting tools

---

For more information, visit our [documentation](https://docs.line-yield.com) or contact our team at [support@line-yield.com](mailto:support@line-yield.com).



