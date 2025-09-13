import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  CheckCircle,
  User,
  MessageSquare,
  Plus,
  ExternalLink
} from 'lucide-react';
import { miniDappSDK } from '../services/MiniDappSDK';
import { useMiniDappTitle } from '@shared/hooks';

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
  status: 'completed' | 'pending' | 'failed';
}

interface Strategy {
  name: string;
  apy: number;
  allocation: number;
  icon: string;
  color: string;
}

const WebMiniDapp: React.FC = () => {
  // Set proper Mini Dapp title
  useMiniDappTitle('LINE Yield');
  
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

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

  // Check if wallet is already connected on mount
  useEffect(() => {
    async function checkWallet() {
      try {
        const accounts = await miniDappSDK.kaia_accounts();
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
          const type = miniDappSDK.getWalletType();
          setWalletType(type);
          const bal = await miniDappSDK.kaia_getBalance(accounts[0]);
          setBalance(bal);
          setUserData(prev => ({
            ...prev,
            connected: true,
            balance: parseFloat(bal) || 0
          }));
        }
      } catch (error) {
        console.error('Error checking wallet:', error);
      }
    }
    checkWallet();
  }, []);

  // Wallet connect handler
  const connectWallet = async () => {
    setIsConnecting(true);
    setConnectionError(null);
    
    try {
      // Request wallet access (this triggers wallet connect flow)
      const accounts = await miniDappSDK.kaia_requestAccounts();
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
        const type = miniDappSDK.getWalletType();
        setWalletType(type);
        const bal = await miniDappSDK.kaia_getBalance(accounts[0]);
        setBalance(bal);
        setUserData(prev => ({
          ...prev,
          connected: true,
          balance: parseFloat(bal) || 0
        }));
      }
    } catch (error) {
      console.error('Wallet connect failed', error);
      setConnectionError(error instanceof Error ? error.message : 'Failed to connect wallet');
    }
    setIsConnecting(false);
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

  // Show wallet connection screen if no wallet connected
  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Welcome to Web Mini Dapp</h1>
          <p className="text-muted-foreground mb-6">
            Please connect your wallet to continue. This is required to access the Mini Dapp features.
          </p>
          
          {/* User Flow Indicator */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600">1</span>
              </div>
              <span className="text-sm text-gray-700">Access Mini Dapp (Web)</span>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600">2</span>
              </div>
              <span className="text-sm text-gray-700">Wallet Connect</span>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-gray-400">3</span>
              </div>
              <span className="text-sm text-gray-500">Play Mini Dapp</span>
            </div>
          </div>

          {connectionError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{connectionError}</p>
            </div>
          )}

          <Button 
            onClick={connectWallet} 
            disabled={isConnecting}
            className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            {isConnecting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5 mr-2" />
                Connect Wallet
              </>
            )}
          </Button>

          <div className="mt-4 text-xs text-muted-foreground">
            <p>Supported wallets: Kaia Wallet, MetaMask</p>
            <p className="mt-1">Web version requires immediate wallet connection</p>
          </div>
        </div>
      </div>
    );
  }

  // Wallet connected - show main dApp UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 relative">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float" style={{animationDelay: '2s'}}></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Web Mini Dapp Dashboard</h1>
            <p className="text-muted-foreground">Manage your USDT investments and track your earnings</p>
          </div>
          
          <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 shadow-lg">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
              </p>
              <p className="text-xs text-muted-foreground">Balance: {balance} USDT</p>
              <p className="text-xs text-muted-foreground">Type: {walletType}</p>
            </div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
                <p className="text-2xl font-bold text-foreground">
                  ${userData.balance.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-secondary bg-secondary/10 px-3 py-1 rounded-full">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">2.4% this month</span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current APY</p>
                <p className="text-2xl font-bold text-foreground">
                  {userData.apy}%
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-yield/10 to-yield/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-6 h-6 text-yield" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-secondary bg-secondary/10 px-3 py-1 rounded-full">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">0.32% from yesterday</span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Earned This Month</p>
                <p className="text-2xl font-bold text-foreground">${userData.earned.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-secondary/10 to-secondary/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="w-6 h-6 text-secondary" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-secondary bg-secondary/10 px-3 py-1 rounded-full">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">14% vs last month</span>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold">Deposit USDT</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Amount to Deposit</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0.00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  />
                  <span className="absolute right-3 top-3 text-sm text-muted-foreground font-medium">USDT</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300" 
                  onClick={handleDeposit}
                >
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Deposit
                </Button>
                <Button variant="outline" className="px-6 border-2 hover:bg-green-50 hover:border-green-300 transition-all duration-200">
                  Max
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                <ArrowDownLeft className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold">Withdraw USDT</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Amount to Withdraw</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  />
                  <span className="absolute right-3 top-3 text-sm text-muted-foreground font-medium">USDT</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300" 
                  onClick={handleWithdraw}
                >
                  <ArrowDownLeft className="w-4 h-4 mr-2" />
                  Withdraw
                </Button>
                <Button variant="outline" className="px-6 border-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200">
                  Max
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Strategy Allocation */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-8">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-600" />
            Strategy Allocation
          </h3>
          <div className="space-y-4">
            {strategies.map((strategy, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{strategy.icon}</span>
                  <div>
                    <p className="font-medium">{strategy.name}</p>
                    <p className="text-sm text-muted-foreground">{strategy.apy}% APY</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${strategy.color}`}
                      style={{width: `${strategy.allocation}%`}}
                    ></div>
                  </div>
                  <Badge variant="secondary">{strategy.allocation}%</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction History */}
        {userData.transactions.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />
              Recent Transactions
            </h3>
            <div className="space-y-3">
              {userData.transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      transaction.type === 'deposit' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      {transaction.type === 'deposit' ? (
                        <ArrowUpRight className="w-4 h-4 text-green-600" />
                      ) : (
                        <ArrowDownLeft className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium capitalize">{transaction.type}</p>
                      <p className="text-sm text-muted-foreground">{transaction.timestamp}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      transaction.type === 'deposit' ? 'text-green-600' : 'text-blue-600'
                    }`}>
                      {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Web-specific features */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-purple-600" />
            Web Mini Dapp Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">Immediate Wallet Connection</h4>
              <p className="text-sm text-purple-600">
                Web version requires wallet connection on initial access for full functionality.
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Cross-Platform Support</h4>
              <p className="text-sm text-blue-600">
                Compatible with Kaia Wallet, MetaMask, and other Web3 wallets.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebMiniDapp;

