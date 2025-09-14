import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface QRPaymentSession {
  id: string;
  amount: string;
  token: string;
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  createdAt: number;
  expiresAt: number;
  payerAddress?: string;
  transactionHash?: string;
  qrCodeData: string;
}

export interface CreatePaymentRequest {
  amount: string;
  token?: string;
  userAddress: string;
  vaultAddress: string;
  description?: string;
  reference?: string;
  expiresInMinutes?: number;
}

export interface PaymentStatusResponse {
  id: string;
  amount: string;
  token: string;
  status: string;
  createdAt: number;
  expiresAt: number;
  payerAddress?: string;
  transactionHash?: string;
  qrCodeData: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class QRPaymentService {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_BASE_URL}/qr-payment`;
  }

  /**
   * Create a new QR payment session
   */
  async createPaymentSession(request: CreatePaymentRequest): Promise<QRPaymentSession> {
    try {
      const response = await axios.post<ApiResponse<QRPaymentSession>>(
        `${this.baseURL}/create`,
        request
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to create payment session');
      }

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.message;
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  /**
   * Get payment session status
   */
  async getPaymentStatus(sessionId: string): Promise<PaymentStatusResponse | null> {
    try {
      const response = await axios.get<ApiResponse<PaymentStatusResponse>>(
        `${this.baseURL}/status/${sessionId}`
      );

      if (!response.data.success) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(response.data.error || 'Failed to get payment status');
      }

      return response.data.data || null;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          return null;
        }
        const errorMessage = error.response?.data?.error || error.message;
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  /**
   * Confirm payment (for testing purposes)
   */
  async confirmPayment(sessionId: string): Promise<{ transactionHash: string; payerAddress: string }> {
    try {
      const response = await axios.post<ApiResponse<{ transactionHash: string; payerAddress: string }>>(
        `${this.baseURL}/mock-confirm`,
        { sessionId }
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to confirm payment');
      }

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.message;
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  /**
   * Cancel payment session
   */
  async cancelPayment(sessionId: string, userAddress: string): Promise<void> {
    try {
      const response = await axios.post<ApiResponse<void>>(
        `${this.baseURL}/cancel`,
        { sessionId, userAddress }
      );

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to cancel payment');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.message;
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  /**
   * Get user's payment sessions
   */
  async getUserSessions(userAddress: string): Promise<QRPaymentSession[]> {
    try {
      const response = await axios.get<ApiResponse<QRPaymentSession[]>>(
        `${this.baseURL}/sessions/${userAddress}`
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to get user sessions');
      }

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.message;
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  /**
   * Get service statistics
   */
  async getStats(): Promise<{
    total: number;
    pending: number;
    paid: number;
    expired: number;
    cancelled: number;
  }> {
    try {
      const response = await axios.get<ApiResponse<{
        total: number;
        pending: number;
        paid: number;
        expired: number;
        cancelled: number;
      }>>(`${this.baseURL}/stats`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to get statistics');
      }

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.message;
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  /**
   * Parse QR code data
   */
  parseQRCodeData(qrCodeData: string): {
    type: string;
    sessionId: string;
    amount: string;
    token: string;
    vaultAddress: string;
    userAddress: string;
    url: string;
    timestamp: number;
  } | null {
    try {
      return JSON.parse(qrCodeData);
    } catch (error) {
      console.error('Failed to parse QR code data:', error);
      return null;
    }
  }

  /**
   * Format amount for display
   */
  formatAmount(amount: string, token: string = 'USDT'): string {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return '0';
    
    return `${numAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    })} ${token}`;
  }

  /**
   * Format time remaining
   */
  formatTimeRemaining(expiresAt: number): string {
    const now = Date.now();
    const remaining = expiresAt - now;
    
    if (remaining <= 0) return 'Expired';
    
    const minutes = Math.floor(remaining / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    
    return `${seconds}s`;
  }

  /**
   * Check if payment is expired
   */
  isExpired(expiresAt: number): boolean {
    return Date.now() > expiresAt;
  }

  /**
   * Get status color for UI
   */
  getStatusColor(status: string): string {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'paid':
        return 'text-green-600 bg-green-100';
      case 'expired':
        return 'text-red-600 bg-red-100';
      case 'cancelled':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  /**
   * Get status icon for UI
   */
  getStatusIcon(status: string): string {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'paid':
        return '✅';
      case 'expired':
        return '❌';
      case 'cancelled':
        return '🚫';
      default:
        return '❓';
    }
  }
}

// Export singleton instance
export const qrPaymentService = new QRPaymentService();
export default qrPaymentService;



