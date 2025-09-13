import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { LiffProvider } from './providers/LiffProvider';
import { Layout, Button } from '../../shared/src';
import { useUniversalWallet, useLineYield } from '../../shared/src';
import PaymentDemo from './components/PaymentDemo';

const queryClient = new QueryClient();

const YieldDashboard: React.FC = () => {
  const { wallet, connectWallet } = useUniversalWallet();
  const { vaultData, isLoading, deposit, withdraw, isDepositing, isWithdrawing, isLiff } = useLineYield();

  const handleDeposit = async () => {
    if (!wallet.isConnected) {
      await connectWallet();
      return;
    }
    
    try {
      await deposit({ amount: '100' });
      console.log('Deposit successful');
    } catch (error) {
      console.error('Deposit failed:', error);
    }
  };

  const handleWithdraw = async () => {
    if (!wallet.isConnected) {
      await connectWallet();
      return;
    }
    
    try {
      await withdraw({ amount: '50' });
      console.log('Withdraw successful');
    } catch (error) {
      console.error('Withdraw failed:', error);
    }
  };

  if (!wallet.isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to LINE Yield
            </h1>
            <p className="text-gray-600 mb-6">
              {isLiff 
                ? 'Connect your wallet to start earning yield on your stablecoins through our LINE Mini App.'
                : 'Connect your wallet to start earning yield on your stablecoins.'
              }
            </p>
            <Button onClick={handleDeposit} fullWidth>
              Connect Wallet
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vault data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Yield Dashboard</h1>
          <p className="text-gray-600 mt-2">
            {isLiff ? 'Gasless transactions powered by LINE' : 'Manage your DeFi investments'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Balance</h3>
            <p className="text-3xl font-bold text-blue-600">
              {vaultData?.userDeposited || '0'} USDC
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Yield</h3>
            <p className="text-3xl font-bold text-green-600">
              {vaultData?.userYield || '0'} USDC
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Current APY</h3>
            <p className="text-3xl font-bold text-purple-600">
              {vaultData?.currentAPY || 0}%
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Deposit</h3>
            <Button 
              onClick={handleDeposit}
              loading={isDepositing}
              fullWidth
            >
              {isDepositing ? 'Processing...' : 'Deposit 100 USDC'}
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Withdraw</h3>
            <Button 
              onClick={handleWithdraw}
              loading={isWithdrawing}
              variant="outline"
              fullWidth
            >
              {isWithdrawing ? 'Processing...' : 'Withdraw 50 USDC'}
            </Button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Demo</h3>
            <p className="text-gray-600 mb-4">
              Test LINE Mini Dapp payment functionality with both crypto and Stripe payments.
            </p>
            <Link 
              to="/payment-demo"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try Payment Demo
            </Link>
          </div>

          {isLiff && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Gasless Transactions:</strong> Your transactions are being processed without gas fees through LINE's relayer service.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <LiffProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<YieldDashboard />} />
              <Route path="/payment-demo" element={<PaymentDemo />} />
              <Route path="*" element={<YieldDashboard />} />
            </Routes>
          </Layout>
        </Router>
      </LiffProvider>
    </QueryClientProvider>
  );
};

export default App;
