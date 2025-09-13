import React, { useState } from 'react';
import { PaymentFlow, PaymentStatus } from '@line-yield/shared';

const PaymentDemo: React.FC = () => {
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<Array<{
    paymentId: string;
    status: PaymentStatus;
    timestamp: number;
    amount: number;
    currency: string;
  }>>([]);

  const handlePaymentComplete = (paymentId: string, status: PaymentStatus) => {
    console.log('Payment completed:', { paymentId, status });
    
    // Add to payment history
    setPaymentHistory(prev => [{
      paymentId,
      status,
      timestamp: Date.now(),
      amount: 100,
      currency: 'USDT'
    }, ...prev]);

    // Hide payment flow after successful payment
    if (status === 'completed') {
      setTimeout(() => setShowPaymentFlow(false), 2000);
    }
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
  };

  return (
    <div className="payment-demo" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#2563eb' }}>
        LINE Yield Payment Demo
      </h1>

      {!showPaymentFlow ? (
        <div>
          {/* Demo Items */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '16px',
            marginBottom: '30px'
          }}>
            {/* Premium Strategy Access */}
            <div style={{
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '20px',
              backgroundColor: '#f9fafb',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }} onClick={() => setShowPaymentFlow(true)}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Premium Strategy Access</h3>
              <p style={{ margin: '0 0 12px 0', color: '#6b7280', fontSize: '14px' }}>
                Unlock advanced yield farming strategies
              </p>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#2563eb' }}>
                100 USDT
              </div>
              <button style={{
                width: '100%',
                marginTop: '12px',
                padding: '10px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600'
              }}>
                Purchase
              </button>
            </div>

            {/* Yield Boost */}
            <div style={{
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '20px',
              backgroundColor: '#f9fafb',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }} onClick={() => setShowPaymentFlow(true)}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Yield Boost</h3>
              <p style={{ margin: '0 0 12px 0', color: '#6b7280', fontSize: '14px' }}>
                Increase your APY by 2% for 30 days
              </p>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#2563eb' }}>
                50 USDT
              </div>
              <button style={{
                width: '100%',
                marginTop: '12px',
                padding: '10px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600'
              }}>
                Purchase
              </button>
            </div>
          </div>

          {/* Payment History */}
          {paymentHistory.length > 0 && (
            <div>
              <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>Payment History</h3>
              <div style={{ 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                {paymentHistory.map((payment, index) => (
                  <div key={payment.paymentId} style={{
                    padding: '12px 16px',
                    borderBottom: index < paymentHistory.length - 1 ? '1px solid #e5e7eb' : 'none',
                    backgroundColor: payment.status === 'completed' ? '#f0f9ff' : 
                                   payment.status === 'failed' ? '#fef2f2' : '#f9fafb'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '14px' }}>
                          {payment.paymentId.substring(0, 12)}...
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {new Date(payment.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '600', fontSize: '16px' }}>
                          {payment.amount} {payment.currency}
                        </div>
                        <div style={{ 
                          fontSize: '12px',
                          color: payment.status === 'completed' ? '#10b981' :
                                 payment.status === 'failed' ? '#ef4444' : '#6b7280'
                        }}>
                          {payment.status.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <button 
            onClick={() => setShowPaymentFlow(false)}
            style={{
              marginBottom: '20px',
              padding: '8px 16px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            ← Back to Demo
          </button>
          
          <PaymentFlow
            itemId="premium-strategy"
            itemName="Premium Strategy Access"
            amount={100}
            currency="USDT"
            onPaymentComplete={handlePaymentComplete}
            onPaymentError={handlePaymentError}
          />
        </div>
      )}
    </div>
  );
};

export default PaymentDemo;


