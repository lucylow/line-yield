import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProgressIndicator } from './ProgressIndicator';
import { useWallet } from '../hooks/useWallet';
import { formatCurrency } from '../utils/formatters';
import { ArrowUpRight, ArrowDownLeft, Info, Zap, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UnsavedChangesDialog } from './UnsavedChangesDialog';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';

interface Step {
  id: string;
  title: string;
  description?: string;
  status: 'completed' | 'current' | 'pending';
}

interface TransactionModalWithUnsavedChangesProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'deposit' | 'withdraw';
  onSubmit: (amount: string) => Promise<any>;
  maxAmount: string;
  isLoading: boolean;
  currentApy?: number;
}

export const TransactionModalWithUnsavedChanges: React.FC<TransactionModalWithUnsavedChangesProps> = ({
  isOpen,
  onClose,
  type,
  onSubmit,
  maxAmount,
  isLoading,
  currentApy = 0.085,
}) => {
  const [amount, setAmount] = useState('');
  const [transactionStep, setTransactionStep] = useState<'input' | 'processing' | 'success'>('input');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { wallet } = useWallet();
  const { toast } = useToast();

  // Check if there are unsaved changes (user has entered an amount)
  const hasUnsavedChanges = amount.trim() !== '' && transactionStep === 'input';

  // Use the unsaved changes hook
  const { navigateWithConfirmation } = useUnsavedChanges({
    hasUnsavedChanges,
    message: `You have entered an amount (${amount} USDT). Are you sure you want to leave without completing the ${type}?`,
    onConfirmLeave: () => {
      // Reset form when user confirms leaving
      setAmount('');
      setTransactionStep('input');
    },
    onCancelLeave: () => {
      // User cancelled leaving, do nothing
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    try {
      setTransactionStep('processing');
      await onSubmit(amount);
      setTransactionStep('success');
      
      // Show success for 2 seconds then close
      setTimeout(() => {
        setAmount('');
        setTransactionStep('input');
        onClose();
      }, 2000);
      
      toast({
        title: `${type === 'deposit' ? 'Deposit' : 'Withdrawal'} Successful`,
        description: `Transaction submitted successfully. Gas fees sponsored!`,
      });
    } catch (error) {
      console.error(`${type} failed:`, error);
      setTransactionStep('input');
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

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowConfirmDialog(true);
    } else {
      onClose();
    }
  };

  const handleConfirmLeave = () => {
    setAmount('');
    setTransactionStep('input');
    setShowConfirmDialog(false);
    onClose();
  };

  const handleCancelLeave = () => {
    setShowConfirmDialog(false);
  };

  const getSteps = (): Step[] => {
    const baseSteps: Step[] = [
      {
        id: 'input',
        title: 'Enter Amount',
        description: 'Specify the amount to deposit',
        status: transactionStep === 'input' ? 'current' : transactionStep === 'processing' || transactionStep === 'success' ? 'completed' : 'pending',
      },
      {
        id: 'processing',
        title: 'Processing',
        description: 'Transaction is being processed',
        status: transactionStep === 'processing' ? 'current' : transactionStep === 'success' ? 'completed' : 'pending',
      },
      {
        id: 'success',
        title: 'Complete',
        description: 'Transaction completed successfully',
        status: transactionStep === 'success' ? 'current' : 'pending',
      },
    ];

    return baseSteps;
  };

  const getIcon = () => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="h-6 w-6 text-green-600" />;
      case 'withdraw':
        return <ArrowUpRight className="h-6 w-6 text-blue-600" />;
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'deposit':
        return 'Deposit USDT';
      case 'withdraw':
        return 'Withdraw USDT';
      default:
        return 'Transaction';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'deposit':
        return 'Deposit USDT to start earning yield';
      case 'withdraw':
        return 'Withdraw your USDT from the vault';
      default:
        return 'Complete your transaction';
    }
  };

  const getButtonText = () => {
    switch (transactionStep) {
      case 'processing':
        return 'Processing...';
      case 'success':
        return 'Success!';
      default:
        return type === 'deposit' ? 'Deposit' : 'Withdraw';
    }
  };

  const getButtonIcon = () => {
    switch (transactionStep) {
      case 'processing':
        return <Clock className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return type === 'deposit' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />;
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getIcon()}
              {getTitle()}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Progress Indicator */}
            <ProgressIndicator steps={getSteps()} />

            {/* Transaction Form */}
            {transactionStep === 'input' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (USDT)</Label>
                  <div className="relative">
                    <Input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      max={maxAmount}
                      className="pr-20"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="absolute right-1 top-1 h-8 px-2 text-xs"
                      onClick={setMaxAmount}
                    >
                      MAX
                    </Button>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Available: {formatCurrency(maxAmount)}</span>
                    <span>APY: {(currentApy * 100).toFixed(2)}%</span>
                  </div>
                </div>

                {/* Transaction Info */}
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="h-4 w-4 text-green-600" />
                    <span>Gas fees sponsored by Kaia</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Info className="h-4 w-4 text-blue-600" />
                    <span>
                      {type === 'deposit' 
                        ? 'Your funds will start earning yield immediately'
                        : 'Withdrawal will be processed instantly'
                      }
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={!amount || parseFloat(amount) <= 0 || isLoading}
                  >
                    {getButtonIcon()}
                    {getButtonText()}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {/* Processing State */}
            {transactionStep === 'processing' && (
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <div>
                  <h3 className="font-semibold">Processing Transaction</h3>
                  <p className="text-sm text-muted-foreground">
                    Please wait while we process your {type}...
                  </p>
                </div>
              </div>
            )}

            {/* Success State */}
            {transactionStep === 'success' && (
              <div className="text-center space-y-4">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                <div>
                  <h3 className="font-semibold text-green-600">Transaction Successful!</h3>
                  <p className="text-sm text-muted-foreground">
                    Your {type} of {formatCurrency(amount)} USDT has been processed.
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Unsaved Changes Confirmation Dialog */}
      <UnsavedChangesDialog
        isOpen={showConfirmDialog}
        onClose={handleCancelLeave}
        onConfirm={handleConfirmLeave}
        title="Unsaved Transaction"
        message={`You have entered an amount (${amount} USDT). Are you sure you want to leave without completing the ${type}?`}
        confirmText="Leave"
        cancelText="Continue"
      />
    </>
  );
};

