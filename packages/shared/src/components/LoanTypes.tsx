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

interface LoanTypesProps {
  userAddress: string | null;
  onSelectLoanType?: (loanType: LoanType) => void;
  className?: string;
}

export const LoanTypes: React.FC<LoanTypesProps> = ({ 
  userAddress, 
  onSelectLoanType,
  className = '' 
}) => {
  const t = useT();
  const [loanTypes, setLoanTypes] = useState<LoanType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<number | null>(null);

  // Fetch loan types
  useEffect(() => {
    const fetchLoanTypes = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/loans/types');
        if (response.ok) {
          const data = await response.json();
          setLoanTypes(data.data);
        } else {
          setError('Failed to load loan types');
        }
      } catch (err) {
        setError('Failed to load loan types');
        console.error('Error fetching loan types:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLoanTypes();
  }, []);

  const formatAmount = (amount: string) => {
    return parseFloat(amount).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  const formatDuration = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    if (days >= 365) {
      const years = Math.floor(days / 365);
      return `${years} year${years > 1 ? 's' : ''}`;
    } else if (days >= 30) {
      const months = Math.floor(days / 30);
      return `${months} month${months > 1 ? 's' : ''}`;
    } else {
      return `${days} day${days > 1 ? 's' : ''}`;
    }
  };

  const formatRate = (rateBps: number) => {
    return (rateBps / 100).toFixed(2);
  };

  const getLoanTypeIcon = (name: string) => {
    if (name.toLowerCase().includes('quick')) return '⚡';
    if (name.toLowerCase().includes('business')) return '🏢';
    if (name.toLowerCase().includes('premium')) return '💎';
    return '💰';
  };

  const getLoanTypeColor = (name: string) => {
    if (name.toLowerCase().includes('quick')) return 'bg-yellow-500';
    if (name.toLowerCase().includes('business')) return 'bg-blue-500';
    if (name.toLowerCase().includes('premium')) return 'bg-purple-500';
    return 'bg-green-500';
  };

  const handleSelectLoanType = (loanType: LoanType) => {
    setSelectedType(loanType.id);
    if (onSelectLoanType) {
      onSelectLoanType(loanType);
    }
  };

  if (loading) {
    return (
      <div className={cn('bg-white rounded-lg shadow-lg p-6', className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
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
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Loan Types</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-lg shadow-lg p-6', className)}>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        💰 Available Loan Types
      </h2>

      {loanTypes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loanTypes.map((loanType) => (
            <div
              key={loanType.id}
              className={cn(
                'border-2 rounded-lg p-6 cursor-pointer transition-all hover:shadow-md',
                selectedType === loanType.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              )}
              onClick={() => handleSelectLoanType(loanType)}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className={cn('w-12 h-12 rounded-full flex items-center justify-center text-white text-xl', getLoanTypeColor(loanType.name))}>
                  {getLoanTypeIcon(loanType.name)}
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Interest Rate</div>
                  <div className="text-lg font-bold text-green-600">
                    {formatRate(loanType.interestRateBps)}%
                  </div>
                </div>
              </div>

              {/* Loan Type Info */}
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {loanType.name}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  {loanType.description}
                </p>
              </div>

              {/* Loan Details */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Loan Amount:</span>
                  <span className="font-medium">
                    {formatAmount(loanType.minAmount)} - {formatAmount(loanType.maxAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">
                    {formatDuration(loanType.durationSeconds)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Collateral Required:</span>
                  <span className="font-medium">
                    {(loanType.collateralRatioBps / 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Liquidation Threshold:</span>
                  <span className="font-medium text-red-600">
                    {(loanType.liquidationThresholdBps / 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Requirements */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">KYC Required:</span>
                  <span className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    loanType.requiresKYC 
                      ? 'bg-orange-100 text-orange-800' 
                      : 'bg-green-100 text-green-800'
                  )}>
                    {loanType.requiresKYC ? 'Yes' : 'No'}
                  </span>
                </div>
                {loanType.maxBorrowers > 0 && (
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-600">Available Slots:</span>
                    <span className="font-medium">
                      {loanType.maxBorrowers - loanType.currentBorrowers} / {loanType.maxBorrowers}
                    </span>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium',
                    loanType.active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  )}>
                    {loanType.active ? 'Available' : 'Unavailable'}
                  </span>
                  {selectedType === loanType.id && (
                    <span className="text-blue-600 text-sm font-medium">Selected</span>
                  )}
                </div>
              </div>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Loan Types Available</h3>
          <p className="text-gray-500">Please check back later for available loan options.</p>
        </div>
      )}

      {/* Selection Info */}
      {selectedType !== null && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-blue-700 font-medium">
              Loan type selected! You can now proceed to create your loan.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};


