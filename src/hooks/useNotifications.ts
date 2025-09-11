import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface UseNotificationsReturn {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  unreadCount: number;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();

  // Load notifications from localStorage on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications));
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = useCallback((
    notification: Omit<Notification, 'id' | 'timestamp' | 'read'>
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Also show toast notification
    toast({
      title: newNotification.title,
      description: newNotification.message,
      variant: newNotification.type === 'error' ? 'destructive' : 'default',
    });
  }, [toast]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    unreadCount,
  };
};

// Utility functions for common notification types
export const useNotificationHelpers = () => {
  const { addNotification } = useNotifications();

  const notifyTransactionSuccess = useCallback((type: 'deposit' | 'withdraw', amount: string, hash: string) => {
    addNotification({
      type: 'success',
      title: `${type === 'deposit' ? 'Deposit' : 'Withdrawal'} Successful`,
      message: `${amount} USDT ${type === 'deposit' ? 'deposited' : 'withdrawn'} successfully`,
      action: {
        label: 'View Transaction',
        onClick: () => window.open(`https://baobab.klaytnscope.com/tx/${hash}`, '_blank'),
      },
    });
  }, [addNotification]);

  const notifyTransactionError = useCallback((type: 'deposit' | 'withdraw', error: string) => {
    addNotification({
      type: 'error',
      title: `${type === 'deposit' ? 'Deposit' : 'Withdrawal'} Failed`,
      message: error,
    });
  }, [addNotification]);

  const notifyYieldUpdate = useCallback((oldApy: number, newApy: number) => {
    const change = newApy - oldApy;
    const isIncrease = change > 0;
    
    addNotification({
      type: isIncrease ? 'success' : 'warning',
      title: 'APY Updated',
      message: `Your vault APY has ${isIncrease ? 'increased' : 'decreased'} from ${(oldApy * 100).toFixed(2)}% to ${(newApy * 100).toFixed(2)}%`,
    });
  }, [addNotification]);

  const notifyRebalance = useCallback(() => {
    addNotification({
      type: 'info',
      title: 'Auto-Rebalance Executed',
      message: 'Your funds have been automatically rebalanced to optimize yields',
    });
  }, [addNotification]);

  const notifyNetworkSwitch = useCallback((network: string) => {
    addNotification({
      type: 'info',
      title: 'Network Switched',
      message: `Successfully switched to ${network}`,
    });
  }, [addNotification]);

  const notifyWalletConnected = useCallback((address: string) => {
    addNotification({
      type: 'success',
      title: 'Wallet Connected',
      message: `Successfully connected wallet: ${address.slice(0, 6)}...${address.slice(-4)}`,
    });
  }, [addNotification]);

  const notifyWalletDisconnected = useCallback(() => {
    addNotification({
      type: 'warning',
      title: 'Wallet Disconnected',
      message: 'Your wallet has been disconnected',
    });
  }, [addNotification]);

  return {
    notifyTransactionSuccess,
    notifyTransactionError,
    notifyYieldUpdate,
    notifyRebalance,
    notifyNetworkSwitch,
    notifyWalletConnected,
    notifyWalletDisconnected,
  };
};
