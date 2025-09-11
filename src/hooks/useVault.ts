import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { VaultData, Transaction } from '../types/vault';
import { useWallet } from './useWallet';
import { useToast } from '@/hooks/use-toast';

export const useVault = (vaultAddress: string) => {
  const { wallet } = useWallet();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [transactionHistory, setTransactionHistory] = useState<Transaction[]>([]);

  // Enhanced vault data fetching with real-time updates
  const getVaultData = useCallback(async (): Promise<VaultData> => {
    if (!wallet.address) {
      throw new Error('Wallet not connected');
    }

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // In a real implementation, this would fetch from your API/contracts
      const mockData: VaultData = {
        totalAssets: '2847589.42',
        userShares: '1000.00',
        userAssets: '1052.18',
        apy: 0.085,
        earnedYield: '52.18',
        strategies: [
          { name: 'Kaia DeFi Pool', allocation: 40, apy: 0.089, tvl: '1,139,035.77' },
          { name: 'Stable Yield Strategy', allocation: 35, apy: 0.082, tvl: '996,356.30' },
          { name: 'Liquidity Mining', allocation: 25, apy: 0.076, tvl: '712,197.35' },
        ],
      };

      return mockData;
    } catch (error) {
      console.error('Failed to fetch vault data:', error);
      throw new Error('Failed to load vault data. Please try again.');
    }
  }, [wallet.address]);

  // Function to get transaction history
  const getTransactionHistory = useCallback(async (): Promise<Transaction[]> => {
    if (!wallet.address) return [];

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock transaction history
      const mockTransactions: Transaction[] = [
        {
          hash: '0x123...abc',
          type: 'deposit',
          amount: '1000.00',
          timestamp: Date.now() - 86400000, // 1 day ago
          status: 'confirmed'
        },
        {
          hash: '0x456...def',
          type: 'withdraw',
          amount: '250.00',
          timestamp: Date.now() - 172800000, // 2 days ago
          status: 'confirmed'
        },
        {
          hash: '0x789...ghi',
          type: 'deposit',
          amount: '500.00',
          timestamp: Date.now() - 259200000, // 3 days ago
          status: 'confirmed'
        }
      ];

      return mockTransactions;
    } catch (error) {
      console.error('Failed to fetch transaction history:', error);
      return [];
    }
  }, [wallet.address]);

  // Query for vault data
  const { data: vaultData, isLoading, error } = useQuery({
    queryKey: ['vaultData', vaultAddress, wallet.address],
    queryFn: getVaultData,
    enabled: !!wallet.address,
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Query for transaction history
  const { data: txHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['transactionHistory', wallet.address],
    queryFn: getTransactionHistory,
    enabled: !!wallet.address,
    refetchInterval: 60000, // Refresh every minute
  });

  // Update local transaction history when data changes
  useEffect(() => {
    if (txHistory) {
      setTransactionHistory(txHistory);
    }
  }, [txHistory]);

  const depositMutation = useMutation({
    mutationFn: async (amount: string) => {
      if (!wallet.address) throw new Error('Wallet not connected');
      
      try {
        // Simulate transaction with more realistic delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
        
        // Add to transaction history immediately
        const newTransaction: Transaction = {
          hash: transactionHash,
          type: 'deposit',
          amount,
          timestamp: Date.now(),
          status: 'confirmed'
        };
        
        setTransactionHistory(prev => [newTransaction, ...prev]);
        
        return { transactionHash };
      } catch (error) {
        console.error('Deposit failed:', error);
        throw new Error('Deposit transaction failed. Please try again.');
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vaultData', vaultAddress, wallet.address] });
      queryClient.invalidateQueries({ queryKey: ['transactionHistory', wallet.address] });
      
      toast({
        title: "Deposit Successful",
        description: `Transaction confirmed: ${data.transactionHash.slice(0, 10)}...`,
      });
    },
    onError: (error) => {
      toast({
        title: "Deposit Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (amount: string) => {
      if (!wallet.address) throw new Error('Wallet not connected');
      
      try {
        // Simulate transaction
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
        
        // Add to transaction history immediately
        const newTransaction: Transaction = {
          hash: transactionHash,
          type: 'withdraw',
          amount,
          timestamp: Date.now(),
          status: 'confirmed'
        };
        
        setTransactionHistory(prev => [newTransaction, ...prev]);
        
        return { transactionHash };
      } catch (error) {
        console.error('Withdrawal failed:', error);
        throw new Error('Withdrawal transaction failed. Please try again.');
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vaultData', vaultAddress, wallet.address] });
      queryClient.invalidateQueries({ queryKey: ['transactionHistory', wallet.address] });
      
      toast({
        title: "Withdrawal Successful",
        description: `Transaction confirmed: ${data.transactionHash.slice(0, 10)}...`,
      });
    },
    onError: (error) => {
      toast({
        title: "Withdrawal Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    },
  });

  // Function to refresh vault data manually
  const refreshVaultData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['vaultData', vaultAddress, wallet.address] });
  }, [queryClient, vaultAddress, wallet.address]);

  // Function to refresh transaction history
  const refreshTransactionHistory = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['transactionHistory', wallet.address] });
  }, [queryClient, wallet.address]);

  return {
    vaultData,
    isLoading,
    error,
    transactionHistory,
    isLoadingHistory,
    deposit: depositMutation.mutateAsync,
    withdraw: withdrawMutation.mutateAsync,
    isDepositing: depositMutation.isPending,
    isWithdrawing: withdrawMutation.isPending,
    refreshVaultData,
    refreshTransactionHistory,
  };
};