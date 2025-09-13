import Stripe from 'stripe';
import { CONFIG } from '../config';
import { Logger } from '../utils/logger';
import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';

const logger = new Logger('PaymentService');

// Initialize Stripe with secret key
const stripe = new Stripe(CONFIG.stripe.secretKey, {
  apiVersion: '2023-10-16',
});

// Initialize Supabase client
const supabase = createClient(CONFIG.supabase.url, CONFIG.supabase.serviceRoleKey);

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'requires_capture' | 'canceled' | 'succeeded';
  clientSecret: string;
  metadata?: Record<string, string>;
}

export interface CryptoPayment {
  id: string;
  amount: string;
  token: string;
  recipientAddress: string;
  txHash?: string;
  status: 'pending' | 'confirmed' | 'failed';
  network: 'kaia' | 'ethereum' | 'polygon';
}

export interface PaymentRecord {
  id: string;
  userId: string;
  type: 'stripe' | 'crypto';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentIntentId?: string;
  txHash?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export class PaymentService {
  private static instance: PaymentService;
  
  private constructor() {}

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  /**
   * Create Stripe payment intent
   */
  public async createStripePaymentIntent(
    amount: number,
    currency: string = 'usd',
    userId: string,
    metadata?: Record<string, string>
  ): Promise<PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        payment_method_types: ['card'],
        metadata: {
          userId,
          ...metadata
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Store payment record in Supabase
      await this.createPaymentRecord({
        userId,
        type: 'stripe',
        amount,
        currency,
        status: 'pending',
        paymentIntentId: paymentIntent.id,
        metadata
      });

      logger.info(`Stripe payment intent created: ${paymentIntent.id} for user ${userId}`);

      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100, // Convert back from cents
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        clientSecret: paymentIntent.client_secret!,
        metadata: paymentIntent.metadata
      };
    } catch (error) {
      logger.error('Error creating Stripe payment intent:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  /**
   * Confirm Stripe payment
   */
  public async confirmStripePayment(paymentIntentId: string): Promise<PaymentRecord> {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        // Update payment record in Supabase
        const { data, error } = await supabase
          .from('payments')
          .update({
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('payment_intent_id', paymentIntentId)
          .select()
          .single();

        if (error) throw error;

        logger.info(`Stripe payment confirmed: ${paymentIntentId}`);
        return data;
      }

      throw new Error(`Payment not succeeded: ${paymentIntent.status}`);
    } catch (error) {
      logger.error('Error confirming Stripe payment:', error);
      throw new Error('Failed to confirm payment');
    }
  }

  /**
   * Create crypto payment
   */
  public async createCryptoPayment(
    amount: string,
    token: string,
    recipientAddress: string,
    userId: string,
    network: 'kaia' | 'ethereum' | 'polygon' = 'kaia'
  ): Promise<CryptoPayment> {
    try {
      const paymentId = `crypto_${Date.now()}_${userId}`;
      
      // Store payment record in Supabase
      const { data, error } = await supabase
        .from('payments')
        .insert([{
          id: paymentId,
          user_id: userId,
          type: 'crypto',
          amount: parseFloat(amount),
          currency: token.toUpperCase(),
          status: 'pending',
          metadata: {
            network,
            recipient_address: recipientAddress,
            token
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      logger.info(`Crypto payment created: ${paymentId} for user ${userId}`);

      return {
        id: paymentId,
        amount,
        token,
        recipientAddress,
        status: 'pending',
        network
      };
    } catch (error) {
      logger.error('Error creating crypto payment:', error);
      throw new Error('Failed to create crypto payment');
    }
  }

  /**
   * Update crypto payment with transaction hash
   */
  public async updateCryptoPayment(
    paymentId: string,
    txHash: string,
    status: 'confirmed' | 'failed'
  ): Promise<PaymentRecord> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .update({
          tx_hash: txHash,
          status: status === 'confirmed' ? 'completed' : 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId)
        .select()
        .single();

      if (error) throw error;

      logger.info(`Crypto payment updated: ${paymentId} with tx ${txHash}`);
      return data;
    } catch (error) {
      logger.error('Error updating crypto payment:', error);
      throw new Error('Failed to update crypto payment');
    }
  }

  /**
   * Get payment history for user
   */
  public async getPaymentHistory(userId: string, limit: number = 50): Promise<PaymentRecord[]> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error getting payment history:', error);
      throw new Error('Failed to get payment history');
    }
  }

  /**
   * Get payment by ID
   */
  public async getPaymentById(paymentId: string): Promise<PaymentRecord | null> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      logger.error('Error getting payment by ID:', error);
      throw new Error('Failed to get payment');
    }
  }

  /**
   * Process refund
   */
  public async processRefund(paymentId: string, reason?: string): Promise<PaymentRecord> {
    try {
      const payment = await this.getPaymentById(paymentId);
      if (!payment) throw new Error('Payment not found');

      if (payment.type === 'stripe' && payment.paymentIntentId) {
        // Process Stripe refund
        const refund = await stripe.refunds.create({
          payment_intent: payment.paymentIntentId,
          reason: reason ? 'requested_by_customer' : undefined
        });

        // Update payment record
        const { data, error } = await supabase
          .from('payments')
          .update({
            status: 'refunded',
            metadata: {
              ...payment.metadata,
              refund_id: refund.id,
              refund_reason: reason
            },
            updated_at: new Date().toISOString()
          })
          .eq('id', paymentId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // For crypto payments, we can only mark as refunded in our system
        const { data, error } = await supabase
          .from('payments')
          .update({
            status: 'refunded',
            metadata: {
              ...payment.metadata,
              refund_reason: reason
            },
            updated_at: new Date().toISOString()
          })
          .eq('id', paymentId)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      logger.error('Error processing refund:', error);
      throw new Error('Failed to process refund');
    }
  }

  /**
   * Create payment record in Supabase
   */
  private async createPaymentRecord(paymentData: Omit<PaymentRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<PaymentRecord> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert([{
          user_id: paymentData.userId,
          type: paymentData.type,
          amount: paymentData.amount,
          currency: paymentData.currency,
          status: paymentData.status,
          payment_intent_id: paymentData.paymentIntentId,
          tx_hash: paymentData.txHash,
          metadata: paymentData.metadata,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error creating payment record:', error);
      throw error;
    }
  }

  /**
   * Get Stripe webhook signature verification
   */
  public verifyStripeWebhook(payload: string, signature: string): Stripe.Event {
    try {
      return stripe.webhooks.constructEvent(
        payload,
        signature,
        CONFIG.stripe.webhookSecret
      );
    } catch (error) {
      logger.error('Webhook signature verification failed:', error);
      throw new Error('Invalid webhook signature');
    }
  }

  /**
   * Handle Stripe webhook events
   */
  public async handleStripeWebhook(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.confirmStripePayment(event.data.object.id);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailure(event.data.object.id);
          break;
        default:
          logger.info(`Unhandled webhook event type: ${event.type}`);
      }
    } catch (error) {
      logger.error('Error handling webhook:', error);
      throw error;
    }
  }

  /**
   * Handle payment failure
   */
  private async handlePaymentFailure(paymentIntentId: string): Promise<void> {
    try {
      await supabase
        .from('payments')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('payment_intent_id', paymentIntentId);

      logger.info(`Payment marked as failed: ${paymentIntentId}`);
    } catch (error) {
      logger.error('Error handling payment failure:', error);
      throw error;
    }
  }

  /**
   * Get payment statistics
   */
  public async getPaymentStats(userId?: string): Promise<{
    totalPayments: number;
    totalAmount: number;
    successRate: number;
    stripePayments: number;
    cryptoPayments: number;
  }> {
    try {
      let query = supabase.from('payments').select('*');
      
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const payments = data || [];
      const totalPayments = payments.length;
      const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
      const successfulPayments = payments.filter(p => p.status === 'completed').length;
      const successRate = totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0;
      const stripePayments = payments.filter(p => p.type === 'stripe').length;
      const cryptoPayments = payments.filter(p => p.type === 'crypto').length;

      return {
        totalPayments,
        totalAmount,
        successRate,
        stripePayments,
        cryptoPayments
      };
    } catch (error) {
      logger.error('Error getting payment stats:', error);
      throw new Error('Failed to get payment statistics');
    }
  }
}

// Export singleton instance
export const paymentService = PaymentService.getInstance();


