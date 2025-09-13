import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UnsavedChangesDialog } from './UnsavedChangesDialog';

interface RouteGuardProps {
  children: React.ReactNode;
  hasUnsavedChanges: boolean;
  message?: string;
  onConfirmLeave?: () => void;
}

/**
 * Component that guards routes and shows confirmation dialog when user tries to navigate away
 * with unsaved changes. This should wrap your main app content.
 */
export const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  hasUnsavedChanges,
  message = "You have unsaved changes. Are you sure you want to leave?",
  onConfirmLeave,
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue = message;
        return message;
      }
    };

    const handlePopState = (event: PopStateEvent) => {
      if (hasUnsavedChanges) {
        event.preventDefault();
        setShowConfirmDialog(true);
        // Push current state back to prevent navigation
        window.history.pushState(null, '', location.pathname + location.search);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUnsavedChanges, message, location.pathname, location.search]);

  const handleConfirmLeave = () => {
    if (pendingNavigation) {
      navigate(pendingNavigation);
      setPendingNavigation(null);
    }
    onConfirmLeave?.();
    setShowConfirmDialog(false);
  };

  const handleCancelLeave = () => {
    setPendingNavigation(null);
    setShowConfirmDialog(false);
  };

  // Function to programmatically navigate with confirmation
  const navigateWithConfirmation = (to: string) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(to);
      setShowConfirmDialog(true);
    } else {
      navigate(to);
    }
  };

  return (
    <>
      {children}
      <UnsavedChangesDialog
        isOpen={showConfirmDialog}
        onClose={handleCancelLeave}
        onConfirm={handleConfirmLeave}
        title="Unsaved Changes"
        message={message}
        confirmText="Leave"
        cancelText="Stay"
      />
    </>
  );
};

