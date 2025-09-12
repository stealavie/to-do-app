import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { useNotifications } from './useNotifications';
import { groupsApi, projectsApi } from '../services/api';
import type { Project } from '../types';

export const useNotificationPolling = () => {
  const { user, isAuthenticated } = useAuth();
  const notificationContext = useNotifications();
  const previousProjectsRef = useRef<Record<string, Project>>({});

  // Helper function to check if a date is within 24 hours
  const isWithin24Hours = (date: string): boolean => {
    const now = new Date();
    const targetDate = new Date(date);
    const diff = targetDate.getTime() - now.getTime();
    return diff > 0 && diff <= 24 * 60 * 60 * 1000;
  };

  const checkForNotifications = useCallback(async () => {
    if (!user || !isAuthenticated) return;

    try {
      // Get user's groups
      const { groups } = await groupsApi.getUserGroups();
      const currentProjects: Record<string, Project> = {};

      for (const group of groups) {
        try {
          const { projects } = await projectsApi.getGroupProjects(group.id);
          
          for (const project of projects) {
            currentProjects[project.id] = {
              ...project,
              group: { id: group.id, name: group.name }
            };

            // Check for new assignments
            const previousProject = previousProjectsRef.current[project.id];
            if (previousProject) {
              // Check if assignment changed and current user is now assigned
              if (
                project.assignedTo === user.id && 
                previousProject.assignedTo !== user.id
              ) {
                // Check if we already have a recent notification for this assignment
                const existingNotification = notificationContext.notifications.find(
                  (n) => 
                    n.type === 'TASK_ASSIGNED' && 
                    n.projectId === project.id &&
                    new Date(n.createdAt) > new Date(Date.now() - 5 * 60 * 1000) // Within last 5 minutes
                );

                if (!existingNotification) {
                  notificationContext.addNotification({
                    type: 'TASK_ASSIGNED',
                    title: `Task Assigned`,
                    message: `You have been assigned to "${project.title}"`,
                    projectId: project.id,
                    groupId: group.id,
                    metadata: {
                      assignedBy: 'System',
                      projectTitle: project.title,
                      groupName: group.name,
                    },
                  });
                }
              }
            }

            // Check for approaching deadlines
            if (
              project.assignedTo === user.id && 
              project.dueDate && 
              isWithin24Hours(project.dueDate)
            ) {
              // Check if we already have a notification for this deadline
              const existingDeadlineNotification = notificationContext.notifications.find(
                (n) => 
                  n.type === 'DEADLINE_APPROACHING' && 
                  n.projectId === project.id &&
                  new Date(n.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000) // Within last 24 hours
              );

              if (!existingDeadlineNotification) {
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
        } catch (error) {
          console.error(`Error fetching projects for group ${group.id}:`, error);
        }
      }

      // Update the reference for next comparison
      previousProjectsRef.current = currentProjects;
    } catch (error) {
      console.error('Error in notification polling:', error);
    }
  }, [user, isAuthenticated, notificationContext]);

  // Set up polling
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Initial check
    checkForNotifications();

    // Set up polling interval (every 2 minutes)
    const interval = setInterval(checkForNotifications, 2 * 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [isAuthenticated, user, checkForNotifications]);

  // Manual refresh function
  const refreshNotifications = useCallback(() => {
    checkForNotifications();
  }, [checkForNotifications]);

  return { refreshNotifications };
};
