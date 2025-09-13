import React, { useState } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useWallet } from '../hooks/useWallet';
import { cn } from '../utils/cn';

// Example ABI for USDT token
const USDT_ABI = [
  {
    "constant": true,
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"name": "", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_to", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"name": "", "type": "bool"}],
    "type": "function"
  }
] as const;

interface SmartContractInteractionProps {
  contractAddress: string;
  abi?: typeof USDT_ABI;
  className?: string;
}

export const SmartContractInteraction: React.FC<SmartContractInteractionProps> = ({
  contractAddress,
  abi = USDT_ABI,
  className = ''
}) => {
  const { address, isConnected, isKaiaNetwork } = useWallet();
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');

  // Read contract - get total supply
  const { data: totalSupply, isLoading: isLoadingSupply } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: abi,
    functionName: 'totalSupply',
  });

  // Read contract - get user balance
  const { data: userBalance, isLoading: isLoadingBalance } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Write contract - transfer tokens
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleTransfer = () => {
    if (!transferTo || !transferAmount) return;

    writeContract({
      address: contractAddress as `0x${string}`,
      abi: abi,
      functionName: 'transfer',
      args: [transferTo as `0x${string}`, BigInt(transferAmount)],
    });
  };

  const formatBalance = (balance: bigint | undefined) => {
    if (!balance) return '0';
    // Assuming 6 decimals for USDT
    return (Number(balance) / 1e6).toFixed(2);
  };

  if (!isConnected) {
    return (
      <div className={cn('bg-gray-50 rounded-lg p-6 text-center', className)}>
        <p className="text-gray-500">Please connect your wallet to interact with smart contracts.</p>
      </div>
    );
  }

  if (!isKaiaNetwork) {
    return (
      <div className={cn('bg-orange-50 border border-orange-200 rounded-lg p-6', className)}>
        <div className="flex items-center">
          <svg className="w-5 h-5 text-orange-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-orange-700">Please switch to Kaia network to interact with smart contracts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-lg shadow-lg p-6 space-y-6', className)}>
      <h3 className="text-xl font-semibold text-gray-900">Smart Contract Interaction</h3>
      
      {/* Contract Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Contract Address</h4>
        <p className="text-sm text-gray-900 font-mono break-all">
          {contractAddress}
        </p>
      </div>

      {/* Read Operations */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900">Contract Data</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h5 className="text-sm font-medium text-blue-800 mb-2">Total Supply</h5>
            {isLoadingSupply ? (
              <div className="animate-pulse h-6 bg-blue-200 rounded"></div>
            ) : (
              <p className="text-lg font-bold text-blue-900">
                {formatBalance(totalSupply)} USDT
              </p>
            )}
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <h5 className="text-sm font-medium text-green-800 mb-2">Your Balance</h5>
            {isLoadingBalance ? (
              <div className="animate-pulse h-6 bg-green-200 rounded"></div>
            ) : (
              <p className="text-lg font-bold text-green-900">
                {formatBalance(userBalance)} USDT
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Write Operations */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900">Transfer Tokens</h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Address
            </label>
            <input
              type="text"
              value={transferTo}
              onChange={(e) => setTransferTo(e.target.value)}
              placeholder="0x..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (USDT)
            </label>
            <input
              type="number"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleTransfer}
            disabled={isPending || isConfirming || !transferTo || !transferAmount}
            className={cn(
              'w-full py-2 px-4 rounded-lg font-medium transition-colors',
              isPending || isConfirming || !transferTo || !transferAmount
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            )}
          >
            {isPending ? 'Preparing...' : isConfirming ? 'Confirming...' : 'Transfer'}
          </button>
        </div>

        {/* Transaction Status */}
        {hash && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-700 mb-2">Transaction Hash</h5>
            <p className="text-sm text-gray-900 font-mono break-all mb-2">
              {hash}
            </p>
            {isConfirming && (
              <div className="flex items-center text-blue-600">
                <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm">Confirming transaction...</span>
              </div>
            )}
            {isSuccess && (
              <div className="flex items-center text-green-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">Transaction confirmed!</span>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700 font-medium">Transaction Error</span>
            </div>
            <p className="text-red-600 text-sm mt-1">
              {error.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
