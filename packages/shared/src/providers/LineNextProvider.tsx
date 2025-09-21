import React, { createContext, useContext, useEffect, useState } from 'react';

interface LineNextContextType {
  isInitialized: boolean;
  isLoggedIn: boolean;
  profile: any;
  accessToken: string | null;
  error: string | null;
}

const LineNextContext = createContext<LineNextContextType>({
  isInitialized: false,
  isLoggedIn: false,
  profile: null,
  accessToken: null,
  error: null,
});

export const LineNextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock LINE Next initialization for development
    const initLineNext = async () => {
      try {
        // Simulate initialization delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock successful initialization
        setIsInitialized(true);
        setIsLoggedIn(false); // Start as not logged in
        setError(null);
      } catch (err) {
        setError('Failed to initialize LINE Next');
        setIsInitialized(true);
      }
    };

    initLineNext();
  }, []);

  const value: LineNextContextType = {
    isInitialized,
    isLoggedIn,
    profile,
    accessToken,
    error,
  };

  return (
    <LineNextContext.Provider value={value}>
      {children}
    </LineNextContext.Provider>
  );
};

export const useLineNext = () => {
  const context = useContext(LineNextContext);
  if (!context) {
    throw new Error('useLineNext must be used within a LineNextProvider');
  }
  return context;
};
