import React, { useState } from 'react';
import { Transaction } from '../types/vault';
import { formatCurrency } from '../utils/formatters';
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, ExternalLink, Copy, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface TransactionHistoryProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

type FilterType = 'all' | 'deposit' | 'withdraw' | 'claim';

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  isLoading = false,
  onRefresh
}) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const { toast } = useToast();

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    return tx.type === filter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowUpRight className="w-5 h-5 text-green-600" />;
      case 'withdraw':
        return <ArrowDownLeft className="w-5 h-5 text-blue-600" />;
      case 'claim':
        return <CheckCircle className="w-5 h-5 text-purple-600" />;
      default:
        return <ArrowUpRight className="w-5 h-5 text-gray-600" />;
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: `${label} copied successfully`,
    });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getTransactionAmount = (tx: Transaction) => {
    const amount = parseFloat(tx.amount);
    const formattedAmount = formatCurrency(amount);
    return tx.type === 'deposit' ? `+${formattedAmount}` : `-${formattedAmount}`;
  };

  const getAmountColor = (type: string) => {
    return type === 'deposit' ? 'text-green-600' : 'text-blue-600';
  };

  if (isLoading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-gray-100 rounded-xl">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Transaction History</h3>
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="hover:bg-green-50 hover:border-green-300 transition-all duration-200"
          >
            <Filter className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        )}
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6">
        {(['all', 'deposit', 'withdraw', 'claim'] as FilterType[]).map((filterType) => (
          <Button
            key={filterType}
            variant={filter === filterType ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(filterType)}
            className={`capitalize ${
              filter === filterType
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'hover:bg-green-50 hover:border-green-300'
            } transition-all duration-200`}
          >
            {filterType}
          </Button>
        ))}
      </div>

      {/* Transaction List */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">No transactions found</p>
            {filter !== 'all' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilter('all')}
                className="mt-2"
              >
                View All Transactions
              </Button>
            )}
          </div>
        ) : (
          filteredTransactions.map((tx) => (
            <div
              key={tx.hash}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
            >
              {/* Transaction Icon */}
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                {getTransactionIcon(tx.type)}
              </div>

              {/* Transaction Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-800 capitalize">
                    {tx.type}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-xs ${getStatusColor(tx.status)}`}
                  >
                    <div className="flex items-center gap-1">
                      {getStatusIcon(tx.status)}
                      {tx.status}
                    </div>
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{formatDate(tx.timestamp)}</span>
                  <span>•</span>
                  <button
                    onClick={() => copyToClipboard(tx.hash, 'Transaction Hash')}
                    className="hover:text-gray-700 transition-colors flex items-center gap-1"
                  >
                    <span className="font-mono">{tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}</span>
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div className="text-right">
                <div className={`font-semibold text-lg ${getAmountColor(tx.type)}`}>
                  {getTransactionAmount(tx)}
                </div>
                <div className="text-sm text-gray-500">USDT</div>
              </div>

              {/* External Link */}
              <button
                onClick={() => window.open(`https://baobab.klaytnscope.com/tx/${tx.hash}`, '_blank')}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 hover:bg-white rounded-lg"
              >
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Load More Button */}
      {filteredTransactions.length > 0 && filteredTransactions.length >= 10 && (
        <div className="mt-6 text-center">
          <Button variant="outline" className="hover:bg-green-50 hover:border-green-300">
            Load More Transactions
          </Button>
        </div>
      )}
    </div>
  );
};
