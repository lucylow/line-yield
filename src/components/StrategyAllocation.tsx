import React from 'react';
import { StrategyAllocation as StrategyAllocationType } from '../types/vault';
import { formatCurrency } from '../utils/formatters';
import { PieChart, Target, TrendingUp, RefreshCw, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StrategyAllocationProps {
  strategies: StrategyAllocationType[];
  lastRebalance?: string;
  nextRebalance?: string;
  canRebalance?: boolean;
  needsRebalance?: boolean;
  onRebalance?: () => void;
}

export const StrategyAllocation: React.FC<StrategyAllocationProps> = ({ 
  strategies,
  lastRebalance,
  nextRebalance,
  canRebalance = false,
  needsRebalance = false,
  onRebalance
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="gradient-card rounded-2xl p-6 shadow-card border animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center">
            <PieChart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Auto-Rebalancing</h3>
            <p className="text-sm text-muted-foreground">Automatically optimized strategy allocation</p>
          </div>
        </div>
        {canRebalance && needsRebalance && (
          <Button
            onClick={onRebalance}
            size="sm"
            className="bg-gradient-to-r from-emerald-400 to-emerald-500 text-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Rebalance Now
          </Button>
        )}
      </div>

      {/* Rebalancing Status */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg mb-6">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-600" />
          <div>
            <div className="text-xs text-gray-600">Last Rebalance</div>
            <div className="text-sm font-medium">{formatDate(lastRebalance)}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-gray-600" />
          <div>
            <div className="text-xs text-gray-600">Next Rebalance</div>
            <div className="text-sm font-medium">{formatDate(nextRebalance)}</div>
          </div>
        </div>
      </div>

      {/* Rebalancing Alert */}
      {needsRebalance && (
        <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg mb-6">
          <AlertCircle className="w-4 h-4 text-orange-600" />
          <span className="text-sm text-orange-800">
            Rebalancing recommended to optimize returns
          </span>
        </div>
      )}

      <div className="space-y-4">
        {strategies.map((strategy, index) => (
          <div
            key={strategy.name}
            className="bg-secondary/30 rounded-lg p-4 hover:bg-secondary/50 transition-colors"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium text-foreground">{strategy.name}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-muted-foreground">
                    TVL: ${formatCurrency(parseFloat(strategy.tvl.replace(',', '')))}
                  </span>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-yield" />
                    <span className="text-sm font-medium text-yield">
                      {(strategy.apy * 100).toFixed(2)}% APY
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-foreground">
                  {strategy.allocation}%
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  index === 0 ? 'bg-yield' : 
                  index === 1 ? 'bg-primary' : 'bg-warning'
                }`}
                style={{ width: `${strategy.allocation}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-accent/30 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-accent-foreground">
            Diversification Score
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Risk level optimized for stable yields
          </span>
          <span className="text-sm font-bold text-yield">
            Excellent
          </span>
        </div>
      </div>
    </div>
  );
};