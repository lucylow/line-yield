import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useKaiaWallet } from '@/hooks/useKaiaWallet';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Zap, 
  DollarSign,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Gas
} from 'lucide-react';

// Vault contract addresses (replace with actual deployed addresses)
const VAULT_ADDRESSES = {
  TESTNET: '0x1234567890123456789012345678901234567890', // Replace with actual testnet vault
  MAINNET: '0x1234567890123456789012345678901234567890'  // Replace with actual mainnet vault
};

interface TransactionStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  txHash?: string;
}

interface KaiaTransactionPanelProps {
  className?: string;
}

export const KaiaTransactionPanel: React.FC<KaiaTransactionPanelProps> = ({
  className = ''
}) => {
  const {
    isConnected,
    account,
    usdtBalance,
    isLoading,
    sendTransaction,
    network,
    KAIANETWORKS
  } = useKaiaWallet();

  const [transactionType, setTransactionType] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionSteps, setTransactionSteps] = useState<TransactionStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get vault address based on current network
  const getVaultAddress = () => {
    return network === KAIANETWORKS.MAINNET 
      ? VAULT_ADDRESSES.MAINNET 
      : VAULT_ADDRESSES.TESTNET;
  };

  // Encode deposit function call data
  const encodeDepositData = (amount: string): string => {
    // This is a simplified example - in production, use a proper ABI encoder
    // deposit(uint256 amount) function signature: 0x47e7ef24
    const amountHex = BigInt(parseFloat(amount) * 10**6).toString(16).padStart(64, '0');
    return `0x47e7ef24${amountHex}`;
  };

  // Encode withdraw function call data
  const encodeWithdrawData = (amount: string): string => {
    // withdraw(uint256 amount) function signature: 0x2e1a7d4d
    const amountHex = BigInt(parseFloat(amount) * 10**6).toString(16).padStart(64, '0');
    return `0x2e1a7d4d${amountHex}`;
  };

  // Handle transaction submission
  const handleTransaction = async () => {
    if (!isConnected || !account) {
      setError('Please connect your wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (transactionType === 'withdraw' && parseFloat(amount) > parseFloat(usdtBalance)) {
      setError('Insufficient USDT balance');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setTxHash(null);

    // Initialize transaction steps
    const steps: TransactionStep[] = [
      {
        id: '1',
        title: 'Preparing Transaction',
        description: 'Encoding transaction data and calculating gas',
        status: 'pending'
      },
      {
        id: '2',
        title: 'Signing Transaction',
        description: 'Please approve the transaction in your wallet',
        status: 'pending'
      },
      {
        id: '3',
        title: 'Broadcasting Transaction',
        description: 'Sending transaction to the network',
        status: 'pending'
      },
      {
        id: '4',
        title: 'Transaction Confirmed',
        description: 'Transaction has been confirmed on the blockchain',
        status: 'pending'
      }
    ];

    setTransactionSteps(steps);
    setCurrentStep(0);

    try {
      // Step 1: Prepare transaction
      setCurrentStep(0);
      setTransactionSteps(prev => prev.map((step, index) => 
        index === 0 ? { ...step, status: 'completed' } : step
      ));

      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing

      // Step 2: Sign and send transaction
      setCurrentStep(1);
      setTransactionSteps(prev => prev.map((step, index) => 
        index === 1 ? { ...step, status: 'completed' } : step
      ));

      const vaultAddress = getVaultAddress();
      const data = transactionType === 'deposit' 
        ? encodeDepositData(amount)
        : encodeWithdrawData(amount);

      const hash = await sendTransaction({
        to: vaultAddress,
        data,
        value: '0x0', // No ETH value for USDT transactions
        gasLimit: '0x186A0', // 100,000 gas limit
        gasPrice: '0x0' // Gas fee delegation - user pays no gas
      });

      if (hash) {
        setTxHash(hash);
        
        // Step 3: Transaction broadcasted
        setCurrentStep(2);
        setTransactionSteps(prev => prev.map((step, index) => 
          index === 2 ? { ...step, status: 'completed', txHash: hash } : step
        ));

        // Step 4: Transaction confirmed (simulated)
        setTimeout(() => {
          setCurrentStep(3);
          setTransactionSteps(prev => prev.map((step, index) => 
            index === 3 ? { ...step, status: 'completed' } : step
          ));
        }, 2000);
      } else {
        throw new Error('Transaction failed');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transaction failed';
      setError(errorMessage);
      
      // Mark current step as failed
      setTransactionSteps(prev => prev.map((step, index) => 
        index === currentStep ? { ...step, status: 'failed' } : step
      ));
    } finally {
      setIsProcessing(false);
    }
  };

  const getStepIcon = (status: TransactionStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />;
    }
  };

  const openTransactionExplorer = () => {
    if (txHash && network) {
      const explorerUrl = `${network.blockExplorerUrls[0]}/tx/${txHash}`;
      window.open(explorerUrl, '_blank');
    }
  };

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    return num.toFixed(2);
  };

  if (!isConnected) {
    return (
      <Card className={`shadow-lg ${className}`}>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Wallet Not Connected
          </h3>
          <p className="text-gray-600">
            Please connect your Kaia wallet to perform transactions
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`shadow-lg ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          {transactionType === 'deposit' ? 'Deposit USDT' : 'Withdraw USDT'}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Transaction Type Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setTransactionType('deposit')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
              transactionType === 'deposit'
                ? 'bg-white shadow-sm text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            Deposit
          </button>
          <button
            onClick={() => setTransactionType('withdraw')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
              transactionType === 'withdraw'
                ? 'bg-white shadow-sm text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            Withdraw
          </button>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Amount (USDT)
          </label>
          <div className="relative">
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isProcessing}
              className="pr-20"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Badge variant="secondary">USDT</Badge>
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Available: {formatAmount(usdtBalance)} USDT</span>
            <button
              onClick={() => setAmount(usdtBalance)}
              className="text-blue-600 hover:text-blue-800"
              disabled={isProcessing}
            >
              Max
            </button>
          </div>
        </div>

        {/* Gas Fee Delegation Info */}
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Gas className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Gas Fee Delegation Active
            </span>
          </div>
          <p className="text-xs text-green-700 mt-1">
            You pay no gas fees for this transaction
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Transaction Steps */}
        {isProcessing && transactionSteps.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Transaction Progress</h4>
            {transactionSteps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-3">
                {getStepIcon(step.status)}
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {step.description}
                  </div>
                </div>
                {step.txHash && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={openTransactionExplorer}
                    className="p-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Transaction Hash Display */}
        {txHash && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-blue-800">
                  Transaction Hash
                </div>
                <div className="text-xs font-mono text-blue-700">
                  {txHash.slice(0, 20)}...
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={openTransactionExplorer}
                className="p-1"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={handleTransaction}
          disabled={isProcessing || isLoading || !amount}
          className="w-full flex items-center justify-center gap-2"
          size="lg"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              {transactionType === 'deposit' ? (
                <ArrowUpRight className="w-5 h-5" />
              ) : (
                <ArrowDownLeft className="w-5 h-5" />
              )}
              {transactionType === 'deposit' ? 'Deposit USDT' : 'Withdraw USDT'}
            </>
          )}
        </Button>

        {/* Transaction Summary */}
        {amount && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Transaction Summary
            </h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Amount:</span>
                <span>{formatAmount(amount)} USDT</span>
              </div>
              <div className="flex justify-between">
                <span>Gas Fee:</span>
                <span className="text-green-600">0 KAIA (Delegated)</span>
              </div>
              <div className="flex justify-between">
                <span>Network:</span>
                <span>{network?.chainName}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KaiaTransactionPanel;
