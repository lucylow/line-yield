import React from 'react';
import { VaultData } from '../types/vault';
import { formatCurrency } from '../utils/formatters';
import { TrendingUp, DollarSign, Target } from 'lucide-react';

interface BalanceCardProps {
  vaultData: VaultData;
  isLoading: boolean;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({ vaultData, isLoading }) => {
  if (isLoading) {
    return (
      <div className="gradient-card rounded-3xl p-8 shadow-lg border animate-fade-in">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-6 bg-muted rounded-lg w-32"></div>
              <div className="h-4 bg-muted rounded w-24"></div>
            </div>
            <div className="space-y-2">
              <div className="h-10 bg-muted rounded-lg w-32"></div>
              <div className="h-4 bg-muted rounded w-16 ml-auto"></div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-16 bg-muted rounded-xl"></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="h-16 bg-muted rounded-xl"></div>
              <div className="h-16 bg-muted rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gradient-card rounded-3xl p-8 shadow-lg border animate-slide-up hover:shadow-xl transition-all duration-500">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shadow-primary">
            <DollarSign className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h3 className="text-muted-foreground text-lg font-semibold">Total Balance</h3>
            <p className="text-sm text-muted-foreground">Principal + Yield Earned</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-foreground mb-2 tracking-tight">
            ${formatCurrency(parseFloat(vaultData.userAssets))}
          </div>
          <div className="text-sm text-muted-foreground font-medium">USDT</div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center p-5 bg-yield-bg rounded-2xl border border-yield/20 shadow-yield hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yield rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-yield-foreground" />
            </div>
            <span className="text-lg font-semibold text-yield">Earned Yield</span>
          </div>
          <div className="text-right">
            <div className="font-bold text-yield text-xl">
              +${formatCurrency(parseFloat(vaultData.earnedYield))}
            </div>
            <div className="text-sm text-yield/80 font-medium">
              +{((parseFloat(vaultData.earnedYield) / (parseFloat(vaultData.userAssets) - parseFloat(vaultData.earnedYield))) * 100).toFixed(2)}%
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-secondary/80 rounded-2xl p-5 border hover:shadow-md transition-all duration-300">
            <div className="text-sm text-muted-foreground mb-2 font-medium">Principal</div>
            <div className="font-bold text-foreground text-xl">
              ${formatCurrency(parseFloat(vaultData.userAssets) - parseFloat(vaultData.earnedYield))}
            </div>
          </div>
          
          <div className="bg-secondary/80 rounded-2xl p-5 border hover:shadow-md transition-all duration-300">
            <div className="text-sm text-muted-foreground mb-2 font-medium">Current APY</div>
            <div className="font-bold text-foreground text-xl">
              {(vaultData.apy * 100).toFixed(2)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};