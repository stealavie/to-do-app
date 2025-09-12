import { useContext } from 'react';
import { NotificationContext } from '../contexts/NotificationContextDefinition';

/**
 * Hook to access the notification context
 * @returns NotificationContext with notifications state and methods
 */
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
