import React from 'react';
import { useInviteFriends } from '../hooks/useInviteFriends';

interface InviteButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
  personalizedMessage?: string;
  userYield?: string;
  currentAPY?: number;
}

export const InviteButton: React.FC<InviteButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  personalizedMessage,
  userYield,
  currentAPY
}) => {
  const { isInviting, error, success, inviteFriends, clearMessages, isAvailable } = useInviteFriends();

  const handleClick = async () => {
    clearMessages();
    
    let message = personalizedMessage;
    if (!message && (userYield || currentAPY)) {
      message = `Join me on LINE Yield! I've earned ${userYield || '0'} USDC at ${currentAPY || 0}% APY! Earn yield on your Kaia-USDT safely and easily! 🚀💰`;
    }

    await inviteFriends(message);
  };

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
    secondary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    outline: 'border border-green-600 text-green-600 hover:bg-green-50 focus:ring-green-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  if (!isAvailable) {
    return (
      <button
        disabled
        className={`${buttonClasses} opacity-50 cursor-not-allowed`}
        title="ShareTargetPicker not available"
      >
        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
        Invite Friends (Unavailable)
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={isInviting}
        className={buttonClasses}
      >
        {isInviting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
            Inviting...
          </>
        ) : (
          <>
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            {children || 'Invite Friends'}
          </>
        )}
      </button>

      {/* Status Messages */}
      {error && (
        <div className="absolute top-full left-0 mt-2 p-2 bg-red-50 border border-red-200 rounded-md shadow-lg z-10 min-w-64">
          <div className="flex items-center">
            <svg className="h-4 w-4 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-red-800">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="absolute top-full left-0 mt-2 p-2 bg-green-50 border border-green-200 rounded-md shadow-lg z-10 min-w-64">
          <div className="flex items-center">
            <svg className="h-4 w-4 text-green-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-green-800">{success}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default InviteButton;


