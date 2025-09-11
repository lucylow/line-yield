import React from 'react';
import { StrategyAllocation as StrategyAllocationType } from '../types/vault';
import { formatCurrency } from '../utils/formatters';
import { PieChart, Target, TrendingUp } from 'lucide-react';

interface StrategyAllocationProps {
  strategies: StrategyAllocationType[];
}

export const StrategyAllocation: React.FC<StrategyAllocationProps> = ({ strategies }) => {
  return (
    <div className="gradient-card rounded-2xl p-6 shadow-card border animate-slide-up">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <PieChart className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Strategy Allocation</h3>
          <p className="text-sm text-muted-foreground">How your funds are distributed</p>
        </div>
      </div>

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