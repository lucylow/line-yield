# LINE Yield Multiple Loan Types System

## Overview

The LINE Yield Multiple Loan Types System is a comprehensive DeFi lending platform that supports various loan categories with flexible terms, competitive interest rates, and secure collateral management. This system enables users to access liquidity while maintaining the security and efficiency of the LINE Yield ecosystem.

## 🏗️ Architecture

### Smart Contract Layer
- **MultiLoanManager.sol**: Core smart contract managing multiple loan types
- **ERC20 Integration**: Supports various tokens for loans and collateral
- **Access Control**: Role-based permissions for admin, liquidator, and oracle functions
- **Reentrancy Protection**: Secure fund transfers with OpenZeppelin guards

### Backend Services
- **LoanService**: Core business logic for loan management
- **API Routes**: RESTful endpoints for frontend integration
- **Database Integration**: PostgreSQL with Supabase for data persistence
- **Oracle Integration**: Real-time price feeds for collateral valuation

### Frontend Components
- **LoanTypes**: Display available loan types with detailed information
- **LoanCreator**: Interactive loan creation interface
- **LoanManager**: Comprehensive loan management dashboard
- **LoanPage**: Main landing page integrating all components

## 🚀 Features

### Multiple Loan Types
1. **Quick Cash** - Short-term loans (30 days)
   - Amount: $100 - $1,000
   - Interest: 5% APR
   - Collateral: 150%
   - No KYC required

2. **Business Loan** - Medium-term loans (90 days)
   - Amount: $1,000 - $10,000
   - Interest: 8% APR
   - Collateral: 200%
   - KYC required
   - Limited slots (100 borrowers)

3. **Premium Loan** - Long-term loans (1 year)
   - Amount: $10,000 - $100,000
   - Interest: 3% APR
   - Collateral: 300%
   - KYC required
   - Limited slots (50 borrowers)

### Advanced Features
- **Dynamic Interest Calculation**: Real-time interest accrual
- **Collateral Management**: Add/withdraw collateral dynamically
- **Automated Liquidation**: Protection against undercollateralization
- **KYC Integration**: Compliance with regulatory requirements
- **Credit Scoring**: Risk assessment and borrower profiling
- **Oracle Price Feeds**: Real-time collateral valuation

## 📊 Smart Contract Details

### Core Functions

#### Loan Type Management
```solidity
function createLoanType(
    string memory name,
    string memory description,
    uint256 maxAmount,
    uint256 minAmount,
    uint256 interestRateBps,
    uint256 collateralRatioBps,
    uint256 durationSeconds,
    uint256 liquidationThresholdBps,
    uint256 penaltyRateBps,
    bool requiresKYC,
    uint256 maxBorrowers
) external onlyRole(ADMIN_ROLE)
```

#### Loan Operations
```solidity
function createLoan(
    uint256 loanTypeId,
    uint256 principalRequested,
    uint256 collateralAmount
) external nonReentrant

function repayLoan(uint256 loanId, uint256 amount) external nonReentrant

function addCollateral(uint256 loanId, uint256 additionalAmount) external nonReentrant

function liquidateLoan(uint256 loanId) external onlyRole(LIQUIDATOR_ROLE)
```

#### Interest & Risk Management
```solidity
function calculateInterest(uint256 loanId) public view returns (uint256)
function calculatePenalty(uint256 loanId) public view returns (uint256)
function isLoanLiquidatable(uint256 loanId) public view returns (bool)
```

### Security Features
- **Access Control**: Role-based permissions using OpenZeppelin
- **Reentrancy Guard**: Protection against reentrancy attacks
- **Pausable**: Emergency stop functionality
- **Input Validation**: Comprehensive parameter validation
- **Overflow Protection**: Safe math operations

## 🔧 Backend Integration

### LoanService Class
```typescript
export class LoanService {
  // Core loan operations
  async createLoan(loanTypeId, principalRequested, collateralAmount, borrowerAddress)
  async repayLoan(loanId, amount)
  async addCollateral(loanId, additionalAmount)
  async liquidateLoan(loanId)
  
  // Query operations
  async getAllLoanTypes()
  async getUserLoans(userAddress)
  async getLoan(loanId)
  async checkBorrowerEligibility(userAddress, loanTypeId)
  
  // Utility functions
  async calculateRequiredCollateral(loanAmount, collateralRatioBps)
  async setKYCVerified(userAddress, verified)
  async updateTokenPrices(prices)
}
```

### API Endpoints

#### Loan Types
- `GET /api/loans/types` - Get all available loan types
- `GET /api/loans/user/:address/eligibility/:loanTypeId` - Check borrower eligibility

#### Loan Management
- `POST /api/loans/create` - Create new loan
- `GET /api/loans/user/:address` - Get user's loans
- `GET /api/loans/:loanId` - Get specific loan details

#### Loan Operations
- `POST /api/loans/:loanId/repay` - Repay loan
- `POST /api/loans/:loanId/add-collateral` - Add collateral
- `POST /api/loans/:loanId/liquidate` - Liquidate loan (admin)

#### Utility Endpoints
- `POST /api/loans/calculate-collateral` - Calculate required collateral
- `POST /api/loans/kyc-verify` - Set KYC verification (admin)
- `POST /api/loans/update-prices` - Update token prices (oracle)
- `GET /api/loans/health` - Health check

## 🎨 Frontend Components

### LoanTypes Component
- Displays all available loan types
- Shows detailed terms and requirements
- Interactive selection with visual feedback
- Real-time availability status

### LoanCreator Component
- Step-by-step loan creation process
- Real-time collateral calculation
- Eligibility checking
- Form validation and error handling

### LoanManager Component
- Comprehensive loan dashboard
- Real-time loan status updates
- Payment and collateral management
- Historical transaction tracking

## 🗄️ Database Schema

### Core Tables
- **loan_types**: Loan type configurations
- **loans**: Individual loan records
- **loan_payments**: Payment history
- **loan_collateral_changes**: Collateral modifications
- **loan_liquidations**: Liquidation records
- **user_kyc**: KYC verification status
- **user_credit_scores**: Credit scoring data
- **token_prices**: Oracle price feeds
- **loan_logs**: Audit trail

### Key Functions
- `calculate_loan_interest()`: Interest calculation
- `is_loan_liquidatable()`: Liquidation check
- `get_loan_statistics()`: Statistical analysis
- `update_loan_type_borrower_count()`: Automatic counter updates

### Views
- **active_loans_view**: Active loans with calculated fields
- **loan_type_stats_view**: Loan type statistics

## 🔐 Security & Compliance

### Access Control
- **Admin Role**: Full system management
- **Liquidator Role**: Liquidation operations
- **Oracle Role**: Price feed updates
- **User Permissions**: Row-level security (RLS)

### Risk Management
- **Over-collateralization**: Minimum collateral ratios
- **Liquidation Thresholds**: Automated protection
- **Penalty Systems**: Late payment consequences
- **Credit Scoring**: Risk assessment

### Compliance Features
- **KYC Integration**: Identity verification
- **Audit Trails**: Complete transaction logging
- **Data Privacy**: RLS policies
- **Regulatory Reporting**: Structured data export

## 🚀 Getting Started

### 1. Smart Contract Deployment
```bash
# Deploy MultiLoanManager contract
npx hardhat run scripts/deploy-loan-manager.js --network kaia

# Initialize default loan types
npx hardhat run scripts/initialize-loan-types.js --network kaia
```

### 2. Backend Setup
```bash
# Install dependencies
npm install

# Set environment variables
export LOAN_CONTRACT_ADDRESS="0x..."
export KAIA_RPC_URL="https://..."
export KAIA_WALLET_PRIVATE_KEY="0x..."

# Initialize loan service
npm run start
```

### 3. Database Setup
```bash
# Run database migrations
psql -d line_yield -f database-schema-loans.sql

# Verify tables and functions
psql -d line_yield -c "\dt loan*"
```

### 4. Frontend Integration
```typescript
// Import components
import { LoanTypes, LoanCreator, LoanManager } from './components';

// Use in your app
<LoanPage />
```

## 📈 Usage Examples

### Creating a Loan
```typescript
// 1. Check eligibility
const eligibility = await loanService.checkBorrowerEligibility(
  userAddress, 
  loanTypeId
);

// 2. Calculate required collateral
const requiredCollateral = await loanService.calculateRequiredCollateral(
  "1000", // $1000 loan
  15000   // 150% collateral ratio
);

// 3. Create loan
const result = await loanService.createLoan(
  loanTypeId,
  "1000",      // $1000 principal
  "1500",      // $1500 collateral
  userAddress
);
```

### Managing a Loan
```typescript
// Get user's loans
const loans = await loanService.getUserLoans(userAddress);

// Repay loan
await loanService.repayLoan(loanId, "500");

// Add collateral
await loanService.addCollateral(loanId, "200");
```

### Admin Operations
```typescript
// Set KYC verification
await loanService.setKYCVerified(userAddress, true);

// Update token prices
await loanService.updateTokenPrices({
  "0x...": "1.00",  // USDT price
  "0x...": "0.25"   // KLAY price
});

// Liquidate undercollateralized loan
await loanService.liquidateLoan(loanId);
```

## 🔄 Integration with Existing Systems

### Yield Protocol Integration
- Loans can be funded from yield vaults
- Interest payments can be reinvested
- Collateral can earn yield while locked

### Referral System Integration
- Loan referrals earn bonus points
- Referral rewards for successful loans
- Cross-promotion with yield products

### NFT Rewards Integration
- Loan milestones unlock NFT badges
- Collateral achievements
- Loyalty program integration

## 📊 Monitoring & Analytics

### Key Metrics
- **Total Value Locked (TVL)**: Total collateral locked
- **Loan Volume**: Total loans originated
- **Default Rate**: Percentage of liquidated loans
- **Average Loan Size**: Mean loan amount
- **Interest Revenue**: Total interest collected

### Health Monitoring
- **Collateralization Ratios**: Real-time monitoring
- **Liquidation Alerts**: Automated notifications
- **System Health**: API and contract status
- **Performance Metrics**: Response times and throughput

## 🛠️ Development & Testing

### Testing Strategy
- **Unit Tests**: Individual function testing
- **Integration Tests**: End-to-end workflows
- **Security Tests**: Vulnerability assessments
- **Performance Tests**: Load and stress testing

### Deployment Checklist
- [ ] Smart contract deployed and verified
- [ ] Database schema applied
- [ ] Environment variables configured
- [ ] API endpoints tested
- [ ] Frontend components integrated
- [ ] Security audit completed
- [ ] Documentation updated

## 🔮 Future Enhancements

### Planned Features
- **Cross-chain Support**: Multi-blockchain loans
- **Flash Loans**: Instant liquidity without collateral
- **Synthetic Assets**: Collateralized debt positions
- **Automated Strategies**: Yield farming integration
- **Mobile App**: Native mobile experience

### Advanced Analytics
- **Machine Learning**: Risk prediction models
- **Portfolio Optimization**: Automated rebalancing
- **Market Analysis**: Trend identification
- **User Behavior**: Engagement analytics

## 📞 Support & Resources

### Documentation
- [API Documentation](https://docs.line-yield.com/api/loans)
- [Smart Contract Docs](https://docs.line-yield.com/contracts)
- [Integration Guide](https://docs.line-yield.com/integration)

### Community
- [Discord](https://discord.gg/line-yield)
- [Telegram](https://t.me/line_yield)
- [GitHub](https://github.com/line-yield)

### Support
- [Help Center](https://help.line-yield.com)
- [Contact Support](mailto:support@line-yield.com)
- [Bug Reports](https://github.com/line-yield/issues)

---

**Note**: This loan system is designed to be modular and extensible. It can be easily integrated into existing DeFi protocols or used as a standalone lending platform. The architecture supports future enhancements and scaling requirements.
