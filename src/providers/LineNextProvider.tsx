import React, { createContext, useContext, useEffect, useState } from 'react';

interface LineNextContextType {
  isInitialized: boolean;
  isLoggedIn: boolean;
  userId: string | null;
  displayName: string | null;
  profilePictureUrl: string | null;
  login: () => void;
  logout: () => void;
  shareTargetPicker: (messages: any[], options?: any) => Promise<void>;
  openWindow: (url: string) => void;
}

const LineNextContext = createContext<LineNextContextType | undefined>(undefined);

interface LineNextProviderProps {
  children: React.ReactNode;
}

export const LineNextProvider: React.FC<LineNextProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);

  useEffect(() => {
    const initializeLineNext = async () => {
      try {
        // Check if we're in LINE environment
        if (typeof window !== 'undefined' && (window as any).liff) {
          const liff = (window as any).liff;
          
          // Initialize LIFF
          await liff.init({ 
            liffId: import.meta.env.VITE_LIFF_ID || 'your-liff-id-here' 
          });
          
          setIsInitialized(true);
          
          if (liff.isLoggedIn()) {
            setIsLoggedIn(true);
            
            // Get user profile
            const profile = await liff.getProfile();
            setUserId(profile.userId);
            setDisplayName(profile.displayName);
            setProfilePictureUrl(profile.pictureUrl);
          }
        } else {
          // Fallback for web environment
          setIsInitialized(true);
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('LINE NEXT initialization failed:', error);
        setIsInitialized(true);
        setIsLoggedIn(false);
      }
    };

    initializeLineNext();
  }, []);

  const login = () => {
    if (typeof window !== 'undefined' && (window as any).liff) {
      const liff = (window as any).liff;
      liff.login();
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined' && (window as any).liff) {
      const liff = (window as any).liff;
      liff.logout();
      setIsLoggedIn(false);
      setUserId(null);
      setDisplayName(null);
      setProfilePictureUrl(null);
    }
  };

  const shareTargetPicker = async (messages: any[], options: any = {}) => {
    if (typeof window !== 'undefined' && (window as any).liff) {
      const liff = (window as any).liff;
      
      if (!liff.isApiAvailable('shareTargetPicker')) {
        throw new Error('ShareTargetPicker API is not available');
      }
      
      await liff.shareTargetPicker(messages, options);
    } else {
      throw new Error('LIFF is not available');
    }
  };

  const openWindow = (url: string) => {
    if (typeof window !== 'undefined' && (window as any).liff) {
      const liff = (window as any).liff;
      liff.openWindow({ url, external: true });
    } else {
      window.open(url, '_blank');
    }
  };

  const value: LineNextContextType = {
    isInitialized,
    isLoggedIn,
    userId,
    displayName,
    profilePictureUrl,
    login,
    logout,
    shareTargetPicker,
    openWindow,
  };

  return (
    <LineNextContext.Provider value={value}>
      {children}
    </LineNextContext.Provider>
  );
};

export const useLineNext = (): LineNextContextType => {
  const context = useContext(LineNextContext);
  if (context === undefined) {
    throw new Error('useLineNext must be used within a LineNextProvider');
  }
  return context;
};

