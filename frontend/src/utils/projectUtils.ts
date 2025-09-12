/**
 * Utility functions for project-related operations
 */

import type { Project } from '../types';

/**
 * Formats a date string to a localized date format
 * @param dateString - The date string to format
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

/**
 * Gets the status and styling information for a project's due date
 * @param dueDate - The project's due date
 * @returns Object containing status, text, and color information
 */
export const getDueDateStatus = (dueDate?: string) => {
  if (!dueDate) return null;
  
  const now = new Date();
  const due = new Date(dueDate);
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return {
      status: 'overdue' as const,
      text: `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} overdue`,
      color: 'text-danger-600',
      bgColor: 'bg-danger-100'
    };
  } else if (diffDays === 0) {
    return {
      status: 'today' as const,
      text: 'Due today',
      color: 'text-warning-600',
      bgColor: 'bg-warning-100'
    };
  } else if (diffDays <= 3) {
    return {
      status: 'soon' as const,
      text: `Due in ${diffDays} day${diffDays !== 1 ? 's' : ''}`,
      color: 'text-warning-600',
      bgColor: 'bg-warning-100'
    };
  } else {
    return {
      status: 'normal' as const,
      text: `Due ${formatDate(dueDate)}`,
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-100'
    };
  }
};

/**
 * Gets styling classes for project priority
 * @param priority - The project priority
 * @returns Object with styling classes
 */
export const getPriorityStyles = (priority: Project['priority']) => {
  switch (priority) {
    case 'HIGH':
      return {
        bgColor: 'bg-danger-100',
        textColor: 'text-danger-800',
        iconColor: 'text-danger-600'
      };
    case 'MEDIUM':
      return {
        bgColor: 'bg-warning-100',
        textColor: 'text-warning-800',
        iconColor: 'text-warning-600'
      };
    case 'LOW':
      return {
        bgColor: 'bg-success-100',
        textColor: 'text-success-800',
        iconColor: 'text-success-600'
      };
    default:
      return {
        bgColor: 'bg-secondary-100',
        textColor: 'text-secondary-800',
        iconColor: 'text-secondary-600'
      };
  }
};

/**
 * Gets styling classes for project status
 * @param status - The project status
 * @returns Object with styling classes
 */
export const getStatusStyles = (status: Project['status']) => {
  switch (status) {
    case 'DONE':
      return {
        bgColor: 'bg-success-100',
        textColor: 'text-success-800',
        iconColor: 'text-success-600'
      };
    case 'IN_PROGRESS':
      return {
        bgColor: 'bg-primary-100',
        textColor: 'text-primary-800',
        iconColor: 'text-primary-600'
      };
    case 'PLANNING':
      return {
        bgColor: 'bg-secondary-100',
        textColor: 'text-secondary-800',
        iconColor: 'text-secondary-600'
      };
    default:
      return {
        bgColor: 'bg-secondary-100',
        textColor: 'text-secondary-800',
        iconColor: 'text-secondary-600'
      };
  }
};

/**
 * Gets human-readable text for project status
 * @param status - The project status
 * @returns Human-readable status text
 */
export const getStatusDisplayText = (status: Project['status']): string => {
  switch (status) {
    case 'DONE':
      return 'Done';
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'PLANNING':
      return 'Planning';
    default:
      return 'Unknown';
  }
};

/**
 * Gets human-readable text for project priority
 * @param priority - The project priority
 * @returns Human-readable priority text
 */
export const getPriorityDisplayText = (priority: Project['priority']): string => {
  switch (priority) {
    case 'HIGH':
      return 'High';
    case 'MEDIUM':
      return 'Medium';
    case 'LOW':
      return 'Low';
    default:
      return 'Medium';
  }
};

/**
 * Calculates project statistics for a group
 * @param projects - Array of projects
 * @param userId - Current user's ID
 * @returns Object with project statistics
 */
export const calculateProjectStats = (projects: Project[], userId?: string) => {
  const allProjects = projects || [];
  const myProjects = allProjects.filter(project => project.assignedUser?.id === userId);
  
  return {
    total: allProjects.length,
    my: myProjects.length,
    planning: allProjects.filter(p => p.status === 'PLANNING').length,
    inProgress: allProjects.filter(p => p.status === 'IN_PROGRESS').length,
    completed: allProjects.filter(p => p.status === 'DONE').length,
    myCompleted: myProjects.filter(p => p.status === 'DONE').length
  };
};
