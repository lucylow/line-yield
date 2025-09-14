import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SimpleWalletProvider } from './providers/SimpleWalletProvider';
import { LineNextProvider } from './providers/LineNextProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import Landing from './pages/Landing';
import KaiaPaymentPage from './pages/KaiaPaymentPage';

function App() {
  return (
    <ErrorBoundary>
      <LineNextProvider>
        <SimpleWalletProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/kaia-payments" element={<KaiaPaymentPage />} />
            </Routes>
          </BrowserRouter>
        </SimpleWalletProvider>
      </LineNextProvider>
    </ErrorBoundary>
  );
}

export default App;