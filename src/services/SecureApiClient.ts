import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ethers } from 'ethers';

export interface TransactionRequest {
  userAddress: string;
  amount: string;
  tokenAddress?: string;
  method: 'deposit' | 'withdraw' | 'mint' | 'redeem';
  nonce?: number;
  signature?: string;
  message?: string;
}

export interface SignedTransaction {
  signedTx: string;
  txHash: string;
  gasEstimate: string;
  nonce: number;
}

export interface UserNonce {
  nonce: number;
  lastUsed: string;
}

export interface WalletInfo {
  address: string;
  balance: string;
  network: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class SecureApiClient {
  private static instance: SecureApiClient;
  private api: AxiosInstance;
  private baseURL: string;

  private constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    
    this.api = axios.create({
      baseURL: `${this.baseURL}/api/secure`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for logging
    this.api.interceptors.request.use(
      (config) => {
        console.log(`[SecureAPI] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[SecureAPI] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        console.error('[SecureAPI] Response error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  public static getInstance(): SecureApiClient {
    if (!SecureApiClient.instance) {
      SecureApiClient.instance = new SecureApiClient();
    }
    return SecureApiClient.instance;
  }

  /**
   * Generate a message for user to sign
   */
  private generateSignMessage(userAddress: string, nonce: number): string {
    const timestamp = Math.floor(Date.now() / 1000);
    return `Sign this message to authenticate with LINE Yield.\n\nAddress: ${userAddress}\nNonce: ${nonce}\nTimestamp: ${timestamp}`;
  }

  /**
   * Sign a message with user's wallet
   */
  private async signMessage(message: string, signer: ethers.Signer): Promise<string> {
    try {
      return await signer.signMessage(message);
    } catch (error) {
      throw new Error('Failed to sign message. Please try again.');
    }
  }

  /**
   * Get user nonce for transaction ordering
   */
  public async getUserNonce(userAddress: string): Promise<UserNonce> {
    try {
      const response = await this.api.get(`/nonce/${userAddress}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get user nonce');
    }
  }

  /**
   * Estimate gas for a transaction
   */
  public async estimateGas(txData: any): Promise<{ gasEstimate: string; gasPrice: string }> {
    try {
      const response = await this.api.post('/estimate-gas', { txData });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to estimate gas');
    }
  }

  /**
   * Create and sign a deposit transaction
   */
  public async createDepositTransaction(
    userAddress: string,
    amount: string,
    signer: ethers.Signer
  ): Promise<SignedTransaction> {
    try {
      // Get user nonce
      const userNonce = await this.getUserNonce(userAddress);
      
      // Generate message for signing
      const message = this.generateSignMessage(userAddress, userNonce.nonce);
      
      // Sign the message
      const signature = await this.signMessage(message, signer);
      
      // Create transaction request
      const transactionRequest: TransactionRequest = {
        userAddress,
        amount,
        method: 'deposit',
        nonce: userNonce.nonce,
        signature,
        message
      };

      const response = await this.api.post('/deposit', transactionRequest);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create deposit transaction');
    }
  }

  /**
   * Create and sign a withdraw transaction
   */
  public async createWithdrawTransaction(
    userAddress: string,
    amount: string,
    signer: ethers.Signer
  ): Promise<SignedTransaction> {
    try {
      // Get user nonce
      const userNonce = await this.getUserNonce(userAddress);
      
      // Generate message for signing
      const message = this.generateSignMessage(userAddress, userNonce.nonce);
      
      // Sign the message
      const signature = await this.signMessage(message, signer);
      
      // Create transaction request
      const transactionRequest: TransactionRequest = {
        userAddress,
        amount,
        method: 'withdraw',
        nonce: userNonce.nonce,
        signature,
        message
      };

      const response = await this.api.post('/withdraw', transactionRequest);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create withdraw transaction');
    }
  }

  /**
   * Sign a generic transaction
   */
  public async signTransaction(
    userAddress: string,
    amount: string,
    method: 'deposit' | 'withdraw' | 'mint' | 'redeem',
    signer: ethers.Signer
  ): Promise<SignedTransaction> {
    try {
      // Get user nonce
      const userNonce = await this.getUserNonce(userAddress);
      
      // Generate message for signing
      const message = this.generateSignMessage(userAddress, userNonce.nonce);
      
      // Sign the message
      const signature = await this.signMessage(message, signer);
      
      // Create transaction request
      const transactionRequest: TransactionRequest = {
        userAddress,
        amount,
        method,
        nonce: userNonce.nonce,
        signature,
        message
      };

      const response = await this.api.post('/sign-transaction', transactionRequest);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to sign transaction');
    }
  }

  /**
   * Get wallet information
   */
  public async getWalletInfo(): Promise<WalletInfo> {
    try {
      const response = await this.api.get('/wallet-info');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get wallet information');
    }
  }

  /**
   * Verify a user signature
   */
  public async verifySignature(
    userAddress: string,
    message: string,
    signature: string
  ): Promise<boolean> {
    try {
      const response = await this.api.post('/verify-signature', {
        userAddress,
        message,
        signature
      });
      return response.data.data.isValid;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to verify signature');
    }
  }

  /**
   * Health check
   */
  public async healthCheck(): Promise<any> {
    try {
      const response = await this.api.get('/health');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Health check failed');
    }
  }

  /**
   * Broadcast a signed transaction to the network
   */
  public async broadcastTransaction(
    signedTx: string,
    provider: ethers.Provider
  ): Promise<string> {
    try {
      const txResponse = await provider.broadcastTransaction(signedTx);
      return txResponse.hash;
    } catch (error) {
      throw new Error('Failed to broadcast transaction');
    }
  }

  /**
   * Wait for transaction confirmation
   */
  public async waitForConfirmation(
    txHash: string,
    provider: ethers.Provider,
    confirmations: number = 1
  ): Promise<ethers.TransactionReceipt> {
    try {
      return await provider.waitForTransaction(txHash, confirmations);
    } catch (error) {
      throw new Error('Failed to wait for transaction confirmation');
    }
  }
}

// Export singleton instance
export const secureApiClient = SecureApiClient.getInstance();


