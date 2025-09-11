import { useEffect, useCallback } from 'react';
import { useNotifications } from './useNotifications';
import { projectsApi } from '../services/api';
import { useAuth } from './useAuth';

// Helper function to check if a date is within 24 hours
const isWithin24Hours = (date: string): boolean => {
  const now = new Date();
  const targetDate = new Date(date);
  const diff = targetDate.getTime() - now.getTime();
  return diff > 0 && diff <= 24 * 60 * 60 * 1000; // 24 hours in milliseconds
};

export const useDeadlineNotifications = () => {
  const { user } = useAuth();
  const notificationContext = useNotifications();

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
              (n) => 
                n.type === 'DEADLINE_APPROACHING' && 
                n.projectId === project.id &&
                n.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Within last 24 hours
            );

            if (!notificationExists) {
              notificationContext.addNotification({
                type: 'DEADLINE_APPROACHING',
                title: `Deadline Approaching`,
                message: `Project "${project.title}" is due within 24 hours`,
                projectId: project.id,
                groupId: group.id,
                metadata: {
                  projectTitle: project.title,
                  groupName: group.name,
                  dueDate: project.dueDate,
                },
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
