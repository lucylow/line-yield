import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useKaiaWallet } from '@/hooks/useKaiaWallet';
import { useLineInvite } from '@/hooks/useLineInvite';
import KaiaWalletConnection from '@/components/KaiaWalletConnection';
import KaiaTransactionPanel from '@/components/KaiaTransactionPanel';
import LineInvitePanel from '@/components/LineInvitePanel';
import { 
  Wallet, 
  TrendingUp, 
  Users, 
  Zap,
  DollarSign,
  Shield,
  MessageCircle,
  ExternalLink,
  RefreshCw,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export const KaiaLineMiniDapp: React.FC = () => {
  const {
    isConnected,
    account,
    kaiaBalance,
    usdtBalance,
    isLoading,
    refreshBalances,
    network,
    KAIANETWORKS
  } = useKaiaWallet();

  const { isInviteAvailable } = useLineInvite();

  const [activeTab, setActiveTab] = useState('wallet');
  const [stats, setStats] = useState({
    totalDeposits: '0',
    totalEarnings: '0',
    apy: '8.64',
    referralCount: 0
  });

  // Auto-refresh balances every 30 seconds
  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => {
        refreshBalances();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isConnected, refreshBalances]);

  // Simulate stats loading
  useEffect(() => {
    if (isConnected && account) {
      // In a real app, this would fetch from your backend
      setStats({
        totalDeposits: '1,250.00',
        totalEarnings: '45.67',
        apy: '8.64',
        referralCount: 12
      });
    }
  }, [isConnected, account]);

  const formatBalance = (balance: string, decimals: number = 2) => {
    const num = parseFloat(balance);
    return num.toFixed(decimals);
  };

  const openExplorer = () => {
    if (account && network) {
      const explorerUrl = `${network.blockExplorerUrls[0]}/account/${account}`;
      window.open(explorerUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">LINE Yield</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Earn automated yield on your USDT with Kaia blockchain integration
          </p>
          
          {/* Status Badges */}
          <div className="flex justify-center gap-2 mt-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Gas Fee Delegation
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Secure DeFi
            </Badge>
            {isInviteAvailable && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                LINE Integration
              </Badge>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        {isConnected && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  ${stats.totalDeposits}
                </div>
                <div className="text-sm text-gray-500">Total Deposits</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">
                  ${stats.totalEarnings}
                </div>
                <div className="text-sm text-gray-500">Total Earnings</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.apy}%
                </div>
                <div className="text-sm text-gray-500">Current APY</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">
                  {stats.referralCount}
                </div>
                <div className="text-sm text-gray-500">Referrals</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="wallet" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Wallet
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="invite" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Invite Friends
            </TabsTrigger>
          </TabsList>

          {/* Wallet Tab */}
          <TabsContent value="wallet" className="space-y-6">
            <KaiaWalletConnection showDetails={true} />
            
            {isConnected && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Yield Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-800">USDT Balance</span>
                      </div>
                      <div className="text-2xl font-bold text-green-900">
                        {formatBalance(usdtBalance, 2)} USDT
                      </div>
                      <div className="text-sm text-green-700">
                        Available for yield farming
                      </div>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-800">KAIA Balance</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-900">
                        {formatBalance(kaiaBalance, 4)} KAIA
                      </div>
                      <div className="text-sm text-blue-700">
                        Gas fees delegated
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={refreshBalances}
                      disabled={isLoading}
                      variant="outline"
                      className="flex-1 flex items-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Refreshing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4" />
                          Refresh Balances
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={openExplorer}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View on Explorer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <KaiaTransactionPanel />
            
            {/* Transaction History */}
            {isConnected && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Recent Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Mock transaction history */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Deposit</div>
                          <div className="text-sm text-gray-500">2 hours ago</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-600">+500.00 USDT</div>
                        <div className="text-sm text-gray-500">Confirmed</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <DollarSign className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Yield Earned</div>
                          <div className="text-sm text-gray-500">1 day ago</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-blue-600">+2.34 USDT</div>
                        <div className="text-sm text-gray-500">Confirmed</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Invite Friends Tab */}
          <TabsContent value="invite" className="space-y-6">
            <LineInvitePanel userAddress={account} />
            
            {/* Referral Stats */}
            {isConnected && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Referral Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {stats.referralCount}
                      </div>
                      <div className="text-sm text-green-700">Total Referrals</div>
                    </div>
                    
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        $12.45
                      </div>
                      <div className="text-sm text-blue-700">Referral Earnings</div>
                    </div>
                    
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        0.5%
                      </div>
                      <div className="text-sm text-purple-700">Commission Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <div className="flex justify-center space-x-6 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              <span>Secure DeFi Protocol</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4" />
              <span>Gas Fee Delegation</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              <span>Audited Smart Contracts</span>
            </div>
          </div>
          
          <p className="text-xs text-gray-400">
            Powered by Kaia blockchain • Integrated with LINE Mini Dapp SDK
          </p>
        </div>
      </div>
    </div>
  );
};

export default KaiaLineMiniDapp;
