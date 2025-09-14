import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useSupabaseVault } from '../hooks/useSupabaseVault';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { BalanceCard } from '../components/BalanceCard';
import { StrategyAllocation } from '../components/StrategyAllocation';
import { TransactionModal } from '../components/TransactionModal';
import { TransactionHistory } from '../components/TransactionHistory';
import { NotificationsPanel } from '../components/NotificationsPanel';
import { LoadingCard, LoadingSpinner } from '../components/LoadingSpinner';
import { AuthModal } from '../components/AuthModal';
import { Button } from '@/components/ui/button';
import { VAULT_ADDRESS } from '../utils/constants';
import { ArrowUpRight, ArrowDownLeft, Wallet, TrendingUp, DollarSign, Percent, RefreshCw } from 'lucide-react';

const Dashboard = () => {
  const { wallet } = useWallet();
  const { isAuthenticated } = useSupabaseAuth();
  const { 
    vaultData, 
    isLoading, 
    transactionHistory, 
    isLoadingHistory,
    deposit, 
    withdraw, 
    isDepositing, 
    isWithdrawing,
    refreshVaultData,
    refreshTransactionHistory
  } = useSupabaseVault();
  
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  const handleRefresh = () => {
    refreshVaultData();
    refreshTransactionHistory();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 text-center max-w-md w-full animate-scale-in">
          <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Welcome to LINE Yield</h1>
          <p className="text-muted-foreground mb-6">Create an account to access your yield dashboard and start earning automated yield</p>
          <Button 
            onClick={() => window.location.href = '/'}
            className="w-full h-12 bg-gradient-to-r from-emerald-400 to-emerald-500 text-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            <Wallet className="w-5 h-5 mr-2" />
            Get Started
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 relative">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float" style={{animationDelay: '4s'}}></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        
        {/* Dashboard Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Manage your USDT investments and track your earnings</p>
          </div>
          
          <div className="flex items-center gap-4">
            <NotificationsPanel />
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="border-2 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            
            <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 shadow-lg">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">
                  {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                </p>
                <p className="text-xs text-muted-foreground">Balance: {wallet.balance} USDT</p>
              </div>
              <div className="w-3 h-3 bg-yield rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {isLoading ? (
            <>
              <LoadingCard className="animate-slide-up" />
              <LoadingCard className="animate-slide-up animate-delay-1" />
              <LoadingCard className="animate-slide-up animate-delay-2" />
            </>
          ) : (
            <>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 animate-slide-up hover:shadow-xl transition-all duration-300 group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
                    <p className="text-2xl font-bold text-foreground">
                      ${vaultData?.userAssets || '0.00'}
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

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 animate-slide-up animate-delay-1 hover:shadow-xl transition-all duration-300 group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Current APY</p>
                    <p className="text-2xl font-bold text-foreground">
                      {vaultData?.apy || '8.64'}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-yield/10 to-yield/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Percent className="w-6 h-6 text-yield" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-secondary bg-secondary/10 px-3 py-1 rounded-full">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">0.32% from yesterday</span>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 animate-slide-up animate-delay-2 hover:shadow-xl transition-all duration-300 group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Earned This Month</p>
                    <p className="text-2xl font-bold text-foreground">$186.42</p>
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
            </>
          )}
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 animate-slide-up hover:shadow-xl transition-all duration-300">
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
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  />
                  <span className="absolute right-3 top-3 text-sm text-muted-foreground font-medium">USDT</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300" 
                  onClick={() => setIsDepositModalOpen(true)}
                  disabled={isDepositing}
                >
                  {isDepositing ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <ArrowUpRight className="w-4 h-4 mr-2" />
                      Deposit
                    </>
                  )}
                </Button>
                <Button variant="outline" className="px-6 border-2 hover:bg-green-50 hover:border-green-300 transition-all duration-200">
                  Max
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 animate-slide-up animate-delay-1 hover:shadow-xl transition-all duration-300">
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
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  />
                  <span className="absolute right-3 top-3 text-sm text-muted-foreground font-medium">USDT</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300" 
                  onClick={() => setIsWithdrawModalOpen(true)}
                  disabled={isWithdrawing}
                >
                  {isWithdrawing ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <ArrowDownLeft className="w-4 h-4 mr-2" />
                      Withdraw
                    </>
                  )}
                </Button>
                <Button variant="outline" className="px-6 border-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200">
                  Max
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Balance Card */}
        {!isLoading && vaultData && (
          <div className="animate-slide-up mb-8">
            <BalanceCard vaultData={vaultData} isLoading={isLoading} />
          </div>
        )}

        {/* Strategy Allocation */}
        {vaultData?.strategies && vaultData.strategies.length > 0 && (
          <div className="animate-slide-up mb-8">
            <StrategyAllocation strategies={vaultData.strategies} />
          </div>
        )}

        {/* Transaction History */}
        <div className="animate-slide-up">
          <TransactionHistory 
            transactions={transactionHistory}
            isLoading={isLoadingHistory}
            onRefresh={refreshTransactionHistory}
          />
        </div>

        {/* Transaction Modals */}
        <TransactionModal
          isOpen={isDepositModalOpen}
          onClose={() => setIsDepositModalOpen(false)}
          type="deposit"
          onSubmit={deposit}
          maxAmount={wallet.balance}
          isLoading={isDepositing}
          currentApy={vaultData?.apy}
        />

        <TransactionModal
          isOpen={isWithdrawModalOpen}
          onClose={() => setIsWithdrawModalOpen(false)}
          type="withdraw"
          onSubmit={withdraw}
          maxAmount={vaultData?.userAssets || '0'}
          isLoading={isWithdrawing}
        />
      </div>
    </div>
  );
};

export default Dashboard;
