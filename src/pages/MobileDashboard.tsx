import React, { useState } from 'react';
import { MobileNavigation } from '../components/MobileNavigation';
import { MobileBottomNavigation } from '../components/MobileBottomNavigation';
import { MobileCard, MobileCardHeader, MobileCardContent, MobileCardTitle } from '../components/MobileCard';
import { MobileButton } from '../components/MobileButton';
import { MobileInput } from '../components/MobileInput';
import { MobileModal, MobileModalActions } from '../components/MobileModal';
import { MobilePullToRefresh } from '../components/MobilePullToRefresh';
import { MobileFadeIn, MobileStagger } from '../components/MobileAnimations';
import { MobileForm, MobileFormField, MobileFormActions } from '../components/MobileForm';
import { useWallet } from '@/hooks/useWallet';
import { useSupabaseVault } from '@/hooks/useSupabaseVault';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  TrendingUp, 
  DollarSign, 
  Percent,
  RefreshCw,
  BarChart3,
  History,
  Settings,
  Zap
} from 'lucide-react';

export const MobileDashboard: React.FC = () => {
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
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const handleRefreshData = () => {
    refreshVaultData();
    refreshTransactionHistory();
  };

  const handleDeposit = async () => {
    if (depositAmount && parseFloat(depositAmount) > 0) {
      await deposit(depositAmount);
      setDepositAmount('');
      setIsDepositModalOpen(false);
    }
  };

  const handleWithdraw = async () => {
    if (withdrawAmount && parseFloat(withdrawAmount) > 0) {
      await withdraw(withdrawAmount);
      setWithdrawAmount('');
      setIsWithdrawModalOpen(false);
    }
  };

  const handleRefresh = async () => {
    await refreshVaultData();
    await refreshTransactionHistory();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
        <MobileCard className="text-center max-w-sm w-full">
          <div className="p-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-xl font-bold mb-3 text-gray-800">Welcome to LINE Yield</h1>
            <p className="text-gray-600 mb-6 text-sm">
              Create an account to access your yield dashboard and start earning automated yield
            </p>
            <MobileButton
              onClick={() => window.location.href = '/'}
              fullWidth
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Get Started
            </MobileButton>
          </div>
        </MobileCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      {/* Mobile Navigation */}
      <MobileNavigation />

      {/* Pull to Refresh Wrapper */}
      <MobilePullToRefresh onRefresh={handleRefresh}>
        {/* Main Content */}
        <div className="pt-20 px-4 pb-24">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 text-sm">Manage your USDT investments</p>
            </div>
            <MobileButton
              variant="ghost"
              size="sm"
              onClick={handleRefreshData}
              className="p-2"
            >
              <RefreshCw className="w-4 h-4" />
            </MobileButton>
          </div>

          {/* Wallet Status */}
          {wallet.isConnected && (
            <MobileCard padding="sm" className="bg-green-50 border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">
                    {wallet.address?.slice(0, 8)}...{wallet.address?.slice(-6)}
                  </p>
                  <p className="text-xs text-green-600">
                    Balance: {wallet.balance} USDT
                  </p>
                </div>
              </div>
            </MobileCard>
          )}
        </div>

        {/* Stats Cards */}
        <div className="space-y-4 mb-6">
          <MobileCard>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Balance</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${vaultData?.userAssets || '0.00'}
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">+2.4% this month</span>
            </div>
          </MobileCard>

          <MobileCard>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Current APY</p>
                <p className="text-2xl font-bold text-gray-900">
                  {vaultData?.apy || '8.64'}%
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                <Percent className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">+0.32% from yesterday</span>
            </div>
          </MobileCard>

          <MobileCard>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Earned This Month</p>
                <p className="text-2xl font-bold text-gray-900">$186.42</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">+14% vs last month</span>
            </div>
          </MobileCard>
        </div>

        {/* Action Cards */}
        <div className="space-y-4 mb-6">
          {/* Deposit Card */}
          <MobileCard>
            <MobileCardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4 text-green-600" />
                </div>
                <MobileCardTitle size="sm">Deposit USDT</MobileCardTitle>
              </div>
            </MobileCardHeader>
            <MobileCardContent>
              <div className="space-y-4">
                <MobileInput
                  label="Amount to Deposit"
                  type="number"
                  placeholder="0.00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  icon={<DollarSign className="w-4 h-4" />}
                />
                <div className="flex gap-3">
                  <MobileButton
                    fullWidth
                    onClick={() => setIsDepositModalOpen(true)}
                    disabled={isDepositing || !depositAmount}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white"
                  >
                    {isDepositing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <ArrowUpRight className="w-4 h-4 mr-2" />
                        Deposit
                      </>
                    )}
                  </MobileButton>
                  <MobileButton
                    variant="outline"
                    onClick={() => setDepositAmount(wallet.balance)}
                    className="px-4"
                  >
                    Max
                  </MobileButton>
                </div>
              </div>
            </MobileCardContent>
          </MobileCard>

          {/* Withdraw Card */}
          <MobileCard>
            <MobileCardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                  <ArrowDownLeft className="w-4 h-4 text-blue-600" />
                </div>
                <MobileCardTitle size="sm">Withdraw USDT</MobileCardTitle>
              </div>
            </MobileCardHeader>
            <MobileCardContent>
              <div className="space-y-4">
                <MobileInput
                  label="Amount to Withdraw"
                  type="number"
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  icon={<DollarSign className="w-4 h-4" />}
                />
                <div className="flex gap-3">
                  <MobileButton
                    fullWidth
                    onClick={() => setIsWithdrawModalOpen(true)}
                    disabled={isWithdrawing || !withdrawAmount}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                  >
                    {isWithdrawing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <ArrowDownLeft className="w-4 h-4 mr-2" />
                        Withdraw
                      </>
                    )}
                  </MobileButton>
                  <MobileButton
                    variant="outline"
                    onClick={() => setWithdrawAmount(vaultData?.userAssets || '0')}
                    className="px-4"
                  >
                    Max
                  </MobileButton>
                </div>
              </div>
            </MobileCardContent>
          </MobileCard>
        </div>

        {/* Strategy Allocation */}
        {vaultData?.strategies && vaultData.strategies.length > 0 && (
          <MobileCard className="mb-6">
            <MobileCardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                </div>
                <MobileCardTitle size="sm">Strategy Allocation</MobileCardTitle>
              </div>
            </MobileCardHeader>
            <MobileCardContent>
              <div className="space-y-3">
                {vaultData.strategies.map((strategy, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900">{strategy.name}</p>
                      <p className="text-sm text-gray-600">{strategy.apy}% APY</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{strategy.allocation}%</p>
                      <p className="text-xs text-gray-600">${strategy.tvl}</p>
                    </div>
                  </div>
                ))}
              </div>
            </MobileCardContent>
          </MobileCard>
        )}

        {/* Transaction History */}
        <MobileCard>
          <MobileCardHeader>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                <History className="w-4 h-4 text-gray-600" />
              </div>
              <MobileCardTitle size="sm">Recent Transactions</MobileCardTitle>
            </div>
          </MobileCardHeader>
          <MobileCardContent>
            {isLoadingHistory ? (
              <div className="text-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">Loading transactions...</p>
              </div>
            ) : transactionHistory && transactionHistory.length > 0 ? (
              <div className="space-y-3">
                {transactionHistory.slice(0, 5).map((tx, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        tx.type === 'deposit' ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        {tx.type === 'deposit' ? (
                          <ArrowUpRight className="w-4 h-4 text-green-600" />
                        ) : (
                          <ArrowDownLeft className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 capitalize">{tx.type}</p>
                        <p className="text-xs text-gray-600">
                          {new Date(tx.created_at || Date.now()).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        tx.type === 'deposit' ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {tx.type === 'deposit' ? '+' : '-'}${tx.amount}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{tx.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <History className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">No transactions yet</p>
                <p className="text-xs text-gray-400">Start by depositing USDT</p>
              </div>
            )}
          </MobileCardContent>
        </MobileCard>
      </div>

      {/* Deposit Modal */}
      <MobileModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        title="Confirm Deposit"
      >
        <div className="space-y-4">
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <p className="text-sm text-gray-600 mb-1">Deposit Amount</p>
            <p className="text-2xl font-bold text-green-600">${depositAmount}</p>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Current APY</span>
              <span className="font-medium">{vaultData?.apy || '8.64'}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Estimated Monthly Yield</span>
              <span className="font-medium">
                ${((parseFloat(depositAmount) * (vaultData?.apy || 8.64)) / 100 / 12).toFixed(2)}
              </span>
            </div>
          </div>
          
          <MobileModalActions>
            <MobileButton
              variant="outline"
              fullWidth
              onClick={() => setIsDepositModalOpen(false)}
            >
              Cancel
            </MobileButton>
            <MobileButton
              fullWidth
              onClick={handleDeposit}
              disabled={isDepositing}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white"
            >
              {isDepositing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Confirm Deposit
                </>
              )}
            </MobileButton>
          </MobileModalActions>
        </div>
      </MobileModal>

      {/* Withdraw Modal */}
      <MobileModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        title="Confirm Withdrawal"
      >
        <div className="space-y-4">
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-gray-600 mb-1">Withdrawal Amount</p>
            <p className="text-2xl font-bold text-blue-600">${withdrawAmount}</p>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Available Balance</span>
              <span className="font-medium">${vaultData?.userAssets || '0.00'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Processing Time</span>
              <span className="font-medium">1-2 minutes</span>
            </div>
          </div>
          
          <MobileModalActions>
            <MobileButton
              variant="outline"
              fullWidth
              onClick={() => setIsWithdrawModalOpen(false)}
            >
              Cancel
            </MobileButton>
            <MobileButton
              fullWidth
              onClick={handleWithdraw}
              disabled={isWithdrawing}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white"
            >
              {isWithdrawing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Confirm Withdrawal
                </>
              )}
            </MobileButton>
          </MobileModalActions>
        </div>
      </MobileModal>
      </MobilePullToRefresh>

      {/* Bottom Navigation */}
      <MobileBottomNavigation />
    </div>
  );
};

export default MobileDashboard;
