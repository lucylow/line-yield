import React, { useEffect, useState } from 'react';
import { LineNextProvider } from '@line-yield/shared/providers/LineNextProvider';
import { SimpleWalletProvider } from '@line-yield/shared/providers/SimpleWalletProvider';
import { ErrorBoundary } from '@line-yield/shared/components/ErrorBoundary';
import { LanguageProvider } from '@line-yield/shared/i18n';
import Landing from '@line-yield/shared/pages/Landing';
import { initializeLIFF, isLIFFAvailable } from './config/liff';
import KaiaDefiDashboard from '@line-yield/shared/components/KaiaDefiDashboard';
import KaiaTradeAndEarn from '@line-yield/shared/components/KaiaTradeAndEarn';

const LIFFApp: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [liffError, setLiffError] = useState<string | null>(null);

  useEffect(() => {
    const initLIFF = async () => {
      try {
        if (isLIFFAvailable()) {
          await initializeLIFF();
          setIsInitialized(true);
        } else {
          setLiffError('LIFF SDK not available');
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('LIFF initialization error:', error);
        setLiffError('Failed to initialize LIFF');
        setIsInitialized(true);
      }
    };

    initLIFF();
  }, []);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">LINE Yield</h2>
          <p className="text-gray-600">Initializing LINE integration...</p>
        </div>
      </div>
    );
  }

  if (liffError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">LINE Integration Error</h2>
          <p className="text-gray-600 mb-4">{liffError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <LanguageProvider>
        <LineNextProvider>
          <SimpleWalletProvider>
            <Landing />
          </SimpleWalletProvider>
        </LineNextProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
};

export default LIFFApp;