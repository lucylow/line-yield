import React, { useState, useEffect } from 'react';
import { PaymentType, PaymentStatus, WalletInfo } from '../types/payment';
import { usePayment } from '../hooks/usePayment';
import { PurchasePrecautions } from './PurchasePrecautions';
import { ConnectedWalletDisplay } from './ConnectedWalletDisplay';
import { PaymentNotification } from './PaymentNotification';

interface PaymentFlowProps {
  itemId: string;
  itemName: string;
  amount: number;
  currency: string;
  onPaymentComplete?: (paymentId: string, status: PaymentStatus) => void;
  onPaymentError?: (error: string) => void;
}

export const PaymentFlow: React.FC<PaymentFlowProps> = ({
  itemId,
  itemName,
  amount,
  currency,
  onPaymentComplete,
  onPaymentError
}) => {
  const [paymentType, setPaymentType] = useState<PaymentType>('crypto');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<PaymentStatus | null>(null);

  const {
    loading,
    paymentId,
    status,
    error,
    walletInfo,
    processPayment,
    pollPaymentStatus,
    connectWallet,
    clearError,
    resetPayment
  } = usePayment();

  // Poll payment status when payment is initiated
  useEffect(() => {
    if (paymentId && status === 'pending') {
      const interval = setInterval(async () => {
        try {
          const newStatus = await pollPaymentStatus(paymentId);
          if (newStatus !== 'pending') {
            clearInterval(interval);
            setNotificationStatus(newStatus);
            setShowNotification(true);
            onPaymentComplete?.(paymentId, newStatus);
            
            // Auto-hide notification after 5 seconds
            setTimeout(() => setShowNotification(false), 5000);
          }
        } catch (error) {
          console.error('Error polling payment status:', error);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [paymentId, status, pollPaymentStatus, onPaymentComplete]);

  // Show error notifications
  useEffect(() => {
    if (error) {
      setNotificationStatus('other_error');
      setShowNotification(true);
      onPaymentError?.(error);
      
      // Auto-hide notification after 5 seconds
      setTimeout(() => setShowNotification(false), 5000);
    }
  }, [error, onPaymentError]);

  const handleWalletConnect = (wallet: WalletInfo) => {
    console.log('Wallet connected:', wallet);
  };

  const handleWalletDisconnect = () => {
    console.log('Wallet disconnected');
    resetPayment();
  };

  const handlePaymentAgreement = async () => {
    if (!walletInfo) {
      await connectWallet();
      return;
    }

    try {
      const resultPaymentId = await processPayment(itemId, amount, paymentType, currency);
      if (resultPaymentId) {
        console.log('Payment initiated:', resultPaymentId);
      }
    } catch (error) {
      console.error('Payment initiation failed:', error);
    }
  };

  const handleNotificationClose = () => {
    setShowNotification(false);
    clearError();
  };

  return (
    <div className="payment-flow" style={{ maxWidth: '400px', margin: '0 auto' }}>
      {/* Item Details */}
      <div style={{ 
        padding: '16px', 
        border: '1px solid #e5e7eb', 
        borderRadius: '8px',
        marginBottom: '16px',
        backgroundColor: '#f9fafb'
      }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>
          {itemName}
        </h3>
        <p style={{ margin: '0', fontSize: '24px', fontWeight: '700', color: '#2563eb' }}>
          {amount} {currency}
        </p>
      </div>

      {/* Wallet Connection */}
      <div style={{ marginBottom: '16px' }}>
        <ConnectedWalletDisplay
          onWalletConnect={handleWalletConnect}
          onWalletDisconnect={handleWalletDisconnect}
          showBalance={true}
          currency={currency}
        />
      </div>

      {/* Payment Type Selection */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '8px', 
          fontSize: '14px', 
          fontWeight: '600' 
        }}>
          Payment Method:
        </label>
        <div style={{ display: 'flex', gap: '12px' }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            cursor: 'pointer'
          }}>
            <input
              type="radio"
              value="crypto"
              checked={paymentType === 'crypto'}
              onChange={(e) => setPaymentType(e.target.value as PaymentType)}
            />
            <span>Cryptocurrency (KAIA/USDT)</span>
          </label>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            cursor: 'pointer'
          }}>
            <input
              type="radio"
              value="stripe"
              checked={paymentType === 'stripe'}
              onChange={(e) => setPaymentType(e.target.value as PaymentType)}
            />
            <span>Fiat (Stripe)</span>
          </label>
        </div>
      </div>

      {/* Purchase Precautions */}
      <PurchasePrecautions
        onAgree={handlePaymentAgreement}
        disabled={loading}
      />

      {/* Loading State */}
      {loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '20px',
          color: '#6b7280'
        }}>
          <div style={{ marginBottom: '8px' }}>⏳</div>
          Processing payment...
        </div>
      )}

      {/* Payment Status */}
      {paymentId && (
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#f0f9ff', 
          border: '1px solid #0ea5e9',
          borderRadius: '6px',
          marginTop: '12px',
          fontSize: '14px'
        }}>
          <strong>Payment ID:</strong> {paymentId}
          {status && (
            <div style={{ marginTop: '4px' }}>
              <strong>Status:</strong> {status}
            </div>
          )}
        </div>
      )}

      {/* Notifications */}
      {showNotification && notificationStatus && (
        <PaymentNotification
          status={notificationStatus}
          onClose={handleNotificationClose}
        />
      )}
    </div>
  );
};


