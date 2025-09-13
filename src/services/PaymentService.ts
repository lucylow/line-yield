import { formatCurrency } from '@/utils/formatters';

// LINE Mini-Dapp Payment Service
export interface PaymentItem {
  itemIdentifier: string;
  name: string;
  imageUrl: string;
  price: string;
  currencyCode: 'USD' | 'KRW' | 'JPY' | 'TWD' | 'THB' | 'KAIA' | 'USDT';
  pgType: 'STRIPE' | 'CRYPTO';
  priceInSmallestUnit: string;
  description?: string;
  category?: string;
}

export interface PaymentRequest {
  buyerDappPortalAddress: string;
  pgType: 'STRIPE' | 'CRYPTO';
  currencyCode: string;
  price: string;
  paymentStatusChangeCallbackUrl: string;
  lockUrl: string;
  unlockUrl: string;
  items: PaymentItem[];
  testMode: boolean;
}

export interface PaymentResponse {
  id: string;
  status: string;
  paymentUrl?: string;
  expiresAt?: string;
}

export interface PaymentStatusUpdate {
  paymentId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  transactionHash?: string;
  timestamp: string;
}

export interface PaymentLockRequest {
  paymentId: string;
  buyerAddress: string;
  amount: string;
  currency: string;
}

export interface PaymentUnlockRequest {
  paymentId: string;
  reason: 'PAYMENT_COMPLETED' | 'PAYMENT_FAILED' | 'PAYMENT_CANCELLED';
}

class PaymentService {
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;
  private testMode: boolean;

  constructor() {
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://payment.dappportal.io/api/payment-v1' 
      : 'https://payment-test.dappportal.io/api/payment-v1';
    this.clientId = process.env.LINE_CLIENT_ID || '56008383-b17f-4d26-a035-f6a60daddb06';
    this.clientSecret = process.env.LINE_CLIENT_SECRET || 'f1b39121-a0fb-4f66-a9e7-064acedbb8f8';
    this.testMode = process.env.NODE_ENV !== 'production';
  }

  /**
   * Create a new payment request
   */
  async createPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/payment/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Id': this.clientId,
          'X-Client-Secret': this.clientSecret,
        },
        body: JSON.stringify(paymentRequest),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || `HTTP ${response.status}: Failed to create payment`);
      }

      const data: PaymentResponse = await response.json();
      
      // Log payment creation for audit
      console.log('Payment created:', {
        paymentId: data.id,
        buyerAddress: paymentRequest.buyerDappPortalAddress,
        amount: paymentRequest.price,
        currency: paymentRequest.currencyCode,
        pgType: paymentRequest.pgType,
        testMode: paymentRequest.testMode
      });

      return data;
    } catch (error) {
      console.error('Payment creation failed:', error);
      throw error;
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/payment/${paymentId}`, {
        method: 'GET',
        headers: {
          'X-Client-Id': this.clientId,
          'X-Client-Secret': this.clientSecret,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || `HTTP ${response.status}: Failed to get payment status`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get payment status:', error);
      throw error;
    }
  }

  /**
   * Handle payment status change webhook
   */
  async handlePaymentStatusChange(paymentId: string, status: string, transactionHash?: string): Promise<void> {
    try {
      // Update payment status in your database
      console.log('Payment status changed:', {
        paymentId,
        status,
        transactionHash,
        timestamp: new Date().toISOString()
      });

      // You would typically update your database here
      // await this.updatePaymentInDatabase(paymentId, status, transactionHash);

      // Send notification to user if needed
      if (status === 'COMPLETED') {
        await this.sendPaymentSuccessNotification(paymentId);
      } else if (status === 'FAILED') {
        await this.sendPaymentFailureNotification(paymentId);
      }
    } catch (error) {
      console.error('Failed to handle payment status change:', error);
      throw error;
    }
  }

  /**
   * Handle payment lock webhook
   */
  async handlePaymentLock(lockRequest: PaymentLockRequest): Promise<void> {
    try {
      console.log('Payment locked:', {
        paymentId: lockRequest.paymentId,
        buyerAddress: lockRequest.buyerAddress,
        amount: lockRequest.amount,
        currency: lockRequest.currency,
        timestamp: new Date().toISOString()
      });

      // Lock the funds in your system
      // await this.lockFunds(lockRequest);
    } catch (error) {
      console.error('Failed to handle payment lock:', error);
      throw error;
    }
  }

  /**
   * Handle payment unlock webhook
   */
  async handlePaymentUnlock(unlockRequest: PaymentUnlockRequest): Promise<void> {
    try {
      console.log('Payment unlocked:', {
        paymentId: unlockRequest.paymentId,
        reason: unlockRequest.reason,
        timestamp: new Date().toISOString()
      });

      // Unlock the funds in your system
      // await this.unlockFunds(unlockRequest);
    } catch (error) {
      console.error('Failed to handle payment unlock:', error);
      throw error;
    }
  }

  /**
   * Get payment history for a user
   */
  async getPaymentHistory(userAddress: string): Promise<PaymentStatusUpdate[]> {
    try {
      // In a real implementation, you would fetch from your database
      // For now, return mock data
      return [
        {
          paymentId: 'pay_123456789',
          status: 'COMPLETED',
          transactionHash: '0x1234567890abcdef',
          timestamp: new Date(Date.now() - 86400000).toISOString() // 1 day ago
        },
        {
          paymentId: 'pay_987654321',
          status: 'COMPLETED',
          transactionHash: '0xfedcba0987654321',
          timestamp: new Date(Date.now() - 172800000).toISOString() // 2 days ago
        }
      ];
    } catch (error) {
      console.error('Failed to get payment history:', error);
      throw error;
    }
  }

  /**
   * Validate payment request
   */
  validatePaymentRequest(request: PaymentRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.buyerDappPortalAddress) {
      errors.push('Buyer address is required');
    }

    if (!request.pgType || !['STRIPE', 'CRYPTO'].includes(request.pgType)) {
      errors.push('Valid payment gateway type is required');
    }

    if (!request.currencyCode) {
      errors.push('Currency code is required');
    }

    if (!request.price || parseFloat(request.price) <= 0) {
      errors.push('Valid price is required');
    }

    if (!request.items || request.items.length === 0) {
      errors.push('At least one item is required');
    }

    if (!request.paymentStatusChangeCallbackUrl) {
      errors.push('Payment status callback URL is required');
    }

    if (!request.lockUrl) {
      errors.push('Lock URL is required');
    }

    if (!request.unlockUrl) {
      errors.push('Unlock URL is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Calculate payment fees
   */
  calculatePaymentFees(amount: number, currency: string, pgType: string): number {
    const feeRates = {
      'STRIPE': {
        'USD': 0.029, // 2.9%
        'KRW': 0.029,
        'JPY': 0.029,
        'TWD': 0.029,
        'THB': 0.029
      },
      'CRYPTO': {
        'KAIA': 0.001, // 0.1%
        'USDT': 0.001
      }
    };

    const rate = feeRates[pgType as keyof typeof feeRates]?.[currency as keyof typeof feeRates.STRIPE] || 0.01;
    return amount * rate;
  }

  /**
   * Format payment amount for display
   */
  formatPaymentAmount(amount: string, currency: string): string {
    const numAmount = parseFloat(amount);
    
    switch (currency) {
      case 'USD':
      case 'KRW':
      case 'JPY':
      case 'TWD':
      case 'THB':
        return formatCurrency(numAmount);
      case 'KAIA':
        return `${numAmount.toFixed(4)} KAI`;
      case 'USDT':
        return `${numAmount.toFixed(2)} USDT`;
      default:
        return `${numAmount} ${currency}`;
    }
  }

  /**
   * Send payment success notification
   */
  private async sendPaymentSuccessNotification(paymentId: string): Promise<void> {
    // Implement notification logic (email, push notification, etc.)
    console.log(`Sending payment success notification for payment ${paymentId}`);
  }

  /**
   * Send payment failure notification
   */
  private async sendPaymentFailureNotification(paymentId: string): Promise<void> {
    // Implement notification logic
    console.log(`Sending payment failure notification for payment ${paymentId}`);
  }

  /**
   * Generate payment ID
   */
  generatePaymentId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `pay_${timestamp}_${random}`;
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    // Implement webhook signature verification
    // This is crucial for security in production
    return true; // Simplified for demo
  }
}

export const paymentService = new PaymentService();
export default paymentService;

