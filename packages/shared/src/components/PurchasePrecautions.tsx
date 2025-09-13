import React, { useState } from 'react';

interface PurchasePrecautionsProps {
  onAgree: () => void;
  disabled?: boolean;
}

export const PurchasePrecautions: React.FC<PurchasePrecautionsProps> = ({ 
  onAgree, 
  disabled = false 
}) => {
  const [agreedNonRefund, setAgreedNonRefund] = useState(false);
  const [agreedEncryptedInfo, setAgreedEncryptedInfo] = useState(false);

  const canPurchase = agreedNonRefund && agreedEncryptedInfo && !disabled;

  const showRefundDetails = () => {
    alert(
      `Refund Policy Details:\n\nPurchase cancellations, exchanges, returns and refunds are not allowed.\n\nAll refund requests are handled by the Mini Dapp directly; LINE NEXT does not mediate.`
    );
  };

  const showEncryptedInfoDetails = () => {
    alert(
      `Consent of Personal Information Provision:\n\n- Receiving Party: LY Corporation\n- Purpose: Processing product payments\n- Personal Information: Encrypted Identification Information\n- Retention Period: Until purpose achieved\n- Country: Japan\n- Company URL: https://www.lycorp.co.jp/\n- Privacy Policy: https://www.lycorp.co.jp/en/company/privacypolicy/\n\nIf you limit this consent, you may not be able to use services.`
    );
  };

  return (
    <div className="purchase-precautions" style={{ 
      marginTop: 16, 
      padding: 16, 
      border: '1px solid #e5e7eb', 
      borderRadius: 8,
      backgroundColor: '#f9fafb'
    }}>
      <h3 style={{ 
        margin: '0 0 12px 0', 
        fontSize: '16px', 
        fontWeight: '600',
        color: '#374151'
      }}>
        Purchase Precautions
      </h3>
      
      <div style={{ marginBottom: 12 }}>
        <label style={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          gap: 8,
          cursor: 'pointer',
          fontSize: '14px',
          lineHeight: '1.5'
        }}>
          <input
            type="checkbox"
            checked={agreedNonRefund}
            onChange={() => setAgreedNonRefund(prev => !prev)}
            disabled={disabled}
            style={{ marginTop: 2 }}
          />
          <span>
            You agree that the product(s) is/are non-refundable.{' '}
            <button 
              type="button" 
              onClick={showRefundDetails}
              disabled={disabled}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563eb',
                textDecoration: 'underline',
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontSize: 'inherit'
              }}
            >
              View Details
            </button>
          </span>
        </label>
      </div>
      
      <div style={{ marginBottom: 16 }}>
        <label style={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          gap: 8,
          cursor: 'pointer',
          fontSize: '14px',
          lineHeight: '1.5'
        }}>
          <input
            type="checkbox"
            checked={agreedEncryptedInfo}
            onChange={() => setAgreedEncryptedInfo(prev => !prev)}
            disabled={disabled}
            style={{ marginTop: 2 }}
          />
          <span>
            If paid via LINE IAP, you agree to providing encrypted ID info to LY Corporation.{' '}
            <button 
              type="button" 
              onClick={showEncryptedInfoDetails}
              disabled={disabled}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563eb',
                textDecoration: 'underline',
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontSize: 'inherit'
              }}
            >
              View Details
            </button>
          </span>
        </label>
      </div>
      
      <button
        type="button"
        onClick={onAgree}
        disabled={!canPurchase}
        style={{
          backgroundColor: canPurchase ? '#2563eb' : '#d1d5db',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          borderRadius: 6,
          cursor: canPurchase ? 'pointer' : 'not-allowed',
          fontSize: '16px',
          fontWeight: '600',
          width: '100%',
          transition: 'background-color 0.2s ease'
        }}
      >
        Proceed to Payment
      </button>
    </div>
  );
};


