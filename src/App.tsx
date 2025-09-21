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
import NFTMarketplace from './pages/NFTMarketplace';
import TradePage from './pages/TradePage';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ReferralPage from './pages/ReferralPage';
import LoanPage from './pages/LoanPage';
import NFTCollateralPage from './pages/NFTCollateralPage';
import TokenManagementPage from './pages/TokenManagementPage';
import Help from './pages/Help';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import SecurityAudit from './pages/SecurityAudit';

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
                <Route path="/nft-marketplace" element={<NFTMarketplace />} />
                <Route path="/trade" element={<TradePage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/referral" element={<ReferralPage />} />
                <Route path="/loan" element={<LoanPage />} />
                <Route path="/nft-collateral" element={<NFTCollateralPage />} />
                <Route path="/token-management" element={<TokenManagementPage />} />
                <Route path="/help" element={<Help />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/security-audit" element={<SecurityAudit />} />
              </Routes>
            </BrowserRouter>
          </SimpleWalletProvider>
        </LineNextProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;