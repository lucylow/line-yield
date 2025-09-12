import React from 'react';
import { cn } from '../utils/cn';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw';
  amount: string;
  token: string;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed';
  hash?: string;
}

interface TransactionHistoryProps {
  transactions?: Transaction[];
  className?: string;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions = [],
  className = ''
}) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeColor = (type: Transaction['type']) => {
    return type === 'deposit' ? 'text-green-600' : 'text-red-600';
  };

  const getTypeIcon = (type: Transaction['type']) => {
    return type === 'deposit' ? (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ) : (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4m16 0l-4-4m4 4l-4 4" />
      </svg>
    );
  };

  if (transactions.length === 0) {
    return (
      <div className={cn('bg-white rounded-lg shadow p-6 text-center', className)}>
        <div className="text-gray-400 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No transactions yet</h3>
        <p className="text-gray-500">Your transaction history will appear here</p>
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-lg shadow', className)}>
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Transaction History</h3>
      </div>
      
      <div className="divide-y divide-gray-200">
        {transactions.map((tx) => (
          <div key={tx.id} className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={cn('p-2 rounded-full', getTypeColor(tx.type))}>
                {getTypeIcon(tx.type)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {tx.type}
                </p>
                <p className="text-sm text-gray-500">
                  {formatDate(tx.timestamp)}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className={cn('text-sm font-medium', getTypeColor(tx.type))}>
                {tx.type === 'deposit' ? '+' : '-'}{tx.amount} {tx.token}
              </p>
              <span className={cn('inline-flex px-2 py-1 text-xs font-medium rounded-full', getStatusColor(tx.status))}>
                {tx.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};