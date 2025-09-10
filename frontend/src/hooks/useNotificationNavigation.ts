import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Notification } from '../types';

export const useNotificationNavigation = () => {
  const navigate = useNavigate();

  const navigateToNotification = useCallback((notification: Notification) => {
    // Navigate based on notification type and metadata
    if (notification.projectId && notification.groupId) {
      // Navigate to group detail page with project ID as search parameter to auto-open the task
      navigate(`/groups/${notification.groupId}?projectId=${notification.projectId}`);
    } else if (notification.groupId) {
      // Navigate to group page
      navigate(`/groups/${notification.groupId}`);
    } else {
      // Default to dashboard
      navigate('/');
    }
  }, [navigate]);

  return { navigateToNotification };
};
