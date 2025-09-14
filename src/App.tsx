import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SimpleWalletProvider } from './providers/SimpleWalletProvider';
import { LineNextProvider } from './providers/LineNextProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LanguageProvider } from './i18n';
import Landing from './pages/Landing';
import KaiaPaymentPage from './pages/KaiaPaymentPage';
import KaiaDefiDashboard from './components/KaiaDefiDashboard';
import KaiaTradeAndEarn from './components/KaiaTradeAndEarn';
import PlatformVerificationChecklist from './components/PlatformVerificationChecklist';

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <LineNextProvider>
          <SimpleWalletProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/kaia-payments" element={<KaiaPaymentPage />} />
                <Route path="/kaia-defi" element={<KaiaDefiDashboard />} />
                <Route path="/trade-earn" element={<KaiaTradeAndEarn />} />
                <Route path="/verification" element={<PlatformVerificationChecklist />} />
              </Routes>
            </BrowserRouter>
          </SimpleWalletProvider>
        </LineNextProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;