// Route constants and utilities
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  LOANS: '/loans',
  REFERRAL: '/referral',
  NFT: '/nft',
  SETTINGS: '/settings',
  PROFILE: '/profile',
  HELP: '/help',
  TERMS: '/terms',
  PRIVACY: '/privacy',
  NOT_FOUND: '/404',
} as const;

export type RouteKey = keyof typeof ROUTES;

// Route metadata for navigation
export const ROUTE_METADATA = {
  [ROUTES.HOME]: {
    title: 'LINE Yield - DeFi Lending Platform',
    description: 'Earn automated yield on your USDT while you chat. DeFi lending, NFT rewards, and referral programs.',
    requiresAuth: false,
  },
  [ROUTES.DASHBOARD]: {
    title: 'Dashboard - LINE Yield',
    description: 'View your yield farming portfolio, track earnings, and manage your DeFi investments.',
    requiresAuth: true,
  },
  [ROUTES.LOANS]: {
    title: 'Loans - LINE Yield',
    description: 'Access flexible lending solutions with competitive rates and secure collateral management.',
    requiresAuth: true,
  },
  [ROUTES.REFERRAL]: {
    title: 'Referral Program - LINE Yield',
    description: 'Invite friends and earn rewards together with LINE Yield. Share your referral link and earn ongoing rewards.',
    requiresAuth: true,
  },
  [ROUTES.NFT]: {
    title: 'NFT Rewards - LINE Yield',
    description: 'Earn and collect unique NFT badges based on your Yield Points. Gamified rewards system.',
    requiresAuth: true,
  },
  [ROUTES.SETTINGS]: {
    title: 'Settings - LINE Yield',
    description: 'Manage your account preferences, security settings, and notification preferences.',
    requiresAuth: true,
  },
  [ROUTES.PROFILE]: {
    title: 'Profile - LINE Yield',
    description: 'View your yield farming journey, achievements, and performance statistics.',
    requiresAuth: true,
  },
  [ROUTES.HELP]: {
    title: 'Help & Support - LINE Yield',
    description: 'Find answers to common questions and get support for LINE Yield services.',
    requiresAuth: false,
  },
  [ROUTES.TERMS]: {
    title: 'Terms of Service - LINE Yield',
    description: 'Terms of Service for LINE Yield platform. Please read these terms carefully.',
    requiresAuth: false,
  },
  [ROUTES.PRIVACY]: {
    title: 'Privacy Policy - LINE Yield',
    description: 'Privacy Policy for LINE Yield. How we collect, use, and protect your personal information.',
    requiresAuth: false,
  },
  [ROUTES.NOT_FOUND]: {
    title: 'Page Not Found - LINE Yield',
    description: 'The page you are looking for could not be found.',
    requiresAuth: false,
  },
} as const;

// Navigation groups for header
export const NAVIGATION_GROUPS = {
  MAIN: [
    { key: 'DASHBOARD', label: 'Dashboard', icon: 'Home' },
    { key: 'LOANS', label: 'Loans', icon: 'TrendingUp' },
    { key: 'REFERRAL', label: 'Referral', icon: 'Users' },
    { key: 'NFT', label: 'NFT Rewards', icon: 'Award' },
  ],
  USER: [
    { key: 'PROFILE', label: 'Profile', icon: 'User' },
    { key: 'SETTINGS', label: 'Settings', icon: 'Settings' },
    { key: 'HELP', label: 'Help & Support', icon: 'HelpCircle' },
  ],
  LEGAL: [
    { key: 'TERMS', label: 'Terms of Service', icon: 'FileText' },
    { key: 'PRIVACY', label: 'Privacy Policy', icon: 'Shield' },
  ],
} as const;

// Route validation utilities
export const isValidRoute = (path: string): boolean => {
  return Object.values(ROUTES).includes(path as any);
};

export const getRouteMetadata = (path: string) => {
  return ROUTE_METADATA[path as keyof typeof ROUTE_METADATA] || ROUTE_METADATA[ROUTES.NOT_FOUND];
};

export const requiresAuth = (path: string): boolean => {
  const metadata = getRouteMetadata(path);
  return metadata.requiresAuth;
};

// Route generation utilities
export const generateReferralLink = (referralCode: string): string => {
  return `${window.location.origin}${ROUTES.HOME}?ref=${referralCode}`;
};

export const generateProfileLink = (username: string): string => {
  return `${window.location.origin}${ROUTES.PROFILE}/${username}`;
};

// Breadcrumb utilities
export const getBreadcrumbs = (path: string) => {
  const segments = path.split('/').filter(Boolean);
  const breadcrumbs = [{ label: 'Home', path: ROUTES.HOME }];
  
  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const metadata = getRouteMetadata(currentPath);
    breadcrumbs.push({
      label: metadata.title.split(' - ')[0],
      path: currentPath,
    });
  });
  
  return breadcrumbs;
};

// Route guards
export const canAccessRoute = (path: string, isAuthenticated: boolean): boolean => {
  if (!requiresAuth(path)) {
    return true;
  }
  return isAuthenticated;
};

export default ROUTES;

