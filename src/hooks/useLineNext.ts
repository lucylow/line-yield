import { useState, useEffect, useCallback } from 'react';
import { useLineNext } from '../providers/LineNextProvider';

interface LineNextFeatures {
  canShare: boolean;
  canInviteFriends: boolean;
  canOpenWindow: boolean;
  canGetProfile: boolean;
}

export const useLineNextIntegration = () => {
  const lineNext = useLineNext();
  const [features, setFeatures] = useState<LineNextFeatures>({
    canShare: false,
    canInviteFriends: false,
    canOpenWindow: false,
    canGetProfile: false,
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).liff) {
      const liff = (window as any).liff;
      
      setFeatures({
        canShare: liff.isApiAvailable('shareTargetPicker'),
        canInviteFriends: liff.isApiAvailable('shareTargetPicker'),
        canOpenWindow: liff.isApiAvailable('openWindow'),
        canGetProfile: liff.isApiAvailable('getProfile'),
      });
    }
  }, [lineNext.isInitialized]);

  const inviteFriends = useCallback(async (message: string) => {
    try {
      const messages = [
        {
          type: 'text',
          text: message
        }
      ];

      await lineNext.shareTargetPicker(messages, {
        isMultiple: false // Restrict to single friend
      });

      return { success: true };
    } catch (error) {
      console.error('Invite friends failed:', error);
      return { success: false, error: error.message };
    }
  }, [lineNext]);

  const shareContent = useCallback(async (content: any) => {
    try {
      await lineNext.shareTargetPicker([content], {
        isMultiple: true
      });

      return { success: true };
    } catch (error) {
      console.error('Share content failed:', error);
      return { success: false, error: error.message };
    }
  }, [lineNext]);

  const openExternalLink = useCallback((url: string) => {
    lineNext.openWindow(url);
  }, [lineNext]);

  return {
    ...lineNext,
    features,
    inviteFriends,
    shareContent,
    openExternalLink,
  };
};

