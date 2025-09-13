/**
 * Utility functions for managing Open Graph and Twitter meta tags
 * Compliant with LINE Mini Dapp Design Guide requirements
 */

export interface MetaTagConfig {
  title: string;
  description: string;
  url: string;
  image: string;
  imageWidth?: number;
  imageHeight?: number;
  imageAlt?: string;
  siteName?: string;
  locale?: string;
  twitterSite?: string;
  twitterCreator?: string;
  keywords?: string;
  author?: string;
}

export interface OpenGraphConfig {
  title: string;
  type: string;
  url: string;
  image: string;
  imageWidth?: number;
  imageHeight?: number;
  imageAlt?: string;
  description: string;
  siteName: string;
  locale: string;
  localeAlternate?: string;
}

export interface TwitterConfig {
  card: string;
  site?: string;
  creator?: string;
  title: string;
  description: string;
  image: string;
  imageAlt?: string;
}

/**
 * Default configuration for LINE Yield Mini Dapp
 */
export const DEFAULT_META_CONFIG: MetaTagConfig = {
  title: 'LINE Yield',
  description: 'Seamless DeFi experience inside LINE Messenger powered by Kaia Blockchain. Earn automated yield on your USDT with 8.64% APY.',
  url: 'https://line-yield-mini-dapp.com',
  image: 'https://line-yield-mini-dapp.com/assets/og-image.svg',
  imageWidth: 1200,
  imageHeight: 630,
  imageAlt: 'LINE Yield Mini Dapp - DeFi on LINE Messenger',
  siteName: 'Mini Dapp',
  locale: 'en_US',
  twitterSite: '@line_yield',
  twitterCreator: '@line_yield',
  keywords: 'Mini Dapp, LINE, Kaia Blockchain, DeFi, Web3, USDT, Yield Farming, Stablecoin',
  author: 'LINE Yield Team',
};

/**
 * Updates Open Graph meta tags
 */
export function updateOpenGraphTags(config: Partial<OpenGraphConfig>): void {
  const fullConfig = { ...DEFAULT_META_CONFIG, ...config };
  
  updateMetaTag('property', 'og:title', fullConfig.title);
  updateMetaTag('property', 'og:type', fullConfig.type || 'website');
  updateMetaTag('property', 'og:url', fullConfig.url);
  updateMetaTag('property', 'og:image', fullConfig.image);
  
  if (fullConfig.imageWidth) {
    updateMetaTag('property', 'og:image:width', fullConfig.imageWidth.toString());
  }
  
  if (fullConfig.imageHeight) {
    updateMetaTag('property', 'og:image:height', fullConfig.imageHeight.toString());
  }
  
  if (fullConfig.imageAlt) {
    updateMetaTag('property', 'og:image:alt', fullConfig.imageAlt);
  }
  
  updateMetaTag('property', 'og:description', fullConfig.description);
  updateMetaTag('property', 'og:site_name', fullConfig.siteName);
  updateMetaTag('property', 'og:locale', fullConfig.locale);
  
  if (fullConfig.localeAlternate) {
    updateMetaTag('property', 'og:locale:alternate', fullConfig.localeAlternate);
  }
}

/**
 * Updates Twitter Card meta tags
 */
export function updateTwitterTags(config: Partial<TwitterConfig>): void {
  const fullConfig = { ...DEFAULT_META_CONFIG, ...config };
  
  updateMetaTag('name', 'twitter:card', fullConfig.card || 'summary_large_image');
  
  if (fullConfig.twitterSite) {
    updateMetaTag('name', 'twitter:site', fullConfig.twitterSite);
  }
  
  if (fullConfig.twitterCreator) {
    updateMetaTag('name', 'twitter:creator', fullConfig.twitterCreator);
  }
  
  updateMetaTag('name', 'twitter:title', fullConfig.title);
  updateMetaTag('name', 'twitter:description', fullConfig.description);
  updateMetaTag('name', 'twitter:image', fullConfig.image);
  
  if (fullConfig.imageAlt) {
    updateMetaTag('name', 'twitter:image:alt', fullConfig.imageAlt);
  }
}

/**
 * Updates standard meta tags
 */
export function updateStandardMetaTags(config: Partial<MetaTagConfig>): void {
  const fullConfig = { ...DEFAULT_META_CONFIG, ...config };
  
  updateMetaTag('name', 'description', fullConfig.description);
  
  if (fullConfig.keywords) {
    updateMetaTag('name', 'keywords', fullConfig.keywords);
  }
  
  if (fullConfig.author) {
    updateMetaTag('name', 'author', fullConfig.author);
  }
}

/**
 * Updates all meta tags (Open Graph, Twitter, and Standard)
 */
export function updateAllMetaTags(config: Partial<MetaTagConfig>): void {
  updateStandardMetaTags(config);
  updateOpenGraphTags(config);
  updateTwitterTags(config);
}

/**
 * Helper function to update or create meta tags
 */
function updateMetaTag(attribute: 'name' | 'property', selector: string, content: string): void {
  let metaTag = document.querySelector(`meta[${attribute}="${selector}"]`) as HTMLMetaElement;
  
  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.setAttribute(attribute, selector);
    document.head.appendChild(metaTag);
  }
  
  metaTag.setAttribute('content', content);
}

/**
 * Sets meta tags for specific pages/sections
 */
export function setPageMetaTags(pageName: string, customConfig?: Partial<MetaTagConfig>): void {
  const pageConfig: Partial<MetaTagConfig> = {
    title: `LINE Yield - ${pageName}`,
    description: `${DEFAULT_META_CONFIG.description} ${pageName} page.`,
    ...customConfig,
  };
  
  updateAllMetaTags(pageConfig);
}

/**
 * Sets meta tags for different languages
 */
export function setLocalizedMetaTags(lang: 'en' | 'ja', customConfig?: Partial<MetaTagConfig>): void {
  const localizedConfig: Partial<MetaTagConfig> = {
    locale: lang === 'ja' ? 'ja_JP' : 'en_US',
    ...(lang === 'ja' && {
      title: 'LINE イールド',
      description: 'LINE Messenger内でのシームレスなDeFi体験。Kaia Blockchainを活用したUSDTの自動利回り獲得。8.64% APY。',
      imageAlt: 'LINE イールド ミニアプリ - LINE MessengerでのDeFi',
    }),
    ...customConfig,
  };
  
  updateAllMetaTags(localizedConfig);
}

/**
 * Pre-configured meta tag setters for common pages
 */
export const metaTagSetters = {
  dashboard: () => setPageMetaTags('Dashboard'),
  transactions: () => setPageMetaTags('Transactions'),
  settings: () => setPageMetaTags('Settings'),
  wallet: () => setPageMetaTags('Wallet Connect'),
  default: () => updateAllMetaTags(DEFAULT_META_CONFIG),
} as const;

/**
 * Validates meta tag configuration
 */
export function validateMetaConfig(config: Partial<MetaTagConfig>): string[] {
  const errors: string[] = [];
  
  if (config.title && config.title.length > 60) {
    errors.push('Title should be 60 characters or less for optimal display');
  }
  
  if (config.description && config.description.length > 160) {
    errors.push('Description should be 160 characters or less for optimal display');
  }
  
  if (config.image && !config.image.startsWith('http')) {
    errors.push('Image URL should be absolute (start with http/https)');
  }
  
  if (config.url && !config.url.startsWith('http')) {
    errors.push('URL should be absolute (start with http/https)');
  }
  
  return errors;
}
