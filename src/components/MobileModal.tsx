import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
}

export const MobileModal: React.FC<MobileModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = ''
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    full: 'max-w-full h-full'
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={cn(
          'sm:max-w-md w-full mx-4 p-0 bg-white rounded-2xl shadow-2xl',
          sizeClasses[size],
          className
        )}
        onPointerDownOutside={closeOnOverlayClick ? onClose : undefined}
      >
        <div className="flex flex-col h-full max-h-[90vh]">
          {/* Header */}
          {(title || showCloseButton) && (
            <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                {title && (
                  <DialogTitle className="text-xl font-bold text-gray-900">
                    {title}
                  </DialogTitle>
                )}
                {showCloseButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </DialogHeader>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface MobileModalActionsProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileModalActions: React.FC<MobileModalActionsProps> = ({
  children,
  className = ''
}) => (
  <div className={cn(
    'flex-shrink-0 p-6 pt-4 border-t border-gray-200 bg-gray-50',
    className
  )}>
    <div className="flex gap-3">
      {children}
    </div>
  </div>
);

export default MobileModal;
