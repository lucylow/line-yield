/**
 * Utility functions for managing document titles according to LINE Mini Dapp requirements
 * Format: "{Mini Dapp Name} | Mini Dapp"
 */

/**
 * Formats a title according to LINE Mini Dapp design guide requirements
 * @param miniDappName - The name of the Mini Dapp (e.g., "LINE Yield")
 * @returns Formatted title string
 */
export function formatMiniDappTitle(miniDappName: string): string {
  return `${miniDappName} | Mini Dapp`;
}

/**
 * Sets the document title with proper Mini Dapp formatting
 * @param miniDappName - The name of the Mini Dapp
 */
export function setMiniDappTitle(miniDappName: string): void {
  const formattedTitle = formatMiniDappTitle(miniDappName);
  document.title = formattedTitle;
  
  // Update meta tags for better SEO and social sharing
  updateMetaTags(formattedTitle);
}

/**
 * Updates meta tags with the formatted title
 * @param title - The formatted title
 */
function updateMetaTags(title: string): void {
  // Update Open Graph title
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    ogTitle.setAttribute('content', title);
  }
  
  // Update Twitter card title
  const twitterTitle = document.querySelector('meta[name="twitter:title"]');
  if (twitterTitle) {
    twitterTitle.setAttribute('content', title);
  }
  
  // Update Twitter site meta if it exists
  const twitterSite = document.querySelector('meta[name="twitter:site"]');
  if (twitterSite) {
    twitterSite.setAttribute('content', '@line_yield');
  }
}

/**
 * Sets a dynamic title based on the current page/state
 * @param miniDappName - Base Mini Dapp name
 * @param pageName - Optional page name to append
 */
export function setDynamicMiniDappTitle(miniDappName: string, pageName?: string): void {
  const title = pageName 
    ? `${miniDappName} - ${pageName} | Mini Dapp`
    : formatMiniDappTitle(miniDappName);
  
  document.title = title;
  updateMetaTags(title);
}

/**
 * Common Mini Dapp names used throughout the application
 */
export const MINI_DAPP_NAMES = {
  LINE_YIELD: 'LINE Yield',
  LINE_YIELD_DASHBOARD: 'LINE Yield Dashboard',
  LINE_YIELD_TRANSACTIONS: 'LINE Yield Transactions',
  LINE_YIELD_SETTINGS: 'LINE Yield Settings',
} as const;

/**
 * Pre-configured title setters for common pages
 */
export const titleSetters = {
  dashboard: () => setMiniDappTitle(MINI_DAPP_NAMES.LINE_YIELD_DASHBOARD),
  transactions: () => setMiniDappTitle(MINI_DAPP_NAMES.LINE_YIELD_TRANSACTIONS),
  settings: () => setMiniDappTitle(MINI_DAPP_NAMES.LINE_YIELD_SETTINGS),
  default: () => setMiniDappTitle(MINI_DAPP_NAMES.LINE_YIELD),
} as const;
