# LINE Yield Credit Scoring System

A comprehensive onchain credit scoring system that tracks user behavior, manages loans, and provides lending capabilities for the LINE Yield platform.

## 🏗️ Architecture Overview

The credit scoring system consists of:

- **Smart Contract**: Onchain credit scoring contract deployed on KAIA network
- **Backend Service**: Node.js service for interacting with the contract and database
- **API Routes**: RESTful endpoints for credit operations
- **Frontend Components**: React components for credit dashboard and widgets
- **Database Schema**: PostgreSQL schema for storing credit data and events

## 📋 Features

### Core Credit Scoring
- **Credit Profiles**: User credit profiles with scores (0-1000)
- **Score Calculation**: Dynamic scoring based on user behavior
- **Score Tiers**: Excellent (800+), Good (700+), Fair (600+), Poor (500+), Very Poor (<500)
- **Score Decay**: Automatic score reduction for inactive users
- **Event Tracking**: Comprehensive audit trail of all credit events

### Loan Management
- **Loan Creation**: Create loans based on credit score
- **Interest Rate Calculation**: Dynamic rates based on creditworthiness
- **Repayment Tracking**: Record and track loan repayments
- **Default Management**: Handle loan defaults and penalties
- **Eligibility Checking**: Verify loan eligibility before approval

### Analytics & Reporting
- **Credit History**: Complete history of credit events
- **Loan Statistics**: Aggregated loan data and metrics
- **User Analytics**: Individual user credit performance
- **System Analytics**: Platform-wide credit statistics

## 🔧 Smart Contract

### Contract: `OnchainCreditScore.sol`

**Key Functions:**
- `createCreditProfile(address user)`: Create new credit profile
- `getCreditScore(address user)`: Get user's current credit score
- `getCreditProfile(address user)`: Get complete credit profile
- `calculateInterestRate(address user)`: Calculate interest rate based on score
- `createLoan(address borrower, uint256 amount, uint256 duration, string purpose)`: Create new loan
- `recordRepayment(uint256 loanId, uint256 amount)`: Record loan repayment
- `recordDefault(uint256 loanId)`: Record loan default
- `isEligibleForLoan(address user, uint256 amount)`: Check loan eligibility

**Events:**
- `CreditScoreUpdated`: Emitted when credit score changes
- `LoanCreated`: Emitted when new loan is created
- `LoanRepaid`: Emitted when loan repayment is recorded
- `LoanDefaulted`: Emitted when loan is marked as defaulted

### Deployment

```bash
# Deploy to KAIA testnet
npx hardhat run scripts/deploy-credit-score.js --network kaia-testnet

# Deploy to KAIA mainnet
npx hardhat run scripts/deploy-credit-score.js --network kaia-mainnet
```

## 🚀 Backend Service

### CreditScoreService

The backend service provides a clean interface to interact with the smart contract and database.

**Key Methods:**
- `createCreditProfile(userAddress)`: Create new credit profile
- `getCreditProfile(userAddress)`: Get user's credit profile
- `getCreditScore(userAddress)`: Get user's credit score
- `calculateInterestRate(userAddress)`: Calculate interest rate
- `createLoan(application)`: Create new loan
- `recordRepayment(loanId, amount)`: Record repayment
- `recordDefault(loanId)`: Record default
- `getUserLoans(userAddress)`: Get user's loan history
- `getLoanStatistics()`: Get platform statistics

### API Routes

**Base URL**: `/api/credit`

#### Profile Management
- `POST /profile/:userAddress` - Create credit profile
- `GET /profile/:userAddress` - Get credit profile
- `GET /score/:userAddress` - Get credit score
- `GET /interest-rate/:userAddress` - Calculate interest rate

#### Loan Operations
- `POST /eligibility/:userAddress` - Check loan eligibility
- `POST /loan` - Create new loan
- `POST /repayment/:loanId` - Record repayment
- `POST /default/:loanId` - Record default
- `GET /loans/:userAddress` - Get user loans
- `GET /loan/:loanId` - Get loan details

#### Analytics
- `GET /events/:userAddress` - Get credit events
- `GET /statistics` - Get loan statistics
- `GET /health` - Health check

## 🎨 Frontend Components

### CreditDashboard

A comprehensive dashboard for managing credit profiles and loans.

**Features:**
- Credit score display with visual indicators
- Loan application form
- Repayment tracking
- Credit history timeline
- Statistics and analytics

### CreditScoreWidget

A compact widget for displaying credit information in the LIFF app.

**Features:**
- Compact credit score display
- Quick stats overview
- Link to full dashboard
- Real-time updates

### useCreditScore Hook

A React hook for managing credit operations.

**Returns:**
- Credit profile data
- Loading states
- Error handling
- Action functions
- Utility functions

## 🗄️ Database Schema

### Core Tables

**credit_profiles**
- Stores user credit profiles and scores
- Tracks borrowing and repayment history
- Maintains payment statistics

**credit_events**
- Audit trail of all credit-related events
- Stores transaction hashes and timestamps
- Enables comprehensive analytics

**loans**
- Stores loan information and status
- Tracks repayment progress
- Manages loan lifecycle

**loan_repayments**
- Individual repayment records
- Links to blockchain transactions
- Enables detailed repayment analysis

**credit_score_history**
- Historical credit score changes
- Tracks score evolution over time
- Enables trend analysis

### Functions

**update_credit_profile()**
- Updates credit profile based on events
- Maintains data consistency
- Triggers score recalculations

**calculate_credit_score()**
- Calculates credit score based on behavior
- Applies configurable factors
- Returns normalized score

**apply_score_decay()**
- Applies score decay for inactive users
- Configurable decay parameters
- Maintains score accuracy

## 🔐 Security Features

### Smart Contract Security
- **Access Control**: Owner-only functions for sensitive operations
- **Input Validation**: Comprehensive parameter validation
- **Reentrancy Protection**: ReentrancyGuard implementation
- **Event Logging**: Complete audit trail

### Backend Security
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Comprehensive input sanitization
- **Error Handling**: Secure error messages
- **Transaction Verification**: Blockchain transaction verification

### Database Security
- **Row Level Security**: User-specific data access
- **Encrypted Storage**: Sensitive data encryption
- **Audit Logging**: Complete operation logging
- **Backup Strategy**: Regular data backups

## 📊 Credit Score Calculation

### Base Score
- **Starting Score**: 500 (neutral)
- **Score Range**: 0-1000
- **Tier Thresholds**: 500, 600, 700, 800

### Score Factors

**Positive Factors:**
- On-time payments: +20 points each
- Loan completion: +30 points each
- Account activity: +5 points
- Regular usage: +10 points

**Negative Factors:**
- Late payments: -50 points each
- Loan defaults: -200 points each
- Inactivity: -10 points per 30 days
- High debt ratio: -25 points

### Interest Rate Calculation

**Rate Tiers:**
- Excellent (800+): 3% APR
- Good (700+): 5% APR
- Fair (600+): 7% APR
- Poor (500+): 10% APR
- Very Poor (<500): 15% APR

## 🚀 Getting Started

### 1. Deploy Smart Contract

```bash
# Install dependencies
npm install

# Deploy to testnet
npx hardhat run scripts/deploy-credit-score.js --network kaia-testnet

# Update environment variables
export CREDIT_SCORE_CONTRACT_ADDRESS=0x...
```

### 2. Setup Database

```bash
# Run database migrations
psql -d line_yield -f database-schema-credit.sql

# Verify tables created
psql -d line_yield -c "\dt"
```

### 3. Configure Backend

```bash
# Update environment variables
cp backend/env.example backend/.env

# Edit .env file with your values
CREDIT_SCORE_CONTRACT_ADDRESS=0x...
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
```

### 4. Start Services

```bash
# Start backend
cd backend
npm run dev

# Start frontend
cd packages/liff-app
npm run dev
```

## 📱 Usage Examples

### Create Credit Profile

```typescript
import { creditApiClient } from './services/CreditApiClient';

// Create profile for new user
await creditApiClient.createCreditProfile('0x1234...');
```

### Check Loan Eligibility

```typescript
// Check if user can borrow $1000
const eligibility = await creditApiClient.checkLoanEligibility(
  '0x1234...', 
  '1000'
);

if (eligibility.eligible) {
  console.log('User can borrow $1000');
  console.log('Recommended amount:', eligibility.recommendedAmount);
}
```

### Create Loan

```typescript
const loanApplication = {
  userId: '0x1234...',
  amount: '1000',
  duration: 30 * 24 * 60 * 60, // 30 days in seconds
  purpose: 'Emergency expenses'
};

const loanId = await creditApiClient.createLoan(loanApplication);
console.log('Loan created with ID:', loanId);
```

### Record Repayment

```typescript
// Record $500 repayment for loan ID 1
await creditApiClient.recordRepayment(1, '500');
```

### Get Credit Profile

```typescript
const profile = await creditApiClient.getCreditProfile('0x1234...');
console.log('Credit Score:', profile.score);
console.log('Tier:', profile.tier);
console.log('Total Borrowed:', profile.totalBorrowed);
```

## 🔄 Integration with LINE Yield

### LIFF App Integration

```typescript
// In packages/liff-app/src/App.tsx
import CreditScoreWidget from './components/CreditScoreWidget';

// Add to dashboard
<CreditScoreWidget 
  userAddress={userAddress} 
  compact={true} 
/>
```

### Rewards Integration

```typescript
// Credit score affects rewards
const creditMultiplier = creditScore >= 700 ? 1.5 : 1.0;
const rewardAmount = baseReward * creditMultiplier;
```

### Payment Integration

```typescript
// Credit score affects payment terms
const interestRate = await creditApiClient.calculateInterestRate(userAddress);
const paymentTerms = {
  amount: loanAmount,
  interestRate: interestRate,
  duration: loanDuration
};
```

## 📈 Analytics & Monitoring

### Key Metrics

**User Metrics:**
- Average credit score
- Score distribution
- Payment behavior
- Loan performance

**Platform Metrics:**
- Total loans created
- Total amount borrowed
- Default rate
- Average interest rate

**Financial Metrics:**
- Total revenue from interest
- Bad debt ratio
- Collection efficiency
- Risk assessment

### Monitoring

**Health Checks:**
- Contract connectivity
- Database connectivity
- API response times
- Error rates

**Alerts:**
- High default rates
- System errors
- Performance degradation
- Security incidents

## 🛠️ Development

### Testing

```bash
# Run smart contract tests
npx hardhat test

# Run backend tests
cd backend
npm test

# Run frontend tests
cd packages/liff-app
npm test
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

### Deployment

```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production
```

## 🔮 Future Enhancements

### Planned Features
- **Credit Score Predictions**: ML-based score predictions
- **Cross-Chain Support**: Multi-chain credit scoring
- **DeFi Integration**: Integration with other DeFi protocols
- **Social Credit**: Social reputation factors
- **Insurance**: Credit default insurance
- **Portfolio Management**: Advanced portfolio analytics

### Technical Improvements
- **Gas Optimization**: Reduce contract gas costs
- **Scalability**: Layer 2 integration
- **Privacy**: Zero-knowledge proofs
- **Interoperability**: Cross-protocol compatibility

## 📚 Resources

### Documentation
- [Smart Contract API](./contracts/OnchainCreditScore.sol)
- [Backend Service API](./backend/src/services/CreditScoreService.ts)
- [Frontend Components](./src/components/CreditDashboard.tsx)
- [Database Schema](./database-schema-credit.sql)

### External Resources
- [KAIA Network Documentation](https://docs.kaia.network/)
- [Ethers.js Documentation](https://docs.ethers.io/)
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://reactjs.org/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Join our Discord community
- Contact the development team

---

**LINE Yield Credit Scoring System** - Building the future of decentralized credit scoring on KAIA network.
