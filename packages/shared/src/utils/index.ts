// Utility functions can be added here
export const formatCurrency = (amount: number, currency: string): string => {
  return `${amount} ${currency}`;
};

export const truncateAddress = (address: string, start = 6, end = 4): string => {
  if (!address) return "";
  return `${address.substring(0, start)}...${address.substring(address.length - end)}`;
};

export { 
  formatMiniDappTitle, 
  setMiniDappTitle, 
  setDynamicMiniDappTitle, 
  MINI_DAPP_NAMES, 
  titleSetters 
} from './titleUtils';

export {
  updateOpenGraphTags,
  updateTwitterTags,
  updateStandardMetaTags,
  updateAllMetaTags,
  setPageMetaTags,
  setLocalizedMetaTags,
  metaTagSetters,
  validateMetaConfig,
  DEFAULT_META_CONFIG,
  type MetaTagConfig,
  type OpenGraphConfig,
  type TwitterConfig,
} from './metaTagsUtils';

export {
  isProtectedPath,
  addHistoryState,
  removeHistoryState,
  showConfirmationDialog,
  setupNavigationPrevention,
  navigationPreventionPresets,
  getLocalizedConfirmationMessage,
  validateNavigationConfig,
  isNavigationPreventionSupported,
  DEFAULT_NAVIGATION_CONFIG,
  type NavigationPreventionConfig,
} from './navigationUtils';


