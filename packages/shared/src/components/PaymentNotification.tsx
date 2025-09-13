import React from 'react';
import { PaymentStatus } from '../types/payment';

interface PaymentNotificationProps {
  status: PaymentStatus;
  onClose?: () => void;
}

export const PaymentNotification: React.FC<PaymentNotificationProps> = ({ 
  status, 
  onClose 
}) => {
  const getNotificationConfig = (status: PaymentStatus) => {
    switch (status) {
      case 'completed':
        return {
          message: 'Payment successful! Your item has been delivered.',
          type: 'success' as const,
          icon: '✅',
          backgroundColor: '#10b981',
          color: '#ffffff'
        };
      case 'failed':
        return {
          message: 'Payment failed. Please check your payment method and try again.',
          type: 'error' as const,
          icon: '❌',
          backgroundColor: '#ef4444',
          color: '#ffffff'
        };
      case 'canceled':
        return {
          message: 'Payment canceled by user.',
          type: 'warning' as const,
          icon: '⚠️',
          backgroundColor: '#f59e0b',
          color: '#ffffff'
        };
      case 'insufficient_balance':
        return {
          message: 'Payment failed: insufficient crypto balance. Please add funds and retry.',
          type: 'error' as const,
          icon: '💰',
          backgroundColor: '#ef4444',
          color: '#ffffff'
        };
      case 'pending':
        return {
          message: 'Payment is being processed. Please wait...',
          type: 'info' as const,
          icon: '⏳',
          backgroundColor: '#3b82f6',
          color: '#ffffff'
        };
      case 'other_error':
      default:
        return {
          message: 'An unexpected error occurred. Please try again later.',
          type: 'error' as const,
          icon: '🚨',
          backgroundColor: '#ef4444',
          color: '#ffffff'
        };
    }
  };

  const config = getNotificationConfig(status);

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        padding: '16px 20px',
        backgroundColor: config.backgroundColor,
        color: config.color,
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        minWidth: '300px',
        maxWidth: '400px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '14px',
        fontWeight: '500'
      }}
    >
      <span style={{ fontSize: '18px' }}>{config.icon}</span>
      <span style={{ flex: 1 }}>{config.message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: config.color,
            cursor: 'pointer',
            fontSize: '18px',
            padding: '0',
            marginLeft: '8px',
            opacity: 0.7
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};

// Toast-style notification component for easier integration
export const PaymentToast: React.FC<PaymentNotificationProps> = ({ 
  status, 
  onClose 
}) => {
  const config = (() => {
    switch (status) {
      case 'completed':
        return {
          message: 'Payment successful! Your item has been delivered.',
          icon: '✅',
          className: 'toast-success'
        };
      case 'failed':
        return {
          message: 'Payment failed. Please check your payment method and try again.',
          icon: '❌',
          className: 'toast-error'
        };
      case 'canceled':
        return {
          message: 'Payment canceled by user.',
          icon: '⚠️',
          className: 'toast-warning'
        };
      case 'insufficient_balance':
        return {
          message: 'Payment failed: insufficient crypto balance. Please add funds and retry.',
          icon: '💰',
          className: 'toast-error'
        };
      case 'pending':
        return {
          message: 'Payment is being processed. Please wait...',
          icon: '⏳',
          className: 'toast-info'
        };
      case 'other_error':
      default:
        return {
          message: 'An unexpected error occurred. Please try again later.',
          icon: '🚨',
          className: 'toast-error'
        };
    }
  })();

  // This would typically be used with a toast library like react-hot-toast
  // For now, we'll return the notification component
  return (
    <PaymentNotification status={status} onClose={onClose} />
  );
};


