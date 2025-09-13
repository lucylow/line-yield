import { ethers } from 'ethers';
import { CONFIG } from '../config';
import { Logger } from '../utils/logger';
import { createClient } from '@supabase/supabase-js';

const logger = new Logger('SecureApiService');

// Initialize Supabase client with service role key (backend only)
const supabase = createClient(CONFIG.supabase.url, CONFIG.supabase.serviceRoleKey);

export interface TransactionRequest {
  userAddress: string;
  amount: string;
  tokenAddress?: string;
  method: 'deposit' | 'withdraw' | 'mint' | 'redeem';
  nonce?: number;
  signature?: string;
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

export class SecureApiService {
  private static instance: SecureApiService;
  private wallet: ethers.Wallet;
  private provider: ethers.JsonRpcProvider;

  private constructor() {
    // Initialize wallet with private key from environment variables
    this.provider = new ethers.JsonRpcProvider(CONFIG.kaia.rpcUrl);
    this.wallet = new ethers.Wallet(CONFIG.kaia.walletPrivateKey, this.provider);
    
    logger.info('SecureApiService initialized with wallet address:', this.wallet.address);
  }

  public static getInstance(): SecureApiService {
    if (!SecureApiService.instance) {
      SecureApiService.instance = new SecureApiService();
    }
    return SecureApiService.instance;
  }

  /**
   * Get user nonce for transaction ordering
   */
  public async getUserNonce(userAddress: string): Promise<UserNonce> {
    try {
      const { data, error } = await supabase
        .from('user_nonces')
        .select('nonce, last_used')
        .eq('user_address', userAddress.toLowerCase())
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error(`Failed to get user nonce: ${error.message}`);
      }

      if (!data) {
        // Create new nonce record
        const newNonce = { nonce: 0, last_used: new Date().toISOString() };
        await supabase
          .from('user_nonces')
          .insert([{ user_address: userAddress.toLowerCase(), ...newNonce }]);
        
        return newNonce;
      }

      return {
        nonce: data.nonce,
        lastUsed: data.last_used
      };
    } catch (error) {
      logger.error('Error getting user nonce:', error);
      throw new Error('Failed to get user nonce');
    }
  }

  /**
   * Increment user nonce after successful transaction
   */
  public async incrementUserNonce(userAddress: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_nonces')
        .update({ 
          nonce: supabase.rpc('increment_nonce'),
          last_used: new Date().toISOString()
        })
        .eq('user_address', userAddress.toLowerCase());

      if (error) {
        throw new Error(`Failed to increment user nonce: ${error.message}`);
      }
    } catch (error) {
      logger.error('Error incrementing user nonce:', error);
      throw new Error('Failed to increment user nonce');
    }
  }

  /**
   * Estimate gas for a transaction
   */
  public async estimateGas(txData: any): Promise<string> {
    try {
      const gasEstimate = await this.provider.estimateGas(txData);
      return gasEstimate.toString();
    } catch (error) {
      logger.error('Error estimating gas:', error);
      throw new Error('Failed to estimate gas');
    }
  }

  /**
   * Sign a transaction with the backend wallet
   */
  public async signTransaction(txData: any): Promise<SignedTransaction> {
    try {
      // Validate transaction data
      if (!txData.to || !txData.value) {
        throw new Error('Invalid transaction data');
      }

      // Estimate gas
      const gasEstimate = await this.estimateGas(txData);
      
      // Get current nonce for the wallet
      const nonce = await this.provider.getTransactionCount(this.wallet.address, 'pending');
      
      // Create transaction with estimated gas
      const transaction = {
        ...txData,
        gasLimit: gasEstimate,
        nonce: nonce,
        gasPrice: await this.provider.getGasPrice()
      };

      // Sign the transaction
      const signedTx = await this.wallet.signTransaction(transaction);
      
      // Get transaction hash
      const txHash = ethers.keccak256(signedTx);

      logger.info('Transaction signed successfully:', { txHash, nonce });

      return {
        signedTx,
        txHash,
        gasEstimate,
        nonce
      };
    } catch (error) {
      logger.error('Error signing transaction:', error);
      throw new Error('Failed to sign transaction');
    }
  }

  /**
   * Create and sign a deposit transaction
   */
  public async createDepositTransaction(request: TransactionRequest): Promise<SignedTransaction> {
    try {
      // Validate request
      if (!request.userAddress || !request.amount) {
        throw new Error('Invalid deposit request');
      }

      // Get user nonce
      const userNonce = await this.getUserNonce(request.userAddress);

      // Create transaction data for deposit
      const txData = {
        to: CONFIG.contracts.vaultAddress,
        value: ethers.parseEther(request.amount),
        data: this.encodeDepositData(request.userAddress, request.amount)
      };

      // Sign the transaction
      const signedTx = await this.signTransaction(txData);

      // Log transaction for audit
      await this.logTransaction({
        userAddress: request.userAddress,
        method: 'deposit',
        amount: request.amount,
        txHash: signedTx.txHash,
        nonce: userNonce.nonce
      });

      return signedTx;
    } catch (error) {
      logger.error('Error creating deposit transaction:', error);
      throw new Error('Failed to create deposit transaction');
    }
  }

  /**
   * Create and sign a withdraw transaction
   */
  public async createWithdrawTransaction(request: TransactionRequest): Promise<SignedTransaction> {
    try {
      // Validate request
      if (!request.userAddress || !request.amount) {
        throw new Error('Invalid withdraw request');
      }

      // Get user nonce
      const userNonce = await this.getUserNonce(request.userAddress);

      // Create transaction data for withdraw
      const txData = {
        to: CONFIG.contracts.vaultAddress,
        value: 0,
        data: this.encodeWithdrawData(request.userAddress, request.amount)
      };

      // Sign the transaction
      const signedTx = await this.signTransaction(txData);

      // Log transaction for audit
      await this.logTransaction({
        userAddress: request.userAddress,
        method: 'withdraw',
        amount: request.amount,
        txHash: signedTx.txHash,
        nonce: userNonce.nonce
      });

      return signedTx;
    } catch (error) {
      logger.error('Error creating withdraw transaction:', error);
      throw new Error('Failed to create withdraw transaction');
    }
  }

  /**
   * Log transaction for audit trail
   */
  private async logTransaction(txData: {
    userAddress: string;
    method: string;
    amount: string;
    txHash: string;
    nonce: number;
  }): Promise<void> {
    try {
      await supabase
        .from('transaction_logs')
        .insert([{
          user_address: txData.userAddress.toLowerCase(),
          method: txData.method,
          amount: txData.amount,
          tx_hash: txData.txHash,
          nonce: txData.nonce,
          created_at: new Date().toISOString()
        }]);
    } catch (error) {
      logger.error('Error logging transaction:', error);
      // Don't throw here as it's not critical
    }
  }

  /**
   * Encode deposit function call data
   */
  private encodeDepositData(userAddress: string, amount: string): string {
    // This would be the actual contract ABI encoding
    // For now, returning a placeholder
    const depositInterface = new ethers.Interface([
      'function deposit(address user, uint256 amount) external payable'
    ]);
    
    return depositInterface.encodeFunctionData('deposit', [userAddress, ethers.parseEther(amount)]);
  }

  /**
   * Encode withdraw function call data
   */
  private encodeWithdrawData(userAddress: string, amount: string): string {
    // This would be the actual contract ABI encoding
    // For now, returning a placeholder
    const withdrawInterface = new ethers.Interface([
      'function withdraw(address user, uint256 amount) external'
    ]);
    
    return withdrawInterface.encodeFunctionData('withdraw', [userAddress, ethers.parseEther(amount)]);
  }

  /**
   * Verify user signature for authentication
   */
  public async verifyUserSignature(
    userAddress: string,
    message: string,
    signature: string
  ): Promise<boolean> {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === userAddress.toLowerCase();
    } catch (error) {
      logger.error('Error verifying user signature:', error);
      return false;
    }
  }

  /**
   * Get wallet balance
   */
  public async getWalletBalance(): Promise<string> {
    try {
      const balance = await this.provider.getBalance(this.wallet.address);
      return ethers.formatEther(balance);
    } catch (error) {
      logger.error('Error getting wallet balance:', error);
      throw new Error('Failed to get wallet balance');
    }
  }

  /**
   * Get wallet address
   */
  public getWalletAddress(): string {
    return this.wallet.address;
  }
}

// Export singleton instance
export const secureApiService = SecureApiService.getInstance();


