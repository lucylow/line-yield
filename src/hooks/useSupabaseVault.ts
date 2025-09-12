import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TransactionService, VaultService, NotificationService } from '@/services/supabase';
import { useSupabaseAuth } from './useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';

interface VaultData {
  totalAssets: string;
  userShares: string;
  userAssets: string;
  apy: number;
  earnedYield: string;
  strategies: StrategyAllocation[];
}

interface StrategyAllocation {
  name: string;
  allocation: number;
  apy: number;
  tvl: string;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'claim';
  amount: string;
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  created_at: string;
}

export const useSupabaseVault = () => {
  const { user, profile } = useSupabaseAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [transactionHistory, setTransactionHistory] = useState<Transaction[]>([]);

  // Fetch vault data
  const { data: vaultData, isLoading: isLoadingVault, error: vaultError } = useQuery({
    queryKey: ['vaultData', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      try {
        const data = await VaultService.getUserVaultData(user.id);
        
        if (data) {
          return {
            totalAssets: data.total_assets || '2847589.42',
            userShares: data.user_shares || '1000.00',
            userAssets: data.user_assets || '1052.18',
            apy: parseFloat(data.apy || '0.085'),
            earnedYield: data.earned_yield || '52.18',
            strategies: data.strategies ? JSON.parse(data.strategies as string) : [
              { name: 'Kaia DeFi Pool', allocation: 40, apy: 0.089, tvl: '1,139,035.77' },
              { name: 'Stable Yield Strategy', allocation: 35, apy: 0.082, tvl: '996,356.30' },
              { name: 'Liquidity Mining', allocation: 25, apy: 0.076, tvl: '712,197.35' },
            ],
          };
        }

        // Return default data if no vault data exists
        return {
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
      } catch (error) {
        console.error('Failed to fetch vault data:', error);
        throw new Error('Failed to load vault data. Please try again.');
      }
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Fetch transaction history
  const { data: txHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['transactionHistory', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      try {
        const transactions = await TransactionService.getUserTransactions(user.id, 50);
        return transactions.map(tx => ({
          id: tx.id,
          hash: tx.hash,
          type: tx.type as 'deposit' | 'withdraw' | 'claim',
          amount: tx.amount,
          timestamp: new Date(tx.created_at).getTime(),
          status: tx.status as 'pending' | 'confirmed' | 'failed'
        }));
      } catch (error) {
        console.error('Failed to fetch transaction history:', error);
        return [];
      }
    },
    enabled: !!user?.id,
    refetchInterval: 60000, // Refresh every minute
  });

  // Update local transaction history when data changes
  useEffect(() => {
    if (txHistory) {
      setTransactionHistory(txHistory);
    }
  }, [txHistory]);

  // Deposit mutation
  const depositMutation = useMutation({
    mutationFn: async (amount: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      try {
        // Simulate blockchain transaction (in real app, this would interact with smart contracts)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
        
        // Create transaction record in database
        const transaction = await TransactionService.createTransaction({
          user_id: user.id,
          type: 'deposit',
          amount,
          hash: transactionHash,
          status: 'confirmed'
        });

        // Update vault data
        const currentVaultData = await VaultService.getUserVaultData(user.id);
        if (currentVaultData) {
          const newUserAssets = (parseFloat(currentVaultData.user_assets || '0') + parseFloat(amount)).toString();
          const newUserShares = (parseFloat(currentVaultData.user_shares || '0') + parseFloat(amount)).toString();
          
          await VaultService.updateVaultData({
            user_id: user.id,
            user_assets: newUserAssets,
            user_shares: newUserShares,
            total_assets: currentVaultData.total_assets,
            apy: currentVaultData.apy,
            earned_yield: currentVaultData.earned_yield,
            strategies: currentVaultData.strategies
          });
        }

        // Create notification
        await NotificationService.createNotification({
          user_id: user.id,
          type: 'success',
          title: 'Deposit Successful',
          message: `${amount} USDT deposited successfully`,
          action_url: `https://baobab.klaytnscope.com/tx/${transactionHash}`
        });

        // Add to local transaction history immediately
        const newTransaction: Transaction = {
          id: transaction.id,
          hash: transactionHash,
          type: 'deposit',
          amount,
          timestamp: new Date().getTime(),
          status: 'confirmed'
        };
        
        setTransactionHistory(prev => [newTransaction, ...prev]);
        
        return { transactionHash };
      } catch (error) {
        console.error('Deposit failed:', error);
        
        // Create error notification
        if (user?.id) {
          await NotificationService.createNotification({
            user_id: user.id,
            type: 'error',
            title: 'Deposit Failed',
            message: 'Your deposit transaction failed. Please try again.'
          });
        }
        
        throw new Error('Deposit transaction failed. Please try again.');
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vaultData', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['transactionHistory', user?.id] });
      
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

  // Withdraw mutation
  const withdrawMutation = useMutation({
    mutationFn: async (amount: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      try {
        // Simulate blockchain transaction
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
        
        // Create transaction record
        const transaction = await TransactionService.createTransaction({
          user_id: user.id,
          type: 'withdraw',
          amount,
          hash: transactionHash,
          status: 'confirmed'
        });

        // Update vault data
        const currentVaultData = await VaultService.getUserVaultData(user.id);
        if (currentVaultData) {
          const newUserAssets = Math.max(0, parseFloat(currentVaultData.user_assets || '0') - parseFloat(amount)).toString();
          const newUserShares = Math.max(0, parseFloat(currentVaultData.user_shares || '0') - parseFloat(amount)).toString();
          
          await VaultService.updateVaultData({
            user_id: user.id,
            user_assets: newUserAssets,
            user_shares: newUserShares,
            total_assets: currentVaultData.total_assets,
            apy: currentVaultData.apy,
            earned_yield: currentVaultData.earned_yield,
            strategies: currentVaultData.strategies
          });
        }

        // Create notification
        await NotificationService.createNotification({
          user_id: user.id,
          type: 'success',
          title: 'Withdrawal Successful',
          message: `${amount} USDT withdrawn successfully`,
          action_url: `https://baobab.klaytnscope.com/tx/${transactionHash}`
        });

        // Add to local transaction history
        const newTransaction: Transaction = {
          id: transaction.id,
          hash: transactionHash,
          type: 'withdraw',
          amount,
          timestamp: new Date().getTime(),
          status: 'confirmed'
        };
        
        setTransactionHistory(prev => [newTransaction, ...prev]);
        
        return { transactionHash };
      } catch (error) {
        console.error('Withdrawal failed:', error);
        
        // Create error notification
        if (user?.id) {
          await NotificationService.createNotification({
            user_id: user.id,
            type: 'error',
            title: 'Withdrawal Failed',
            message: 'Your withdrawal transaction failed. Please try again.'
          });
        }
        
        throw new Error('Withdrawal transaction failed. Please try again.');
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vaultData', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['transactionHistory', user?.id] });
      
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

  // Refresh functions
  const refreshVaultData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['vaultData', user?.id] });
  }, [queryClient, user?.id]);

  const refreshTransactionHistory = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['transactionHistory', user?.id] });
  }, [queryClient, user?.id]);

  return {
    vaultData,
    isLoading: isLoadingVault,
    error: vaultError,
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
