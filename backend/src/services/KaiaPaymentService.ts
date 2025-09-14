import { CONFIG } from '../config';
import { Logger } from '../utils/logger';
import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';
import crypto from 'crypto';

// Initialize Supabase client
const supabase = createClient(CONFIG.supabase.url, CONFIG.supabase.serviceRoleKey);

export interface KaiaPayment {
  id: string;
  paymentId: number;
  buyerAddress: string;
  sellerAddress: string;
  amount: string;
  platformFee: string;
  loyaltyFee: string;
  sellerPayout: string;
  productId: string;
  description: string;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  orderHash: string;
  txHash?: string;
  createdAt: string;
  completedAt?: string;
}

export interface PaymentFeeStructure {
  platformFeePercent: number;
  loyaltyFeePercent: number;
  gasFeePercent: number;
  platformWallet: string;
  loyaltyWallet: string;
}

export interface PaymentStats {
  totalVolumeProcessed: string;
  totalFeesCollected: string;
  totalPayments: number;
  platformFeePercent: number;
  loyaltyFeePercent: number;
  gasFeePercent: number;
}

export interface CreatePaymentRequest {
  sellerAddress: string;
  amount: string;
  productId: string;
  description: string;
  buyerAddress: string;
}

export class KaiaPaymentService {
  private static instance: KaiaPaymentService;
  private provider: ethers.Provider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;

  private constructor() {
    this.provider = new ethers.JsonRpcProvider(CONFIG.kaia.rpcUrl);
    this.wallet = new ethers.Wallet(CONFIG.kaia.walletPrivateKey, this.provider);
    
    // Initialize contract (you'll need to deploy and get the address)
    const contractAddress = CONFIG.contracts.kaiaPaymentProcessorAddress || '0x0000000000000000000000000000000000000000';
    const contractABI = this.getContractABI();
    this.contract = new ethers.Contract(contractAddress, contractABI, this.wallet);
  }

  public static getInstance(): KaiaPaymentService {
    if (!KaiaPaymentService.instance) {
      KaiaPaymentService.instance = new KaiaPaymentService();
    }
    return KaiaPaymentService.instance;
  }

  /**
   * Create a new KAIA payment
   */
  async createPayment(request: CreatePaymentRequest): Promise<KaiaPayment> {
    try {
      const orderHash = this.generateOrderHash(request);
      const signature = await this.generateOrderSignature(request, orderHash);
      
      // Create payment record in database first
      const paymentRecord = await this.createPaymentRecord({
        buyerAddress: request.buyerAddress,
        sellerAddress: request.sellerAddress,
        amount: request.amount,
        productId: request.productId,
        description: request.description,
        orderHash,
        status: 'pending'
      });

      // Calculate fees
      const fees = await this.calculateFees(request.amount);
      
      Logger.info(`KAIA payment created: ${paymentRecord.id} - ${request.amount} KAIA`);
      
      return {
        ...paymentRecord,
        platformFee: fees.platformFee,
        loyaltyFee: fees.loyaltyFee,
        sellerPayout: fees.sellerPayout
      };
    } catch (error) {
      Logger.error('Error creating KAIA payment:', error);
      throw new Error('Failed to create KAIA payment');
    }
  }

  /**
   * Complete payment on blockchain
   */
  async completePayment(paymentId: number, sellerPrivateKey: string): Promise<string> {
    try {
      // Create seller wallet for signing
      const sellerWallet = new ethers.Wallet(sellerPrivateKey, this.provider);
      
      // Connect contract with seller wallet
      const sellerContract = this.contract.connect(sellerWallet);
      
      // Execute completion transaction
      const tx = await sellerContract.completePayment(paymentId);
      const receipt = await tx.wait();

      // Update payment record
      await this.updatePaymentRecord(paymentId, {
        status: 'completed',
        txHash: receipt.hash,
        completedAt: new Date().toISOString()
      });

      Logger.info(`KAIA payment completed: ${paymentId} - TX: ${receipt.hash}`);
      return receipt.hash;
    } catch (error) {
      Logger.error('Error completing KAIA payment:', error);
      throw new Error('Failed to complete KAIA payment');
    }
  }

  /**
   * Cancel payment
   */
  async cancelPayment(paymentId: number, reason: string, userAddress: string, userPrivateKey: string): Promise<string> {
    try {
      const userWallet = new ethers.Wallet(userPrivateKey, this.provider);
      const userContract = this.contract.connect(userWallet);
      
      const tx = await userContract.cancelPayment(paymentId, reason);
      const receipt = await tx.wait();

      // Update payment record
      await this.updatePaymentRecord(paymentId, {
        status: 'cancelled',
        txHash: receipt.hash
      });

      Logger.info(`KAIA payment cancelled: ${paymentId} - TX: ${receipt.hash}`);
      return receipt.hash;
    } catch (error) {
      Logger.error('Error cancelling KAIA payment:', error);
      throw new Error('Failed to cancel KAIA payment');
    }
  }

  /**
   * Process refund
   */
  async processRefund(paymentId: number, refundAmount: string): Promise<string> {
    try {
      const tx = await this.contract.processRefund(paymentId, ethers.parseEther(refundAmount));
      const receipt = await tx.wait();

      // Update payment record
      await this.updatePaymentRecord(paymentId, {
        status: 'refunded',
        txHash: receipt.hash
      });

      Logger.info(`KAIA payment refunded: ${paymentId} - Amount: ${refundAmount}`);
      return receipt.hash;
    } catch (error) {
      Logger.error('Error processing refund:', error);
      throw new Error('Failed to process refund');
    }
  }

  /**
   * Get payment by ID
   */
  async getPayment(paymentId: number): Promise<KaiaPayment | null> {
    try {
      const { data, error } = await supabase
        .from('kaia_payments')
        .select('*')
        .eq('payment_id', paymentId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data ? this.mapDatabaseToPayment(data) : null;
    } catch (error) {
      Logger.error('Error getting KAIA payment:', error);
      throw new Error('Failed to get KAIA payment');
    }
  }

  /**
   * Get user's payment history
   */
  async getUserPayments(userAddress: string, limit: number = 50): Promise<KaiaPayment[]> {
    try {
      const { data, error } = await supabase
        .from('kaia_payments')
        .select('*')
        .or(`buyer_address.eq.${userAddress},seller_address.eq.${userAddress}`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data ? data.map(this.mapDatabaseToPayment) : [];
    } catch (error) {
      Logger.error('Error getting user KAIA payments:', error);
      throw new Error('Failed to get user payments');
    }
  }

  /**
   * Get payment statistics
   */
  async getPaymentStats(): Promise<PaymentStats> {
    try {
      // Get stats from blockchain
      const contractStats = await this.contract.getPaymentStats();
      
      return {
        totalVolumeProcessed: ethers.formatEther(contractStats[0]),
        totalFeesCollected: ethers.formatEther(contractStats[1]),
        totalPayments: Number(contractStats[2]),
        platformFeePercent: Number(contractStats[3]),
        loyaltyFeePercent: Number(contractStats[4]),
        gasFeePercent: Number(contractStats[5])
      };
    } catch (error) {
      Logger.error('Error getting payment stats:', error);
      throw new Error('Failed to get payment statistics');
    }
  }

  /**
   * Calculate fees for a given amount
   */
  async calculateFees(amount: string): Promise<{
    platformFee: string;
    loyaltyFee: string;
    sellerPayout: string;
  }> {
    try {
      const fees = await this.contract.calculateFees(ethers.parseEther(amount));
      
      return {
        platformFee: ethers.formatEther(fees[0]),
        loyaltyFee: ethers.formatEther(fees[1]),
        sellerPayout: ethers.formatEther(fees[2])
      };
    } catch (error) {
      Logger.error('Error calculating fees:', error);
      throw new Error('Failed to calculate fees');
    }
  }

  /**
   * Update fee structure (admin only)
   */
  async updateFeeStructure(
    platformFeePercent: number,
    loyaltyFeePercent: number,
    gasFeePercent: number
  ): Promise<string> {
    try {
      const tx = await this.contract.updateFeeStructure(
        platformFeePercent,
        loyaltyFeePercent,
        gasFeePercent
      );
      const receipt = await tx.wait();

      Logger.info(`Fee structure updated - TX: ${receipt.hash}`);
      return receipt.hash;
    } catch (error) {
      Logger.error('Error updating fee structure:', error);
      throw new Error('Failed to update fee structure');
    }
  }

  /**
   * Get KAIA token balance for an address
   */
  async getKaiaBalance(address: string): Promise<string> {
    try {
      const balance = await this.contract.kaiaToken().balanceOf(address);
      return ethers.formatEther(balance);
    } catch (error) {
      Logger.error('Error getting KAIA balance:', error);
      throw new Error('Failed to get KAIA balance');
    }
  }

  /**
   * Create payment record in database
   */
  private async createPaymentRecord(paymentData: {
    buyerAddress: string;
    sellerAddress: string;
    amount: string;
    productId: string;
    description: string;
    orderHash: string;
    status: string;
  }): Promise<KaiaPayment> {
    try {
      const { data, error } = await supabase
        .from('kaia_payments')
        .insert([{
          buyer_address: paymentData.buyerAddress,
          seller_address: paymentData.sellerAddress,
          amount: paymentData.amount,
          product_id: paymentData.productId,
          description: paymentData.description,
          order_hash: paymentData.orderHash,
          status: paymentData.status,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return this.mapDatabaseToPayment(data);
    } catch (error) {
      Logger.error('Error creating payment record:', error);
      throw error;
    }
  }

  /**
   * Update payment record
   */
  private async updatePaymentRecord(paymentId: number, updates: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('kaia_payments')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('payment_id', paymentId);

      if (error) throw error;
    } catch (error) {
      Logger.error('Error updating payment record:', error);
      throw error;
    }
  }

  /**
   * Generate order hash
   */
  private generateOrderHash(request: CreatePaymentRequest): string {
    return ethers.solidityPackedKeccak256(
      ['address', 'address', 'uint256', 'string', 'uint256'],
      [
        request.buyerAddress,
        request.sellerAddress,
        ethers.parseEther(request.amount),
        request.productId,
        Date.now()
      ]
    );
  }

  /**
   * Generate order signature
   */
  private async generateOrderSignature(request: CreatePaymentRequest, orderHash: string): Promise<string> {
    const messageHash = ethers.solidityPackedKeccak256(
      ['address', 'uint256', 'string', 'bytes32', 'address'],
      [
        request.sellerAddress,
        ethers.parseEther(request.amount),
        request.productId,
        orderHash,
        await this.contract.getAddress()
      ]
    );
    
    return await this.wallet.signMessage(ethers.getBytes(messageHash));
  }

  /**
   * Map database record to KaiaPayment
   */
  private mapDatabaseToPayment(data: any): KaiaPayment {
    return {
      id: data.id,
      paymentId: data.payment_id,
      buyerAddress: data.buyer_address,
      sellerAddress: data.seller_address,
      amount: data.amount,
      platformFee: data.platform_fee || '0',
      loyaltyFee: data.loyalty_fee || '0',
      sellerPayout: data.seller_payout || '0',
      productId: data.product_id,
      description: data.description,
      status: data.status,
      orderHash: data.order_hash,
      txHash: data.tx_hash,
      createdAt: data.created_at,
      completedAt: data.completed_at
    };
  }

  /**
   * Get contract ABI (simplified version)
   */
  private getContractABI(): any[] {
    return [
      "function createPayment(address seller, uint256 amount, string productId, string description, bytes32 orderHash, bytes signature) external returns (uint256)",
      "function completePayment(uint256 paymentId) external",
      "function cancelPayment(uint256 paymentId, string reason) external",
      "function processRefund(uint256 paymentId, uint256 refundAmount) external",
      "function getPayment(uint256 paymentId) external view returns (tuple)",
      "function getUserPayments(address user) external view returns (uint256[])",
      "function getPaymentStats() external view returns (uint256, uint256, uint256, uint256, uint256, uint256)",
      "function calculateFees(uint256 amount) external view returns (uint256, uint256, uint256)",
      "function updateFeeStructure(uint256 platformFeePercent, uint256 loyaltyFeePercent, uint256 gasFeePercent) external",
      "function kaiaToken() external view returns (address)",
      "function getAddress() external view returns (address)"
    ];
  }
}

export const kaiaPaymentService = KaiaPaymentService.getInstance();

