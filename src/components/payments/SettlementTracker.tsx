import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  DollarSign,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  Zap,
  Banknote
} from 'lucide-react';

interface SettlementRequest {
  id: string;
  paymentId: string;
  user: string;
  fiatAmount: number;
  usdtAmount: number;
  otcPartner: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  otcTransactionId?: string;
  settlementHash?: string;
  createdAt: string;
  completedAt?: string;
}

interface OTCPartner {
  id: string;
  name: string;
  liquidity: number;
  conversionRate: number;
  fee: number;
  status: 'active' | 'inactive';
}

export const SettlementTracker: React.FC = () => {
  const [settlements, setSettlements] = useState<SettlementRequest[]>([]);
  const [otcPartners, setOtcPartners] = useState<OTCPartner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    fetchSettlementData();
  }, []);

  const fetchSettlementData = async () => {
    try {
      setLoading(true);
      
      // Mock settlement data
      const mockSettlements: SettlementRequest[] = [
        {
          id: 'settle_001',
          paymentId: 'pay_001',
          user: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          fiatAmount: 1000,
          usdtAmount: 997,
          otcPartner: 'otc_partner_1',
          status: 'completed',
          otcTransactionId: 'otc_tx_001',
          settlementHash: '0x1234567890abcdef...',
          createdAt: '2024-01-20T10:30:00Z',
          completedAt: '2024-01-20T10:35:00Z'
        },
        {
          id: 'settle_002',
          paymentId: 'pay_002',
          user: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          fiatAmount: 500,
          usdtAmount: 498,
          otcPartner: 'otc_partner_2',
          status: 'processing',
          otcTransactionId: 'otc_tx_002',
          createdAt: '2024-01-20T11:00:00Z'
        },
        {
          id: 'settle_003',
          paymentId: 'pay_003',
          user: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          fiatAmount: 2500,
          usdtAmount: 2495,
          otcPartner: 'otc_partner_1',
          status: 'pending',
          createdAt: '2024-01-20T11:30:00Z'
        }
      ];

      const mockOTCPartners: OTCPartner[] = [
        {
          id: 'otc_partner_1',
          name: 'CryptoBridge OTC',
          liquidity: 5000000,
          conversionRate: 0.997,
          fee: 0.3,
          status: 'active'
        },
        {
          id: 'otc_partner_2',
          name: 'Digital Exchange Pro',
          liquidity: 3000000,
          conversionRate: 0.996,
          fee: 0.4,
          status: 'active'
        },
        {
          id: 'otc_partner_3',
          name: 'Blockchain Partners',
          liquidity: 2000000,
          conversionRate: 0.995,
          fee: 0.5,
          status: 'active'
        }
      ];

      setSettlements(mockSettlements);
      setOtcPartners(mockOTCPartners);
    } catch (error) {
      console.error('Failed to fetch settlement data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchSettlementData();
    setRefreshing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOTCPartnerName = (partnerId: string) => {
    const partner = otcPartners.find(p => p.id === partnerId);
    return partner ? partner.name : 'Unknown Partner';
  };

  const getProgressValue = (status: string) => {
    switch (status) {
      case 'completed':
        return 100;
      case 'processing':
        return 75;
      case 'pending':
        return 25;
      default:
        return 0;
    }
  };

  const totalSettlements = settlements.length;
  const completedSettlements = settlements.filter(s => s.status === 'completed').length;
  const totalUSDT = settlements
    .filter(s => s.status === 'completed')
    .reduce((sum, s) => sum + s.usdtAmount, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading settlement data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Settlement Tracker</h2>
          <p className="text-gray-600 mt-1">Track your payment settlements and USDT conversions</p>
        </div>
        
        <Button onClick={refreshData} disabled={refreshing} variant="outline">
          {refreshing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </>
          )}
        </Button>
      </div>

      {/* Settlement Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Settlements</p>
                <p className="text-2xl font-bold text-gray-900">{totalSettlements}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedSettlements}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total USDT</p>
                <p className="text-2xl font-bold text-gray-900">{totalUSDT.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settlement Flow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ArrowRight className="w-5 h-5 mr-2" />
            Settlement Process
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <p className="text-sm font-medium">Payment</p>
                <p className="text-xs text-gray-500">3rd Party</p>
              </div>
              
              <ArrowRight className="w-4 h-4 text-gray-400" />
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <p className="text-sm font-medium">LINE NEXT</p>
                <p className="text-xs text-gray-500">Processing</p>
              </div>
              
              <ArrowRight className="w-4 h-4 text-gray-400" />
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <p className="text-sm font-medium">OTC Partner</p>
                <p className="text-xs text-gray-500">Conversion</p>
              </div>
              
              <ArrowRight className="w-4 h-4 text-gray-400" />
              
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-orange-600 font-bold">4</span>
                </div>
                <p className="text-sm font-medium">USDT Claim</p>
                <p className="text-xs text-gray-500">Complete</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settlement Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Settlement Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {settlements.map((settlement) => (
              <div key={settlement.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(settlement.status)}
                    <div>
                      <h3 className="font-semibold">Settlement #{settlement.id}</h3>
                      <p className="text-sm text-gray-600">
                        Payment #{settlement.paymentId}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(settlement.status)}>
                    {settlement.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Fiat Amount</p>
                    <p className="font-semibold">${settlement.fiatAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">USDT Amount</p>
                    <p className="font-semibold">{settlement.usdtAmount.toLocaleString()} USDT</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">OTC Partner</p>
                    <p className="font-semibold">{getOTCPartnerName(settlement.otcPartner)}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Settlement Progress</span>
                    <span className="text-sm text-gray-600">
                      {getProgressValue(settlement.status)}%
                    </span>
                  </div>
                  <Progress value={getProgressValue(settlement.status)} className="h-2" />
                </div>

                {/* Transaction Details */}
                {settlement.otcTransactionId && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">OTC Transaction:</span>
                    <span className="font-mono text-gray-800">{settlement.otcTransactionId}</span>
                  </div>
                )}

                {settlement.settlementHash && (
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-600">Settlement Hash:</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-gray-800">{settlement.settlementHash}</span>
                      <Button size="sm" variant="ghost">
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-600">Created:</span>
                  <span>{new Date(settlement.createdAt).toLocaleString()}</span>
                </div>

                {settlement.completedAt && (
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-600">Completed:</span>
                    <span>{new Date(settlement.completedAt).toLocaleString()}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* OTC Partners */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Banknote className="w-5 h-5 mr-2" />
            OTC Partners
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {otcPartners.map((partner) => (
              <div key={partner.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{partner.name}</h3>
                  <Badge className={partner.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {partner.status.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Liquidity:</span>
                    <span className="font-medium">${partner.liquidity.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Conversion Rate:</span>
                    <span className="font-medium">{partner.conversionRate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Fee:</span>
                    <span className="font-medium">{partner.fee}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettlementTracker;

