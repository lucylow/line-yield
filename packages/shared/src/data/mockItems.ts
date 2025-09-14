export interface InAppItem {
  id: string;
  name: string;
  description: string;
  category: 'nft' | 'premium' | 'booster' | 'cosmetic' | 'utility' | 'subscription';
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  price: {
    crypto: {
      amount: number;
      currency: 'YIELD' | 'KAIA' | 'USDT';
    };
    fiat: {
      amount: number;
      currency: 'USD' | 'KRW' | 'JPY' | 'TWD' | 'THB';
    };
  };
  image: string;
  icon: string;
  effects?: {
    type: string;
    value: number;
    duration?: number; // in days
  }[];
  requirements?: {
    minLevel?: number;
    minStaked?: number;
    requiredItems?: string[];
  };
  limitedTime?: {
    startDate: string;
    endDate: string;
  };
  stock?: {
    total: number;
    remaining: number;
  };
  tags: string[];
  popularity: number; // 1-100
  createdAt: string;
}

export const mockInAppItems: InAppItem[] = [
  // NFT Items
  {
    id: 'nft_yield_master',
    name: 'Yield Master NFT',
    description: 'Exclusive NFT badge for top yield farmers. Provides 15% bonus APY and exclusive access to premium features.',
    category: 'nft',
    rarity: 'legendary',
    price: {
      crypto: { amount: 1000, currency: 'YIELD' },
      fiat: { amount: 50, currency: 'USD' }
    },
    image: '/images/nft/yield-master.png',
    icon: '🏆',
    effects: [
      { type: 'apy_boost', value: 15, duration: 365 },
      { type: 'premium_access', value: 1 },
      { type: 'voting_power', value: 100 }
    ],
    requirements: {
      minLevel: 10,
      minStaked: 10000
    },
    stock: { total: 100, remaining: 23 },
    tags: ['nft', 'exclusive', 'yield-boost', 'premium'],
    popularity: 95,
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'nft_degen_warrior',
    name: 'Degen Warrior NFT',
    description: 'For the brave souls who take calculated risks. Grants 20% bonus on high-risk investments.',
    category: 'nft',
    rarity: 'epic',
    price: {
      crypto: { amount: 500, currency: 'YIELD' },
      fiat: { amount: 25, currency: 'USD' }
    },
    image: '/images/nft/degen-warrior.png',
    icon: '⚔️',
    effects: [
      { type: 'risk_bonus', value: 20, duration: 180 },
      { type: 'early_access', value: 1 }
    ],
    requirements: {
      minLevel: 5
    },
    stock: { total: 500, remaining: 156 },
    tags: ['nft', 'risk', 'bonus', 'warrior'],
    popularity: 78,
    createdAt: '2024-01-20T00:00:00Z'
  },
  {
    id: 'nft_diamond_hands',
    name: 'Diamond Hands NFT',
    description: 'For the HODLers. Provides immunity to panic selling and bonus rewards for long-term staking.',
    category: 'nft',
    rarity: 'rare',
    price: {
      crypto: { amount: 250, currency: 'YIELD' },
      fiat: { amount: 12.50, currency: 'USD' }
    },
    image: '/images/nft/diamond-hands.png',
    icon: '💎',
    effects: [
      { type: 'hodl_bonus', value: 25, duration: 365 },
      { type: 'panic_protection', value: 1 }
    ],
    stock: { total: 1000, remaining: 423 },
    tags: ['nft', 'hodl', 'staking', 'protection'],
    popularity: 82,
    createdAt: '2024-01-25T00:00:00Z'
  },

  // Premium Features
  {
    id: 'premium_analytics',
    name: 'Premium Analytics Dashboard',
    description: 'Advanced analytics with real-time data, custom charts, and predictive insights for your portfolio.',
    category: 'premium',
    rarity: 'epic',
    price: {
      crypto: { amount: 200, currency: 'YIELD' },
      fiat: { amount: 10, currency: 'USD' }
    },
    image: '/images/premium/analytics.png',
    icon: '📊',
    effects: [
      { type: 'advanced_analytics', value: 1, duration: 30 },
      { type: 'custom_charts', value: 1, duration: 30 },
      { type: 'predictive_insights', value: 1, duration: 30 }
    ],
    tags: ['premium', 'analytics', 'dashboard', 'insights'],
    popularity: 88,
    createdAt: '2024-02-01T00:00:00Z'
  },
  {
    id: 'premium_support',
    name: 'VIP Customer Support',
    description: 'Priority customer support with dedicated account manager and faster response times.',
    category: 'premium',
    rarity: 'rare',
    price: {
      crypto: { amount: 100, currency: 'YIELD' },
      fiat: { amount: 5, currency: 'USD' }
    },
    image: '/images/premium/support.png',
    icon: '🎧',
    effects: [
      { type: 'priority_support', value: 1, duration: 30 },
      { type: 'dedicated_manager', value: 1, duration: 30 },
      { type: 'faster_response', value: 1, duration: 30 }
    ],
    tags: ['premium', 'support', 'vip', 'priority'],
    popularity: 75,
    createdAt: '2024-02-05T00:00:00Z'
  },
  {
    id: 'premium_api_access',
    name: 'Premium API Access',
    description: 'Access to advanced API endpoints with higher rate limits and real-time data feeds.',
    category: 'premium',
    rarity: 'epic',
    price: {
      crypto: { amount: 300, currency: 'YIELD' },
      fiat: { amount: 15, currency: 'USD' }
    },
    image: '/images/premium/api.png',
    icon: '🔌',
    effects: [
      { type: 'api_access', value: 1, duration: 30 },
      { type: 'rate_limit_boost', value: 10, duration: 30 },
      { type: 'realtime_data', value: 1, duration: 30 }
    ],
    requirements: {
      minLevel: 8
    },
    tags: ['premium', 'api', 'developer', 'integration'],
    popularity: 65,
    createdAt: '2024-02-10T00:00:00Z'
  },

  // Boosters
  {
    id: 'booster_apy_24h',
    name: '24h APY Booster',
    description: 'Temporarily increase your staking APY by 50% for 24 hours. Perfect for maximizing rewards during high-yield periods.',
    category: 'booster',
    rarity: 'common',
    price: {
      crypto: { amount: 50, currency: 'YIELD' },
      fiat: { amount: 2.50, currency: 'USD' }
    },
    image: '/images/boosters/apy-booster.png',
    icon: '⚡',
    effects: [
      { type: 'apy_boost', value: 50, duration: 1 }
    ],
    stock: { total: 10000, remaining: 8756 },
    tags: ['booster', 'apy', 'temporary', 'yield'],
    popularity: 92,
    createdAt: '2024-02-15T00:00:00Z'
  },
  {
    id: 'booster_referral_7d',
    name: '7-Day Referral Booster',
    description: 'Double your referral rewards for 7 days. Earn more when friends join through your referral link.',
    category: 'booster',
    rarity: 'rare',
    price: {
      crypto: { amount: 75, currency: 'YIELD' },
      fiat: { amount: 3.75, currency: 'USD' }
    },
    image: '/images/boosters/referral-booster.png',
    icon: '👥',
    effects: [
      { type: 'referral_boost', value: 100, duration: 7 }
    ],
    stock: { total: 5000, remaining: 3421 },
    tags: ['booster', 'referral', 'social', 'rewards'],
    popularity: 85,
    createdAt: '2024-02-20T00:00:00Z'
  },
  {
    id: 'booster_gas_free',
    name: 'Gas-Free Transactions',
    description: 'Enjoy 10 gas-free transactions. Perfect for small trades and interactions.',
    category: 'booster',
    rarity: 'common',
    price: {
      crypto: { amount: 30, currency: 'YIELD' },
      fiat: { amount: 1.50, currency: 'USD' }
    },
    image: '/images/boosters/gas-free.png',
    icon: '⛽',
    effects: [
      { type: 'gas_free', value: 10 }
    ],
    stock: { total: 20000, remaining: 15678 },
    tags: ['booster', 'gas', 'transactions', 'free'],
    popularity: 90,
    createdAt: '2024-02-25T00:00:00Z'
  },

  // Cosmetic Items
  {
    id: 'cosmetic_profile_frame_gold',
    name: 'Gold Profile Frame',
    description: 'Exclusive gold frame for your profile. Show off your premium status with this luxurious border.',
    category: 'cosmetic',
    rarity: 'epic',
    price: {
      crypto: { amount: 150, currency: 'YIELD' },
      fiat: { amount: 7.50, currency: 'USD' }
    },
    image: '/images/cosmetic/gold-frame.png',
    icon: '🖼️',
    effects: [
      { type: 'profile_customization', value: 1 }
    ],
    tags: ['cosmetic', 'profile', 'gold', 'premium'],
    popularity: 70,
    createdAt: '2024-03-01T00:00:00Z'
  },
  {
    id: 'cosmetic_avatar_robot',
    name: 'Robot Avatar',
    description: 'Futuristic robot avatar for your profile. Perfect for tech-savvy DeFi enthusiasts.',
    category: 'cosmetic',
    rarity: 'rare',
    price: {
      crypto: { amount: 80, currency: 'YIELD' },
      fiat: { amount: 4, currency: 'USD' }
    },
    image: '/images/cosmetic/robot-avatar.png',
    icon: '🤖',
    effects: [
      { type: 'avatar_customization', value: 1 }
    ],
    tags: ['cosmetic', 'avatar', 'robot', 'tech'],
    popularity: 68,
    createdAt: '2024-03-05T00:00:00Z'
  },
  {
    id: 'cosmetic_theme_dark',
    name: 'Dark Theme Pack',
    description: 'Professional dark theme with custom colors and animations. Easy on the eyes for night trading.',
    category: 'cosmetic',
    rarity: 'common',
    price: {
      crypto: { amount: 40, currency: 'YIELD' },
      fiat: { amount: 2, currency: 'USD' }
    },
    image: '/images/cosmetic/dark-theme.png',
    icon: '🌙',
    effects: [
      { type: 'theme_customization', value: 1 }
    ],
    tags: ['cosmetic', 'theme', 'dark', 'night'],
    popularity: 82,
    createdAt: '2024-03-10T00:00:00Z'
  },

  // Utility Items
  {
    id: 'utility_portfolio_tracker',
    name: 'Advanced Portfolio Tracker',
    description: 'Track your entire DeFi portfolio across multiple chains with real-time P&L calculations.',
    category: 'utility',
    rarity: 'epic',
    price: {
      crypto: { amount: 120, currency: 'YIELD' },
      fiat: { amount: 6, currency: 'USD' }
    },
    image: '/images/utility/portfolio-tracker.png',
    icon: '📈',
    effects: [
      { type: 'portfolio_tracking', value: 1, duration: 30 },
      { type: 'multi_chain', value: 1, duration: 30 },
      { type: 'realtime_pnl', value: 1, duration: 30 }
    ],
    tags: ['utility', 'portfolio', 'tracking', 'defi'],
    popularity: 88,
    createdAt: '2024-03-15T00:00:00Z'
  },
  {
    id: 'utility_price_alerts',
    name: 'Smart Price Alerts',
    description: 'Set intelligent price alerts with custom conditions and notifications across multiple channels.',
    category: 'utility',
    rarity: 'rare',
    price: {
      crypto: { amount: 60, currency: 'YIELD' },
      fiat: { amount: 3, currency: 'USD' }
    },
    image: '/images/utility/price-alerts.png',
    icon: '🔔',
    effects: [
      { type: 'price_alerts', value: 1, duration: 30 },
      { type: 'smart_conditions', value: 1, duration: 30 },
      { type: 'multi_channel', value: 1, duration: 30 }
    ],
    tags: ['utility', 'alerts', 'price', 'notifications'],
    popularity: 80,
    createdAt: '2024-03-20T00:00:00Z'
  },

  // Subscriptions
  {
    id: 'subscription_premium_monthly',
    name: 'Premium Monthly Subscription',
    description: 'Full access to all premium features including analytics, priority support, and exclusive content.',
    category: 'subscription',
    rarity: 'epic',
    price: {
      crypto: { amount: 500, currency: 'YIELD' },
      fiat: { amount: 25, currency: 'USD' }
    },
    image: '/images/subscriptions/premium-monthly.png',
    icon: '⭐',
    effects: [
      { type: 'all_premium_features', value: 1, duration: 30 },
      { type: 'priority_support', value: 1, duration: 30 },
      { type: 'exclusive_content', value: 1, duration: 30 },
      { type: 'advanced_analytics', value: 1, duration: 30 }
    ],
    tags: ['subscription', 'premium', 'monthly', 'all-access'],
    popularity: 90,
    createdAt: '2024-03-25T00:00:00Z'
  },
  {
    id: 'subscription_pro_annual',
    name: 'Pro Annual Subscription',
    description: 'Professional-grade tools and features for serious DeFi users. Save 20% with annual billing.',
    category: 'subscription',
    rarity: 'legendary',
    price: {
      crypto: { amount: 4800, currency: 'YIELD' },
      fiat: { amount: 240, currency: 'USD' }
    },
    image: '/images/subscriptions/pro-annual.png',
    icon: '💼',
    effects: [
      { type: 'pro_features', value: 1, duration: 365 },
      { type: 'api_access', value: 1, duration: 365 },
      { type: 'dedicated_support', value: 1, duration: 365 },
      { type: 'white_label', value: 1, duration: 365 }
    ],
    requirements: {
      minLevel: 15
    },
    tags: ['subscription', 'pro', 'annual', 'professional'],
    popularity: 75,
    createdAt: '2024-03-30T00:00:00Z'
  },

  // Limited Time Items
  {
    id: 'limited_valentine_nft',
    name: 'Valentine\'s Day NFT',
    description: 'Exclusive Valentine\'s Day themed NFT with special animations and romantic effects.',
    category: 'nft',
    rarity: 'epic',
    price: {
      crypto: { amount: 200, currency: 'YIELD' },
      fiat: { amount: 10, currency: 'USD' }
    },
    image: '/images/nft/valentine.png',
    icon: '💕',
    effects: [
      { type: 'special_animation', value: 1 },
      { type: 'romantic_effects', value: 1 },
      { type: 'exclusive_access', value: 1 }
    ],
    limitedTime: {
      startDate: '2024-02-10T00:00:00Z',
      endDate: '2024-02-17T23:59:59Z'
    },
    stock: { total: 1000, remaining: 234 },
    tags: ['limited', 'valentine', 'nft', 'exclusive'],
    popularity: 95,
    createdAt: '2024-02-10T00:00:00Z'
  },
  {
    id: 'limited_spring_booster',
    name: 'Spring Growth Booster',
    description: 'Limited-time booster that increases all rewards by 30% for 14 days. Perfect for spring portfolio growth.',
    category: 'booster',
    rarity: 'rare',
    price: {
      crypto: { amount: 100, currency: 'YIELD' },
      fiat: { amount: 5, currency: 'USD' }
    },
    image: '/images/boosters/spring-growth.png',
    icon: '🌸',
    effects: [
      { type: 'all_rewards_boost', value: 30, duration: 14 }
    ],
    limitedTime: {
      startDate: '2024-03-20T00:00:00Z',
      endDate: '2024-04-20T23:59:59Z'
    },
    stock: { total: 5000, remaining: 1234 },
    tags: ['limited', 'spring', 'booster', 'growth'],
    popularity: 88,
    createdAt: '2024-03-20T00:00:00Z'
  }
];

// Helper functions for item management
export const getItemsByCategory = (category: InAppItem['category']): InAppItem[] => {
  return mockInAppItems.filter(item => item.category === category);
};

export const getItemsByRarity = (rarity: InAppItem['rarity']): InAppItem[] => {
  return mockInAppItems.filter(item => item.rarity === rarity);
};

export const getLimitedTimeItems = (): InAppItem[] => {
  const now = new Date();
  return mockInAppItems.filter(item => {
    if (!item.limitedTime) return false;
    const startDate = new Date(item.limitedTime.startDate);
    const endDate = new Date(item.limitedTime.endDate);
    return now >= startDate && now <= endDate;
  });
};

export const getPopularItems = (limit: number = 10): InAppItem[] => {
  return mockInAppItems
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);
};

export const getItemById = (id: string): InAppItem | undefined => {
  return mockInAppItems.find(item => item.id === id);
};

export const searchItems = (query: string): InAppItem[] => {
  const lowercaseQuery = query.toLowerCase();
  return mockInAppItems.filter(item => 
    item.name.toLowerCase().includes(lowercaseQuery) ||
    item.description.toLowerCase().includes(lowercaseQuery) ||
    item.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};

export const getAvailableItems = (): InAppItem[] => {
  return mockInAppItems.filter(item => {
    // Check if item is in stock
    if (item.stock && item.stock.remaining <= 0) return false;
    
    // Check if limited time item is still available
    if (item.limitedTime) {
      const now = new Date();
      const endDate = new Date(item.limitedTime.endDate);
      if (now > endDate) return false;
    }
    
    return true;
  });
};

// Price conversion utilities
export const convertCryptoToFiat = (
  cryptoAmount: number,
  cryptoCurrency: string,
  fiatCurrency: string
): number => {
  // Mock conversion rates (in real app, these would come from price oracles)
  const rates: Record<string, Record<string, number>> = {
    'YIELD': { 'USD': 0.05, 'KRW': 65, 'JPY': 7.5, 'TWD': 1.6, 'THB': 1.8 },
    'KAIA': { 'USD': 0.12, 'KRW': 156, 'JPY': 18, 'TWD': 3.8, 'THB': 4.3 },
    'USDT': { 'USD': 1.0, 'KRW': 1300, 'JPY': 150, 'TWD': 32, 'THB': 36 }
  };
  
  return cryptoAmount * (rates[cryptoCurrency]?.[fiatCurrency] || 1);
};

export const convertFiatToCrypto = (
  fiatAmount: number,
  fiatCurrency: string,
  cryptoCurrency: string
): number => {
  const rates: Record<string, Record<string, number>> = {
    'USD': { 'YIELD': 20, 'KAIA': 8.33, 'USDT': 1.0 },
    'KRW': { 'YIELD': 0.015, 'KAIA': 0.0064, 'USDT': 0.00077 },
    'JPY': { 'YIELD': 0.133, 'KAIA': 0.056, 'USDT': 0.0067 },
    'TWD': { 'YIELD': 0.625, 'KAIA': 0.263, 'USDT': 0.031 },
    'THB': { 'YIELD': 0.556, 'KAIA': 0.233, 'USDT': 0.028 }
  };
  
  return fiatAmount * (rates[fiatCurrency]?.[cryptoCurrency] || 1);
};

