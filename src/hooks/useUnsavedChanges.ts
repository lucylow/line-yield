import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface UseUnsavedChangesOptions {
  hasUnsavedChanges: boolean;
  message?: string;
  onConfirmLeave?: () => void;
  onCancelLeave?: () => void;
}

/**
 * Hook to handle unsaved changes confirmation when user tries to leave
 * @param hasUnsavedChanges - Whether there are unsaved changes
 * @param message - Custom message to show in confirmation dialog
 * @param onConfirmLeave - Callback when user confirms they want to leave
 * @param onCancelLeave - Callback when user cancels leaving
 */
export const useUnsavedChanges = ({
  hasUnsavedChanges,
  message = "You have unsaved changes. Are you sure you want to leave?",
  onConfirmLeave,
  onCancelLeave,
}: UseUnsavedChangesOptions) => {
  const navigate = useNavigate();
  const location = useLocation();
  const hasUnsavedChangesRef = useRef(hasUnsavedChanges);

  // Update ref when hasUnsavedChanges changes
  useEffect(() => {
    hasUnsavedChangesRef.current = hasUnsavedChanges;
  }, [hasUnsavedChanges]);

  useEffect(() => {
    // Handle browser back/forward buttons and page refresh
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChangesRef.current) {
        event.preventDefault();
        event.returnValue = message;
        return message;
      }
    };

    // Handle programmatic navigation (React Router)
    const handlePopState = (event: PopStateEvent) => {
      if (hasUnsavedChangesRef.current) {
        const shouldLeave = window.confirm(message);
        if (!shouldLeave) {
          // Prevent navigation by pushing current state back
          window.history.pushState(null, '', location.pathname + location.search);
          onCancelLeave?.();
          return;
        }
        onConfirmLeave?.();
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [message, onConfirmLeave, onCancelLeave, location.pathname, location.search]);

  // Function to programmatically navigate with confirmation
  const navigateWithConfirmation = (to: string, options?: { replace?: boolean }) => {
    if (hasUnsavedChangesRef.current) {
      const shouldLeave = window.confirm(message);
      if (!shouldLeave) {
        onCancelLeave?.();
        return false;
      }
      onConfirmLeave?.();
    }
    navigate(to, options);
    return true;
  };

  return {
    navigateWithConfirmation,
  };
};

