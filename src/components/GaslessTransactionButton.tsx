import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useGaslessTransaction, createDepositSignature, createWithdrawSignature } from '@/hooks/useGaslessTransaction';
import { useWallet } from '@/hooks/useWallet';
import { ArrowDown, ArrowUp, Zap, Loader2 } from 'lucide-react';

interface GaslessTransactionButtonProps {
  type: 'deposit' | 'withdraw';
  amount: string;
  onSuccess?: (txHash: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export const GaslessTransactionButton: React.FC<GaslessTransactionButtonProps> = ({
  type,
  amount,
  onSuccess,
  onError,
  className = '',
}) => {
  const { wallet } = useWallet();
  const { executeGaslessDeposit, executeGaslessWithdraw, getUserNonce, isLoading, error } = useGaslessTransaction();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleGaslessTransaction = async () => {
    if (!wallet.isConnected || !wallet.signer) {
      onError?.('Wallet not connected');
      return;
    }

    try {
      setIsProcessing(true);

      // Get user's current nonce
      const nonce = await getUserNonce(wallet.address);
      
      if (nonce === 0 && error) {
        throw new Error('Failed to get user nonce');
      }

      let signature: string;
      let result;

      if (type === 'deposit') {
        // Create deposit signature
        signature = await createDepositSignature(
          wallet.signer,
          process.env.REACT_APP_VAULT_ADDRESS || '',
          wallet.address,
          nonce,
          amount,
          wallet.address // receiver is the user themselves
        );

        // Execute gasless deposit
        result = await executeGaslessDeposit({
          user: wallet.address,
          assets: amount,
          receiver: wallet.address,
          nonce,
          signature,
        });
      } else {
        // Create withdraw signature
        signature = await createWithdrawSignature(
          wallet.signer,
          process.env.REACT_APP_VAULT_ADDRESS || '',
          wallet.address,
          nonce,
          amount,
          wallet.address, // receiver is the user themselves
          wallet.address  // owner is the user themselves
        );

        // Execute gasless withdraw
        result = await executeGaslessWithdraw({
          user: wallet.address,
          assets: amount,
          receiver: wallet.address,
          owner: wallet.address,
          nonce,
          signature,
        });
      }

      if (result.success && result.transactionHash) {
        onSuccess?.(result.transactionHash);
      } else {
        onError?.(result.error || 'Transaction failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const isDisabled = isLoading || isProcessing || !wallet.isConnected || !amount || parseFloat(amount) <= 0;

  return (
    <Button
      onClick={handleGaslessTransaction}
      disabled={isDisabled}
      className={`relative overflow-hidden ${className}`}
    >
      {isLoading || isProcessing ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            {type === 'deposit' ? (
              <>
                <ArrowDown className="w-4 h-4" />
                Deposit Gasless
              </>
            ) : (
              <>
                <ArrowUp className="w-4 h-4" />
                Withdraw Gasless
              </>
            )}
          </div>
        </>
      )}
      
      {/* Gasless indicator */}
      <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-1 py-0.5 rounded-bl">
        FREE
      </div>
    </Button>
  );
};

export default GaslessTransactionButton;
