import React, { useState } from 'react';
import { Button } from './simple/Button';
import { useLineNextIntegration } from '../hooks/useLineNext';
import { Share2, Users, ExternalLink } from 'lucide-react';

export const LineNextIntegration: React.FC = () => {
  const { 
    isInitialized, 
    isLoggedIn, 
    displayName, 
    profilePictureUrl,
    features,
    login,
    logout,
    inviteFriends,
    shareContent,
    openExternalLink 
  } = useLineNextIntegration();

  const [isInviting, setIsInviting] = useState(false);
  const [inviteMessage, setInviteMessage] = useState('Join me on LINE Yield! Earn yield on your Kaia-USDT safely and easily! 🚀');

  const handleInviteFriends = async () => {
    setIsInviting(true);
    try {
      const result = await inviteFriends(inviteMessage);
      if (result.success) {
        alert('Invitation sent successfully! 🎉');
      } else {
        alert(`Failed to send invitation: ${result.error}`);
      }
    } catch (error) {
      alert('Failed to send invitation. Please try again.');
    } finally {
      setIsInviting(false);
    }
  };

  const handleShareYield = async () => {
    try {
      const shareData = {
        type: 'text',
        text: `🚀 LINE Yield - Earn up to 12% APY on Kaia-USDT!\n\n✅ Secure & Audited\n✅ Gasless Transactions\n✅ Mobile Optimized\n\nStart earning today!`
      };

      const result = await shareContent(shareData);
      if (result.success) {
        alert('Shared successfully! 🎉');
      } else {
        alert(`Failed to share: ${result.error}`);
      }
    } catch (error) {
      alert('Failed to share. Please try again.');
    }
  };

  const handleOpenDocs = () => {
    openExternalLink('https://docs.line-yield.com');
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Initializing LINE NEXT...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center">
          <Share2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">LINE NEXT Integration</h3>
          <p className="text-sm text-gray-600">Connect with LINE ecosystem</p>
        </div>
      </div>

      {isLoggedIn ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
            {profilePictureUrl && (
              <img 
                src={profilePictureUrl} 
                alt="Profile" 
                className="w-8 h-8 rounded-full"
              />
            )}
            <div>
              <p className="font-medium text-gray-900">Welcome, {displayName}!</p>
              <p className="text-xs text-gray-500">Connected to LINE</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {features.canInviteFriends && (
              <Button
                onClick={handleInviteFriends}
                disabled={isInviting}
                className="w-full flex items-center gap-2 justify-center"
              >
                <Users className="w-4 h-4" />
                {isInviting ? 'Inviting...' : 'Invite Friends'}
              </Button>
            )}

            {features.canShare && (
              <Button
                onClick={handleShareYield}
                variant="outline"
                className="w-full flex items-center gap-2 justify-center"
              >
                <Share2 className="w-4 h-4" />
                Share LINE Yield
              </Button>
            )}

            {features.canOpenWindow && (
              <Button
                onClick={handleOpenDocs}
                variant="outline"
                className="w-full flex items-center gap-2 justify-center"
              >
                <ExternalLink className="w-4 h-4" />
                Open Documentation
              </Button>
            )}
          </div>

          <Button
            onClick={logout}
            variant="outline"
            className="w-full text-red-600 border-red-200 hover:bg-red-50"
          >
            Disconnect from LINE
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center p-4 bg-white rounded-lg border">
            <p className="text-sm text-gray-600 mb-3">
              Connect to LINE to unlock social features and invite friends!
            </p>
            <Button
              onClick={login}
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              Connect with LINE
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            <p>Available features when connected:</p>
            <ul className="mt-1 space-y-1">
              <li>• Invite friends to LINE Yield</li>
              <li>• Share your yield earnings</li>
              <li>• Access LINE ecosystem</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

