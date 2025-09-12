import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wallet, 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft,
  Shield,
  Zap,
  BarChart3,
  History,
  Settings,
  ChevronRight,
  Fuel,
  Clock,
  CheckCircle
} from 'lucide-react';

interface UserData {
  connected: boolean;
  balance: number;
  apy: number;
  earned: number;
  transactions: Transaction[];
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
}

interface Strategy {
  name: string;
  apy: number;
  allocation: number;
  icon: string;
  color: string;
}

const LineYieldApp: React.FC = () => {
  const [userData, setUserData] = useState<UserData>({
    connected: false,
    balance: 0,
    apy: 8.65,
    earned: 0,
    transactions: []
  });

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const strategies: Strategy[] = [
    { name: 'Aave Lending', apy: 5.2, allocation: 40, icon: '🏦', color: 'bg-blue-500' },
    { name: 'KlaySwap LP', apy: 12.5, allocation: 35, icon: '🔄', color: 'bg-green-500' },
    { name: 'Compound', apy: 7.8, allocation: 25, icon: '📈', color: 'bg-purple-500' }
  ];

  const connectWallet = () => {
    setUserData(prev => ({
      ...prev,
      connected: true,
      balance: 1045.32,
      earned: 186.42
    }));
  };

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (amount > 0) {
      setUserData(prev => ({
        ...prev,
        balance: prev.balance + amount,
        transactions: [{
          id: Date.now().toString(),
          type: 'deposit',
          amount,
          timestamp: new Date().toLocaleString(),
          status: 'completed'
        }, ...prev.transactions]
      }));
      setDepositAmount('');
      setIsDepositModalOpen(false);
    }
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (amount > 0 && amount <= userData.balance) {
      setUserData(prev => ({
        ...prev,
        balance: prev.balance - amount,
        transactions: [{
          id: Date.now().toString(),
          type: 'withdraw',
          amount,
          timestamp: new Date().toLocaleString(),
          status: 'completed'
        }, ...prev.transactions]
      }));
      setWithdrawAmount('');
      setIsWithdrawModalOpen(false);
    }
  };

  if (!userData.connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Wallet className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">LINE Yield</h1>
            <p className="text-gray-600 mb-6">Earn up to 8.5% APY on your USDT. No fees, no complexity.</p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Fuel className="w-4 h-4 text-green-500" />
                <span>Fuelless transactions</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Secure & audited</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Zap className="w-4 h-4 text-green-500" />
                <span>Auto-rebalancing</span>
              </div>
            </div>

            <Button onClick={connectWallet} className="w-full bg-green-500 hover:bg-green-600">
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-500 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg">LINE Yield</span>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90">Connected</div>
            <div className="text-xs">0x4F4E...7a2B</div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="text-sm opacity-90">Total Balance</div>
              <div className="text-2xl font-bold">${userData.balance.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="text-sm opacity-90">Current APY</div>
              <div className="text-2xl font-bold">{userData.apy.toFixed(2)}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button 
            onClick={() => setIsDepositModalOpen(true)}
            className="bg-green-500 hover:bg-green-600 h-12"
          >
            <ArrowUpRight className="w-4 h-4 mr-2" />
            Deposit
          </Button>
          <Button 
            onClick={() => setIsWithdrawModalOpen(true)}
            variant="outline"
            className="h-12"
          >
            <ArrowDownLeft className="w-4 h-4 mr-2" />
            Withdraw
          </Button>
        </div>

        {/* Strategy Allocation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Strategy Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {strategies.map((strategy, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${strategy.color} flex items-center justify-center text-white text-sm`}>
                        {strategy.icon}
                      </div>
                      <div>
                        <div className="font-medium">{strategy.name}</div>
                        <div className="text-sm text-gray-500">{strategy.allocation}% allocation</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">{strategy.apy}% APY</div>
                    </div>
                  </div>
                  <Progress value={strategy.allocation} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userData.transactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tx.type === 'deposit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {tx.type === 'deposit' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="font-medium capitalize">{tx.type}</div>
                      <div className="text-sm text-gray-500">{tx.timestamp}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </div>
                    <Badge variant={tx.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {userData.transactions.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No transactions yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deposit Modal */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Deposit USDT</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Amount</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                />
                <div className="text-right text-sm text-gray-500 mt-1">
                  Wallet Balance: 1,245.32 USDT
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleDeposit}
                  className="flex-1 bg-green-500 hover:bg-green-600"
                >
                  Confirm Deposit
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setDepositAmount('1245.32')}
                >
                  Max
                </Button>
              </div>
              <Button 
                variant="ghost" 
                onClick={() => setIsDepositModalOpen(false)}
                className="w-full"
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Withdraw Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Withdraw USDT</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Amount</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
                <div className="text-right text-sm text-gray-500 mt-1">
                  Available: ${userData.balance.toFixed(2)} USDT
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleWithdraw}
                  className="flex-1 bg-green-500 hover:bg-green-600"
                >
                  Confirm Withdrawal
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setWithdrawAmount(userData.balance.toString())}
                >
                  Max
                </Button>
              </div>
              <Button 
                variant="ghost" 
                onClick={() => setIsWithdrawModalOpen(false)}
                className="w-full"
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default LineYieldApp;
