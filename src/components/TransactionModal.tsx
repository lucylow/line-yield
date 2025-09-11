import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWallet } from '../hooks/useWallet';
import { formatCurrency } from '../utils/formatters';
import { ArrowUpRight, ArrowDownLeft, Info, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'deposit' | 'withdraw';
  onSubmit: (amount: string) => Promise<any>;
  maxAmount: string;
  isLoading: boolean;
  currentApy?: number;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  type,
  onSubmit,
  maxAmount,
  isLoading,
  currentApy = 0.085,
}) => {
  const [amount, setAmount] = useState('');
  const { wallet } = useWallet();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    try {
      await onSubmit(amount);
      setAmount('');
      onClose();
      toast({
        title: `${type === 'deposit' ? 'Deposit' : 'Withdrawal'} Successful`,
        description: `Transaction submitted successfully. Gas fees sponsored!`,
      });
    } catch (error) {
      console.error(`${type} failed:`, error);
      toast({
        title: `${type === 'deposit' ? 'Deposit' : 'Withdrawal'} Failed`,
        description: "Please try again or contact support",
        variant: "destructive",
      });
    }
  };

  const setMaxAmount = () => {
    setAmount(maxAmount);
  };

  const isDeposit = type === 'deposit';
  const Icon = isDeposit ? ArrowUpRight : ArrowDownLeft;
  const projectedYield = parseFloat(amount || '0') * currentApy;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-card to-card/80 p-8">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-4 text-2xl">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                isDeposit ? 'bg-yield shadow-yield' : 'bg-warning shadow-warning'
              }`}>
                <Icon className={`w-6 h-6 ${isDeposit ? 'text-yield-foreground' : 'text-warning-foreground'}`} />
              </div>
              <div>
                <div className="font-bold tracking-tight">
                  {isDeposit ? 'Deposit USDT' : 'Withdraw USDT'}
                </div>
                <div className="text-sm font-normal text-muted-foreground">
                  {isDeposit ? 'Start earning yield today' : 'Access your funds anytime'}
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-8 mt-8">
            <div className="space-y-4">
              <Label htmlFor="amount" className="text-lg font-semibold">
                Amount to {isDeposit ? 'Deposit' : 'Withdraw'}
              </Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={maxAmount}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="text-2xl pr-20 h-16 border-2 rounded-2xl font-bold"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-6">
                  <span className="text-muted-foreground font-semibold text-lg">USDT</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-secondary/50 rounded-xl">
                <span className="text-sm font-medium text-muted-foreground">
                  {isDeposit ? 'Wallet Balance' : 'Available'}: ${formatCurrency(parseFloat(maxAmount))}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={setMaxAmount}
                  className="text-primary hover:text-primary/80 font-semibold"
                >
                  Use Max
                </Button>
              </div>
            </div>

            {/* Transaction Details */}
            <div className="bg-accent/80 rounded-2xl p-6 space-y-4 border">
              <div className="flex items-center gap-3 text-lg font-semibold text-accent-foreground">
                <Info className="w-5 h-5" />
                Transaction Details
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-card/60 rounded-xl">
                  <span className="text-muted-foreground font-medium">Current APY</span>
                  <span className="font-bold text-lg">{(currentApy * 100).toFixed(2)}%</span>
                </div>
                
                {isDeposit && amount && (
                  <div className="flex justify-between items-center p-3 bg-yield-bg rounded-xl">
                    <span className="text-yield/80 font-medium">Projected yearly yield</span>
                    <span className="font-bold text-yield text-lg">
                      +${formatCurrency(projectedYield)}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between items-center p-3 bg-yield-bg rounded-xl">
                  <span className="text-yield/80 font-medium">Gas Fee</span>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yield" />
                    <span className="font-bold text-yield">Free (Sponsored)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 h-14 text-lg font-semibold border-2"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant={isDeposit ? "yield" : "warning"}
                disabled={!amount || parseFloat(amount) <= 0 || isLoading}
                className="flex-1 h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  `${isDeposit ? 'Deposit' : 'Withdraw'} ${amount || '0'} USDT`
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};