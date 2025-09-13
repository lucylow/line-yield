import React from 'react';
import { cn } from '../utils/cn';
import { useLocalization } from '../hooks';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'warning' | 'danger';
  className?: string;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText,
  cancelText,
  variant = 'default',
  className = '',
}) => {
  const { strings, lang } = useLocalization();

  if (!isOpen) return null;

  // Get localized text
  const getTitle = () => {
    if (title) return title;
    return lang === 'ja' ? '確認' : 'Confirm';
  };

  const getMessage = () => {
    if (message) return message;
    return lang === 'ja' 
      ? 'この操作を続行しますか？'
      : 'Are you sure you want to continue?';
  };

  const getConfirmText = () => {
    if (confirmText) return confirmText;
    return lang === 'ja' ? '確認' : 'Confirm';
  };

  const getCancelText = () => {
    if (cancelText) return cancelText;
    return lang === 'ja' ? 'キャンセル' : 'Cancel';
  };

  // Get variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          icon: '⚠️',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          confirmBg: 'bg-yellow-500 hover:bg-yellow-600',
          borderColor: 'border-yellow-200',
        };
      case 'danger':
        return {
          icon: '🚨',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          confirmBg: 'bg-red-500 hover:bg-red-600',
          borderColor: 'border-red-200',
        };
      default:
        return {
          icon: '❓',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          confirmBg: 'bg-blue-500 hover:bg-blue-600',
          borderColor: 'border-blue-200',
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      {/* Dialog */}
      <div className={cn(
        'relative bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full p-6',
        className
      )}>
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <div className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center',
            variantStyles.iconBg
          )}>
            <span className="text-2xl">{variantStyles.icon}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {getTitle()}
            </h3>
            <p className="text-sm text-gray-500">
              {lang === 'ja' ? '操作の確認' : 'Action Confirmation'}
            </p>
          </div>
        </div>

        {/* Message */}
        <div className="mb-6">
          <p className="text-gray-700 leading-relaxed">
            {getMessage()}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors duration-200"
          >
            {getCancelText()}
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              'flex-1 px-4 py-3 text-white rounded-xl font-medium transition-colors duration-200',
              variantStyles.confirmBg
            )}
          >
            {getConfirmText()}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Hook to use confirmation dialog with state management
 */
export function useConfirmationDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [config, setConfig] = React.useState<{
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'warning' | 'danger';
    onConfirm?: () => void;
    onCancel?: () => void;
  }>({});

  const showDialog = React.useCallback((dialogConfig: typeof config) => {
    setConfig(dialogConfig);
    setIsOpen(true);
  }, []);

  const hideDialog = React.useCallback(() => {
    setIsOpen(false);
    setConfig({});
  }, []);

  const handleConfirm = React.useCallback(() => {
    config.onConfirm?.();
    hideDialog();
  }, [config, hideDialog]);

  const handleCancel = React.useCallback(() => {
    config.onCancel?.();
    hideDialog();
  }, [config, hideDialog]);

  const ConfirmationDialogComponent = React.useCallback(() => (
    <ConfirmationDialog
      isOpen={isOpen}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      title={config.title}
      message={config.message}
      confirmText={config.confirmText}
      cancelText={config.cancelText}
      variant={config.variant}
    />
  ), [isOpen, handleConfirm, handleCancel, config]);

  return {
    showDialog,
    hideDialog,
    ConfirmationDialog: ConfirmationDialogComponent,
  };
}
