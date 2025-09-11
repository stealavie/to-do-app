import { useEffect, useCallback } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { projectsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Helper function to check if a date is within 24 hours
const isWithin24Hours = (date: string): boolean => {
  const now = new Date();
  const targetDate = new Date(date);
  const diff = targetDate.getTime() - now.getTime();
  return diff > 0 && diff <= 24 * 60 * 60 * 1000; // 24 hours in milliseconds
};

export const useDeadlineNotifications = () => {
  const { user } = useAuth();
  const notificationContext = useNotifications() as any;

  const checkDeadlines = useCallback(async () => {
    if (!user) return;

    try {
      // Get user's groups and their projects
      const { groups } = await import('../services/api').then(api => api.groupsApi.getUserGroups());
      
      for (const group of groups) {
        const { projects } = await projectsApi.getGroupProjects(group.id);
        
        for (const project of projects) {
          // Check if this project is assigned to the current user and has an approaching deadline
          if (
            project.assignedTo === user.id && 
            project.dueDate && 
            isWithin24Hours(project.dueDate)
          ) {
            // Check if we've already sent a notification for this deadline
            const notificationExists = notificationContext.notifications.some(
              (n: any) => 
                n.type === 'DEADLINE_APPROACHING' && 
                n.projectId === project.id &&
                n.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Within last 24 hours
            );

            if (!notificationExists && notificationContext.generateDeadlineNotification) {
              notificationContext.generateDeadlineNotification({
                ...project,
                group: { id: group.id, name: group.name }
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking deadlines:', error);
    }
  }, [user, notificationContext]);

  // Set up polling to check deadlines
  useEffect(() => {
    if (!user) return;

    // Check immediately
    checkDeadlines();

    // Then check every hour
    const interval = setInterval(checkDeadlines, 60 * 60 * 1000); // 1 hour

    return () => clearInterval(interval);
  }, [user, checkDeadlines]);

  return { checkDeadlines };
};
