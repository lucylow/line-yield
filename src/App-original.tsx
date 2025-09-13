import React from 'react';
import { SimpleWalletProvider } from './providers/SimpleWalletProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { WalletConnectButton } from './components/WalletConnectButton';
import { NetworkBanner } from './components/NetworkBanner';
import { LoanPage } from './pages/LoanPage';
import { ReferralPage } from './pages/ReferralPage';
import { NFTPage } from './pages/NFTPage';
import { SmartContractInteraction } from './components/SmartContractInteraction';
import { cn } from './utils/cn';

// Example USDT contract address on Kaia (replace with actual address)
const USDT_CONTRACT_ADDRESS = '0x...'; // Replace with actual USDT contract address

function App() {
  const [activePage, setActivePage] = React.useState<'loans' | 'referral' | 'nft' | 'contract'>('loans');

  const pages = [
    { id: 'loans', label: 'Loans', icon: '🏦' },
    { id: 'referral', label: 'Referral', icon: '🎯' },
    { id: 'nft', label: 'NFT Rewards', icon: '🎨' },
    { id: 'contract', label: 'Smart Contracts', icon: '⚡' },
  ];

  const renderPage = () => {
    switch (activePage) {
      case 'loans':
        return <LoanPage />;
      case 'referral':
        return <ReferralPage />;
      case 'nft':
        return <NFTPage />;
      case 'contract':
        return (
          <div className="p-6">
            <SmartContractInteraction 
              contractAddress={USDT_CONTRACT_ADDRESS}
              className="max-w-4xl mx-auto"
            />
          </div>
        );
      default:
        return <LoanPage />;
    }
  };

  return (
    <ErrorBoundary>
      <SimpleWalletProvider>
        <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">LY</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">LINE Yield</h1>
              </div>

              {/* Navigation */}
              <nav className="hidden md:flex space-x-8">
                {pages.map((page) => (
                  <button
                    key={page.id}
                    onClick={() => setActivePage(page.id as any)}
                    className={cn(
                      'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      activePage === page.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    )}
                  >
                    <span>{page.icon}</span>
                    <span>{page.label}</span>
                  </button>
                ))}
              </nav>

              {/* Wallet Connect */}
              <WalletConnectButton />
            </div>
          </div>
        </header>

        {/* Network Banner */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <NetworkBanner />
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden bg-white border-b border-gray-200">
          <div className="px-4 py-2">
            <div className="flex space-x-2 overflow-x-auto">
              {pages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => setActivePage(page.id as any)}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                    activePage === page.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  )}
                >
                  <span>{page.icon}</span>
                  <span>{page.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderPage()}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Product</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><a href="#" className="hover:text-gray-900">Yield Farming</a></li>
                  <li><a href="#" className="hover:text-gray-900">Lending</a></li>
                  <li><a href="#" className="hover:text-gray-900">NFT Rewards</a></li>
                  <li><a href="#" className="hover:text-gray-900">Referral Program</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Resources</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><a href="#" className="hover:text-gray-900">Documentation</a></li>
                  <li><a href="#" className="hover:text-gray-900">API Reference</a></li>
                  <li><a href="#" className="hover:text-gray-900">Smart Contracts</a></li>
                  <li><a href="#" className="hover:text-gray-900">Security Audit</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Community</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><a href="#" className="hover:text-gray-900">Discord</a></li>
                  <li><a href="#" className="hover:text-gray-900">Telegram</a></li>
                  <li><a href="#" className="hover:text-gray-900">Twitter</a></li>
                  <li><a href="#" className="hover:text-gray-900">GitHub</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Support</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><a href="#" className="hover:text-gray-900">Help Center</a></li>
                  <li><a href="#" className="hover:text-gray-900">Contact Us</a></li>
                  <li><a href="#" className="hover:text-gray-900">Bug Reports</a></li>
                  <li><a href="#" className="hover:text-gray-900">Feature Requests</a></li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <p className="text-sm text-gray-600">
                  © 2024 LINE Yield. All rights reserved.
                </p>
                <div className="flex space-x-6 mt-4 md:mt-0">
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Privacy Policy</a>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Terms of Service</a>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Cookie Policy</a>
                </div>
              </div>
            </div>
          </div>
        </footer>
        </div>
      </SimpleWalletProvider>
    </ErrorBoundary>
  );
}

export default App;