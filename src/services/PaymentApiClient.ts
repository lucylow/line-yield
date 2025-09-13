import axios, { AxiosInstance, AxiosResponse } from 'axios';

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

export interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  successRate: number;
  stripePayments: number;
  cryptoPayments: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class PaymentApiClient {
  private static instance: PaymentApiClient;
  private api: AxiosInstance;
  private baseURL: string;

  private constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    
    this.api = axios.create({
      baseURL: `${this.baseURL}/api/payments`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for logging
    this.api.interceptors.request.use(
      (config) => {
        console.log(`[PaymentAPI] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[PaymentAPI] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        console.error('[PaymentAPI] Response error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  public static getInstance(): PaymentApiClient {
    if (!PaymentApiClient.instance) {
      PaymentApiClient.instance = new PaymentApiClient();
    }
    return PaymentApiClient.instance;
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
      const response = await this.api.post('/stripe/create-intent', {
        amount,
        currency,
        userId,
        metadata
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create payment intent');
    }
  }

  /**
   * Confirm Stripe payment
   */
  public async confirmStripePayment(paymentIntentId: string): Promise<PaymentRecord> {
    try {
      const response = await this.api.post('/stripe/confirm', {
        paymentIntentId
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to confirm payment');
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
      const response = await this.api.post('/crypto/create', {
        amount,
        token,
        recipientAddress,
        userId,
        network
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create crypto payment');
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
      const response = await this.api.put(`/crypto/${paymentId}`, {
        txHash,
        status
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update crypto payment');
    }
  }

  /**
   * Get payment history for user
   */
  public async getPaymentHistory(userId: string, limit: number = 50): Promise<PaymentRecord[]> {
    try {
      const response = await this.api.get(`/history/${userId}?limit=${limit}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get payment history');
    }
  }

  /**
   * Get payment by ID
   */
  public async getPaymentById(paymentId: string): Promise<PaymentRecord> {
    try {
      const response = await this.api.get(`/${paymentId}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get payment');
    }
  }

  /**
   * Process refund
   */
  public async processRefund(paymentId: string, reason?: string): Promise<PaymentRecord> {
    try {
      const response = await this.api.post(`/${paymentId}/refund`, {
        reason
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to process refund');
    }
  }

  /**
   * Get payment statistics
   */
  public async getPaymentStats(userId?: string): Promise<PaymentStats> {
    try {
      const url = userId ? `/stats/${userId}` : '/stats';
      const response = await this.api.get(url);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get payment statistics');
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
}

// Export singleton instance
export const paymentApiClient = PaymentApiClient.getInstance();


