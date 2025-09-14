import { ROUTES, ROUTE_METADATA } from './routes';

// Navigation utilities
export const navigation = {
  // Get page title for document title
  getPageTitle: (path: string): string => {
    const metadata = ROUTE_METADATA[path as keyof typeof ROUTE_METADATA];
    return metadata?.title || 'LINE Yield';
  },

  // Get page description for meta tags
  getPageDescription: (path: string): string => {
    const metadata = ROUTE_METADATA[path as keyof typeof ROUTE_METADATA];
    return metadata?.description || 'LINE Yield - DeFi Lending Platform';
  },

  // Check if route requires authentication
  requiresAuth: (path: string): boolean => {
    const metadata = ROUTE_METADATA[path as keyof typeof ROUTE_METADATA];
    return metadata?.requiresAuth || false;
  },

  // Generate canonical URL
  getCanonicalUrl: (path: string): string => {
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://line-yield.com' 
      : 'http://localhost:5173';
    return `${baseUrl}${path}`;
  },

  // Generate Open Graph URL
  getOgUrl: (path: string): string => {
    return navigation.getCanonicalUrl(path);
  },

  // Generate Twitter Card URL
  getTwitterUrl: (path: string): string => {
    return navigation.getCanonicalUrl(path);
  },
};

// Scroll utilities
export const scroll = {
  // Smooth scroll to top
  toTop: (behavior: ScrollBehavior = 'smooth') => {
    window.scrollTo({ top: 0, behavior });
  },

  // Smooth scroll to element
  toElement: (elementId: string, behavior: ScrollBehavior = 'smooth') => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior });
    }
  },

  // Scroll to specific position
  toPosition: (x: number, y: number, behavior: ScrollBehavior = 'smooth') => {
    window.scrollTo({ left: x, top: y, behavior });
  },

  // Check if element is in viewport
  isInViewport: (element: Element): boolean => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },
};

// History utilities
export const history = {
  // Navigate back
  goBack: () => {
    window.history.back();
  },

  // Navigate forward
  goForward: () => {
    window.history.forward();
  },

  // Get current path
  getCurrentPath: (): string => {
    return window.location.pathname;
  },

  // Get current search params
  getSearchParams: (): URLSearchParams => {
    return new URLSearchParams(window.location.search);
  },

  // Get specific search param
  getSearchParam: (key: string): string | null => {
    const params = history.getSearchParams();
    return params.get(key);
  },

  // Update URL without navigation
  updateUrl: (path: string, search?: string) => {
    const url = search ? `${path}?${search}` : path;
    window.history.replaceState({}, '', url);
  },

  // Push state without navigation
  pushState: (path: string, search?: string) => {
    const url = search ? `${path}?${search}` : path;
    window.history.pushState({}, '', url);
  },
};

// Link utilities
export const links = {
  // Generate external link with security attributes
  external: (url: string, text: string): { href: string; target: string; rel: string } => {
    return {
      href: url,
      target: '_blank',
      rel: 'noopener noreferrer',
    };
  },

  // Generate mailto link
  mailto: (email: string, subject?: string, body?: string): string => {
    const params = new URLSearchParams();
    if (subject) params.append('subject', subject);
    if (body) params.append('body', body);
    const query = params.toString();
    return `mailto:${email}${query ? `?${query}` : ''}`;
  },

  // Generate tel link
  tel: (phoneNumber: string): string => {
    return `tel:${phoneNumber}`;
  },

  // Generate WhatsApp link
  whatsapp: (phoneNumber: string, message?: string): string => {
    const params = new URLSearchParams();
    if (message) params.append('text', message);
    const query = params.toString();
    return `https://wa.me/${phoneNumber}${query ? `?${query}` : ''}`;
  },

  // Generate Telegram link
  telegram: (username: string, message?: string): string => {
    const params = new URLSearchParams();
    if (message) params.append('text', message);
    const query = params.toString();
    return `https://t.me/${username}${query ? `?${query}` : ''}`;
  },
};

// Tab utilities
export const tabs = {
  // Open link in new tab
  openInNewTab: (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  },

  // Open link in same tab
  openInSameTab: (url: string) => {
    window.location.href = url;
  },

  // Check if tab is focused
  isTabFocused: (): boolean => {
    return document.hasFocus();
  },

  // Set tab title
  setTitle: (title: string) => {
    document.title = title;
  },

  // Set tab favicon
  setFavicon: (iconUrl: string) => {
    const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (link) {
      link.href = iconUrl;
    } else {
      const newLink = document.createElement('link');
      newLink.rel = 'icon';
      newLink.href = iconUrl;
      document.head.appendChild(newLink);
    }
  },
};

// Keyboard navigation utilities
export const keyboard = {
  // Check if key is navigation key
  isNavigationKey: (key: string): boolean => {
    const navigationKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', 'Space'];
    return navigationKeys.includes(key);
  },

  // Check if key is escape key
  isEscapeKey: (key: string): boolean => {
    return key === 'Escape';
  },

  // Check if key is enter key
  isEnterKey: (key: string): boolean => {
    return key === 'Enter';
  },

  // Check if key is space key
  isSpaceKey: (key: string): boolean => {
    return key === ' ';
  },

  // Check if modifier keys are pressed
  hasModifierKey: (event: KeyboardEvent): boolean => {
    return event.ctrlKey || event.metaKey || event.altKey || event.shiftKey;
  },
};

// Focus management utilities
export const focus = {
  // Trap focus within element
  trap: (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  },

  // Focus first focusable element
  focusFirst: (element: HTMLElement) => {
    const focusableElement = element.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement;
    focusableElement?.focus();
  },

  // Focus last focusable element
  focusLast: (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    lastElement?.focus();
  },

  // Remove focus from all elements
  blurAll: () => {
    (document.activeElement as HTMLElement)?.blur();
  },
};

export default {
  navigation,
  scroll,
  history,
  links,
  tabs,
  keyboard,
  focus,
};

