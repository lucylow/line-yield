import { useState, useCallback, useRef } from 'react';
import { useUnsavedChanges } from './useUnsavedChanges';

interface UseFormWithUnsavedChangesOptions<T> {
  initialValues: T;
  onSubmit: (values: T) => Promise<void> | void;
  onSave?: (values: T) => Promise<void> | void;
  isDirty?: (values: T, initialValues: T) => boolean;
  message?: string;
}

/**
 * Enhanced form hook that tracks unsaved changes and shows confirmation dialogs
 * @param initialValues - Initial form values
 * @param onSubmit - Function to call when form is submitted
 * @param onSave - Optional function to call when form is saved
 * @param isDirty - Function to determine if form has unsaved changes
 * @param message - Custom message for unsaved changes dialog
 */
export const useFormWithUnsavedChanges = <T extends Record<string, any>>({
  initialValues,
  onSubmit,
  onSave,
  isDirty = (values, initial) => JSON.stringify(values) !== JSON.stringify(initial),
  message,
}: UseFormWithUnsavedChangesOptions<T>) => {
  const [values, setValues] = useState<T>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const initialValuesRef = useRef(initialValues);

  // Check if form has unsaved changes
  const hasUnsavedChanges = isDirty(values, initialValuesRef.current);

  // Handle unsaved changes confirmation
  const { navigateWithConfirmation } = useUnsavedChanges({
    hasUnsavedChanges,
    message: message || "You have unsaved changes. Are you sure you want to leave?",
    onConfirmLeave: () => {
      // Reset form when user confirms leaving
      setValues(initialValuesRef.current);
    },
    onCancelLeave: () => {
      // User cancelled leaving, do nothing
    },
  });

  // Update form values
  const updateValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
  }, []);

  // Update multiple values at once
  const updateValues = useCallback((newValues: Partial<T>) => {
    setValues(prev => ({ ...prev, ...newValues }));
  }, []);

  // Reset form to initial values
  const resetForm = useCallback(() => {
    setValues(initialValuesRef.current);
  }, []);

  // Save form data (without submitting)
  const saveForm = useCallback(async () => {
    if (onSave) {
      try {
        setIsSubmitting(true);
        await onSave(values);
        // Update initial values to current values after successful save
        initialValuesRef.current = { ...values };
      } catch (error) {
        console.error('Save failed:', error);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [values, onSave]);

  // Submit form
  const submitForm = useCallback(async () => {
    try {
      setIsSubmitting(true);
      await onSubmit(values);
      // Update initial values to current values after successful submit
      initialValuesRef.current = { ...values };
    } catch (error) {
      console.error('Submit failed:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [values, onSubmit]);

  // Handle actions that might cause data loss
  const handleActionWithConfirmation = useCallback((action: () => void) => {
    if (hasUnsavedChanges) {
      setPendingAction(() => action);
      setShowConfirmDialog(true);
    } else {
      action();
    }
  }, [hasUnsavedChanges]);

  // Confirm leaving with unsaved changes
  const confirmLeave = useCallback(() => {
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
    setShowConfirmDialog(false);
  }, [pendingAction]);

  // Cancel leaving with unsaved changes
  const cancelLeave = useCallback(() => {
    setPendingAction(null);
    setShowConfirmDialog(false);
  }, []);

  return {
    values,
    setValues,
    updateValue,
    updateValues,
    resetForm,
    submitForm,
    saveForm,
    isSubmitting,
    hasUnsavedChanges,
    showConfirmDialog,
    confirmLeave,
    cancelLeave,
    handleActionWithConfirmation,
    navigateWithConfirmation,
  };
};

