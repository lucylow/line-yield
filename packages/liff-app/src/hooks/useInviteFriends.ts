import { useState, useCallback } from 'react';
import { inviteService, InviteOptions } from '../services/inviteService';
import { useLiff } from '../providers/LiffProvider';

export interface UseInviteFriendsReturn {
  isInviting: boolean;
  error: string | null;
  success: string | null;
  inviteFriends: (message?: string, options?: InviteOptions) => Promise<void>;
  inviteWithTemplate: (options?: InviteOptions) => Promise<void>;
  inviteWithImage: (imageUrl: string, previewUrl: string, text?: string, options?: InviteOptions) => Promise<void>;
  clearMessages: () => void;
  isAvailable: boolean;
}

export const useInviteFriends = (): UseInviteFriendsReturn => {
  const { isInitialized } = useLiff();
  const [isInviting, setIsInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isAvailable = isInitialized && inviteService.isShareTargetPickerAvailable();

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const inviteFriends = useCallback(async (
    message?: string,
    options: InviteOptions = { isMultiple: false }
  ) => {
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
      const inviteMessage = message || inviteService.getDefaultInviteMessage();
      await inviteService.inviteFriendsWithText(inviteMessage, options);
      setSuccess('Invitation sent successfully! 🎉');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  }, [isInitialized]);

  const inviteWithTemplate = useCallback(async (
    options: InviteOptions = { isMultiple: false }
  ) => {
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
      const template = inviteService.createInviteCarouselTemplate();
      await inviteService.inviteFriendsWithTemplate(template, options);
      setSuccess('Rich template invitation sent! 🚀');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  }, [isInitialized]);

  const inviteWithImage = useCallback(async (
    imageUrl: string,
    previewUrl: string,
    text?: string,
    options: InviteOptions = { isMultiple: false }
  ) => {
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
      const inviteText = text || inviteService.getDefaultInviteMessage();
      await inviteService.inviteFriendsWithImage(imageUrl, previewUrl, inviteText, options);
      setSuccess('Image invitation sent! 📸');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  }, [isInitialized]);

  return {
    isInviting,
    error,
    success,
    inviteFriends,
    inviteWithTemplate,
    inviteWithImage,
    clearMessages,
    isAvailable
  };
};


