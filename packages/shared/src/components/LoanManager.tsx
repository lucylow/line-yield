import React, { useState, useEffect } from 'react';
import { cn } from '../../src/utils/cn';
import { useT } from '../../src/hooks/useT';

interface Loan {
  id: number;
  loanTypeId: number;
  borrower: string;
  principal: string;
  collateral: string;
  startTimestamp: number;
  repaidAmount: string;
  lastPaymentTimestamp: number;
  status: 'Active' | 'Repaid' | 'Liquidated' | 'Defaulted' | 'Cancelled';
  interestAccrued: string;
  isLiquidated: boolean;
  totalOwed?: string;
  interestOwed?: string;
  penaltyOwed?: string;
  daysRemaining?: number;
  collateralRatio?: number;
}

interface LoanManagerProps {
  userAddress: string | null;
  className?: string;
}

export const LoanManager: React.FC<LoanManagerProps> = ({ 
  userAddress, 
  className = '' 
}) => {
  const t = useT();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [repayAmount, setRepayAmount] = useState<string>('');
  const [repayLoading, setRepayLoading] = useState<number | null>(null);
  const [addCollateralAmount, setAddCollateralAmount] = useState<string>('');
  const [addCollateralLoading, setAddCollateralLoading] = useState<number | null>(null);

  // Fetch user loans
  useEffect(() => {
    if (userAddress) {
      fetchUserLoans();
    } else {
      setLoans([]);
      setLoading(false);
    }
  }, [userAddress]);

  const fetchUserLoans = async () => {
    if (!userAddress) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/loans/user/${userAddress}`);
      if (response.ok) {
        const data = await response.json();
        setLoans(data.data);
      } else {
        setError('Failed to load loans');
      }
    } catch (err) {
      setError('Failed to load loans');
      console.error('Error fetching loans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRepayLoan = async (loanId: number) => {
    if (!repayAmount || parseFloat(repayAmount) <= 0) {
      setError('Please enter a valid repayment amount');
      return;
    }

    setRepayLoading(loanId);
    setError(null);

    try {
      const response = await fetch(`/api/loans/${loanId}/repay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: repayAmount
        }),
      });

      const result = await response.json();

      if (result.success) {
        setRepayAmount('');
        await fetchUserLoans(); // Refresh loans
      } else {
        setError(result.error || 'Failed to repay loan');
      }
    } catch (err) {
      setError('Failed to repay loan');
      console.error('Error repaying loan:', err);
    } finally {
      setRepayLoading(null);
    }
  };

  const handleAddCollateral = async (loanId: number) => {
    if (!addCollateralAmount || parseFloat(addCollateralAmount) <= 0) {
      setError('Please enter a valid collateral amount');
      return;
    }

    setAddCollateralLoading(loanId);
    setError(null);

    try {
      const response = await fetch(`/api/loans/${loanId}/add-collateral`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: addCollateralAmount
        }),
      });

      const result = await response.json();

      if (result.success) {
        setAddCollateralAmount('');
        await fetchUserLoans(); // Refresh loans
      } else {
        setError(result.error || 'Failed to add collateral');
      }
    } catch (err) {
      setError('Failed to add collateral');
      console.error('Error adding collateral:', err);
    } finally {
      setAddCollateralLoading(null);
    }
  };

  const formatAmount = (amount: string) => {
    return parseFloat(amount).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Repaid': return 'bg-blue-100 text-blue-800';
      case 'Liquidated': return 'bg-red-100 text-red-800';
      case 'Defaulted': return 'bg-red-100 text-red-800';
      case 'Cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return '🟢';
      case 'Repaid': return '✅';
      case 'Liquidated': return '🔴';
      case 'Defaulted': return '⚠️';
      case 'Cancelled': return '❌';
      default: return '❓';
    }
  };

  if (!userAddress) {
    return (
      <div className={cn('bg-white rounded-lg shadow-lg p-6 text-center', className)}>
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Your Wallet</h3>
        <p className="text-gray-500">Please connect your wallet to view and manage your loans.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={cn('bg-white rounded-lg shadow-lg p-6', className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('bg-white rounded-lg shadow-lg p-6 text-center', className)}>
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Loans</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button 
          onClick={fetchUserLoans}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-lg shadow-lg p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          📊 My Loans
        </h2>
        <button 
          onClick={fetchUserLoans}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-700 font-medium">Error</span>
          </div>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
      )}

      {loans.length > 0 ? (
        <div className="space-y-6">
          {loans.map((loan) => (
            <div key={loan.id} className="border border-gray-200 rounded-lg p-6">
              {/* Loan Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getStatusIcon(loan.status)}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Loan #{loan.id}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Created: {formatDate(loan.startTimestamp)}
                    </p>
                  </div>
                </div>
                <span className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium',
                  getStatusColor(loan.status)
                )}>
                  {loan.status}
                </span>
              </div>

              {/* Loan Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-600">Principal</div>
                  <div className="text-lg font-bold text-gray-900">
                    {formatAmount(loan.principal)}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-600">Collateral</div>
                  <div className="text-lg font-bold text-gray-900">
                    {formatAmount(loan.collateral)}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-600">Repaid</div>
                  <div className="text-lg font-bold text-green-600">
                    {formatAmount(loan.repaidAmount)}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-600">Total Owed</div>
                  <div className="text-lg font-bold text-red-600">
                    {loan.totalOwed ? formatAmount(loan.totalOwed) : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <div className="text-sm text-gray-600">Interest Owed</div>
                  <div className="text-sm font-medium text-orange-600">
                    {loan.interestOwed ? formatAmount(loan.interestOwed) : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Penalty Owed</div>
                  <div className="text-sm font-medium text-red-600">
                    {loan.penaltyOwed ? formatAmount(loan.penaltyOwed) : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Days Remaining</div>
                  <div className="text-sm font-medium text-blue-600">
                    {loan.daysRemaining !== undefined ? `${loan.daysRemaining} days` : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Actions for Active Loans */}
              {loan.status === 'Active' && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Loan Actions</h4>
                  
                  {/* Repay Loan */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Repay Loan
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        value={repayAmount}
                        onChange={(e) => setRepayAmount(e.target.value)}
                        placeholder="Enter repayment amount"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        step="0.01"
                      />
                      <button
                        onClick={() => handleRepayLoan(loan.id)}
                        disabled={repayLoading === loan.id || !repayAmount}
                        className={cn(
                          'px-4 py-2 rounded-lg font-medium text-white transition-colors',
                          repayLoading === loan.id || !repayAmount
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700'
                        )}
                      >
                        {repayLoading === loan.id ? 'Repaying...' : 'Repay'}
                      </button>
                    </div>
                  </div>

                  {/* Add Collateral */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add Collateral
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        value={addCollateralAmount}
                        onChange={(e) => setAddCollateralAmount(e.target.value)}
                        placeholder="Enter additional collateral amount"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        step="0.01"
                      />
                      <button
                        onClick={() => handleAddCollateral(loan.id)}
                        disabled={addCollateralLoading === loan.id || !addCollateralAmount}
                        className={cn(
                          'px-4 py-2 rounded-lg font-medium text-white transition-colors',
                          addCollateralLoading === loan.id || !addCollateralAmount
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                        )}
                      >
                        {addCollateralLoading === loan.id ? 'Adding...' : 'Add Collateral'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Loan Status Info */}
              {loan.status !== 'Active' && (
                <div className="border-t pt-4">
                  <div className="text-sm text-gray-600">
                    {loan.status === 'Repaid' && '✅ This loan has been fully repaid.'}
                    {loan.status === 'Liquidated' && '🔴 This loan was liquidated due to undercollateralization or default.'}
                    {loan.status === 'Defaulted' && '⚠️ This loan has defaulted.'}
                    {loan.status === 'Cancelled' && '❌ This loan was cancelled.'}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Loans Found</h3>
          <p className="text-gray-500">You don't have any loans yet. Create your first loan to get started!</p>
        </div>
      )}
    </div>
  );
};
