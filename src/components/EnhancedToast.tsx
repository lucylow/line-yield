import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, Zap } from 'lucide-react';

interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ 
  id, 
  type, 
  title, 
  description, 
  duration = 5000,
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />
  };

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const iconColors = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600'
  };

  return (
    <div 
      className={`
        max-w-sm w-full bg-white shadow-lg rounded-2xl border-l-4 border p-4 mb-3
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${colors[type]}
      `}
    >
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${iconColors[type]}`}>
          {icons[type]}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-semibold">
            {title}
          </p>
          {description && (
            <p className="text-sm opacity-80 mt-1">
              {description}
            </p>
          )}
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={handleClose}
            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
        <div 
          className={`h-1 rounded-full transition-all duration-${duration} ease-linear ${
            type === 'success' ? 'bg-green-500' :
            type === 'error' ? 'bg-red-500' :
            type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
          }`}
          style={{
            animation: `shrink ${duration}ms linear forwards`
          }}
        />
      </div>
    </div>
  );
};

interface TransactionToastProps {
  id: string;
  type: 'deposit' | 'withdraw' | 'rebalance';
  amount: string;
  status: 'pending' | 'success' | 'failed';
  hash?: string;
  onClose: (id: string) => void;
}

export const TransactionToast: React.FC<TransactionToastProps> = ({
  id,
  type,
  amount,
  status,
  hash,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      handleClose();
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const getStatusInfo = () => {
    switch (status) {
      case 'pending':
        return {
          icon: <Zap className="w-5 h-5 animate-pulse" />,
          color: 'bg-blue-50 border-blue-200 text-blue-800',
          iconColor: 'text-blue-600',
          title: 'Transaction Pending',
          description: 'Your transaction is being processed'
        };
      case 'success':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          color: 'bg-green-50 border-green-200 text-green-800',
          iconColor: 'text-green-600',
          title: `${type === 'deposit' ? 'Deposit' : type === 'withdraw' ? 'Withdrawal' : 'Rebalance'} Successful`,
          description: `${amount} USDT ${type === 'deposit' ? 'deposited' : type === 'withdraw' ? 'withdrawn' : 'rebalanced'} successfully`
        };
      case 'failed':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          color: 'bg-red-50 border-red-200 text-red-800',
          iconColor: 'text-red-600',
          title: 'Transaction Failed',
          description: 'Your transaction could not be completed'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div 
      className={`
        max-w-sm w-full bg-white shadow-lg rounded-2xl border-l-4 border p-4 mb-3
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${statusInfo.color}
      `}
    >
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${statusInfo.iconColor}`}>
          {statusInfo.icon}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-semibold">
            {statusInfo.title}
          </p>
          <p className="text-sm opacity-80 mt-1">
            {statusInfo.description}
          </p>
          {hash && (
            <p className="text-xs opacity-60 mt-2 font-mono">
              {hash.slice(0, 10)}...{hash.slice(-8)}
            </p>
          )}
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={handleClose}
            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;
