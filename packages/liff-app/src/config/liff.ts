// LIFF Configuration for LINE Yield
export const LIFF_CONFIG = {
  // Replace with your actual LIFF ID from LINE Developers Console
  liffId: import.meta.env.VITE_LIFF_ID || 'your-liff-id-here',
  
  // LIFF features to enable
  features: {
    shareTargetPicker: true,
    openWindow: true,
    getProfile: true,
    sendMessages: true,
    scanCode: false,
    getIDToken: true,
  },
  
  // App configuration
  app: {
    name: 'LINE Yield',
    description: 'Earn yield on Kaia-USDT safely and easily',
    version: '1.0.0',
  },
  
  // Share messages templates
  shareTemplates: {
    inviteFriend: {
      type: 'text',
      text: 'Join me on LINE Yield! Earn yield on your Kaia-USDT safely and easily! 🚀'
    },
    shareYield: {
      type: 'text',
      text: '🚀 LINE Yield - Earn up to 12% APY on Kaia-USDT!\n\n✅ Secure & Audited\n✅ Gasless Transactions\n✅ Mobile Optimized\n\nStart earning today!'
    },
    shareEarnings: (amount: string, apy: string) => ({
      type: 'text',
      text: `💰 I just earned ${amount} with LINE Yield!\n\nAPY: ${apy}\n\nJoin me and start earning today! 🚀`
    })
  },
  
  // External links
  externalLinks: {
    docs: 'https://docs.line-yield.com',
    support: 'https://support.line-yield.com',
    telegram: 'https://t.me/lineyield',
    twitter: 'https://twitter.com/lineyield',
  }
};

// LIFF initialization function
export const initializeLIFF = async () => {
  try {
    if (typeof window !== 'undefined' && (window as any).liff) {
      const liff = (window as any).liff;
      
      // Initialize LIFF with configuration
      await liff.init({ 
        liffId: LIFF_CONFIG.liffId 
      });
      
      console.log('LIFF initialized successfully');
      return liff;
    } else {
      console.warn('LIFF SDK not available');
      return null;
    }
  } catch (error) {
    console.error('LIFF initialization failed:', error);
    return null;
  }
};

// Check if LIFF is available
export const isLIFFAvailable = (): boolean => {
  return typeof window !== 'undefined' && !!(window as any).liff;
};

// Check if specific LIFF API is available
export const isLIFFApiAvailable = (apiName: string): boolean => {
  if (!isLIFFAvailable()) return false;
  
  const liff = (window as any).liff;
  return liff.isApiAvailable(apiName);
};
