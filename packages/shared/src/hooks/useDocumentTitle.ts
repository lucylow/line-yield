import { useEffect } from 'react';
import { updateAllMetaTags, DEFAULT_META_CONFIG, type MetaTagConfig } from '../utils/metaTagsUtils';

/**
 * Hook to manage document title with LINE Mini Dapp format
 * Format: "{Mini Dapp Name} | Mini Dapp"
 * Also updates all related meta tags for SEO and social sharing
 */
export function useDocumentTitle(title: string, metaConfig?: Partial<MetaTagConfig>) {
  useEffect(() => {
    const formattedTitle = `${title} | Mini Dapp`;
    document.title = formattedTitle;
    
    // Update all meta tags with the new title and any additional config
    const config: Partial<MetaTagConfig> = {
      title: title, // Use the base title for meta tags (without "| Mini Dapp")
      ...metaConfig,
    };
    
    updateAllMetaTags(config);
    
    // Cleanup function to restore original title if needed
    return () => {
      // Optionally restore default meta tags
      // updateAllMetaTags(DEFAULT_META_CONFIG);
    };
  }, [title, metaConfig]);
}

/**
 * Hook to set Mini Dapp title with automatic formatting
 * @param miniDappName - The name of the Mini Dapp (e.g., "LINE Yield")
 * @param metaConfig - Optional meta tag configuration
 */
export function useMiniDappTitle(miniDappName: string, metaConfig?: Partial<MetaTagConfig>) {
  useDocumentTitle(miniDappName, metaConfig);
}

/**
 * Utility function to format title according to LINE Mini Dapp requirements
 * @param miniDappName - The name of the Mini Dapp
 * @returns Formatted title string
 */
export function formatMiniDappTitle(miniDappName: string): string {
  return `${miniDappName} | Mini Dapp`;
}

/**
 * Utility function to set document title directly with meta tag updates
 * @param miniDappName - The name of the Mini Dapp
 * @param metaConfig - Optional meta tag configuration
 */
export function setMiniDappTitle(miniDappName: string, metaConfig?: Partial<MetaTagConfig>): void {
  document.title = formatMiniDappTitle(miniDappName);
  
  // Update all meta tags
  const config: Partial<MetaTagConfig> = {
    title: miniDappName,
    ...metaConfig,
  };
  
  updateAllMetaTags(config);
}
