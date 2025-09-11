import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { VaultData } from '../types/vault';
import { useWallet } from './useWallet';

export const useVault = (vaultAddress: string) => {
  const { wallet } = useWallet();
  const queryClient = useQueryClient();

  // Mock data for demo purposes
  const getVaultData = useCallback(async (): Promise<VaultData> => {
    if (!wallet.address) {
      throw new Error('Wallet not connected');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

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
  }, [wallet.address]);

  const { data: vaultData, isLoading, error } = useQuery({
    queryKey: ['vaultData', vaultAddress, wallet.address],
    queryFn: getVaultData,
    enabled: !!wallet.address,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const depositMutation = useMutation({
    mutationFn: async (amount: string) => {
      if (!wallet.address) throw new Error('Wallet not connected');
      
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaultData', vaultAddress, wallet.address] });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (amount: string) => {
      if (!wallet.address) throw new Error('Wallet not connected');
      
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaultData', vaultAddress, wallet.address] });
    },
  });

  return {
    vaultData,
    isLoading,
    error,
    deposit: depositMutation.mutateAsync,
    withdraw: withdrawMutation.mutateAsync,
    isDepositing: depositMutation.isPending,
    isWithdrawing: withdrawMutation.isPending,
  };
};