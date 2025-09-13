# Gamification System

This document describes the comprehensive gamification system for the LINE Yield Mini Dapp, featuring reward missions, leaderboards, NFT rewards, and point exchange functionality.

## 🎮 Features Overview

### Core Gamification Features
- **Reward Missions**: Complete tasks to earn points, NFTs, and KAIA tokens
- **Leaderboards**: Compete with other users across multiple categories
- **NFT Rewards**: Collect exclusive NFTs by completing missions
- **Point Exchange**: Convert LINE Yield points to KAIA tokens
- **Achievement System**: Unlock badges and achievements
- **Level System**: Progress through levels with experience points

### Mission Types
- **First Purchase**: Make your first USDT deposit
- **Mission Master**: Complete 5 different missions
- **Social Butterfly**: Invite 5 friends to LINE Yield
- **Big Spender**: Deposit 1000 USDT or more
- **Daily Grind**: Use LINE Yield for 7 consecutive days

## 🚀 Quick Start

### Basic Usage

```tsx
import { GamificationDashboard } from '@shared/components';
import { useGamification } from '@shared/hooks';

function MyApp() {
  const userId = 'user123';
  
  return (
    <GamificationDashboard userId={userId} />
  );
}
```

### Individual Components

```tsx
import { 
  MissionCard, 
  LeaderboardComponent, 
  NFTCard, 
  PointExchange 
} from '@shared/components';

// Mission Card
<MissionCard 
  mission={mission} 
  onComplete={(missionId) => console.log('Completed:', missionId)} 
/>

// Leaderboard
<LeaderboardComponent 
  leaderboard={leaderboard} 
  loading={false}
  onRefresh={() => console.log('Refreshing...')} 
/>

// NFT Card
<NFTCard 
  nft={nft} 
  onClaim={(nftId) => console.log('Claiming:', nftId)} 
/>

// Point Exchange
<PointExchange 
  exchangeRates={rates}
  userPoints={1000}
  onExchange={(points, currency) => console.log('Exchanging:', points, currency)}
/>
```

## 📚 API Reference

### Hooks

#### `useGamification(userId)`
Manages user gamification data and mission completion.

```tsx
const {
  user,           // GamificationUser | null
  missions,       // Mission[]
  loading,        // boolean
  error,          // string | null
  completeMission, // (missionId: string) => Promise<Reward | null>
  updateUserProgress, // (updates: Partial<GamificationUser>) => Promise<void>
  refresh         // () => void
} = useGamification(userId);
```

#### `useLeaderboard(type, period)`
Fetches and manages leaderboard data.

```tsx
const {
  leaderboard,    // Leaderboard | null
  loading,        // boolean
  error,          // string | null
  refresh         // () => void
} = useLeaderboard(LeaderboardType.POINTS, LeaderboardPeriod.ALL_TIME);
```

#### `useNFTs(userId)`
Manages user's NFT collection.

```tsx
const {
  nfts,           // NFT[]
  loading,        // boolean
  error,          // string | null
  claimNFT,       // (nftId: string) => Promise<NFT | null>
  refresh         // () => void
} = useNFTs(userId);
```

#### `usePointExchange(userId)`
Handles point exchange functionality.

```tsx
const {
  exchangeRates,  // PointExchangeRate[]
  loading,        // boolean
  error,          // string | null
  exchangePoints, // (points: number, toCurrency: string) => Promise<boolean>
  refresh         // () => void
} = usePointExchange(userId);
```

#### `useGamificationStats()`
Provides global gamification statistics.

```tsx
const {
  stats,          // GamificationStats | null
  loading,        // boolean
  error,          // string | null
  refresh         // () => void
} = useGamificationStats();
```

### Components

#### `GamificationDashboard`
Main dashboard component with tabs for all gamification features.

**Props:**
- `userId: string` - User ID for gamification data
- `className?: string` - Additional CSS classes

#### `MissionCard`
Displays individual mission information and progress.

**Props:**
- `mission: Mission` - Mission data
- `onComplete?: (missionId: string) => void` - Completion callback
- `className?: string` - Additional CSS classes

#### `LeaderboardComponent`
Shows leaderboard rankings with podium display.

**Props:**
- `leaderboard: Leaderboard` - Leaderboard data
- `loading?: boolean` - Loading state
- `onRefresh?: () => void` - Refresh callback
- `className?: string` - Additional CSS classes

#### `NFTCard`
Displays NFT information with rarity and attributes.

**Props:**
- `nft: NFT` - NFT data
- `onClaim?: (nftId: string) => void` - Claim callback
- `onView?: (nftId: string) => void` - View callback
- `className?: string` - Additional CSS classes
- `showClaimButton?: boolean` - Show claim button

#### `PointExchange`
Handles point to KAIA token exchange.

**Props:**
- `exchangeRates: PointExchangeRate[]` - Available exchange rates
- `userPoints: number` - User's current points
- `onExchange: (points: number, toCurrency: string) => Promise<boolean>` - Exchange callback
- `loading?: boolean` - Loading state
- `className?: string` - Additional CSS classes

## 🎯 Mission System

### Mission Types

#### `MissionType.FIRST_PURCHASE`
- **Target**: 1 deposit
- **Reward**: 100 LINE Yield Points
- **Difficulty**: Easy
- **Category**: Beginner

#### `MissionType.COMPLETE_MISSIONS`
- **Target**: 5 missions completed
- **Reward**: Mission Master NFT (Rare)
- **Difficulty**: Medium
- **Category**: Special

#### `MissionType.INVITE_FRIENDS`
- **Target**: 5 friends invited
- **Reward**: 50 KAIA Tokens
- **Difficulty**: Hard
- **Category**: Social

#### `MissionType.DEPOSIT_AMOUNT`
- **Target**: 1000 USDT
- **Reward**: +0.5% Bonus APY for 30 days
- **Difficulty**: Medium
- **Category**: Trading

#### `MissionType.STREAK_DAYS`
- **Target**: 7 consecutive days
- **Reward**: 200 LINE Yield Points
- **Difficulty**: Medium
- **Category**: Community

### Mission Status
- **LOCKED**: Mission not yet available
- **AVAILABLE**: Mission can be started
- **IN_PROGRESS**: Mission is active
- **COMPLETED**: Mission finished
- **EXPIRED**: Mission expired

### Mission Difficulty
- **EASY**: Simple tasks for beginners
- **MEDIUM**: Moderate difficulty tasks
- **HARD**: Challenging tasks
- **EXPERT**: Advanced tasks

## 🏆 Leaderboard System

### Leaderboard Types
- **POINTS**: Total points earned
- **LEVEL**: User level progression
- **TRADING_VOLUME**: Total trading volume
- **REFERRALS**: Number of friends invited
- **STREAK**: Longest consecutive days
- **ACHIEVEMENTS**: Number of achievements unlocked

### Leaderboard Periods
- **DAILY**: Daily rankings
- **WEEKLY**: Weekly rankings
- **MONTHLY**: Monthly rankings
- **ALL_TIME**: All-time rankings

### Ranking Display
- **Top 3**: Special podium display with crowns and medals
- **Full Rankings**: Complete list with user stats
- **Current User**: Highlighted with "You" badge

## 🎨 NFT System

### NFT Rarities
- **COMMON**: Basic NFTs (Gray)
- **RARE**: Uncommon NFTs (Green)
- **EPIC**: Special NFTs (Blue)
- **LEGENDARY**: Ultra-rare NFTs (Purple)

### NFT Collections
- **LINE Yield Achievements**: Mission completion NFTs
- **LINE Yield Legends**: Top performer NFTs
- **Special Events**: Limited edition NFTs

### NFT Attributes
Each NFT contains attributes like:
- **Rarity**: NFT rarity level
- **Category**: Type of achievement
- **Power**: Numerical power value
- **Collection**: Which collection it belongs to

## 💰 Point Exchange System

### Exchange Rates
- **LINE_YIELD_POINTS → KAIA**: 1000 points = 1 KAIA
- **Minimum Exchange**: 1000 points
- **Maximum Exchange**: 100,000 points
- **Exchange Fee**: 5%

### Exchange Process
1. Select exchange rate
2. Enter points amount
3. Review calculation (amount - fee)
4. Confirm exchange
5. Receive KAIA tokens

### Exchange Features
- **Quick Amount Buttons**: Min, 25%, 50%, 75%, Max
- **Real-time Calculation**: Live fee and amount calculation
- **Validation**: Min/max amount checks
- **Error Handling**: Insufficient balance, network errors

## 🎖️ Achievement System

### Achievement Categories
- **TRADING**: Trading-related achievements
- **SOCIAL**: Social interaction achievements
- **MILESTONE**: Major milestone achievements
- **SPECIAL**: Special event achievements
- **COLLECTION**: Collection-based achievements

### Badge System
- **Early Adopter**: Joined in first month
- **Top Trader**: Top 10% trader by volume
- **Community Champion**: Active community member

## 📊 Statistics & Analytics

### User Statistics
- **Total Points**: Lifetime points earned
- **Level**: Current user level
- **Experience**: Current level experience
- **Missions Completed**: Total missions finished
- **Friends Invited**: Referral count
- **Streak Days**: Current consecutive days
- **Achievements**: Total achievements unlocked
- **Badges**: Total badges earned

### Global Statistics
- **Total Users**: Platform user count
- **Total Points Earned**: All-time points
- **Total Missions Completed**: All missions finished
- **Total NFTs Minted**: All NFTs created
- **Total KAIA Exchanged**: All exchanges
- **Average Level**: Platform average level
- **Top Performer**: Current leader

## 🔧 Service Layer

### GamificationService
Singleton service managing all gamification logic:

```typescript
const service = GamificationService.getInstance();

// User management
await service.getUser(userId);
await service.createUser(userId, walletAddress);
await service.updateUser(userId, updates);

// Mission management
await service.getMissions(userId);
await service.completeMission(userId, missionId);

// Leaderboard
await service.getLeaderboard(type, period);

// NFT management
await service.mintNFT(userId, nftId);
await service.getUserNFTs(userId);

// Point exchange
await service.getExchangeRates();
await service.exchangePoints(userId, points, currency);

// Statistics
await service.getGamificationStats();
```

## 🎨 UI Components

### Design System
- **Consistent Styling**: Tailwind CSS with custom components
- **Responsive Design**: Mobile-first approach
- **Accessibility**: ARIA labels and keyboard navigation
- **Loading States**: Skeleton loaders and spinners
- **Error Handling**: User-friendly error messages

### Color Coding
- **Points**: Blue (#3B82F6)
- **Missions**: Green (#10B981)
- **Levels**: Purple (#8B5CF6)
- **Referrals**: Yellow (#F59E0B)
- **NFTs**: Gradient based on rarity
- **Leaderboards**: Gold/Silver/Bronze for top 3

## 🚀 Integration Guide

### Adding to Existing Components

```tsx
import { useGamification } from '@shared/hooks';

function MyComponent() {
  const { user, missions, completeMission } = useGamification('user123');
  
  const handleDeposit = async () => {
    // Your deposit logic
    await depositUSDT(amount);
    
    // Check for mission completion
    const firstPurchaseMission = missions.find(m => m.type === 'first_purchase');
    if (firstPurchaseMission && firstPurchaseMission.current >= firstPurchaseMission.target) {
      await completeMission(firstPurchaseMission.id);
    }
  };
  
  return (
    <div>
      <p>Points: {user?.totalPoints}</p>
      <p>Level: {user?.level}</p>
      {/* Your component content */}
    </div>
  );
}
```

### Event Tracking

```tsx
import { GamificationService } from '@shared/services';

const service = GamificationService.getInstance();

// Track user actions
await service.updateUser(userId, {
  totalDeposits: user.totalDeposits + amount,
  lastActiveDate: new Date()
});

// Check for mission completion
const missions = await service.getMissions(userId);
for (const mission of missions) {
  if (mission.current >= mission.target && mission.status !== 'completed') {
    await service.completeMission(userId, mission.id);
  }
}
```

## 🧪 Testing

### Unit Tests
```typescript
import { GamificationService } from '@shared/services';

describe('GamificationService', () => {
  let service: GamificationService;
  
  beforeEach(() => {
    service = GamificationService.getInstance();
  });
  
  test('should create user', async () => {
    const user = await service.createUser('user123', '0x...');
    expect(user.userId).toBe('user123');
    expect(user.totalPoints).toBe(0);
    expect(user.level).toBe(1);
  });
  
  test('should complete mission', async () => {
    const reward = await service.completeMission('user123', 'first_purchase');
    expect(reward).toBeDefined();
    expect(reward?.type).toBe('points');
  });
});
```

### Component Tests
```typescript
import { render, screen } from '@testing-library/react';
import { MissionCard } from '@shared/components';

test('should display mission information', () => {
  const mission = {
    id: 'test',
    title: 'Test Mission',
    description: 'Test description',
    // ... other properties
  };
  
  render(<MissionCard mission={mission} />);
  
  expect(screen.getByText('Test Mission')).toBeInTheDocument();
  expect(screen.getByText('Test description')).toBeInTheDocument();
});
```

## 🔍 Troubleshooting

### Common Issues

**Missions not updating:**
- Check if user data is being updated correctly
- Verify mission progress calculation
- Ensure mission completion logic is triggered

**Leaderboard not loading:**
- Check network connectivity
- Verify leaderboard type and period parameters
- Check for API errors in console

**NFT claiming fails:**
- Verify user has sufficient permissions
- Check NFT template exists
- Ensure blockchain connection is active

**Point exchange errors:**
- Verify user has sufficient points
- Check exchange rate validity
- Ensure blockchain transaction succeeds

### Debug Mode
Enable debug logging:
```typescript
localStorage.setItem('debug-gamification', 'true');
```

## 📈 Performance Considerations

- **Lazy Loading**: Components load data only when needed
- **Caching**: Service layer caches frequently accessed data
- **Optimistic Updates**: UI updates immediately, syncs in background
- **Pagination**: Large lists are paginated for performance
- **Debouncing**: User input is debounced to prevent excessive API calls

## 🔮 Future Enhancements

- **Seasonal Events**: Limited-time missions and rewards
- **Guild System**: Team-based competitions
- **Cross-Platform**: Sync across web and mobile
- **AI Recommendations**: Personalized mission suggestions
- **Social Features**: Share achievements and compete with friends
- **Advanced Analytics**: Detailed performance metrics
- **Customizable Avatars**: NFT-based profile pictures
- **Voice Commands**: Voice-activated mission completion

---

This gamification system provides a comprehensive foundation for engaging users and encouraging platform adoption through rewards, competition, and social features.
