import React, { useState } from 'react';
import { inviteService, InviteOptions } from '../services/inviteService';
import { useLiff } from '../providers/LiffProvider';

interface InviteFriendsProps {
  userYield?: string;
  currentAPY?: number;
  className?: string;
}

export const InviteFriends: React.FC<InviteFriendsProps> = ({
  userYield,
  currentAPY,
  className = ''
}) => {
  const { isInitialized } = useLiff();
  const [isInviting, setIsInviting] = useState(false);
  const [inviteType, setInviteType] = useState<'text' | 'template' | 'image'>('text');
  const [customMessage, setCustomMessage] = useState('');
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInvite = async () => {
    if (!isInitialized) {
      setError('LIFF is not initialized yet');
      return;
    }

    if (!inviteService.isShareTargetPickerAvailable()) {
      setError('ShareTargetPicker is not available in this environment');
      return;
    }

    setIsInviting(true);
    setError(null);
    setSuccess(null);

    try {
      const options: InviteOptions = { isMultiple: allowMultiple };
      
      switch (inviteType) {
        case 'text':
          const message = customMessage || inviteService.getPersonalizedInviteMessage(userYield, currentAPY);
          await inviteService.inviteFriendsWithText(message, options);
          break;
          
        case 'template':
          const template = inviteService.createInviteCarouselTemplate();
          await inviteService.inviteFriendsWithTemplate(template, options);
          break;
          
        case 'image':
          await inviteService.inviteFriendsWithImage(
            'https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=LINE+Yield+App',
            'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=LINE+Yield',
            customMessage || inviteService.getPersonalizedInviteMessage(userYield, currentAPY),
            options
          );
          break;
      }

      setSuccess('Invitation sent successfully! 🎉');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const quickInvite = async () => {
    setIsInviting(true);
    setError(null);
    setSuccess(null);

    try {
      const message = inviteService.getPersonalizedInviteMessage(userYield, currentAPY);
      await inviteService.inviteFriendsWithText(message, { isMultiple: false });
      setSuccess('Quick invitation sent! 🚀');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  if (!isInitialized) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing LINE integration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="flex items-center mb-4">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-lg font-semibold text-gray-900">Invite Friends</h3>
          <p className="text-sm text-gray-600">Share LINE Yield with your friends</p>
        </div>
      </div>

      {/* Quick Invite Button */}
      <div className="mb-6">
        <button
          onClick={quickInvite}
          disabled={isInviting}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          {isInviting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Sending...
            </>
          ) : (
            <>
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Quick Invite Friends
            </>
          )}
        </button>
      </div>

      {/* Advanced Options */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Advanced Options</h4>
        
        {/* Invite Type Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Invite Type</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="text"
                checked={inviteType === 'text'}
                onChange={(e) => setInviteType(e.target.value as 'text')}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Text Message</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="template"
                checked={inviteType === 'template'}
                onChange={(e) => setInviteType(e.target.value as 'template')}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Rich Template</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="image"
                checked={inviteType === 'image'}
                onChange={(e) => setInviteType(e.target.value as 'image')}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Image + Text</span>
            </label>
          </div>
        </div>

        {/* Custom Message */}
        {inviteType === 'text' || inviteType === 'image' ? (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Custom Message</label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder={inviteService.getPersonalizedInviteMessage(userYield, currentAPY)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>
        ) : null}

        {/* Multiple Recipients Option */}
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={allowMultiple}
              onChange={(e) => setAllowMultiple(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Allow multiple recipients (groups)</span>
          </label>
          <p className="text-xs text-gray-500 mt-1">
            When unchecked, only individual friends can be selected
          </p>
        </div>

        {/* Send Button */}
        <button
          onClick={handleInvite}
          disabled={isInviting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
        >
          {isInviting ? 'Sending Invitation...' : 'Send Custom Invitation'}
        </button>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Tip:</strong> ShareTargetPicker allows you to invite friends directly from LINE. 
              This feature is only available in LINE Mini Apps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteFriends;


