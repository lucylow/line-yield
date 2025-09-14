import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { LoanTypes } from '@shared/components/LoanTypes';
import { LoanCreator } from '@shared/components/LoanCreator';
import { LoanManager } from '@shared/components/LoanManager';
import { cn } from '../utils/cn';

interface LoanType {
  id: number;
  name: string;
  description: string;
  maxAmount: string;
  minAmount: string;
  interestRateBps: number;
  collateralRatioBps: number;
  durationSeconds: number;
  liquidationThresholdBps: number;
  penaltyRateBps: number;
  active: boolean;
  requiresKYC: boolean;
  maxBorrowers: number;
  currentBorrowers: number;
}

export const LoanPage: React.FC = () => {
  const { address: userAddress, isConnected } = useWallet();
  const [activeTab, setActiveTab] = useState<'types' | 'create' | 'manage'>('types');
  const [selectedLoanType, setSelectedLoanType] = useState<LoanType | null>(null);
  const [refreshLoans, setRefreshLoans] = useState(0);

  const handleSelectLoanType = (loanType: LoanType) => {
    setSelectedLoanType(loanType);
    setActiveTab('create');
  };

  const handleLoanCreated = (loanId: number) => {
    setRefreshLoans(prev => prev + 1);
    setActiveTab('manage');
    setSelectedLoanType(null);
  };

  const tabs = [
    { id: 'types', label: 'Loan Types', icon: '💰' },
    { id: 'create', label: 'Create Loan', icon: '🏦' },
    { id: 'manage', label: 'My Loans', icon: '📊' }
  ];

  return (
    <div className="loan-page p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🏦 LINE Yield Lending Platform
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Access flexible lending solutions with competitive rates and secure collateral management. 
          Choose from multiple loan types tailored to your needs.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 rounded-lg p-1 flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={cn(
                "px-6 py-3 text-lg font-medium rounded-md transition-colors flex items-center space-x-2",
                activeTab === tab.id
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
              onClick={() => {
                setActiveTab(tab.id as any);
                if (tab.id === 'create' && !selectedLoanType) {
                  setActiveTab('types');
                }
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <div className="text-yellow-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Wallet Not Connected</h3>
          <p className="text-yellow-700">
            Please connect your wallet to access lending features and manage your loans.
          </p>
        </div>
      )}

      {/* Tab Content */}
      {isConnected && (
        <>
          {activeTab === 'types' && (
            <LoanTypes 
              userAddress={userAddress}
              onSelectLoanType={handleSelectLoanType}
            />
          )}

          {activeTab === 'create' && (
            <div className="space-y-6">
              {selectedLoanType ? (
                <LoanCreator 
                  userAddress={userAddress}
                  selectedLoanType={selectedLoanType}
                  onLoanCreated={handleLoanCreated}
                />
              ) : (
                <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Loan Type First</h3>
                  <p className="text-gray-500 mb-4">
                    Please go back to the Loan Types tab and select a loan type to create a new loan.
                  </p>
                  <button
                    onClick={() => setActiveTab('types')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Browse Loan Types
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'manage' && (
            <LoanManager 
              userAddress={userAddress}
              key={refreshLoans}
            />
          )}
        </>
      )}

      {/* Features Overview */}
      <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          🚀 Lending Platform Features
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Multiple Loan Types</h3>
            <p className="text-gray-600">
              Choose from Quick Cash, Business Loans, and Premium options with different terms and rates.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Collateral</h3>
            <p className="text-gray-600">
              Your assets are protected with over-collateralization and automated liquidation protection.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Access</h3>
            <p className="text-gray-600">
              Get immediate access to funds with our streamlined application and approval process.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Monitoring</h3>
            <p className="text-gray-600">
              Track your loan status, payments, and collateral ratio in real-time.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🛡️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Risk Management</h3>
            <p className="text-gray-600">
              Advanced risk assessment and automated liquidation to protect both borrowers and lenders.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Flexible Terms</h3>
            <p className="text-gray-600">
              Customizable loan terms with competitive interest rates and flexible repayment options.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          ❓ Frequently Asked Questions
        </h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              How does the lending process work?
            </h3>
            <p className="text-gray-700">
              Simply select a loan type, provide the required collateral, and receive your loan instantly. 
              You can repay at any time and add additional collateral to improve your loan-to-value ratio.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              What happens if I can't repay my loan?
            </h3>
            <p className="text-gray-700">
              If your loan becomes undercollateralized or you miss payments, the system may liquidate 
              your collateral to cover the debt. You can add more collateral to prevent liquidation.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Are there any fees besides interest?
            </h3>
            <p className="text-gray-700">
              There are no origination fees or hidden charges. You only pay the agreed interest rate 
              and any penalties for late payments as specified in your loan terms.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Can I pay off my loan early?
            </h3>
            <p className="text-gray-700">
              Yes! You can repay your loan at any time without prepayment penalties. 
              Early repayment will reduce your interest charges.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              What collateral is accepted?
            </h3>
            <p className="text-gray-700">
              We accept various cryptocurrencies as collateral. The specific tokens and their 
              collateral ratios depend on the loan type you choose.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              How is my collateral protected?
            </h3>
            <p className="text-gray-700">
              Your collateral is held in secure smart contracts with automated monitoring. 
              The system ensures you maintain the required collateral ratio and provides 
              warnings before liquidation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
