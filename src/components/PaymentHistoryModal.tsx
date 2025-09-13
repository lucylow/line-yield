import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  Copy,
  RefreshCw
} from 'lucide-react';
import { Transaction } from '../types/vault';
import { formatCurrency } from '../utils/formatters';
import { useToast } from '@/hooks/use-toast';

interface PaymentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  isLoading: boolean;
  onRefresh?: () => void;
}

export const PaymentHistoryModal: React.FC<PaymentHistoryModalProps> = ({
  isOpen,
  onClose,
  transactions,
  isLoading,
  onRefresh
}) => {
  const { toast } = useToast();

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
    const date = new Date(timestamp * 1000);
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Payment History
            </span>
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
                className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
              </div>
              <p className="text-gray-600">Loading payment history...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600">No transactions found.</p>
              <p className="text-sm text-gray-500 mt-2">Your transaction history will appear here once you start using the platform.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
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
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {transactions.length > 0 && (
          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-sm text-gray-500">
              Showing {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              {transactions.length >= 10 && (
                <Button variant="outline" className="hover:bg-blue-50 hover:border-blue-300">
                  Load More
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
