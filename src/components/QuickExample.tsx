import React, { useState } from 'react';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { UnsavedChangesDialog } from '@/components/UnsavedChangesDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * Quick example showing how to add unsaved changes protection to any component
 */
export const QuickExample: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [showDialog, setShowDialog] = useState(false);

  // Check if there are unsaved changes
  const hasUnsavedChanges = inputValue.trim() !== '';

  // Use the unsaved changes hook
  const { navigateWithConfirmation } = useUnsavedChanges({
    hasUnsavedChanges,
    message: "You have entered text. Are you sure you want to leave?",
    onConfirmLeave: () => {
      // Reset input when user confirms leaving
      setInputValue('');
    },
  });

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowDialog(true);
    }
  };

  const handleConfirmLeave = () => {
    setInputValue('');
    setShowDialog(false);
  };

  const handleCancelLeave = () => {
    setShowDialog(false);
  };

  const handleNavigateAway = () => {
    navigateWithConfirmation('/dashboard');
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Quick Example</h3>
      
      <div className="space-y-2">
        <label htmlFor="input">Enter some text:</label>
        <Input
          id="input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type something..."
        />
      </div>

      {hasUnsavedChanges && (
        <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
          ⚠️ You have unsaved changes
        </div>
      )}

      <div className="flex gap-2">
        <Button onClick={handleClose} variant="outline">
          Close
        </Button>
        <Button onClick={handleNavigateAway} variant="outline">
          Navigate Away
        </Button>
      </div>

      <UnsavedChangesDialog
        isOpen={showDialog}
        onClose={handleCancelLeave}
        onConfirm={handleConfirmLeave}
        title="Unsaved Changes"
        message="You have entered text. Are you sure you want to leave?"
        confirmText="Leave"
        cancelText="Stay"
      />
    </div>
  );
};

