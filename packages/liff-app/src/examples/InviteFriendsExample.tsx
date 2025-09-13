import React, { useState } from 'react';
import { inviteService } from '../services/inviteService';
import { useInviteFriends } from '../hooks/useInviteFriends';
import InviteButton from '../components/InviteButton';
import { useLiff } from '../providers/LiffProvider';

/**
 * Comprehensive example demonstrating ShareTargetPicker implementation
 * for inviting friends in LINE Mini Dapp (LIFF)
 */
export const InviteFriendsExample: React.FC = () => {
  const { isInitialized, user } = useLiff();
  const { isInviting, error, success, inviteFriends, inviteWithTemplate, inviteWithImage, clearMessages, isAvailable } = useInviteFriends();
  const [customMessage, setCustomMessage] = useState('');

  // Example 1: Basic text invitation
  const handleBasicInvite = async () => {
    await inviteFriends();
  };

  // Example 2: Personalized invitation with user data
  const handlePersonalizedInvite = async () => {
    const message = `Hey! I'm earning yield on LINE Yield and thought you'd love it too! 
    
🚀 Earn up to 12% APY on Kaia-USDT
💰 Gasless transactions powered by LINE
🛡️ Secure and easy to use

Join me: https://line-yield.com`;
    
    await inviteFriends(message);
  };

  // Example 3: Custom message invitation
  const handleCustomInvite = async () => {
    if (!customMessage.trim()) {
      alert('Please enter a custom message');
      return;
    }
    await inviteFriends(customMessage);
  };

  // Example 4: Rich template invitation
  const handleTemplateInvite = async () => {
    await inviteWithTemplate();
  };

  // Example 5: Image invitation
  const handleImageInvite = async () => {
    await inviteWithImage(
      'https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=LINE+Yield+App',
      'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=LINE+Yield',
      'Check out LINE Yield - the easiest way to earn DeFi yield! 🚀'
    );
  };

  // Example 6: Multiple recipients invitation
  const handleMultipleInvite = async () => {
    const message = 'Join our LINE Yield community! Earn yield together! 🚀💰';
    await inviteFriends(message, { isMultiple: true });
  };

  if (!isInitialized) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing LINE integration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">ShareTargetPicker Examples</h2>
        <p className="text-gray-600">
          Comprehensive examples of inviting friends using LINE's ShareTargetPicker API
        </p>
        
        {/* Status Display */}
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">ShareTargetPicker Status: </span>
              <span className={`text-sm font-medium ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                {isAvailable ? 'Available ✅' : 'Not Available ❌'}
              </span>
            </div>
            {user && (
              <div className="text-sm text-gray-600">
                Welcome, {user.displayName}!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Example 1: Basic Invitation */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Basic Text Invitation</h3>
        <p className="text-sm text-gray-600 mb-3">
          Simple text message invitation using the default message.
        </p>
        <button
          onClick={handleBasicInvite}
          disabled={isInviting || !isAvailable}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isInviting ? 'Sending...' : 'Send Basic Invite'}
        </button>
      </div>

      {/* Example 2: Personalized Invitation */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Personalized Invitation</h3>
        <p className="text-sm text-gray-600 mb-3">
          Custom message with detailed information about LINE Yield.
        </p>
        <button
          onClick={handlePersonalizedInvite}
          disabled={isInviting || !isAvailable}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isInviting ? 'Sending...' : 'Send Personalized Invite'}
        </button>
      </div>

      {/* Example 3: Custom Message */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Custom Message</h3>
        <p className="text-sm text-gray-600 mb-3">
          Enter your own custom invitation message.
        </p>
        <div className="space-y-3">
          <textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Enter your custom invitation message..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          <button
            onClick={handleCustomInvite}
            disabled={isInviting || !isAvailable || !customMessage.trim()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isInviting ? 'Sending...' : 'Send Custom Message'}
          </button>
        </div>
      </div>

      {/* Example 4: Rich Template */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Rich Template Invitation</h3>
        <p className="text-sm text-gray-600 mb-3">
          Send a carousel template with multiple cards showcasing LINE Yield features.
        </p>
        <button
          onClick={handleTemplateInvite}
          disabled={isInviting || !isAvailable}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isInviting ? 'Sending...' : 'Send Rich Template'}
        </button>
      </div>

      {/* Example 5: Image Invitation */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Image + Text Invitation</h3>
        <p className="text-sm text-gray-600 mb-3">
          Send an image along with a text message to make the invitation more visual.
        </p>
        <button
          onClick={handleImageInvite}
          disabled={isInviting || !isAvailable}
          className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isInviting ? 'Sending...' : 'Send Image Invite'}
        </button>
      </div>

      {/* Example 6: Multiple Recipients */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Multiple Recipients</h3>
        <p className="text-sm text-gray-600 mb-3">
          Allow sending to multiple friends or groups (isMultiple: true).
        </p>
        <button
          onClick={handleMultipleInvite}
          disabled={isInviting || !isAvailable}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isInviting ? 'Sending...' : 'Send to Multiple'}
        </button>
      </div>

      {/* Reusable InviteButton Component */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">7. Reusable InviteButton Component</h3>
        <p className="text-sm text-gray-600 mb-3">
          Using the reusable InviteButton component with different variants.
        </p>
        <div className="flex flex-wrap gap-3">
          <InviteButton variant="primary" size="sm">
            Quick Invite
          </InviteButton>
          <InviteButton variant="secondary" size="md">
            Invite Friends
          </InviteButton>
          <InviteButton variant="outline" size="lg">
            Share LINE Yield
          </InviteButton>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex">
            <svg className="h-5 w-5 text-green-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-green-800">Success</p>
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Clear Messages Button */}
      {(error || success) && (
        <button
          onClick={clearMessages}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 underline"
        >
          Clear Messages
        </button>
      )}

      {/* Code Example */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Code Example:</h4>
        <pre className="text-xs text-gray-700 overflow-x-auto">
{`import liff from '@line/liff';

async function inviteFriends() {
  try {
    if (!liff.isApiAvailable('shareTargetPicker')) {
      console.error('ShareTargetPicker not available');
      return;
    }

    const messages = [{
      type: 'text',
      text: 'Join me on LINE Yield! Earn yield on your Kaia-USDT safely and easily!'
    }];

    await liff.shareTargetPicker(messages, { isMultiple: false });
    console.log('Invite sent successfully');
  } catch (error) {
    console.error('Error inviting friends:', error);
  }
}`}
        </pre>
      </div>
    </div>
  );
};

export default InviteFriendsExample;


