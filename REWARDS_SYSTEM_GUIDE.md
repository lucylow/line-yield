# LINE Yield Rewards System Guide

This comprehensive guide covers the complete rewards system implementation for LINE Yield, including user loyalty points, KAIA rewards, signup bonuses, and item draw functionality.

## 🎁 System Overview

The LINE Yield rewards system is designed to incentivize user engagement and loyalty through a comprehensive points-based system that includes:

- **Signup Bonus**: 1,000 points for new users
- **Loyalty Rewards**: Points for daily activities and milestones
- **KAIA Rewards**: Special rewards for KAIA network activities
- **Item Draw System**: Spend points to win random items
- **Level System**: Progress through bronze, silver, gold, platinum, and diamond tiers

## 🏗️ Architecture

### Backend Components

1. **RewardsService** (`backend/src/services/RewardsService.ts`)
   - Core service for all reward operations
   - Point management and user level calculations
   - Item draw system with weighted randomness

2. **Rewards API Routes** (`backend/src/routes/rewards.ts`)
   - RESTful API endpoints for reward operations
   - Rate limiting and input validation
   - Comprehensive error handling

3. **Database Schema** (`database-schema-rewards.sql`)
   - Complete database schema for rewards system
   - Row Level Security (RLS) policies
   - Optimized indexes and functions

### Frontend Components

1. **RewardsApiClient** (`src/services/RewardsApiClient.ts`)
   - Frontend API client for reward operations
   - Error handling and response management

2. **useRewards Hook** (`src/hooks/useRewards.ts`)
   - React hook for reward operations
   - State management and user feedback

3. **UI Components**
   - `RewardsDashboard`: Complete rewards interface
   - `RewardsWidget`: Compact rewards widget for main dashboard

## 🎯 Reward Types

### 1. Signup Bonus
- **Amount**: 1,000 points
- **Trigger**: New user registration
- **Frequency**: One-time only
- **Expiration**: 30 days

```typescript
// Award signup bonus
await rewardsService.awardSignupBonus(userId);
```

### 2. Loyalty Rewards

#### Daily Login
- **Amount**: 50 points
- **Trigger**: Daily app login
- **Frequency**: Once per day
- **Expiration**: 90 days

#### Transaction Bonuses
- **Deposit**: 100 points
- **Withdraw**: 50 points
- **Yield Earned**: 200 points
- **Auto-credited**: Yes

#### Milestone Rewards
- **Level 2**: 100 points (1,000 total points)
- **Level 3**: 250 points (2,500 total points)
- **Level 4**: 500 points (5,000 total points)
- **Level 5**: 1,000 points (10,000 total points)

### 3. KAIA Rewards

#### First Deposit
- **Amount**: 200 points
- **Trigger**: First deposit on KAIA network
- **Auto-credited**: Yes

#### Yield Milestone
- **Amount**: 300 points
- **Trigger**: Reaching yield milestones
- **Auto-credited**: Yes

#### Long-term Holder
- **Amount**: 500 points
- **Trigger**: Holding assets for extended periods
- **Auto-credited**: Yes

### 4. Item Draw System

#### Draw Types
- **Common Draw**: 500 points
  - Higher chance for common items
  - 50% common, 30% rare, 15% epic, 5% legendary

- **Premium Draw**: 1,000 points
  - Better chance for rare items
  - 30% common, 40% rare, 25% epic, 5% legendary

#### Item Rarities
- **Common**: Basic items (shields, potions, basic weapons)
- **Rare**: Enhanced items (silver armor, magic staffs)
- **Epic**: Powerful items (thunder hammer, phoenix feather)
- **Legendary**: Mythical items (Excalibur, Holy Grail)

## 🎮 Usage Examples

### Frontend Integration

#### Basic Rewards Widget
```typescript
import { RewardsWidget } from '@/components/RewardsWidget';

function Dashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <RewardsWidget compact={true} />
      {/* Other dashboard components */}
    </div>
  );
}
```

#### Full Rewards Dashboard
```typescript
import { RewardsDashboard } from '@/components/RewardsDashboard';

function RewardsPage() {
  return (
    <div className="container mx-auto">
      <RewardsDashboard />
    </div>
  );
}
```

#### Using the Rewards Hook
```typescript
import { useRewards } from '@/hooks/useRewards';

function MyComponent() {
  const {
    userPoints,
    claimSignupBonus,
    claimDailyLogin,
    performItemDraw,
    isLoading,
    error
  } = useRewards();

  const handleClaimBonus = async () => {
    if (userPoints) {
      await claimSignupBonus(userPoints.userId);
    }
  };

  return (
    <div>
      <p>Available Points: {userPoints?.availablePoints}</p>
      <button onClick={handleClaimBonus} disabled={isLoading}>
        Claim Signup Bonus
      </button>
    </div>
  );
}
```

### Backend API Usage

#### Award Signup Bonus
```bash
POST /api/rewards/signup-bonus/{userId}
```

#### Award Loyalty Points
```bash
POST /api/rewards/loyalty/{userId}
Content-Type: application/json

{
  "activity": "daily_login",
  "metadata": {
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

#### Perform Item Draw
```bash
POST /api/rewards/draw/{userId}
Content-Type: application/json

{
  "drawType": "premium"
}
```

#### Get User Points
```bash
GET /api/rewards/points/{userId}
```

## 🗄️ Database Schema

### Core Tables

#### user_points
```sql
CREATE TABLE user_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL UNIQUE,
    total_points INTEGER NOT NULL DEFAULT 0,
    available_points INTEGER NOT NULL DEFAULT 0,
    used_points INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    tier VARCHAR(20) NOT NULL DEFAULT 'bronze',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### rewards
```sql
CREATE TABLE rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    points INTEGER NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);
```

#### draw_items
```sql
CREATE TABLE draw_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    rarity VARCHAR(20) NOT NULL,
    points_cost INTEGER NOT NULL,
    image_url TEXT,
    draw_type VARCHAR(20) NOT NULL DEFAULT 'common',
    is_active BOOLEAN NOT NULL DEFAULT true
);
```

### Database Functions

#### Credit Points
```sql
SELECT credit_user_points('user123', 1000, 'signup_bonus');
```

#### Deduct Points
```sql
SELECT deduct_user_points('user123', 500, 'item_draw');
```

#### Get Leaderboard
```sql
SELECT * FROM get_points_leaderboard(100);
```

## 🔧 Configuration

### Environment Variables

#### Backend
```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key

# Rewards Configuration
REWARDS_SIGNUP_BONUS=1000
REWARDS_DAILY_LOGIN=50
REWARDS_DEPOSIT_BONUS=100
REWARDS_WITHDRAW_BONUS=50
REWARDS_YIELD_BONUS=200
```

#### Frontend
```bash
VITE_API_BASE_URL=http://localhost:3000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Reward Configuration
```typescript
const REWARD_CONFIG = {
  SIGNUP_BONUS: 1000,
  REFERRAL_BONUS: 500,
  DAILY_LOGIN: 50,
  TRANSACTION_BONUS: {
    deposit: 100,
    withdraw: 50,
    yield_earned: 200
  },
  KAIA_REWARDS: {
    first_deposit: 200,
    yield_milestone: 300,
    long_term_holder: 500
  }
};
```

## 🎨 UI Components

### RewardsDashboard
Complete rewards interface with:
- User points overview
- Level progress tracking
- Reward claiming interface
- Item draw system
- Reward and draw history

### RewardsWidget
Compact widget for main dashboard with:
- Current points display
- Tier and level information
- Quick reward claiming
- Progress indicators

### Key Features
- **Responsive Design**: Works on all device sizes
- **Real-time Updates**: Points update immediately
- **Error Handling**: Comprehensive error states
- **Loading States**: Smooth loading indicators
- **Accessibility**: Screen reader friendly

## 🔒 Security Features

### Backend Security
- **Rate Limiting**: Prevents abuse of reward endpoints
- **Input Validation**: All inputs are validated and sanitized
- **Authentication**: User signature verification
- **Audit Logging**: All reward operations are logged

### Database Security
- **Row Level Security**: Users can only access their own data
- **Encrypted Storage**: Sensitive data is encrypted
- **Access Control**: Proper permissions for different roles

### Frontend Security
- **Input Validation**: Client-side validation
- **Error Handling**: Secure error messages
- **HTTPS Only**: All API calls use HTTPS

## 📊 Analytics and Monitoring

### Tracked Events
- Reward claims
- Item draws
- Level progression
- User engagement
- Error rates

### Metrics
- Points distribution
- Reward claim rates
- Draw success rates
- User retention
- Tier progression

### Monitoring
- API response times
- Error rates
- Database performance
- User satisfaction

## 🚀 Deployment

### Database Setup
1. Run the database schema script
2. Set up Row Level Security policies
3. Create necessary indexes
4. Insert sample draw items

### Backend Deployment
1. Set environment variables
2. Deploy API routes
3. Configure rate limiting
4. Set up monitoring

### Frontend Deployment
1. Build with environment variables
2. Deploy to CDN
3. Configure API endpoints
4. Test reward functionality

## 🧪 Testing

### Unit Tests
- Reward service functions
- API endpoint responses
- Database functions
- UI component behavior

### Integration Tests
- End-to-end reward flows
- Database operations
- API integration
- User experience

### Load Tests
- High-volume reward claims
- Concurrent item draws
- Database performance
- API response times

## 📈 Future Enhancements

### Planned Features
- **Referral System**: Earn points for inviting friends
- **Achievement System**: Unlock special rewards
- **Seasonal Events**: Limited-time rewards
- **NFT Integration**: Convert points to NFTs
- **Social Features**: Share achievements

### Scalability Improvements
- **Caching**: Redis for frequently accessed data
- **Queue System**: Background reward processing
- **Microservices**: Separate reward service
- **CDN**: Global content delivery

## 🆘 Troubleshooting

### Common Issues

#### Points Not Crediting
- Check user authentication
- Verify reward status
- Check expiration dates
- Review error logs

#### Item Draw Failures
- Verify sufficient points
- Check draw item availability
- Review random number generation
- Check database constraints

#### Performance Issues
- Monitor database queries
- Check API response times
- Review caching strategy
- Optimize database indexes

### Debug Tools
- API health checks
- Database query monitoring
- Error logging
- Performance metrics

## 📞 Support

For issues or questions regarding the rewards system:

1. Check the troubleshooting section
2. Review error logs
3. Test with sample data
4. Contact the development team

---

**Note**: This rewards system is designed to be secure, scalable, and user-friendly. Regular audits and updates ensure optimal performance and security.


