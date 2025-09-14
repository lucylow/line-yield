import { v4 as uuidv4 } from 'uuid';
import { ethers } from 'ethers';
import { Logger } from '../utils/logger';
import { CONFIG } from '../config';

export interface QRPaymentSession {
  id: string;
  amount: string;
  token: string; // USDT, KLAY, etc.
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  createdAt: number;
  expiresAt: number;
  payerAddress?: string;
  transactionHash?: string;
  vaultAddress: string;
  userAddress: string;
  qrCodeData: string;
  metadata?: {
    description?: string;
    reference?: string;
    [key: string]: any;
  };
}

export interface CreatePaymentRequest {
  amount: string;
  token: string;
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

export class QRPaymentService {
  private sessions: Map<string, QRPaymentSession> = new Map();
  private readonly DEFAULT_EXPIRY_MINUTES = 15;
  private readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Start cleanup interval for expired sessions
    setInterval(() => this.cleanupExpiredSessions(), this.CLEANUP_INTERVAL);
  }

  /**
   * Create a new QR payment session
   */
  async createPaymentSession(request: CreatePaymentRequest): Promise<QRPaymentSession> {
    try {
      const sessionId = uuidv4();
      const expiresInMinutes = request.expiresInMinutes || this.DEFAULT_EXPIRY_MINUTES;
      const expiresAt = Date.now() + (expiresInMinutes * 60 * 1000);

      // Generate QR code data - using a custom URL scheme for Line Yield
      const qrCodeData = this.generateQRCodeData(sessionId, request);

      const session: QRPaymentSession = {
        id: sessionId,
        amount: request.amount,
        token: request.token,
        status: 'pending',
        createdAt: Date.now(),
        expiresAt,
        vaultAddress: request.vaultAddress,
        userAddress: request.userAddress,
        qrCodeData,
        metadata: {
          description: request.description,
          reference: request.reference,
        },
      };

      this.sessions.set(sessionId, session);

      Logger.info(`Created QR payment session: ${sessionId}`, {
        amount: request.amount,
        token: request.token,
        userAddress: request.userAddress,
      });

      return session;
    } catch (error) {
      Logger.error('Failed to create QR payment session', error);
      throw new Error('Failed to create payment session');
    }
  }

  /**
   * Get payment session status
   */
  async getPaymentStatus(sessionId: string): Promise<PaymentStatusResponse | null> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    // Check if session has expired
    if (session.status === 'pending' && Date.now() > session.expiresAt) {
      session.status = 'expired';
      this.sessions.set(sessionId, session);
    }

    return {
      id: session.id,
      amount: session.amount,
      token: session.token,
      status: session.status,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      payerAddress: session.payerAddress,
      transactionHash: session.transactionHash,
      qrCodeData: session.qrCodeData,
    };
  }

  /**
   * Confirm payment (called by webhook or manual confirmation)
   */
  async confirmPayment(
    sessionId: string,
    transactionHash: string,
    payerAddress: string
  ): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      Logger.warn(`Payment session not found: ${sessionId}`);
      return false;
    }

    if (session.status !== 'pending') {
      Logger.warn(`Payment session already processed: ${sessionId}, status: ${session.status}`);
      return false;
    }

    if (Date.now() > session.expiresAt) {
      Logger.warn(`Payment session expired: ${sessionId}`);
      session.status = 'expired';
      this.sessions.set(sessionId, session);
      return false;
    }

    // Update session with payment confirmation
    session.status = 'paid';
    session.transactionHash = transactionHash;
    session.payerAddress = payerAddress;
    this.sessions.set(sessionId, session);

    Logger.info(`Payment confirmed: ${sessionId}`, {
      transactionHash,
      payerAddress,
      amount: session.amount,
    });

    return true;
  }

  /**
   * Cancel a payment session
   */
  async cancelPayment(sessionId: string, userAddress: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    // Only allow cancellation by the user who created the session
    if (session.userAddress.toLowerCase() !== userAddress.toLowerCase()) {
      return false;
    }

    if (session.status !== 'pending') {
      return false;
    }

    session.status = 'cancelled';
    this.sessions.set(sessionId, session);

    Logger.info(`Payment cancelled: ${sessionId}`, { userAddress });
    return true;
  }

  /**
   * Get all sessions for a user
   */
  async getUserSessions(userAddress: string): Promise<QRPaymentSession[]> {
    const userSessions: QRPaymentSession[] = [];
    
    for (const session of this.sessions.values()) {
      if (session.userAddress.toLowerCase() === userAddress.toLowerCase()) {
        userSessions.push(session);
      }
    }

    return userSessions.sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Generate QR code data for payment
   */
  private generateQRCodeData(sessionId: string, request: CreatePaymentRequest): string {
    // For Line Yield, we'll use a custom URL scheme that can be handled by the app
    // In production, this could be a deep link or a URL that opens the payment flow
    
    const baseUrl = CONFIG.frontend?.url || 'https://line-yield.app';
    const paymentUrl = `${baseUrl}/pay/${sessionId}`;
    
    // Alternative: Use a custom scheme for mobile apps
    // const customScheme = `lineyield://pay?sessionId=${sessionId}&amount=${request.amount}&token=${request.token}`;
    
    // For now, return a JSON string that can be parsed by the payment handler
    return JSON.stringify({
      type: 'line-yield-payment',
      sessionId,
      amount: request.amount,
      token: request.token,
      vaultAddress: request.vaultAddress,
      userAddress: request.userAddress,
      url: paymentUrl,
      timestamp: Date.now(),
    });
  }

  /**
   * Clean up expired sessions
   */
  private cleanupExpiredSessions(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.status === 'pending' && now > session.expiresAt) {
        session.status = 'expired';
        this.sessions.set(sessionId, session);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      Logger.info(`Cleaned up ${cleanedCount} expired payment sessions`);
    }
  }

  /**
   * Get session statistics
   */
  getStats(): {
    total: number;
    pending: number;
    paid: number;
    expired: number;
    cancelled: number;
  } {
    const stats = {
      total: 0,
      pending: 0,
      paid: 0,
      expired: 0,
      cancelled: 0,
    };

    for (const session of this.sessions.values()) {
      stats.total++;
      stats[session.status]++;
    }

    return stats;
  }
}

// Singleton instance
export const qrPaymentService = new QRPaymentService();



