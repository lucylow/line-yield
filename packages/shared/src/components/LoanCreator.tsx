import React, { useState, useEffect } from 'react';
import { cn } from '../../src/utils/cn';
import { useT } from '../../src/hooks/useT';

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

interface LoanCreatorProps {
  userAddress: string | null;
  selectedLoanType: LoanType | null;
  onLoanCreated?: (loanId: number) => void;
  className?: string;
}

export const LoanCreator: React.FC<LoanCreatorProps> = ({ 
  userAddress, 
  selectedLoanType,
  onLoanCreated,
  className = '' 
}) => {
  const t = useT();
  const [principalRequested, setPrincipalRequested] = useState<string>('');
  const [collateralAmount, setCollateralAmount] = useState<string>('');
  const [requiredCollateral, setRequiredCollateral] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [eligibility, setEligibility] = useState<{ eligible: boolean; reason?: string } | null>(null);

  // Check eligibility when loan type changes
  useEffect(() => {
    if (selectedLoanType && userAddress) {
      checkEligibility();
    }
  }, [selectedLoanType, userAddress]);

  // Calculate required collateral when principal changes
  useEffect(() => {
    if (selectedLoanType && principalRequested) {
      calculateRequiredCollateral();
    }
  }, [selectedLoanType, principalRequested]);

  const checkEligibility = async () => {
    if (!selectedLoanType || !userAddress) return;

    try {
      const response = await fetch(`/api/loans/user/${userAddress}/eligibility/${selectedLoanType.id}`);
      if (response.ok) {
        const data = await response.json();
        setEligibility(data.data);
      }
    } catch (err) {
      console.error('Error checking eligibility:', err);
    }
  };

  const calculateRequiredCollateral = async () => {
    if (!selectedLoanType || !principalRequested) return;

    try {
      const response = await fetch('/api/loans/calculate-collateral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loanAmount: principalRequested,
          collateralRatioBps: selectedLoanType.collateralRatioBps
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRequiredCollateral(data.data.requiredCollateral);
      }
    } catch (err) {
      console.error('Error calculating required collateral:', err);
    }
  };

  const handleCreateLoan = async () => {
    if (!selectedLoanType || !userAddress || !principalRequested || !collateralAmount) {
      setError('Please fill in all required fields');
      return;
    }

    if (!eligibility?.eligible) {
      setError(eligibility?.reason || 'You are not eligible for this loan type');
      return;
    }

    const principal = parseFloat(principalRequested);
    const collateral = parseFloat(collateralAmount);
    const required = parseFloat(requiredCollateral);

    if (principal < parseFloat(selectedLoanType.minAmount) || principal > parseFloat(selectedLoanType.maxAmount)) {
      setError(`Loan amount must be between ${selectedLoanType.minAmount} and ${selectedLoanType.maxAmount}`);
      return;
    }

    if (collateral < required) {
      setError(`Collateral amount must be at least ${requiredCollateral}`);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/loans/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loanTypeId: selectedLoanType.id,
          principalRequested,
          collateralAmount,
          borrowerAddress: userAddress
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(`🎉 Loan created successfully! Loan ID: ${result.data.loanId}`);
        if (onLoanCreated) {
          onLoanCreated(result.data.loanId);
        }
        // Reset form
        setPrincipalRequested('');
        setCollateralAmount('');
        setRequiredCollateral('');
      } else {
        setError(result.error || 'Failed to create loan');
      }
    } catch (err) {
      setError('Failed to create loan');
      console.error('Error creating loan:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: string) => {
    return parseFloat(amount).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  const formatRate = (rateBps: number) => {
    return (rateBps / 100).toFixed(2);
  };

  if (!selectedLoanType) {
    return (
      <div className={cn('bg-white rounded-lg shadow-lg p-6 text-center', className)}>
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Loan Type</h3>
        <p className="text-gray-500">Please select a loan type to create a new loan.</p>
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-lg shadow-lg p-6', className)}>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        🏦 Create New Loan
      </h2>

      {/* Selected Loan Type Info */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          {selectedLoanType.name}
        </h3>
        <p className="text-blue-700 text-sm mb-3">
          {selectedLoanType.description}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-blue-600 font-medium">Interest Rate:</span>
            <div className="text-blue-900 font-bold">{formatRate(selectedLoanType.interestRateBps)}%</div>
          </div>
          <div>
            <span className="text-blue-600 font-medium">Duration:</span>
            <div className="text-blue-900 font-bold">
              {Math.floor(selectedLoanType.durationSeconds / (24 * 60 * 60))} days
            </div>
          </div>
          <div>
            <span className="text-blue-600 font-medium">Collateral Required:</span>
            <div className="text-blue-900 font-bold">
              {(selectedLoanType.collateralRatioBps / 100).toFixed(0)}%
            </div>
          </div>
          <div>
            <span className="text-blue-600 font-medium">Amount Range:</span>
            <div className="text-blue-900 font-bold">
              {formatAmount(selectedLoanType.minAmount)} - {formatAmount(selectedLoanType.maxAmount)}
            </div>
          </div>
        </div>
      </div>

      {/* Eligibility Check */}
      {eligibility && (
        <div className={cn(
          'mb-6 p-4 rounded-lg border',
          eligibility.eligible 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        )}>
          <div className="flex items-center">
            {eligibility.eligible ? (
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className={cn(
              'font-medium',
              eligibility.eligible ? 'text-green-700' : 'text-red-700'
            )}>
              {eligibility.eligible ? 'You are eligible for this loan type' : eligibility.reason}
            </span>
          </div>
        </div>
      )}

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

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-green-700 font-medium">Success</span>
          </div>
          <p className="text-green-600 mt-1">{success}</p>
        </div>
      )}

      {/* Loan Form */}
      <div className="space-y-6">
        {/* Principal Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Loan Amount (USD)
          </label>
          <div className="relative">
            <input
              type="number"
              value={principalRequested}
              onChange={(e) => setPrincipalRequested(e.target.value)}
              placeholder={`Enter amount between ${formatAmount(selectedLoanType.minAmount)} and ${formatAmount(selectedLoanType.maxAmount)}`}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min={selectedLoanType.minAmount}
              max={selectedLoanType.maxAmount}
              step="0.01"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <span className="text-gray-500 text-sm">USD</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Minimum: {formatAmount(selectedLoanType.minAmount)} | Maximum: {formatAmount(selectedLoanType.maxAmount)}
          </p>
        </div>

        {/* Required Collateral Display */}
        {requiredCollateral && (
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">Required Collateral</h4>
            <div className="text-lg font-bold text-yellow-900">
              {formatAmount(requiredCollateral)}
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              You need to provide {(selectedLoanType.collateralRatioBps / 100).toFixed(0)}% collateral
            </p>
          </div>
        )}

        {/* Collateral Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Collateral Amount (USD)
          </label>
          <div className="relative">
            <input
              type="number"
              value={collateralAmount}
              onChange={(e) => setCollateralAmount(e.target.value)}
              placeholder={`Enter collateral amount (minimum: ${requiredCollateral || '0'})`}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min={requiredCollateral || '0'}
              step="0.01"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <span className="text-gray-500 text-sm">USD</span>
            </div>
          </div>
          {requiredCollateral && (
            <p className="text-sm text-gray-500 mt-1">
              Minimum required: {formatAmount(requiredCollateral)}
            </p>
          )}
        </div>

        {/* Loan Summary */}
        {principalRequested && collateralAmount && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-800 mb-3">Loan Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Principal Amount:</span>
                <span className="font-medium">{formatAmount(principalRequested)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Collateral Amount:</span>
                <span className="font-medium">{formatAmount(collateralAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Interest Rate:</span>
                <span className="font-medium">{formatRate(selectedLoanType.interestRateBps)}% APR</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">
                  {Math.floor(selectedLoanType.durationSeconds / (24 * 60 * 60))} days
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-600">Collateral Ratio:</span>
                <span className="font-medium">
                  {collateralAmount && principalRequested ? 
                    ((parseFloat(collateralAmount) / parseFloat(principalRequested)) * 100).toFixed(1) + '%' : 
                    'N/A'
                  }
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Create Loan Button */}
        <button
          onClick={handleCreateLoan}
          disabled={loading || !eligibility?.eligible || !principalRequested || !collateralAmount}
          className={cn(
            'w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors',
            loading || !eligibility?.eligible || !principalRequested || !collateralAmount
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          )}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Loan...
            </div>
          ) : (
            'Create Loan'
          )}
        </button>

        {/* Disclaimer */}
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <p className="font-medium mb-1">Important Disclaimer:</p>
          <ul className="space-y-1">
            <li>• You will be required to repay the principal plus interest</li>
            <li>• Your collateral may be liquidated if the loan becomes undercollateralized</li>
            <li>• Late payments may incur additional penalties</li>
            <li>• Please ensure you understand the terms before proceeding</li>
          </ul>
        </div>
      </div>
    </div>
  );
};


