import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, ConnectWallet, BalanceDisplay, TransactionHistory } from '@shared/components';
import { useLineYield, usePlatform } from '@shared/hooks';

const Dashboard: React.FC = () => {
  const { vaultData, deposit, withdraw, isLoading, isDepositing, isWithdrawing, error } = useLineYield();
  const { isLiff } = usePlatform();
  const [depositAmount, setDepositAmount] = useState('10');
  const [withdrawAmount, setWithdrawAmount] = useState('5');

  const handleDeposit = async () => {
    try {
      await deposit({ amount: depositAmount });
      setDepositAmount('10'); // Reset to default
    } catch (error) {
      console.error('Deposit failed:', error);
    }
  };

  const handleWithdraw = async () => {
    try {
      await withdraw({ amount: withdrawAmount });
      setWithdrawAmount('5'); // Reset to default
    } catch (error) {
      console.error('Withdraw failed:', error);
    }
  };

  // Mock transaction data for demonstration
  const mockTransactions = [
    {
      id: '1',
      type: 'deposit' as const,
      amount: '100.0',
      timestamp: Date.now() - 86400000, // 1 day ago
      status: 'completed' as const,
      hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
    },
    {
      id: '2',
      type: 'yield' as const,
      amount: '2.5',
      timestamp: Date.now() - 43200000, // 12 hours ago
      status: 'completed' as const,
      hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
    },
    {
      id: '3',
      type: 'withdraw' as const,
      amount: '50.0',
      timestamp: Date.now() - 21600000, // 6 hours ago
      status: 'pending' as const,
      hash: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            LINE Yield Dashboard
          </h1>
          <p className="text-gray-600">
            {isLiff 
              ? 'Manage your stablecoin yield farming through LINE'
              : 'Manage your stablecoin yield farming on the web'
            }
          </p>
        </div>

        {/* Wallet Connection */}
        <div className="mb-8">
          <ConnectWallet />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error loading vault data
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {error.message || 'An unexpected error occurred'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-blue-800">Loading vault data...</span>
            </div>
          </div>
        )}

        {/* Balance Display */}
        {vaultData && (
          <>
            <div className="mb-8">
              <BalanceDisplay 
                balance={vaultData.userDeposited} 
                earned={vaultData.userYield}
              />
            </div>

            {/* Action Buttons */}
            <div className="mb-8">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Deposit Section */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Deposit USDT</h4>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Amount"
                        min="0"
                        step="0.01"
                      />
                      <Button 
                        loading={isDepositing} 
                        onClick={handleDeposit}
                        disabled={!depositAmount || parseFloat(depositAmount) <= 0}
                      >
                        Deposit
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      Current APY: {vaultData.currentAPY.toFixed(2)}%
                    </p>
                  </div>

                  {/* Withdraw Section */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Withdraw USDT</h4>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Amount"
                        min="0"
                        step="0.01"
                        max={vaultData.userDeposited}
                      />
                      <Button 
                        variant="secondary" 
                        loading={isWithdrawing} 
                        onClick={handleWithdraw}
                        disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > parseFloat(vaultData.userDeposited)}
                      >
                        Withdraw
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      Available: {parseFloat(vaultData.userDeposited).toFixed(4)} USDT
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction History */}
            <div className="mb-8">
              <TransactionHistory transactions={mockTransactions} />
            </div>
          </>
        )}

        {/* Payment Demo Section */}
        <div className="mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
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
        </div>

        {/* Platform-specific features */}
        {isLiff && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  LINE Mini App Features
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>• Gasless transactions through LINE relayer</p>
                  <p>• Seamless wallet integration</p>
                  <p>• Push notifications for yield updates</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
