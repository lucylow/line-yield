import React, { useState } from 'react';
import { usePreventGoBack, useConfirmationDialog } from '../hooks';
import { ConfirmationDialog } from './ConfirmationDialog';

interface NavigationPreventionDemoProps {
  className?: string;
}

export const NavigationPreventionDemo: React.FC<NavigationPreventionDemoProps> = ({ 
  className = '' 
}) => {
  const [isProtected, setIsProtected] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { showDialog, ConfirmationDialog } = useConfirmationDialog();

  // Basic navigation prevention
  usePreventGoBack({
    enabled: isProtected,
    message: hasUnsavedChanges 
      ? 'You have unsaved changes. Are you sure you want to leave?'
      : 'Are you sure you want to go back?',
    preventUnload: true,
  });

  const handleToggleProtection = () => {
    setIsProtected(!isProtected);
  };

  const handleToggleUnsavedChanges = () => {
    setHasUnsavedChanges(!hasUnsavedChanges);
  };

  const handleShowCustomDialog = () => {
    showDialog({
      title: 'Custom Confirmation',
      message: 'This is a custom confirmation dialog. Do you want to proceed?',
      variant: 'warning',
      confirmText: 'Yes, Proceed',
      cancelText: 'No, Cancel',
      onConfirm: () => {
        alert('User confirmed the action!');
      },
      onCancel: () => {
        alert('User cancelled the action.');
      },
    });
  };

  return (
    <div className={`p-6 bg-white rounded-lg shadow-lg ${className}`}>
      <h3 className="text-xl font-semibold mb-4">Navigation Prevention Demo</h3>
      
      <div className="space-y-4">
        {/* Protection Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleProtection}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isProtected 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {isProtected ? 'Protection ON' : 'Protection OFF'}
          </button>
          <span className="text-sm text-gray-600">
            {isProtected ? 'Navigation is protected' : 'Navigation is not protected'}
          </span>
        </div>

        {/* Unsaved Changes Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleUnsavedChanges}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              hasUnsavedChanges 
                ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {hasUnsavedChanges ? 'Has Unsaved Changes' : 'No Unsaved Changes'}
          </button>
          <span className="text-sm text-gray-600">
            {hasUnsavedChanges ? 'Will show unsaved changes warning' : 'Will show basic warning'}
          </span>
        </div>

        {/* Custom Dialog Demo */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleShowCustomDialog}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Show Custom Dialog
          </button>
          <span className="text-sm text-gray-600">
            Demonstrates custom confirmation dialog
          </span>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Instructions:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Toggle protection ON to enable navigation prevention</li>
            <li>• Try using the browser back button when protection is enabled</li>
            <li>• Try refreshing the page when protection is enabled</li>
            <li>• Toggle "unsaved changes" to see different warning messages</li>
            <li>• Click "Show Custom Dialog" to see the confirmation dialog component</li>
          </ul>
        </div>

        {/* Status Display */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">Current Status:</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <div>Protection: <span className={isProtected ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>{isProtected ? 'ENABLED' : 'DISABLED'}</span></div>
            <div>Unsaved Changes: <span className={hasUnsavedChanges ? 'text-yellow-600 font-medium' : 'text-gray-600 font-medium'}>{hasUnsavedChanges ? 'YES' : 'NO'}</span></div>
            <div>Current Path: <span className="font-mono text-xs">{window.location.pathname}</span></div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog />
    </div>
  );
};
