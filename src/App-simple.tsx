import React, { useState } from 'react';
import { SimpleWalletProvider } from './providers/SimpleWalletProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { WalletConnectButton } from './components/WalletConnectButton';
import { NetworkBanner } from './components/NetworkBanner';
import { Button } from './components/simple/Button';
import { Card, CardContent, CardHeader, CardTitle } from './components/simple/Card';
import { cn } from './utils/cn';

function App() {
  const [activeTab, setActiveTab] = useState('loans');

  const renderContent = () => {
    switch (activeTab) {
      case 'loans':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Loan Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Manage your DeFi loans with multiple loan types and flexible terms.
                </p>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2">Personal Loans</h4>
                        <p className="text-sm text-gray-600 mb-3">Quick access to funds</p>
                        <Button className="w-full">View Details</Button>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2">Business Loans</h4>
                        <p className="text-sm text-gray-600 mb-3">For business growth</p>
                        <Button className="w-full">View Details</Button>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2">Collateral Loans</h4>
                        <p className="text-sm text-gray-600 mb-3">Secured lending</p>
                        <Button className="w-full">View Details</Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'referral':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Referral Program</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Invite friends and earn rewards together.
                </p>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Your Referral Link</h4>
                    <p className="text-blue-700 text-sm mb-3">
                      https://line-yield.com/ref/your-code
                    </p>
                    <Button variant="outline" size="sm">Copy Link</Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">12</div>
                      <div className="text-sm text-gray-600">Referrals</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">$240</div>
                      <div className="text-sm text-gray-600">Earned</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'nft':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>NFT Collection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Collect and trade NFT badges based on your Yield Points.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {['Novice', 'Explorer', 'Pioneer', 'Master', 'Legend', 'Titan'].map((tier, index) => (
                    <Card key={tier}>
                      <CardContent className="p-4 text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg mx-auto mb-2"></div>
                        <h4 className="font-semibold text-sm">{tier}</h4>
                        <p className="text-xs text-gray-600">{index * 1000} points</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return <div>Page not found</div>;
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
                <div className="flex items-center">
                  <h1 className="text-xl font-bold text-blue-600">LINE Yield</h1>
                </div>

                {/* Wallet Connection */}
                <div className="flex items-center space-x-4">
                  <NetworkBanner />
                  <WalletConnectButton />
                </div>
              </div>
            </div>
          </header>

          {/* Navigation */}
          <nav className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex space-x-8">
                {[
                  { id: 'loans', label: 'Loans' },
                  { id: 'referral', label: 'Referral' },
                  { id: 'nft', label: 'NFTs' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'py-4 px-1 border-b-2 font-medium text-sm',
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {renderContent()}
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center text-gray-600">
                <p>&copy; 2024 LINE Yield. All rights reserved.</p>
                <div className="mt-4 space-x-6">
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Privacy Policy</a>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Terms of Service</a>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Cookie Policy</a>
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
