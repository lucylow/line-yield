import React from 'react';
import { useUniversalWallet } from '../hooks/useUniversalWallet';
import { useLineYield } from '../hooks/useLineYield';
import { cn } from '../utils/cn';

interface BalanceDisplayProps {
  balance?: string;
  earned?: string;
  className?: string;
  showYield?: boolean;
}

export const BalanceDisplay: React.FC<BalanceDisplayProps> = ({
  balance,
  earned,
  className = '',
  showYield = true
}) => {
  const { wallet } = useUniversalWallet();
  const { vaultData } = useLineYield();

  if (!wallet.isConnected) {
    return (
      <div className={cn('text-center text-gray-500', className)}>
        <p>Connect wallet to view balance</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Wallet Balance</h3>
          <p className="text-2xl font-bold text-blue-600">
            {wallet.balance} KAIA
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Deposited</h3>
          <p className="text-2xl font-bold text-green-600">
            {balance || vaultData?.userDeposited || '0'} USDC
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-gray-600">Yield Earned</h3>
          <span className="text-sm text-gray-500">
            {vaultData?.currentAPY || '0'}% APY
          </span>
        </div>
        <p className="text-xl font-bold text-purple-600">
          {earned || vaultData?.userYield || '0'} USDC
        </p>
      </div>
    </div>
  );
};