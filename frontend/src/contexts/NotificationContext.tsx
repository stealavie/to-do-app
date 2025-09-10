import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Notification, NotificationContext as INotificationContext } from '../types';
import { useAuth } from './AuthContext';
import { notificationsApi } from '../services/api';

const NotificationContext = createContext<INotificationContext | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Load notifications from backend
  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }

    setLoading(true);
    try {
      const { notifications: fetchedNotifications } = await notificationsApi.getNotifications();
      // Convert backend notifications to frontend format if needed
      const formattedNotifications: Notification[] = fetchedNotifications.map((notif: any) => ({
        id: notif.id,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        isRead: notif.isRead,
        createdAt: notif.createdAt,
        projectId: notif.projectId,
        groupId: notif.groupId,
        metadata: notif.metadata,
      }));
      setNotifications(formattedNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Load notifications when user logs in or context initializes
  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
    }
  }, [isAuthenticated, loadNotifications]);

  // Polling for new notifications every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      loadNotifications();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, loadNotifications]);

  const addNotification = useCallback((notificationData: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    // This is mainly for client-side notifications or immediate feedback
    // In a real app, this would trigger a backend call or WebSocket event
    console.log('Client-side notification (not persisted):', notificationData);
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationsApi.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, []);

  const removeNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationsApi.deleteNotification(notificationId);
      setNotifications(prev =>
        prev.filter(notification => notification.id !== notificationId)
      );
    } catch (error) {
      console.error('Error removing notification:', error);
    }
  }, []);

  const clearAllNotifications = useCallback(async () => {
    try {
      await notificationsApi.clearAllNotifications();
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  }, []);

  // Refresh notifications (useful for manual refresh or after certain actions)
  const refreshNotifications = useCallback(() => {
    loadNotifications();
  }, [loadNotifications]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const contextValue: INotificationContext = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
  };

  // Expose additional methods for external use
  (contextValue as any).refreshNotifications = refreshNotifications;
  (contextValue as any).loading = loading;

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};
