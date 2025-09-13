/**
 * Utility functions for navigation prevention and management
 * Compliant with LINE Mini Dapp Design Guide
 */

export interface NavigationPreventionConfig {
  /** Whether prevention is enabled */
  enabled: boolean;
  /** Protected paths */
  protectedPaths: string[];
  /** Confirmation message */
  message: string;
  /** Whether to prevent page unload */
  preventUnload: boolean;
}

/**
 * Default configuration for navigation prevention
 */
export const DEFAULT_NAVIGATION_CONFIG: NavigationPreventionConfig = {
  enabled: true,
  protectedPaths: ['/'],
  message: 'Are you sure you want to leave? Your progress may be lost.',
  preventUnload: true,
};

/**
 * Check if current path is protected
 */
export function isProtectedPath(path: string, protectedPaths: string[]): boolean {
  return protectedPaths.some(protectedPath => 
    path === protectedPath || 
    path.startsWith(protectedPath + '/')
  );
}

/**
 * Add history state to prevent immediate back navigation
 */
export function addHistoryState(): void {
  history.pushState(null, '', window.location.pathname);
}

/**
 * Remove history state (cleanup)
 */
export function removeHistoryState(): void {
  // This is handled automatically by the browser
  // when the page is refreshed or navigated away from
}

/**
 * Show confirmation dialog
 */
export function showConfirmationDialog(message: string): boolean {
  return window.confirm(message);
}

/**
 * Setup navigation prevention listeners
 */
export function setupNavigationPrevention(config: NavigationPreventionConfig): () => void {
  if (!config.enabled) return () => {};

  const currentPath = window.location.pathname;
  
  // Add initial state if on protected path
  if (isProtectedPath(currentPath, config.protectedPaths)) {
    addHistoryState();
  }

  // Handle browser back button
  const handlePopState = (event: PopStateEvent) => {
    if (!isProtectedPath(window.location.pathname, config.protectedPaths)) {
      return;
    }

    const confirmed = showConfirmationDialog(config.message);
    
    if (!confirmed) {
      // Prevent navigation by pushing state back
      addHistoryState();
    }
  };

  // Handle page refresh/close
  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (!config.preventUnload || !isProtectedPath(window.location.pathname, config.protectedPaths)) {
      return;
    }

    event.preventDefault();
    event.returnValue = config.message;
    return config.message;
  };

  // Add event listeners
  window.addEventListener('popstate', handlePopState);
  
  if (config.preventUnload) {
    window.addEventListener('beforeunload', handleBeforeUnload);
  }

  // Return cleanup function
  return () => {
    window.removeEventListener('popstate', handlePopState);
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
}

/**
 * Pre-configured navigation prevention for common scenarios
 */
export const navigationPreventionPresets = {
  /** Protect only the root path */
  rootOnly: (message?: string): NavigationPreventionConfig => ({
    ...DEFAULT_NAVIGATION_CONFIG,
    protectedPaths: ['/'],
    message: message || DEFAULT_NAVIGATION_CONFIG.message,
  }),

  /** Protect multiple specific paths */
  specificPaths: (paths: string[], message?: string): NavigationPreventionConfig => ({
    ...DEFAULT_NAVIGATION_CONFIG,
    protectedPaths: paths,
    message: message || DEFAULT_NAVIGATION_CONFIG.message,
  }),

  /** Protect all paths (entire app) */
  allPaths: (message?: string): NavigationPreventionConfig => ({
    ...DEFAULT_NAVIGATION_CONFIG,
    protectedPaths: ['/'],
    message: message || DEFAULT_NAVIGATION_CONFIG.message,
  }),

  /** Disable prevention */
  disabled: (): NavigationPreventionConfig => ({
    ...DEFAULT_NAVIGATION_CONFIG,
    enabled: false,
  }),
};

/**
 * Get localized confirmation messages
 */
export function getLocalizedConfirmationMessage(lang: 'en' | 'ja', customMessage?: string): string {
  if (customMessage) return customMessage;

  switch (lang) {
    case 'ja':
      return '本当に戻りますか？進行中の作業が失われる可能性があります。';
    case 'en':
    default:
      return 'Are you sure you want to go back? Your progress may be lost.';
  }
}

/**
 * Validate navigation prevention configuration
 */
export function validateNavigationConfig(config: Partial<NavigationPreventionConfig>): string[] {
  const errors: string[] = [];

  if (config.protectedPaths && config.protectedPaths.length === 0) {
    errors.push('At least one protected path must be specified');
  }

  if (config.message && config.message.length > 200) {
    errors.push('Confirmation message should be 200 characters or less');
  }

  return errors;
}

/**
 * Check if navigation prevention is supported
 */
export function isNavigationPreventionSupported(): boolean {
  return typeof window !== 'undefined' && 
         typeof history !== 'undefined' && 
         typeof window.addEventListener === 'function';
}
