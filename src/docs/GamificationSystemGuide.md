# LINE YIELD Gamification System Guide

This comprehensive guide covers the implementation of the LINE YIELD Points gamification system, including smart contracts, backend services, frontend components, and integration examples.

## Overview

The LINE YIELD gamification system is designed to increase user engagement and retention through a comprehensive points system that rewards users for:

- **Deposits**: 1 point per USDT deposited
- **Referrals**: 50 points for each successful referral
- **Holding**: 10 points per day for holding funds
- **Daily Distribution**: Proportional points distribution to top performers

## Architecture

### Smart Contract: `LineYieldPoints.sol`

The core gamification logic is implemented in a Solidity smart contract that handles:

#### Key Features
- **Points Tracking**: Individual user balances and total points earned
- **Leaderboard**: Top 10 users by points with automatic ranking
- **Referral System**: Track referrals and award points to both parties
- **Daily Distribution**: Proportional distribution to leaderboard participants
- **Security**: Access control, reentrancy protection, and emergency pause

#### Contract Functions

```solidity
// Core Functions
function awardDepositPoints(address user, uint256 amount) external onlyAuthorized
function awardReferralPoints(address referrer, address referee) external onlyAuthorized
function distributeDailyPoints() external onlyAuthorized
function getUserStats(address user) external view returns (uint256, uint256, uint256, uint256)
function getLeaderboard() external view returns (address[] memory, uint256[] memory)

// Admin Functions
function setDailyDistributionPool(uint256 amount) external onlyOwner
function addAuthorizedCaller(address caller) external onlyOwner
function emergencyPause() external onlyOwner
```

#### Points Configuration
- **Deposit Rate**: 1 point per USDT (scaled by 1e18)
- **Referral Points**: 50 points per referral
- **Holding Points**: 10 points per day
- **Leaderboard Size**: Top 10 users
- **Distribution Interval**: 24 hours

### Backend Services

#### GamificationService.ts
A comprehensive service that handles:

```typescript
// Core Methods
async getUserBalance(userAddress: string): Promise<string>
async getUserStats(userAddress: string): Promise<UserStats>
async getLeaderboard(): Promise<LeaderboardEntry[]>
async getContractStats(): Promise<ContractStats>

// Admin Methods
async awardDepositPoints(userAddress: string, amount: string): Promise<string>
async awardReferralPoints(referrerAddress: string, refereeAddress: string): Promise<string>
async distributeDailyPoints(): Promise<string>

// Event Listening
async listenToPointsEvents(callback: (event: PointsTransaction) => void)
async listenToDistributionEvents(callback: (event: DailyDistribution) => void)
```

#### API Endpoints

**Daily Distribution**: `/api/gamification/daily-distribution`
- Triggers daily points distribution
- Requires admin authorization
- Handles cron job integration

**Award Points**: `/api/gamification/award-points`
- Awards points for deposits and referrals
- Validates user actions
- Updates user statistics

### Frontend Components

#### GamificationDashboard.tsx
The main dashboard component featuring:

- **User Statistics**: Current points, total earned, referrals, rank
- **Leaderboard**: Top performers with ranking system
- **Earning Methods**: Clear explanation of how to earn points
- **Daily Distribution**: Countdown and pool information
- **Rewards**: Available rewards and redemption options

#### ReferralSystem.tsx
Comprehensive referral system with:

- **Referral Code Generation**: Unique codes from wallet addresses
- **Share Functionality**: Multiple sharing options (social media, QR codes)
- **Statistics Tracking**: Referral count and points earned
- **User Guidance**: Step-by-step referral process

## Implementation Guide

### 1. Smart Contract Deployment

```bash
# Deploy the contract
npx hardhat run scripts/deploy-gamification.js --network kaia

# Verify the contract
npx hardhat verify --network kaia <CONTRACT_ADDRESS>
```

### 2. Backend Configuration

```typescript
// Environment Variables
KAIA_RPC_URL=https://rpc.kaia.one
ADMIN_PRIVATE_KEY=your_admin_private_key
LINE_YIELD_POINTS_CONTRACT_ADDRESS=0x...
ADMIN_API_KEY=your_secure_api_key
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

### 3. Frontend Integration

```typescript
import GamificationDashboard from '@/components/GamificationDashboard';
import ReferralSystem from '@/components/ReferralSystem';

// In your main app
const App = () => {
  return (
    <div>
      <GamificationDashboard />
      <ReferralSystem />
    </div>
  );
};
```

### 4. Daily Distribution Setup

#### Cron Job Configuration
```bash
# Add to crontab for daily execution at 00:00 UTC
0 0 * * * curl -X POST https://yourserver.com/api/gamification/daily-distribution \
  -H "X-Admin-Key: your_admin_api_key"
```

#### Manual Trigger
```typescript
// Trigger distribution manually
const response = await fetch('/api/gamification/daily-distribution', {
  method: 'POST',
  headers: {
    'X-Admin-Key': process.env.ADMIN_API_KEY
  }
});
```

## Usage Examples

### Awarding Deposit Points

```typescript
// When user makes a deposit
const depositAmount = '100'; // 100 USDT
const userAddress = '0x...';

await gamificationService.awardDepositPoints(userAddress, depositAmount);
// Awards 100 points (1 point per USDT)
```

### Handling Referrals

```typescript
// When new user joins with referral code
const referrerAddress = '0x...';
const refereeAddress = '0x...';

await gamificationService.awardReferralPoints(referrerAddress, refereeAddress);
// Awards 50 points to both users
```

### Getting User Statistics

```typescript
const userStats = await gamificationService.getUserStats(userAddress);
console.log({
  balance: userStats.balance,        // Current points
  totalEarned: userStats.totalEarned, // Total points earned
  referrals: userStats.referrals,     // Number of referrals
  referralPoints: userStats.referralPoints // Points from referrals
});
```

### Leaderboard Integration

```typescript
const leaderboard = await gamificationService.getLeaderboard();
leaderboard.forEach((entry, index) => {
  console.log(`Rank ${entry.rank}: ${entry.address} - ${entry.points} points`);
});
```

## Security Considerations

### Smart Contract Security
- **Access Control**: Only authorized callers can award points
- **Reentrancy Protection**: Prevents reentrancy attacks
- **Emergency Pause**: Ability to pause the system if needed
- **Input Validation**: Proper validation of all inputs

### Backend Security
- **API Authentication**: Admin API key required for sensitive operations
- **Rate Limiting**: Prevent abuse of point awarding
- **Input Validation**: Validate all user inputs
- **Error Handling**: Comprehensive error handling and logging

### Frontend Security
- **Wallet Integration**: Secure wallet connection
- **Input Sanitization**: Sanitize all user inputs
- **Error Boundaries**: Graceful error handling

## Monitoring & Analytics

### Key Metrics to Track
- **Total Points Distributed**: Overall engagement metric
- **Daily Active Users**: User retention
- **Referral Conversion Rate**: Effectiveness of referral system
- **Leaderboard Participation**: Top user engagement
- **Points Earning Patterns**: User behavior analysis

### Event Tracking
```typescript
// Track points awarded events
gamificationService.listenToPointsEvents((event) => {
  console.log('Points awarded:', {
    user: event.user,
    points: event.points,
    reason: event.reason,
    timestamp: event.timestamp
  });
});

// Track daily distributions
gamificationService.listenToDistributionEvents((event) => {
  console.log('Daily distribution:', {
    totalDistributed: event.totalDistributed,
    participants: event.participants,
    timestamp: event.timestamp
  });
});
```

## Rewards & Incentives

### Available Rewards
1. **Premium Features** (1000 points)
   - Advanced yield optimization strategies
   - Priority customer support
   - Exclusive analytics

2. **Gas Credits** (500 points)
   - Free gas for transactions
   - Reduced fees for operations

3. **Priority Support** (200 points)
   - Faster customer support
   - Direct access to team

4. **Exclusive NFTs** (5000 points)
   - Limited edition LINE YIELD NFTs
   - Special collectibles

### Reward Redemption
```typescript
// Implement reward redemption logic
const redeemReward = async (rewardId: string, userAddress: string) => {
  const userStats = await gamificationService.getUserStats(userAddress);
  const reward = getRewardById(rewardId);
  
  if (parseFloat(userStats.balance) >= reward.cost) {
    // Process redemption
    await processRewardRedemption(rewardId, userAddress);
    return { success: true };
  } else {
    return { success: false, error: 'Insufficient points' };
  }
};
```

## Testing

### Unit Tests
```typescript
describe('GamificationService', () => {
  it('should award deposit points correctly', async () => {
    const userAddress = '0x...';
    const amount = '100';
    
    const txHash = await gamificationService.awardDepositPoints(userAddress, amount);
    expect(txHash).toBeDefined();
    
    const stats = await gamificationService.getUserStats(userAddress);
    expect(stats.balance).toBe('100');
  });
});
```

### Integration Tests
```typescript
describe('Gamification Integration', () => {
  it('should handle complete user journey', async () => {
    // 1. User deposits
    await gamificationService.awardDepositPoints(userAddress, '100');
    
    // 2. User refers friend
    await gamificationService.awardReferralPoints(userAddress, friendAddress);
    
    // 3. Check final stats
    const stats = await gamificationService.getUserStats(userAddress);
    expect(stats.balance).toBe('150'); // 100 + 50
    expect(stats.referrals).toBe(1);
  });
});
```

## Deployment Checklist

### Smart Contract
- [ ] Deploy contract to Kaia network
- [ ] Verify contract on block explorer
- [ ] Set up admin wallet and authorized callers
- [ ] Configure daily distribution pool
- [ ] Test all contract functions

### Backend
- [ ] Deploy API endpoints
- [ ] Configure environment variables
- [ ] Set up cron job for daily distribution
- [ ] Test API endpoints
- [ ] Set up monitoring and logging

### Frontend
- [ ] Integrate gamification components
- [ ] Test wallet connections
- [ ] Test points display and updates
- [ ] Test referral system
- [ ] Test leaderboard functionality

### Production
- [ ] Set up monitoring dashboards
- [ ] Configure alerting
- [ ] Set up backup systems
- [ ] Document operational procedures
- [ ] Train support team

## Troubleshooting

### Common Issues

1. **Points Not Updating**
   - Check contract authorization
   - Verify transaction confirmation
   - Check event listeners

2. **Leaderboard Not Updating**
   - Verify leaderboard update logic
   - Check for contract events
   - Ensure proper sorting

3. **Daily Distribution Failing**
   - Check cron job configuration
   - Verify admin API key
   - Check contract balance

### Debug Tools
```typescript
// Enable debug logging
const DEBUG_MODE = process.env.NODE_ENV === 'development';

if (DEBUG_MODE) {
  console.log('Gamification debug:', {
    userAddress,
    pointsBalance,
    leaderboard,
    contractStats
  });
}
```

## Conclusion

The LINE YIELD gamification system provides a comprehensive solution for user engagement and retention. With its robust smart contract foundation, flexible backend services, and intuitive frontend components, it creates an engaging experience that rewards users for their participation in the ecosystem.

The system is designed to scale with your application and can easily accommodate new reward mechanisms, additional earning methods, and enhanced features as your user base grows.

