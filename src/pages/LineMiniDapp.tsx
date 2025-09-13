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
  Eye
} from 'lucide-react';
import { miniDappSDK } from '../services/MiniDappSDK';
import { useLiff } from '../hooks/useLiff';
import { PaymentHistoryModal } from '../components/PaymentHistoryModal';
import { Transaction } from '../types/vault';
import { useMiniDappTitle } from '@shared/hooks';

interface UserData {
  connected: boolean;
  balance: number;
  apy: number;
  earned: number;
  transactions: Transaction[];
}


interface Strategy {
  name: string;
  apy: number;
  allocation: number;
  icon: string;
  color: string;
}

const LineMiniDapp: React.FC = () => {
  const { isInitialized, user, error: liffError } = useLiff();
  
  // Set proper Mini Dapp title
  useMiniDappTitle('LINE Yield');
  const [userConsent, setUserConsent] = useState(false);
  const [hasAddedOA, setHasAddedOA] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentStep, setCurrentStep] = useState<'consent' | 'add-oa' | 'play' | 'wallet'>('consent');

  const [userData, setUserData] = useState<UserData>({
    connected: false,
    balance: 0,
    apy: 8.65,
    earned: 0,
    transactions: []
  });

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isPaymentHistoryModalOpen, setIsPaymentHistoryModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [paymentHistoryTransactions, setPaymentHistoryTransactions] = useState<Transaction[]>([]);
  const [isLoadingPaymentHistory, setIsLoadingPaymentHistory] = useState(false);

  const strategies: Strategy[] = [
    { name: 'Aave Lending', apy: 5.2, allocation: 40, icon: '🏦', color: 'bg-blue-500' },
    { name: 'KlaySwap LP', apy: 12.5, allocation: 35, icon: '🔄', color: 'bg-green-500' },
    { name: 'Compound', apy: 7.8, allocation: 25, icon: '📈', color: 'bg-purple-500' }
  ];

  // Check wallet connection on mount
  useEffect(() => {
    const checkWallet = async () => {
      try {
        const accounts = await miniDappSDK.kaia_accounts();
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setWalletType(miniDappSDK.getWalletType());
          const bal = await miniDappSDK.kaia_getBalance(accounts[0]);
          setBalance(bal);
          setWalletConnected(true);
          setUserData(prev => ({
            ...prev,
            connected: true,
            balance: parseFloat(bal) || 0
          }));
        }
      } catch (error) {
        console.error('Error checking wallet:', error);
      }
    };

    if (isInitialized && hasAddedOA) {
      checkWallet();
    }
  }, [isInitialized, hasAddedOA]);

  // Consent to channel handler
  const handleConsentToChannel = () => {
    setUserConsent(true);
    setCurrentStep('add-oa');
  };

  // Add official account handler
  const handleAddOfficialAccount = () => {
    setHasAddedOA(true);
    setCurrentStep('play');
  };

  // Wallet Connect handler (triggered when needed)
  const handleWalletConnect = async () => {
    setIsConnecting(true);
    try {
      const accounts = await miniDappSDK.kaia_requestAccounts();
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setWalletType(miniDappSDK.getWalletType());
        const bal = await miniDappSDK.kaia_getBalance(accounts[0]);
        setBalance(bal);
        setWalletConnected(true);
        setUserData(prev => ({
          ...prev,
          connected: true,
          balance: parseFloat(bal) || 0
        }));
        setCurrentStep('play');
      }
    } catch (error) {
      console.error('Wallet connection failed', error);
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
          hash: `0x${Date.now().toString(16)}`,
          type: 'deposit',
          amount: amount.toString(),
          timestamp: Math.floor(Date.now() / 1000),
          status: 'confirmed'
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
          hash: `0x${Date.now().toString(16)}`,
          type: 'withdraw',
          amount: amount.toString(),
          timestamp: Math.floor(Date.now() / 1000),
          status: 'confirmed'
        }, ...prev.transactions]
      }));
      setWithdrawAmount('');
      setIsWithdrawModalOpen(false);
    }
  };

  // Function triggered to open payment history modal
  const openPaymentHistory = () => {
    setIsPaymentHistoryModalOpen(true);
    fetchPaymentHistory();
  };

  // Fetch payment history from backend or blockchain
  const fetchPaymentHistory = async () => {
    if (!walletAddress) return;
    setIsLoadingPaymentHistory(true);

    try {
      // Use local transactions directly (they're already in the correct format)
      const formattedTransactions: Transaction[] = userData.transactions;

      // In a real implementation, you would fetch from your backend API:
      // const response = await fetch(`/api/payment-history?user=${walletAddress}`);
      // if (!response.ok) throw new Error('Failed to fetch payment history');
      // const data: Transaction[] = await response.json();
      
      setPaymentHistoryTransactions(formattedTransactions);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      setPaymentHistoryTransactions([]);
    } finally {
      setIsLoadingPaymentHistory(false);
    }
  };

  // Show loading state while LIFF initializes
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <MessageSquare className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Initializing LINE Mini Dapp</h1>
          <p className="text-muted-foreground mb-6">Please wait while we set up your experience...</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if LIFF initialization failed
  if (liffError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Initialization Failed</h1>
          <p className="text-muted-foreground mb-6">{liffError}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="w-full h-12 bg-gradient-to-r from-red-400 to-red-500 text-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Step 1: Consent to Channel
  if (!userConsent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Welcome to LINE Yield</h1>
          <p className="text-muted-foreground mb-6">
            To use this Mini Dapp, you need to consent to our channel and add our official account.
          </p>
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-sm text-gray-700">Access LINE Mini Dapp</span>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600">2</span>
              </div>
              <span className="text-sm text-gray-700">Consent to Channel</span>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-gray-400">3</span>
              </div>
              <span className="text-sm text-gray-500">Add Official Account</span>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-gray-400">4</span>
              </div>
              <span className="text-sm text-gray-500">Play Mini Dapp</span>
            </div>
          </div>
          <Button 
            onClick={handleConsentToChannel}
            className="w-full h-12 bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Consent to Channel
          </Button>
        </div>
      </div>
    );
  }

  // Step 2: Add Official Account
  if (!hasAddedOA) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Plus className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Add Official Account</h1>
          <p className="text-muted-foreground mb-6">
            Please add our official LINE account to continue using the Mini Dapp.
          </p>
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-sm text-gray-700">Access LINE Mini Dapp</span>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-sm text-gray-700">Consent to Channel</span>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600">3</span>
              </div>
              <span className="text-sm text-gray-700">Add Official Account</span>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-gray-400">4</span>
              </div>
              <span className="text-sm text-gray-500">Play Mini Dapp</span>
            </div>
          </div>
          <Button 
            onClick={handleAddOfficialAccount}
            className="w-full h-12 bg-gradient-to-r from-blue-400 to-blue-500 text-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Official Account
          </Button>
        </div>
      </div>
    );
  }

  // Step 3: Play Mini Dapp (without wallet connection)
  if (!walletConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 relative">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">LINE Yield Mini Dapp</h1>
            <p className="text-muted-foreground">Welcome! You can now explore the Mini Dapp features.</p>
          </div>

          {/* Progress Indicator */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-sm text-gray-700">Access LINE Mini Dapp</span>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-sm text-gray-700">Consent to Channel</span>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-sm text-gray-700">Add Official Account</span>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-sm text-gray-700">Play Mini Dapp</span>
            </div>
          </div>

          {/* Demo Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  Yield Strategies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {strategies.map((strategy, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{strategy.icon}</span>
                        <div>
                          <p className="font-medium">{strategy.name}</p>
                          <p className="text-sm text-muted-foreground">{strategy.apy}% APY</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{strategy.allocation}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Current APY</span>
                    <span className="font-bold text-green-600">8.65%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total TVL</span>
                    <span className="font-bold">$2.4M</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Active Users</span>
                    <span className="font-bold">1,247</span>
                  </div>
                  <Progress value={75} className="w-full" />
                  <p className="text-xs text-muted-foreground">Strategy allocation optimized</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Wallet Connect Button - Only shown when needed */}
          <div className="text-center">
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg max-w-md mx-auto">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Wallet className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Ready to Start Earning?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect your wallet when you're ready to deposit or claim rewards.
                </p>
                <Button 
                  onClick={handleWalletConnect}
                  disabled={isConnecting}
                  className="w-full h-12 bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  {isConnecting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-5 h-5 mr-2" />
                      Connect Wallet (When Needed)
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Full Mini Dapp with wallet connected
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 relative">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float" style={{animationDelay: '2s'}}></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">LINE Yield Dashboard</h1>
            <p className="text-muted-foreground">Manage your USDT investments and track your earnings</p>
          </div>
          
          <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 shadow-lg">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
              </p>
              <p className="text-xs text-muted-foreground">Balance: {balance} USDT</p>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
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
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />
              Recent Transactions
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={openPaymentHistory}
              className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
            >
              <Eye className="w-4 h-4 mr-2" />
              View All History
            </Button>
          </div>
          {userData.transactions.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-4">No transactions yet</p>
              <p className="text-sm text-gray-400">Start by depositing USDT to begin earning yield</p>
            </div>
          ) : (
            <div className="space-y-3">
              {userData.transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.hash} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
                      {transaction.type === 'deposit' ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payment History Modal */}
      <PaymentHistoryModal
        isOpen={isPaymentHistoryModalOpen}
        onClose={() => setIsPaymentHistoryModalOpen(false)}
        transactions={paymentHistoryTransactions}
        isLoading={isLoadingPaymentHistory}
        onRefresh={fetchPaymentHistory}
      />
    </div>
  );
};

export default LineMiniDapp;
