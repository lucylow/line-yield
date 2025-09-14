import { ethers } from 'ethers';
import Stripe from 'stripe';
import { SupabaseClient } from '@supabase/supabase-js';

interface PaymentMethod {
  type: 'crypto' | 'stripe';
  currency: string;
  amount: number;
}

interface CryptoPayment {
  method: 'crypto';
  currency: 'YIELD' | 'KAIA' | 'USDT';
  amount: string;
  userAddress: string;
  itemId: string;
}

interface StripePayment {
  method: 'stripe';
  currency: 'USD' | 'KRW' | 'JPY' | 'TWD' | 'THB';
  amount: number;
  userEmail: string;
  itemId: string;
  paymentMethodId?: string;
}

interface PaymentResult {
  success: boolean;
  transactionId?: string;
  paymentIntentId?: string;
  error?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
}

interface UserInventory {
  userId: string;
  items: Array<{
    itemId: string;
    quantity: number;
    purchasedAt: string;
    expiresAt?: string;
    isActive: boolean;
  }>;
}

export class PaymentService {
  private stripe: Stripe;
  private provider: ethers.providers.Provider | null = null;
  private supabase: SupabaseClient;
  private yieldTokenContract: ethers.Contract | null = null;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
    });
  }

  async initialize(provider: ethers.providers.Provider, yieldTokenAddress: string) {
    this.provider = provider;
    
    // YieldToken contract ABI (simplified)
    const contractABI = [
      'function transfer(address to, uint256 amount) external returns (bool)',
      'function transferFrom(address from, address to, uint256 amount) external returns (bool)',
      'function approve(address spender, uint256 amount) external returns (bool)',
      'function allowance(address owner, address spender) external view returns (uint256)',
      'function balanceOf(address account) external view returns (uint256)',
      'event Transfer(address indexed from, address indexed to, uint256 value)'
    ];

    this.yieldTokenContract = new ethers.Contract(yieldTokenAddress, contractABI, provider);
  }

  /**
   * Process crypto payment
   */
  async processCryptoPayment(payment: CryptoPayment): Promise<PaymentResult> {
    try {
      if (!this.yieldTokenContract) {
        throw new Error('YieldToken contract not initialized');
      }

      const userAddress = payment.userAddress;
      const amount = ethers.utils.parseEther(payment.amount);
      
      // Check user balance
      const balance = await this.yieldTokenContract.balanceOf(userAddress);
      if (balance.lt(amount)) {
        return {
          success: false,
          error: 'Insufficient balance',
          status: 'failed'
        };
      }

      // Get platform wallet address (where payments go)
      const platformAddress = process.env.PLATFORM_WALLET_ADDRESS;
      if (!platformAddress) {
        throw new Error('Platform wallet address not configured');
      }

      // Create transaction
      const signer = this.provider!.getSigner(userAddress);
      const contractWithSigner = this.yieldTokenContract.connect(signer);
      
      const tx = await contractWithSigner.transfer(platformAddress, amount);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        // Payment successful, add item to user inventory
        await this.addItemToInventory(userAddress, payment.itemId, 1);
        
        // Log payment
        await this.logPayment({
          userId: userAddress,
          itemId: payment.itemId,
          amount: payment.amount,
          currency: payment.currency,
          method: 'crypto',
          transactionHash: tx.hash,
          status: 'completed'
        });

        return {
          success: true,
          transactionId: tx.hash,
          status: 'completed'
        };
      } else {
        return {
          success: false,
          error: 'Transaction failed',
          status: 'failed'
        };
      }
    } catch (error) {
      console.error('Crypto payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'failed'
      };
    }
  }

  /**
   * Process Stripe payment
   */
  async processStripePayment(payment: StripePayment): Promise<PaymentResult> {
    try {
      // Create payment intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(payment.amount * 100), // Convert to cents
        currency: payment.currency.toLowerCase(),
        customer_email: payment.userEmail,
        metadata: {
          itemId: payment.itemId,
          userId: payment.userEmail // Using email as user ID for Stripe
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // If payment method is provided, confirm the payment
      if (payment.paymentMethodId) {
        const confirmedPayment = await this.stripe.paymentIntents.confirm(
          paymentIntent.id,
          {
            payment_method: payment.paymentMethodId,
          }
        );

        if (confirmedPayment.status === 'succeeded') {
          // Payment successful, add item to user inventory
          await this.addItemToInventory(payment.userEmail, payment.itemId, 1);
          
          // Log payment
          await this.logPayment({
            userId: payment.userEmail,
            itemId: payment.itemId,
            amount: payment.amount.toString(),
            currency: payment.currency,
            method: 'stripe',
            transactionHash: confirmedPayment.id,
            status: 'completed'
          });

          return {
            success: true,
            paymentIntentId: confirmedPayment.id,
            status: 'completed'
          };
        }
      }

      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        status: 'pending'
      };
    } catch (error) {
      console.error('Stripe payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'failed'
      };
    }
  }

  /**
   * Create Stripe customer
   */
  async createStripeCustomer(email: string, name?: string): Promise<string> {
    const customer = await this.stripe.customers.create({
      email,
      name,
    });
    return customer.id;
  }

  /**
   * Get payment methods for a customer
   */
  async getCustomerPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    const paymentMethods = await this.stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });
    return paymentMethods.data;
  }

  /**
   * Add item to user inventory
   */
  private async addItemToInventory(userId: string, itemId: string, quantity: number): Promise<void> {
    const { error } = await this.supabase
      .from('user_inventory')
      .upsert({
        user_id: userId,
        item_id: itemId,
        quantity: quantity,
        purchased_at: new Date().toISOString(),
        is_active: true
      }, {
        onConflict: 'user_id,item_id'
      });

    if (error) throw error;
  }

  /**
   * Get user inventory
   */
  async getUserInventory(userId: string): Promise<UserInventory> {
    const { data, error } = await this.supabase
      .from('user_inventory')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) throw error;

    return {
      userId,
      items: data?.map(item => ({
        itemId: item.item_id,
        quantity: item.quantity,
        purchasedAt: item.purchased_at,
        expiresAt: item.expires_at,
        isActive: item.is_active
      })) || []
    };
  }

  /**
   * Log payment transaction
   */
  private async logPayment(payment: {
    userId: string;
    itemId: string;
    amount: string;
    currency: string;
    method: string;
    transactionHash: string;
    status: string;
  }): Promise<void> {
    const { error } = await this.supabase
      .from('payment_transactions')
      .insert({
        user_id: payment.userId,
        item_id: payment.itemId,
        amount: payment.amount,
        currency: payment.currency,
        payment_method: payment.method,
        transaction_hash: payment.transactionHash,
        status: payment.status,
        created_at: new Date().toISOString()
      });

    if (error) throw error;
  }

  /**
   * Get payment history for a user
   */
  async getPaymentHistory(userId: string, limit: number = 50): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('payment_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  /**
   * Process refund
   */
  async processRefund(transactionId: string, reason: string): Promise<PaymentResult> {
    try {
      // Check if it's a Stripe payment
      if (transactionId.startsWith('pi_')) {
        const refund = await this.stripe.refunds.create({
          payment_intent: transactionId,
          reason: 'requested_by_customer',
          metadata: {
            reason
          }
        });

        // Update payment status
        await this.supabase
          .from('payment_transactions')
          .update({ status: 'refunded' })
          .eq('transaction_hash', transactionId);

        return {
          success: true,
          paymentIntentId: refund.id,
          status: 'refunded'
        };
      } else {
        // For crypto payments, we would need to implement a refund mechanism
        // This could involve transferring tokens back to the user
        return {
          success: false,
          error: 'Crypto refunds not implemented',
          status: 'failed'
        };
      }
    } catch (error) {
      console.error('Refund error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'failed'
      };
    }
  }

  /**
   * Get payment statistics
   */
  async getPaymentStats(): Promise<{
    totalRevenue: number;
    cryptoPayments: number;
    stripePayments: number;
    totalTransactions: number;
    averageOrderValue: number;
  }> {
    const { data, error } = await this.supabase
      .from('payment_transactions')
      .select('amount, currency, payment_method, status');

    if (error) throw error;

    const transactions = data || [];
    const completedTransactions = transactions.filter(t => t.status === 'completed');
    
    const cryptoPayments = completedTransactions.filter(t => t.payment_method === 'crypto').length;
    const stripePayments = completedTransactions.filter(t => t.payment_method === 'stripe').length;
    
    // Calculate total revenue (simplified - would need proper currency conversion)
    const totalRevenue = completedTransactions.reduce((sum, t) => {
      return sum + parseFloat(t.amount);
    }, 0);

    return {
      totalRevenue,
      cryptoPayments,
      stripePayments,
      totalTransactions: completedTransactions.length,
      averageOrderValue: completedTransactions.length > 0 ? totalRevenue / completedTransactions.length : 0
    };
  }

  /**
   * Validate payment method
   */
  async validatePaymentMethod(payment: CryptoPayment | StripePayment): Promise<boolean> {
    try {
      if (payment.method === 'crypto') {
        const cryptoPayment = payment as CryptoPayment;
        
        // Validate wallet address
        if (!ethers.utils.isAddress(cryptoPayment.userAddress)) {
          return false;
        }

        // Validate amount
        if (parseFloat(cryptoPayment.amount) <= 0) {
          return false;
        }

        return true;
      } else {
        const stripePayment = payment as StripePayment;
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(stripePayment.userEmail)) {
          return false;
        }

        // Validate amount
        if (stripePayment.amount <= 0) {
          return false;
        }

        return true;
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * Get supported currencies
   */
  getSupportedCurrencies(): {
    crypto: string[];
    fiat: string[];
  } {
    return {
      crypto: ['YIELD', 'KAIA', 'USDT'],
      fiat: ['USD', 'KRW', 'JPY', 'TWD', 'THB']
    };
  }

  /**
   * Calculate fees
   */
  calculateFees(amount: number, currency: string, paymentMethod: 'crypto' | 'stripe'): {
    amount: number;
    fee: number;
    total: number;
    feePercentage: number;
  } {
    let feePercentage = 0;
    
    if (paymentMethod === 'crypto') {
      feePercentage = 0.5; // 0.5% for crypto payments
    } else {
      // Stripe fees vary by country and payment method
      feePercentage = 2.9; // 2.9% + 30¢ for most cards
    }

    const fee = amount * (feePercentage / 100);
    const total = amount + fee;

    return {
      amount,
      fee,
      total,
      feePercentage
    };
  }
}

