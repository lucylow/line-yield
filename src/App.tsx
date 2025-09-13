import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SimpleWalletProvider } from './providers/SimpleWalletProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import Layout from './components/layout/Layout';

// Import pages
import Landing from './pages/Landing';
import Index from './pages/Index';
import LoanPage from './pages/LoanPage';
import ReferralPage from './pages/ReferralPage';
import NFTPage from './pages/NFTPage';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Help from './pages/Help';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ErrorBoundary>
      <SimpleWalletProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/" element={<Layout />}>
              <Route path="/dashboard" element={<Index />} />
              <Route path="/loans" element={<LoanPage />} />
              <Route path="/referral" element={<ReferralPage />} />
              <Route path="/nft" element={<NFTPage />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/help" element={<Help />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/404" element={<NotFound />} />
            </Route>
            <Route path="*" element={<Navigate to="/404" />} />
          </Routes>
        </Router>
      </SimpleWalletProvider>
    </ErrorBoundary>
  );
}

export default App;