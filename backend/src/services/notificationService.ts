import { prisma } from '../lib/prisma';
import type { NotificationType } from '@prisma/client';
import { emitNotification } from './socketService';

export interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  projectId?: string;
  groupId?: string;
  metadata?: any;
}

/**
 * Create a new notification in the database and emit real-time event
 */
export const createNotification = async (data: CreateNotificationData) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        projectId: data.projectId,
        groupId: data.groupId,
        metadata: data.metadata,
      },
    });

    // Emit real-time notification
    emitNotification(data.userId, notification);

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Create a task assignment notification
 */
export const createTaskAssignmentNotification = async (
  assignedUserId: string,
  projectTitle: string,
  assignedByUsername?: string,
  projectId?: string,
  groupId?: string,
  groupName?: string
) => {
  const assignedByText = assignedByUsername ? ` by ${assignedByUsername}` : '';
  
  return createNotification({
    userId: assignedUserId,
    type: 'TASK_ASSIGNED',
    title: 'New Task Assigned',
    message: `You have been assigned to: "${projectTitle}"${assignedByText}`,
    projectId,
    groupId,
    metadata: {
      assignedBy: assignedByUsername,
      projectTitle,
      groupName,
    },
  });
};

/**
 * Create a deadline approaching notification
 */
export const createDeadlineNotification = async (
  userId: string,
  projectTitle: string,
  dueDate: string,
  projectId?: string,
  groupId?: string,
  groupName?: string
) => {
  const dueDateObj = new Date(dueDate);
  const formattedDate = dueDateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return createNotification({
    userId,
    type: 'DEADLINE_APPROACHING',
    title: 'Deadline Approaching',
    message: `Task "${projectTitle}" is due ${formattedDate}`,
    projectId,
    groupId,
    metadata: {
      projectTitle,
      groupName,
      dueDate,
      formattedDueDate: formattedDate,
    },
  });
};

/**
 * Check for projects with approaching deadlines and create notifications
 */
export const checkApproachingDeadlines = async () => {
  try {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    // Find projects with due dates within the next 24 hours
    const approachingProjects = await prisma.project.findMany({
      where: {
        dueDate: {
          gte: now,
          lte: tomorrow,
        },
        assignedTo: {
          not: null,
        },
      },
      include: {
        assignedUser: true,
        group: true,
      },
    });

    for (const project of approachingProjects) {
      if (!project.assignedUser || !project.dueDate) continue;

      // Check if we already sent a notification for this deadline
      const existingNotification = await prisma.notification.findFirst({
        where: {
          userId: project.assignedUser.id,
          type: 'DEADLINE_APPROACHING',
          projectId: project.id,
          createdAt: {
            gte: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Within last 24 hours
          },
        },
      });

      if (!existingNotification) {
        await createDeadlineNotification(
          project.assignedUser.id,
          project.title,
          project.dueDate.toISOString(),
          project.id,
          project.groupId,
          project.group?.name
        );
      }
    }
  } catch (error) {
    console.error('Error checking approaching deadlines:', error);
    throw error;
  }
};

/**
 * Get notifications for a specific user
 */
export const getUserNotifications = async (userId: string, limit = 50) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
};

/**
 * Get unread notification count for a user
 */
export const getUserUnreadCount = async (userId: string) => {
  return prisma.notification.count({
    where: { 
      userId,
      isRead: false 
    },
  });
};
