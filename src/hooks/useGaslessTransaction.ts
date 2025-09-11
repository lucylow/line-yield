import { useState, useCallback } from 'react';
import { ethers } from 'ethers';

interface GaslessTransactionParams {
  user: string;
  assets?: string;
  shares?: string;
  receiver: string;
  owner?: string;
  nonce: number;
  signature: string;
}

interface RelayerResponse {
  success: boolean;
  transactionHash?: string;
  gasUsed?: string;
  blockNumber?: string;
  error?: string;
}

interface UseGaslessTransactionReturn {
  executeGaslessDeposit: (params: GaslessTransactionParams) => Promise<RelayerResponse>;
  executeGaslessWithdraw: (params: GaslessTransactionParams) => Promise<RelayerResponse>;
  executeGaslessMint: (params: GaslessTransactionParams) => Promise<RelayerResponse>;
  executeGaslessRedeem: (params: GaslessTransactionParams) => Promise<RelayerResponse>;
  getUserNonce: (userAddress: string) => Promise<number>;
  isLoading: boolean;
  error: string | null;
}

const RELAYER_BASE_URL = process.env.REACT_APP_RELAYER_URL || 'http://localhost:3000';

export const useGaslessTransaction = (): UseGaslessTransactionReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const makeRelayerRequest = useCallback(async (
    endpoint: string,
    params: GaslessTransactionParams
  ): Promise<RelayerResponse> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${RELAYER_BASE_URL}/relay/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Relayer request failed');
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const executeGaslessDeposit = useCallback(async (params: GaslessTransactionParams): Promise<RelayerResponse> => {
    if (!params.assets) {
      const error = 'Assets amount is required for deposit';
      setError(error);
      return { success: false, error };
    }

    return makeRelayerRequest('deposit', params);
  }, [makeRelayerRequest]);

  const executeGaslessWithdraw = useCallback(async (params: GaslessTransactionParams): Promise<RelayerResponse> => {
    if (!params.assets || !params.owner) {
      const error = 'Assets amount and owner are required for withdrawal';
      setError(error);
      return { success: false, error };
    }

    return makeRelayerRequest('withdraw', params);
  }, [makeRelayerRequest]);

  const executeGaslessMint = useCallback(async (params: GaslessTransactionParams): Promise<RelayerResponse> => {
    if (!params.shares) {
      const error = 'Shares amount is required for mint';
      setError(error);
      return { success: false, error };
    }

    return makeRelayerRequest('mint', params);
  }, [makeRelayerRequest]);

  const executeGaslessRedeem = useCallback(async (params: GaslessTransactionParams): Promise<RelayerResponse> => {
    if (!params.shares || !params.owner) {
      const error = 'Shares amount and owner are required for redeem';
      setError(error);
      return { success: false, error };
    }

    return makeRelayerRequest('redeem', params);
  }, [makeRelayerRequest]);

  const getUserNonce = useCallback(async (userAddress: string): Promise<number> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${RELAYER_BASE_URL}/nonce/${userAddress}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get user nonce');
      }

      return parseInt(data.nonce);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return 0;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    executeGaslessDeposit,
    executeGaslessWithdraw,
    executeGaslessMint,
    executeGaslessRedeem,
    getUserNonce,
    isLoading,
    error,
  };
};

// Utility function to create signature for gasless transactions
export const createGaslessSignature = async (
  signer: ethers.Signer,
  vaultAddress: string,
  userAddress: string,
  nonce: number,
  action: string,
  ...params: (string | number)[]
): Promise<string> => {
  const messageHash = ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ['address', 'address', 'uint256', 'string', ...new Array(params.length).fill('uint256')],
      [vaultAddress, userAddress, nonce, action, ...params]
    )
  );

  const signature = await signer.signMessage(ethers.toUtf8Bytes(messageHash));
  return signature;
};

// Utility function to create deposit signature
export const createDepositSignature = async (
  signer: ethers.Signer,
  vaultAddress: string,
  userAddress: string,
  nonce: number,
  assets: string,
  receiver: string
): Promise<string> => {
  return createGaslessSignature(signer, vaultAddress, userAddress, nonce, 'deposit', assets, receiver);
};

// Utility function to create withdraw signature
export const createWithdrawSignature = async (
  signer: ethers.Signer,
  vaultAddress: string,
  userAddress: string,
  nonce: number,
  assets: string,
  receiver: string,
  owner: string
): Promise<string> => {
  return createGaslessSignature(signer, vaultAddress, userAddress, nonce, 'withdraw', assets, receiver, owner);
};

// Utility function to create mint signature
export const createMintSignature = async (
  signer: ethers.Signer,
  vaultAddress: string,
  userAddress: string,
  nonce: number,
  shares: string,
  receiver: string
): Promise<string> => {
  return createGaslessSignature(signer, vaultAddress, userAddress, nonce, 'mint', shares, receiver);
};

// Utility function to create redeem signature
export const createRedeemSignature = async (
  signer: ethers.Signer,
  vaultAddress: string,
  userAddress: string,
  nonce: number,
  shares: string,
  receiver: string,
  owner: string
): Promise<string> => {
  return createGaslessSignature(signer, vaultAddress, userAddress, nonce, 'redeem', shares, receiver, owner);
};
