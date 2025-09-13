import { useEffect, useCallback, useState } from 'react';
import { useLocalization } from './useLocalization';

export interface PreventGoBackConfig {
  /** Whether to show confirmation dialog */
  enabled?: boolean;
  /** Custom confirmation message */
  message?: string;
  /** Paths to protect (default: ['/']) */
  protectedPaths?: string[];
  /** Whether to prevent browser refresh/close */
  preventUnload?: boolean;
  /** Custom confirmation title */
  title?: string;
}

/**
 * Hook to prevent accidental navigation back from Mini Dapp
 * Shows confirmation dialog when user tries to navigate away
 * Compliant with LINE Mini Dapp Design Guide
 */
export function usePreventGoBack(config: PreventGoBackConfig = {}) {
  const {
    enabled = true,
    message,
    protectedPaths = ['/'],
    preventUnload = true,
    title,
  } = config;

  const { strings, lang } = useLocalization();
  const [isNavigating, setIsNavigating] = useState(false);

  // Get localized confirmation message
  const getConfirmationMessage = useCallback(() => {
    if (message) return message;
    
    return lang === 'ja' 
      ? '本当に戻りますか？進行中の作業が失われる可能性があります。'
      : 'Are you sure you want to go back? Your progress may be lost.';
  }, [message, lang, strings]);

  // Get localized confirmation title
  const getConfirmationTitle = useCallback(() => {
    if (title) return title;
    
    return lang === 'ja' 
      ? '確認'
      : 'Confirm Navigation';
  }, [title, lang]);

  // Check if current path is protected
  const isProtectedPath = useCallback(() => {
    return protectedPaths.some(path => 
      window.location.pathname === path || 
      window.location.pathname.startsWith(path + '/')
    );
  }, [protectedPaths]);

  // Handle browser back button
  const handlePopState = useCallback((event: PopStateEvent) => {
    if (!enabled || !isProtectedPath()) return;

    setIsNavigating(true);
    
    const confirmed = window.confirm(getConfirmationMessage());
    
    if (!confirmed) {
      // Prevent navigation by pushing state back
      history.pushState(null, '', window.location.pathname);
    }
    
    setIsNavigating(false);
  }, [enabled, isProtectedPath, getConfirmationMessage]);

  // Handle page refresh/close
  const handleBeforeUnload = useCallback((event: BeforeUnloadEvent) => {
    if (!enabled || !preventUnload || !isProtectedPath()) return;

    const confirmationMessage = getConfirmationMessage();
    event.preventDefault();
    event.returnValue = confirmationMessage;
    return confirmationMessage;
  }, [enabled, preventUnload, isProtectedPath, getConfirmationMessage]);

  // Setup event listeners
  useEffect(() => {
    if (!enabled) return;

    // Add initial state to prevent immediate back navigation
    if (isProtectedPath()) {
      history.pushState(null, '', window.location.pathname);
    }

    // Add event listeners
    window.addEventListener('popstate', handlePopState);
    
    if (preventUnload) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, handlePopState, handleBeforeUnload, isProtectedPath]);

  // Manual navigation prevention
  const preventNavigation = useCallback(() => {
    if (!enabled || !isProtectedPath()) return true;

    const confirmed = window.confirm(getConfirmationMessage());
    return confirmed;
  }, [enabled, isProtectedPath, getConfirmationMessage]);

  return {
    isNavigating,
    preventNavigation,
    isProtectedPath: isProtectedPath(),
  };
}

/**
 * Simplified hook for basic back prevention
 * Uses default configuration
 */
export function usePreventGoBackSimple() {
  return usePreventGoBack();
}

/**
 * Hook for preventing navigation on specific routes
 * @param route - The route to protect
 */
export function usePreventGoBackOnRoute(route: string) {
  return usePreventGoBack({
    protectedPaths: [route],
  });
}

/**
 * Hook for preventing navigation with custom message
 * @param message - Custom confirmation message
 */
export function usePreventGoBackWithMessage(message: string) {
  return usePreventGoBack({
    message,
  });
}
