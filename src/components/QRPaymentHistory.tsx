import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQRPayment } from '../hooks/useQRPayment';
import { useWallet } from '../hooks/useWallet';
import { qrPaymentService, QRPaymentSession } from '../services/qrPaymentService';
import { 
  History, 
  Search, 
  Filter, 
  Download,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QRPaymentHistoryProps {
  className?: string;
}

type FilterStatus = 'all' | 'pending' | 'paid' | 'expired' | 'cancelled';

export const QRPaymentHistory: React.FC<QRPaymentHistoryProps> = ({ className }) => {
  const { wallet } = useWallet();
  const { toast } = useToast();
  const { formatAmount, formatTimeRemaining, getStatusColor, getStatusIcon } = useQRPayment();
  
  const [sessions, setSessions] = useState<QRPaymentSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount'>('newest');

  const loadSessions = async () => {
    if (!wallet?.address) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const userSessions = await qrPaymentService.getUserSessions(wallet.address);
      setSessions(userSessions);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load payment history';
      setError(errorMessage);
      console.error('Failed to load sessions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [wallet?.address]);

  const filteredSessions = sessions
    .filter(session => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          session.id.toLowerCase().includes(searchLower) ||
          session.amount.includes(searchTerm) ||
          session.description?.toLowerCase().includes(searchLower) ||
          session.reference?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    })
    .filter(session => {
      // Status filter
      if (statusFilter === 'all') return true;
      return session.status === statusFilter;
    })
    .sort((a, b) => {
      // Sort filter
      switch (sortBy) {
        case 'newest':
          return b.createdAt - a.createdAt;
        case 'oldest':
          return a.createdAt - b.createdAt;
        case 'amount':
          return parseFloat(b.amount) - parseFloat(a.amount);
        default:
          return b.createdAt - a.createdAt;
      }
    });

  const handleRefresh = () => {
    loadSessions();
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Session ID', 'Amount', 'Token', 'Status', 'Created', 'Expires', 'Transaction Hash', 'Payer Address'],
      ...filteredSessions.map(session => [
        session.id,
        session.amount,
        session.token,
        session.status,
        new Date(session.createdAt).toISOString(),
        new Date(session.expiresAt).toISOString(),
        session.transactionHash || '',
        session.payerAddress || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qr-payment-history-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Export Complete',
      description: 'Payment history exported to CSV',
    });
  };

  const getStatusBadge = (status: string) => (
    <Badge className={getStatusColor(status)}>
      {getStatusIcon(status)} {status.toUpperCase()}
    </Badge>
  );

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getSessionSummary = () => {
    const total = sessions.length;
    const pending = sessions.filter(s => s.status === 'pending').length;
    const paid = sessions.filter(s => s.status === 'paid').length;
    const expired = sessions.filter(s => s.status === 'expired').length;
    const cancelled = sessions.filter(s => s.status === 'cancelled').length;
    
    return { total, pending, paid, expired, cancelled };
  };

  const summary = getSessionSummary();

  if (!wallet?.address) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Connect your wallet to view payment history</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Payment History</h2>
          <p className="text-muted-foreground">
            View and manage your QR payment sessions
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{summary.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{summary.pending}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{summary.paid}</div>
              <div className="text-sm text-muted-foreground">Paid</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{summary.expired}</div>
              <div className="text-sm text-muted-foreground">Expired</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{summary.cancelled}</div>
              <div className="text-sm text-muted-foreground">Cancelled</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by ID, amount, description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(value: FilterStatus) => setStatusFilter(value)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value: 'newest' | 'oldest' | 'amount') => setSortBy(value)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="amount">Amount (High to Low)</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={handleExportCSV}
              disabled={filteredSessions.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-red-600 mt-1">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Sessions List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Payment Sessions ({filteredSessions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 mx-auto animate-spin mb-4" />
              <p className="text-muted-foreground">Loading payment history...</p>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                {sessions.length === 0 
                  ? 'No payment sessions found' 
                  : 'No sessions match your filters'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="font-mono text-sm text-muted-foreground">
                        {session.id.slice(0, 8)}...
                      </div>
                      {getStatusBadge(session.status)}
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {formatAmount(session.amount, session.token)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(session.createdAt)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Expires</div>
                      <div className="font-medium">
                        {session.status === 'pending' ? (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimeRemaining(session.expiresAt)}
                          </span>
                        ) : (
                          formatDate(session.expiresAt)
                        )}
                      </div>
                    </div>
                    {session.transactionHash && (
                      <div>
                        <div className="text-muted-foreground">Transaction</div>
                        <div className="font-mono text-xs">
                          {session.transactionHash.slice(0, 10)}...
                        </div>
                      </div>
                    )}
                    {session.payerAddress && (
                      <div>
                        <div className="text-muted-foreground">Payer</div>
                        <div className="font-mono text-xs">
                          {session.payerAddress.slice(0, 10)}...
                        </div>
                      </div>
                    )}
                    {session.description && (
                      <div>
                        <div className="text-muted-foreground">Description</div>
                        <div className="font-medium truncate">
                          {session.description}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};



