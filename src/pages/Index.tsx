import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useVault } from '../hooks/useVault';
import { BalanceCard } from '../components/BalanceCard';
import { StrategyAllocation } from '../components/StrategyAllocation';
import { TransactionModal } from '../components/TransactionModal';
import { Button } from '@/components/ui/button';
import { VAULT_ADDRESS } from '../utils/constants';
import { ArrowUpRight, ArrowDownLeft, Wallet, TrendingUp, DollarSign, Percent } from 'lucide-react';

const Dashboard = () => {
  const { wallet } = useWallet();
  const { vaultData, isLoading, deposit, withdraw, isDepositing, isWithdrawing } = 
    useVault(VAULT_ADDRESS);
  
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  if (!wallet.isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please connect your wallet</h1>
          <p className="text-muted-foreground">You need to connect your wallet to access the dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Manage your USDT investments and track your earnings</p>
          </div>
          
          <div className="flex items-center gap-3 bg-card/60 backdrop-blur-sm border border-border rounded-xl px-4 py-3">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
              </p>
              <p className="text-xs text-muted-foreground">Balance: {wallet.balance} USDT</p>
            </div>
            <div className="w-3 h-3 bg-yield rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-2xl p-6 shadow-lg border animate-slide-up">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
                <p className="text-2xl font-bold text-foreground">
                  ${vaultData?.userAssets || '0.00'}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-secondary">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">2.4% this month</span>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-lg border animate-slide-up">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current APY</p>
                <p className="text-2xl font-bold text-foreground">
                  {vaultData?.apy || '8.64'}%
                </p>
              </div>
              <div className="w-12 h-12 bg-yield/10 rounded-xl flex items-center justify-center">
                <Percent className="w-6 h-6 text-yield" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-secondary">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">0.32% from yesterday</span>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-lg border animate-slide-up">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Earned This Month</p>
                <p className="text-2xl font-bold text-foreground">$186.42</p>
              </div>
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-secondary" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-secondary">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">14% vs last month</span>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-card rounded-2xl p-6 shadow-lg border animate-slide-up">
            <h3 className="text-xl font-semibold mb-6">Deposit USDT</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Amount to Deposit</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <span className="absolute right-3 top-3 text-sm text-muted-foreground">USDT</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  className="flex-1" 
                  onClick={() => setIsDepositModalOpen(true)}
                  disabled={isDepositing}
                >
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Deposit
                </Button>
                <Button variant="outline" className="px-6">
                  Max
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-lg border animate-slide-up">
            <h3 className="text-xl font-semibold mb-6">Withdraw USDT</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Amount to Withdraw</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <span className="absolute right-3 top-3 text-sm text-muted-foreground">USDT</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  className="flex-1" 
                  onClick={() => setIsWithdrawModalOpen(true)}
                  disabled={isWithdrawing}
                >
                  <ArrowDownLeft className="w-4 h-4 mr-2" />
                  Withdraw
                </Button>
                <Button variant="outline" className="px-6">
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
          <div className="animate-slide-up">
            <StrategyAllocation strategies={vaultData.strategies} />
          </div>
        )}

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
