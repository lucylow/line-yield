import axios, { AxiosInstance } from 'axios';
import { PaymentRequest, PaymentStatus, SettlementRequest } from '../types/payment';

/**
 * LINE NEXT Integration Service
 * Handles payment processing through LINE NEXT platform
 */
export class LINENextService {
  private apiClient: AxiosInstance;
  private readonly baseURL: string;
  private readonly apiKey: string;
  private readonly channelId: string;

  constructor() {
    this.baseURL = process.env.LINE_NEXT_API_URL || 'https://api.line-next.com';
    this.apiKey = process.env.LINE_NEXT_API_KEY || '';
    this.channelId = process.env.LINE_CHANNEL_ID || '';

    this.apiClient = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-Channel-ID': this.channelId
      },
      timeout: 30000
    });
  }

  /**
   * Create payment request in LINE NEXT
   * @param paymentData Payment request data
   * @returns LINE NEXT payment response
   */
  async createPaymentRequest(paymentData: {
    userId: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    description: string;
    metadata?: any;
  }): Promise<{
    success: boolean;
    paymentId?: string;
    lineNextTransactionId?: string;
    approvalUrl?: string;
    error?: string;
  }> {
    try {
      const response = await this.apiClient.post('/v1/payments/create', {
        channel_id: this.channelId,
        user_id: paymentData.userId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        payment_method: paymentData.paymentMethod,
        description: paymentData.description,
        metadata: paymentData.metadata,
        callback_url: `${process.env.APP_URL}/api/payments/callback`,
        success_url: `${process.env.APP_URL}/payments/success`,
        cancel_url: `${process.env.APP_URL}/payments/cancel`
      });

      if (response.data.success) {
        return {
          success: true,
          paymentId: response.data.payment_id,
          lineNextTransactionId: response.data.transaction_id,
          approvalUrl: response.data.approval_url
        };
      } else {
        return {
          success: false,
          error: response.data.error || 'Payment request failed'
        };
      }
    } catch (error: any) {
      console.error('LINE NEXT payment request error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Network error'
      };
    }
  }

  /**
   * Get payment status from LINE NEXT
   * @param lineNextTransactionId LINE NEXT transaction ID
   * @returns Payment status
   */
  async getPaymentStatus(lineNextTransactionId: string): Promise<{
    success: boolean;
    status?: PaymentStatus;
    amount?: number;
    currency?: string;
    processorTransactionId?: string;
    error?: string;
  }> {
    try {
      const response = await this.apiClient.get(`/v1/payments/${lineNextTransactionId}/status`);

      if (response.data.success) {
        const lineNextStatus = response.data.status;
        let ourStatus: PaymentStatus;

        switch (lineNextStatus) {
          case 'pending':
            ourStatus = PaymentStatus.Pending;
            break;
          case 'approved':
            ourStatus = PaymentStatus.Approved;
            break;
          case 'processing':
            ourStatus = PaymentStatus.Processing;
            break;
          case 'completed':
            ourStatus = PaymentStatus.Completed;
            break;
          case 'failed':
            ourStatus = PaymentStatus.Failed;
            break;
          case 'cancelled':
            ourStatus = PaymentStatus.Cancelled;
            break;
          default:
            ourStatus = PaymentStatus.Pending;
        }

        return {
          success: true,
          status: ourStatus,
          amount: response.data.amount,
          currency: response.data.currency,
          processorTransactionId: response.data.processor_transaction_id
        };
      } else {
        return {
          success: false,
          error: response.data.error || 'Failed to get payment status'
        };
      }
    } catch (error: any) {
      console.error('LINE NEXT payment status error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Network error'
      };
    }
  }

  /**
   * Cancel payment in LINE NEXT
   * @param lineNextTransactionId LINE NEXT transaction ID
   * @returns Cancellation result
   */
  async cancelPayment(lineNextTransactionId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const response = await this.apiClient.post(`/v1/payments/${lineNextTransactionId}/cancel`);

      if (response.data.success) {
        return { success: true };
      } else {
        return {
          success: false,
          error: response.data.error || 'Payment cancellation failed'
        };
      }
    } catch (error: any) {
      console.error('LINE NEXT payment cancellation error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Network error'
      };
    }
  }

  /**
   * Refund payment in LINE NEXT
   * @param lineNextTransactionId LINE NEXT transaction ID
   * @param amount Refund amount
   * @param reason Refund reason
   * @returns Refund result
   */
  async refundPayment(
    lineNextTransactionId: string,
    amount: number,
    reason: string
  ): Promise<{
    success: boolean;
    refundId?: string;
    error?: string;
  }> {
    try {
      const response = await this.apiClient.post(`/v1/payments/${lineNextTransactionId}/refund`, {
        amount: amount,
        reason: reason
      });

      if (response.data.success) {
        return {
          success: true,
          refundId: response.data.refund_id
        };
      } else {
        return {
          success: false,
          error: response.data.error || 'Payment refund failed'
        };
      }
    } catch (error: any) {
      console.error('LINE NEXT payment refund error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Network error'
      };
    }
  }

  /**
   * Create settlement request in LINE NEXT
   * @param settlementData Settlement data
   * @returns Settlement response
   */
  async createSettlementRequest(settlementData: {
    paymentId: string;
    amount: number;
    currency: string;
    targetCurrency: string;
    otcPartnerId: string;
  }): Promise<{
    success: boolean;
    settlementId?: string;
    otcTransactionId?: string;
    error?: string;
  }> {
    try {
      const response = await this.apiClient.post('/v1/settlements/create', {
        payment_id: settlementData.paymentId,
        amount: settlementData.amount,
        currency: settlementData.currency,
        target_currency: settlementData.targetCurrency,
        otc_partner_id: settlementData.otcPartnerId,
        callback_url: `${process.env.APP_URL}/api/settlements/callback`
      });

      if (response.data.success) {
        return {
          success: true,
          settlementId: response.data.settlement_id,
          otcTransactionId: response.data.otc_transaction_id
        };
      } else {
        return {
          success: false,
          error: response.data.error || 'Settlement request failed'
        };
      }
    } catch (error: any) {
      console.error('LINE NEXT settlement request error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Network error'
      };
    }
  }

  /**
   * Get settlement status from LINE NEXT
   * @param settlementId Settlement ID
   * @returns Settlement status
   */
  async getSettlementStatus(settlementId: string): Promise<{
    success: boolean;
    status?: string;
    usdtAmount?: number;
    transactionHash?: string;
    error?: string;
  }> {
    try {
      const response = await this.apiClient.get(`/v1/settlements/${settlementId}/status`);

      if (response.data.success) {
        return {
          success: true,
          status: response.data.status,
          usdtAmount: response.data.usdt_amount,
          transactionHash: response.data.transaction_hash
        };
      } else {
        return {
          success: false,
          error: response.data.error || 'Failed to get settlement status'
        };
      }
    } catch (error: any) {
      console.error('LINE NEXT settlement status error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Network error'
      };
    }
  }

  /**
   * Send notification to LINE user
   * @param userId LINE user ID
   * @param message Notification message
   * @param data Additional data
   * @returns Notification result
   */
  async sendNotification(
    userId: string,
    message: string,
    data?: any
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const response = await this.apiClient.post('/v1/notifications/send', {
        user_id: userId,
        message: message,
        data: data
      });

      if (response.data.success) {
        return { success: true };
      } else {
        return {
          success: false,
          error: response.data.error || 'Notification failed'
        };
      }
    } catch (error: any) {
      console.error('LINE NEXT notification error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Network error'
      };
    }
  }

  /**
   * Verify webhook signature
   * @param payload Webhook payload
   * @param signature Webhook signature
   * @returns Verification result
   */
  async verifyWebhookSignature(payload: string, signature: string): Promise<boolean> {
    try {
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', process.env.LINE_NEXT_WEBHOOK_SECRET || '')
        .update(payload)
        .digest('hex');

      return signature === expectedSignature;
    } catch (error) {
      console.error('Webhook signature verification error:', error);
      return false;
    }
  }

  /**
   * Handle payment webhook
   * @param webhookData Webhook data
   * @returns Processing result
   */
  async handlePaymentWebhook(webhookData: any): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const { transaction_id, status, amount, currency, processor_transaction_id } = webhookData;

      // Update payment status in database
      // This would typically call your database service
      console.log('Processing payment webhook:', {
        transaction_id,
        status,
        amount,
        currency,
        processor_transaction_id
      });

      return { success: true };
    } catch (error: any) {
      console.error('Payment webhook processing error:', error);
      return {
        success: false,
        error: error.message || 'Webhook processing failed'
      };
    }
  }

  /**
   * Handle settlement webhook
   * @param webhookData Webhook data
   * @returns Processing result
   */
  async handleSettlementWebhook(webhookData: any): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const { settlement_id, status, usdt_amount, transaction_hash } = webhookData;

      // Update settlement status in database
      // This would typically call your database service
      console.log('Processing settlement webhook:', {
        settlement_id,
        status,
        usdt_amount,
        transaction_hash
      });

      return { success: true };
    } catch (error: any) {
      console.error('Settlement webhook processing error:', error);
      return {
        success: false,
        error: error.message || 'Webhook processing failed'
      };
    }
  }
}

export default LINENextService;

