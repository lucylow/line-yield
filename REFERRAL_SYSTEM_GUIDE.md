# LINE Yield Referral System

A comprehensive referral and promotion system for the LINE Yield DeFi protocol, enabling users to invite friends and earn rewards through Yield Points.

## 🎯 Overview

The LINE Yield Referral System is designed to:
- **Drive user acquisition** through incentivized referrals
- **Reward existing users** for bringing new participants
- **Create a sustainable growth loop** with ongoing yield sharing
- **Integrate seamlessly** with the existing LINE Yield ecosystem

## 🏗️ Architecture

### Frontend Components

#### ReferralPromotion Component
```typescript
// Location: packages/shared/src/components/ReferralPromotion.tsx
interface ReferralPromotionProps {
  userAddress: string | null;
  className?: string;
}
```

**Features:**
- Referral code generation and display
- Referral link sharing (Twitter, Telegram, LINE)
- Referral code redemption for new users
- Real-time referral statistics
- Reward tracking and status updates

#### ReferralPage Component
```typescript
// Location: src/pages/ReferralPage.tsx
```

**Features:**
- Complete referral dashboard
- Leaderboard display
- Referral tips and guidance
- FAQ section
- How-it-works explanation

### Backend Services

#### ReferralService
```typescript
// Location: backend/src/services/ReferralService.ts
export class ReferralService {
  // Core referral functionality
  getOrCreateReferralCode(userAddress: string): Promise<string>
  redeemReferralCode(referredByCode: string, userAddress: string): Promise<Result>
  getReferralData(userAddress: string): Promise<ReferralData>
  getReferralStats(userAddress: string): Promise<ReferralStats>
  awardReferralRewards(referrerAddress: string, referredAddress: string, rewardType: string): Promise<void>
  trackDepositForReferral(userAddress: string, amount: string): Promise<void>
  trackYieldForReferral(userAddress: string, yieldAmount: string): Promise<void>
}
```

#### API Routes
```typescript
// Location: backend/src/routes/referral.ts
```

**Endpoints:**
- `GET /api/referral/code` - Get or create referral code
- `GET /api/referral/data` - Get referral data
- `GET /api/referral/stats` - Get referral statistics
- `POST /api/referral/redeem` - Redeem referral code
- `POST /api/referral/track-deposit` - Track deposit for rewards
- `POST /api/referral/track-yield` - Track yield for rewards
- `GET /api/referral/leaderboard` - Get referral leaderboard
- `GET /api/referral/validate` - Validate referral code

### Database Schema

#### Core Tables
```sql
-- Extended users table
ALTER TABLE users ADD COLUMN referral_code VARCHAR(8) UNIQUE;
ALTER TABLE users ADD COLUMN referred_by VARCHAR(255);
ALTER TABLE users ADD COLUMN referral_level INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN referral_earnings TEXT DEFAULT '0';

-- Referral tracking table
CREATE TABLE referral_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_address VARCHAR(255) NOT NULL,
    referred_address VARCHAR(255) NOT NULL,
    referral_code VARCHAR(8) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    points_awarded INTEGER DEFAULT 0,
    amount VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referral campaigns table
CREATE TABLE referral_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    referrer_rewards JSONB NOT NULL DEFAULT '{}',
    referred_rewards JSONB NOT NULL DEFAULT '{}',
    max_referrals_per_user INTEGER,
    max_total_referrals INTEGER
);
```

## 💰 Reward Structure

### Referrer Rewards
- **Signup Bonus**: 100 Yield Points when referred user signs up
- **Deposit Bonus**: 50 Yield Points when referred user makes first deposit
- **Yield Share**: 10% of referred user's ongoing yield earnings

### Referred User Rewards
- **Signup Bonus**: 100 Yield Points bonus on signup
- **Deposit Bonus**: 50 Yield Points bonus on first deposit
- **APY Boost**: 2% APY boost for first 30 days

### Reward Configuration
```typescript
private readonly REFERRAL_CONFIG = {
  REFERRER_REWARDS: {
    signup: 100,        // Points when referred user signs up
    deposit: 50,        // Points when referred user makes first deposit
    yield_share: 0.1    // 10% of referred user's yield earnings
  },
  REFERRED_REWARDS: {
    signup: 100,        // Bonus points for new user
    deposit: 50,        // Bonus points for first deposit
    apy_boost: 0.02     // 2% APY boost for first 30 days
  },
  REFERRAL_CODE_LENGTH: 8,
  MAX_REFERRAL_DEPTH: 2 // Maximum referral depth
};
```

## 🚀 Getting Started

### 1. Database Setup

Run the referral schema migration:
```bash
# Apply the referral database schema
psql -d line_yield_db -f database-schema-referral.sql
```

### 2. Backend Setup

The referral system is automatically integrated into the main API server:

```typescript
// backend/src/index.ts
import { ApiServer } from './services/api-server';

class Application {
  private apiServer: ApiServer;
  
  constructor() {
    this.apiServer = new ApiServer();
  }
  
  async start(): Promise<void> {
    // Start API server with referral routes
    await this.apiServer.start();
  }
}
```

### 3. Frontend Integration

#### Using the ReferralPromotion Component
```typescript
import { ReferralPromotion } from '../packages/shared/src/components/ReferralPromotion';

function MyPage() {
  const [userAddress, setUserAddress] = useState<string | null>(null);
  
  return (
    <ReferralPromotion 
      userAddress={userAddress}
      className="max-w-2xl mx-auto"
    />
  );
}
```

#### Using the ReferralPage
```typescript
import { ReferralPage } from '../src/pages/ReferralPage';

function App() {
  return <ReferralPage />;
}
```

## 📊 Analytics & Tracking

### Referral Events Tracked
- **Signup**: When referred user creates account
- **Deposit**: When referred user makes first deposit
- **Withdraw**: When referred user withdraws funds
- **Yield Earned**: When referred user earns yield

### Analytics Dashboard
The system provides comprehensive analytics:
- Total referrals per user
- Active referrals (users who deposited)
- Total earnings from referrals
- Pending rewards
- Referral leaderboard

### Database Functions
```sql
-- Get referral statistics for a user
SELECT * FROM get_referral_stats('user_address');

-- Get referral leaderboard
SELECT * FROM get_referral_leaderboard(10);

-- Validate referral code
SELECT * FROM validate_referral_code('abc12345');
```

## 🔧 Configuration

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/line_yield_db

# API Server
API_PORT=3001
API_HOST=0.0.0.0

# Frontend
FRONTEND_URL=http://localhost:3000
```

### Rate Limiting
- **API Endpoints**: 100 requests per minute per IP
- **Referral Operations**: 10 requests per minute per IP
- **Leaderboard**: 20 requests per minute per IP

## 🛡️ Security Features

### Anti-Abuse Measures
- **Self-referral prevention**: Users cannot refer themselves
- **Duplicate account detection**: System prevents multiple accounts per user
- **Rate limiting**: Prevents spam and abuse
- **Input validation**: All inputs are validated and sanitized

### Data Protection
- **Row Level Security (RLS)**: Users can only access their own data
- **Encrypted referral codes**: 8-character hex codes
- **Audit trail**: All referral events are logged
- **Secure API endpoints**: Protected with authentication

## 📈 Performance Optimization

### Database Indexes
```sql
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_referred_by ON users(referred_by);
CREATE INDEX idx_referral_tracking_referrer ON referral_tracking(referrer_address);
CREATE INDEX idx_referral_tracking_referred ON referral_tracking(referred_address);
```

### Caching Strategy
- **Referral codes**: Cached for 1 hour
- **Leaderboard**: Cached for 5 minutes
- **User stats**: Cached for 10 minutes

### API Optimization
- **Batch operations**: Multiple referrals processed together
- **Async processing**: Non-blocking reward distribution
- **Connection pooling**: Efficient database connections

## 🧪 Testing

### Unit Tests
```bash
# Run referral service tests
npm test -- --grep "ReferralService"

# Run API route tests
npm test -- --grep "referral routes"
```

### Integration Tests
```bash
# Test referral flow end-to-end
npm run test:integration -- --grep "referral flow"
```

### Load Testing
```bash
# Test referral API performance
npm run test:load -- --grep "referral api"
```

## 📚 API Documentation

### Referral Code Generation
```http
GET /api/referral/code?address=0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6

Response:
{
  "success": true,
  "referralCode": "a1b2c3d4"
}
```

### Referral Code Redemption
```http
POST /api/referral/redeem
Content-Type: application/json

{
  "referredByCode": "a1b2c3d4",
  "userAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
}

Response:
{
  "success": true,
  "message": "Referral redeemed successfully",
  "referrerAddress": "0x1234567890123456789012345678901234567890"
}
```

### Referral Statistics
```http
GET /api/referral/stats?address=0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6

Response:
{
  "success": true,
  "totalReferrals": 5,
  "activeReferrals": 3,
  "totalEarnings": "1500",
  "pendingRewards": "200"
}
```

## 🚀 Deployment

### Production Setup
1. **Database Migration**: Apply referral schema
2. **Environment Configuration**: Set production environment variables
3. **API Server**: Deploy with referral routes enabled
4. **Frontend**: Include referral components
5. **Monitoring**: Set up analytics and alerting

### Monitoring
- **Referral conversion rates**
- **Reward distribution metrics**
- **API performance**
- **Error rates and logs**

## 🔮 Future Enhancements

### Planned Features
- **Multi-level referrals**: Referral chains with multiple levels
- **Campaign management**: Time-limited referral campaigns
- **Social integration**: Enhanced social media sharing
- **Mobile optimization**: Native mobile app integration
- **Advanced analytics**: Detailed referral analytics dashboard

### Integration Opportunities
- **LINE Bot integration**: Referral commands in LINE chat
- **Push notifications**: Referral reward notifications
- **Email campaigns**: Automated referral email sequences
- **Social proof**: Referral success stories and testimonials

## 📞 Support

For questions or issues with the referral system:
- **Documentation**: Check this guide and API docs
- **Issues**: Report bugs on GitHub
- **Community**: Join the LINE Yield Discord
- **Support**: Contact support@line-yield.com

---

**LINE Yield Referral System** - Building the future of DeFi through community-driven growth.


