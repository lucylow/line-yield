import React, { createContext, useContext, useEffect, useState } from 'react';
import liff from '@line/liff';

interface LiffContextType {
  isInitialized: boolean;
  user: any;
  error: string | null;
}

const LiffContext = createContext<LiffContextType>({
  isInitialized: false,
  user: null,
  error: null
});

export const LiffProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initLiff = async () => {
      try {
        const liffId = process.env.VITE_LIFF_ID;
        
        if (!liffId) {
          throw new Error('LIFF ID not configured');
        }

        await liff.init({ liffId });
        setIsInitialized(true);

        if (liff.isLoggedIn()) {
          const profile = await liff.getProfile();
          setUser(profile);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize LIFF';
        setError(errorMessage);
        console.error('LIFF init failed', err);
      }
    };

    initLiff();
  }, []);

  return (
    <LiffContext.Provider value={{ isInitialized, user, error }}>
      {children}
    </LiffContext.Provider>
  );
};

export const useLiff = () => useContext(LiffContext);
