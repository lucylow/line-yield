export type PaymentType = 'crypto' | 'stripe';

export type PaymentStatus = 
  | 'pending'
  | 'completed'
  | 'failed'
  | 'canceled'
  | 'insufficient_balance'
  | 'other_error';

export interface PaymentRequest {
  itemId: string;
  amount: number;
  currency: string;
  userWalletAddress: string;
  paymentType: PaymentType;
  description?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  paymentId: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  timestamp: number;
  transactionHash?: string;
  error?: string;
}

export interface PaymentStatusResponse {
  paymentId: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  timestamp: number;
  transactionHash?: string;
  error?: string;
}

export interface WalletInfo {
  address: string;
  balance: string;
  currency: string;
  walletType: string;
}

export interface PurchaseAgreement {
  agreedNonRefund: boolean;
  agreedEncryptedInfo: boolean;
}


