import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

// LINE Mini Dapp SDK types
interface LineInviteOptions {
  message?: string;
  url?: string;
  imageUrl?: string;
}

interface LineInviteHook {
  isInviteAvailable: boolean;
  isLoading: boolean;
  error: string | null;
  inviteFriends: (options?: LineInviteOptions) => Promise<boolean>;
  shareToLine: (message: string, url?: string) => Promise<boolean>;
  shareToFriends: (message: string, url?: string) => Promise<boolean>;
}

// Declare LINE SDK types
declare global {
  interface Window {
    liff?: {
      init: (config: { liffId: string }) => Promise<void>;
      isLoggedIn: () => boolean;
      isInClient: () => boolean;
      getOS: () => string;
      getVersion: () => string;
      getProfile: () => Promise<{
        userId: string;
        displayName: string;
        pictureUrl: string;
        statusMessage: string;
      }>;
      shareTargetPicker: (messages: any[]) => Promise<boolean>;
      openWindow: (url: string, external?: boolean) => void;
      closeWindow: () => void;
      sendMessages: (messages: any[]) => Promise<void>;
      getFriendship: () => Promise<{ friendFlag: boolean }>;
      getIDToken: () => string;
      getAccessToken: () => string;
    };
    // LINE Mini Dapp specific methods
    lineMiniApp?: {
      inviteFriends: (options: LineInviteOptions) => Promise<boolean>;
      shareToLine: (message: string, url?: string) => Promise<boolean>;
      shareToFriends: (message: string, url?: string) => Promise<boolean>;
    };
  }
}

export const useLineInvite = (): LineInviteHook => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if LINE invite functionality is available
  const isInviteAvailable = useCallback(() => {
    return typeof window !== 'undefined' && (
      (window.liff && window.liff.shareTargetPicker) ||
      (window.lineMiniApp && window.lineMiniApp.inviteFriends)
    );
  }, []);

  // Generate invite message with referral link
  const generateInviteMessage = useCallback((baseMessage?: string, url?: string) => {
    const defaultMessage = `🚀 Join me on LINE Yield and start earning 8.64% APY on your USDT! 

💰 Earn automated yield on stablecoins
🔒 Secure DeFi strategies on Kaia blockchain
📱 Access directly from LINE Messenger
⚡ Gas fee delegation - pay no transaction fees

Get started: ${url || window.location.href}`;

    return baseMessage || defaultMessage;
  }, []);

  // Invite friends using LINE Mini Dapp SDK
  const inviteFriends = useCallback(async (options?: LineInviteOptions): Promise<boolean> => {
    if (!isInviteAvailable()) {
      setError('LINE invite functionality not available');
      toast({
        title: "Invite Not Available",
        description: "LINE invite functionality is not available in this environment",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const inviteOptions: LineInviteOptions = {
        message: generateInviteMessage(options?.message, options?.url),
        url: options?.url || window.location.href,
        imageUrl: options?.imageUrl || 'https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=LINE+Yield',
        ...options
      };

      let success = false;

      // Try LINE Mini Dapp SDK first
      if (window.lineMiniApp && window.lineMiniApp.inviteFriends) {
        success = await window.lineMiniApp.inviteFriends(inviteOptions);
      }
      // Fallback to LIFF SDK
      else if (window.liff && window.liff.shareTargetPicker) {
        const messages = [{
          type: 'text',
          text: inviteOptions.message
        }];

        if (inviteOptions.url) {
          messages.push({
            type: 'text',
            text: inviteOptions.url
          });
        }

        success = await window.liff.shareTargetPicker(messages);
      }

      if (success) {
        toast({
          title: "Invite Sent!",
          description: "Your friends have been invited to LINE Yield",
        });
      } else {
        toast({
          title: "Invite Cancelled",
          description: "Invite was cancelled or failed",
          variant: "destructive",
        });
      }

      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to invite friends';
      setError(errorMessage);
      console.error('Failed to invite friends:', err);
      
      toast({
        title: "Invite Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isInviteAvailable, generateInviteMessage, toast]);

  // Share to LINE using LINE Mini Dapp SDK
  const shareToLine = useCallback(async (message: string, url?: string): Promise<boolean> => {
    if (!isInviteAvailable()) {
      setError('LINE share functionality not available');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const shareMessage = generateInviteMessage(message, url);
      let success = false;

      // Try LINE Mini Dapp SDK first
      if (window.lineMiniApp && window.lineMiniApp.shareToLine) {
        success = await window.lineMiniApp.shareToLine(shareMessage, url);
      }
      // Fallback to LIFF SDK
      else if (window.liff && window.liff.shareTargetPicker) {
        const messages = [{
          type: 'text',
          text: shareMessage
        }];

        if (url) {
          messages.push({
            type: 'text',
            text: url
          });
        }

        success = await window.liff.shareTargetPicker(messages);
      }

      if (success) {
        toast({
          title: "Shared to LINE!",
          description: "Your message has been shared to LINE",
        });
      }

      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to share to LINE';
      setError(errorMessage);
      console.error('Failed to share to LINE:', err);
      
      toast({
        title: "Share Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isInviteAvailable, generateInviteMessage, toast]);

  // Share to friends using LINE Mini Dapp SDK
  const shareToFriends = useCallback(async (message: string, url?: string): Promise<boolean> => {
    if (!isInviteAvailable()) {
      setError('LINE friends share functionality not available');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const shareMessage = generateInviteMessage(message, url);
      let success = false;

      // Try LINE Mini Dapp SDK first
      if (window.lineMiniApp && window.lineMiniApp.shareToFriends) {
        success = await window.lineMiniApp.shareToFriends(shareMessage, url);
      }
      // Fallback to LIFF SDK
      else if (window.liff && window.liff.shareTargetPicker) {
        const messages = [{
          type: 'text',
          text: shareMessage
        }];

        if (url) {
          messages.push({
            type: 'text',
            text: url
          });
        }

        success = await window.liff.shareTargetPicker(messages);
      }

      if (success) {
        toast({
          title: "Shared with Friends!",
          description: "Your message has been shared with your friends",
        });
      }

      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to share with friends';
      setError(errorMessage);
      console.error('Failed to share with friends:', err);
      
      toast({
        title: "Share Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isInviteAvailable, generateInviteMessage, toast]);

  return {
    isInviteAvailable: isInviteAvailable(),
    isLoading,
    error,
    inviteFriends,
    shareToLine,
    shareToFriends
  };
};

export default useLineInvite;
