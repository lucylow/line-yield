import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUniversalWallet } from './useUniversalWallet';
import { usePlatform } from './usePlatform';
import { VaultService } from '../services/vaultService';
import { RelayerService } from '../services/relayerService';

export const useLineYield = () => {
  const { wallet } = useUniversalWallet();
  const { isLiff } = usePlatform();
  const queryClient = useQueryClient();
  
  const vaultService = new VaultService(wallet.provider);
  const relayerService = new RelayerService();

  // Fetch vault data
  const { data: vaultData, isLoading, error } = useQuery({
    queryKey: ['vaultData', wallet.address],
    queryFn: async () => {
      if (!wallet.address || !wallet.provider) return null;
      return vaultService.getVaultData(wallet.address);
    },
    enabled: !!wallet.address && !!wallet.provider,
    refetchInterval: 30000,
  });

  // Deposit mutation
  const depositMutation = useMutation({
    mutationFn: async ({ amount }: { amount: string }) => {
      if (!wallet.provider || !wallet.address) {
        throw new Error('Wallet not connected');
      }

      const depositTx = await vaultService.prepareDeposit(amount, wallet.address);
      
      if (isLiff) {
        // Use relayer for gasless transactions in LIFF
        console.log('Using relayer for gasless transaction');
        return relayerService.relayTransaction({
          to: depositTx.to,
          data: depositTx.data,
          value: depositTx.value?.toString() || '0'
        });
      } else {
        // Direct transaction for web version
        console.log('Using direct wallet transaction');
        const signer = wallet.provider.getSigner();
        const tx = await signer.sendTransaction({
          to: depositTx.to,
          data: depositTx.data,
          value: depositTx.value,
          gasLimit: depositTx.gasLimit,
          gasPrice: depositTx.gasPrice,
        });
        return tx.wait();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaultData', wallet.address] });
    },
  });

  // Withdraw mutation
  const withdrawMutation = useMutation({
    mutationFn: async ({ amount }: { amount: string }) => {
      if (!wallet.provider || !wallet.address) {
        throw new Error('Wallet not connected');
      }

      const withdrawTx = await vaultService.prepareWithdraw(amount, wallet.address);
      
      if (isLiff) {
        return relayerService.relayTransaction({
          to: withdrawTx.to,
          data: withdrawTx.data,
          value: withdrawTx.value?.toString() || '0'
        });
      } else {
        const signer = wallet.provider.getSigner();
        const tx = await signer.sendTransaction({
          to: withdrawTx.to,
          data: withdrawTx.data,
          value: withdrawTx.value,
          gasLimit: withdrawTx.gasLimit,
          gasPrice: withdrawTx.gasPrice,
        });
        return tx.wait();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaultData', wallet.address] });
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
    isLiff
  };
};