import * as cron from 'node-cron';
import { prisma } from '../lib/prisma';
import { getUserAnalytics } from '../utils/userAnalytics';

/**
 * Smart Notification Scheduler - The core of Module 4's Time & Notification Engine
 * 
 * This service runs background jobs to analyze tasks and send intelligent notifications
 * based on user procrastination patterns and deadlines.
 * 
 * Key Features:
 * - Smart start reminders based on procrastination coefficient
 * - Critical deadline alerts
 * - Duplicate notification prevention
 * - Personalized timing based on user analytics
 */
export class NotificationScheduler {
  private isRunning = false;

  /**
   * Starts the notification scheduler
   * Runs every 5 minutes to check for tasks that need notifications
   */
  public start(): void {
    console.log('🔔 Starting Smart Notification Scheduler...');
    
    // Schedule job to run every 5 minutes: */5 * * * *
    cron.schedule('*/5 * * * *', async () => {
      if (this.isRunning) {
        console.log('⏳ Previous notification job still running, skipping...');
        return;
      }

      this.isRunning = true;
      console.log('🔍 Running smart notification analysis...');
      
      try {
        await this.processSmartNotifications();
        console.log('✅ Smart notification analysis completed');
      } catch (error) {
        console.error('❌ Error in notification scheduler:', error);
      } finally {
        this.isRunning = false;
      }
    });

    console.log('✅ Smart Notification Scheduler started - checking every 5 minutes');
  }

  /**
   * Stops the notification scheduler
   */
  public stop(): void {
    console.log('🛑 Stopping Smart Notification Scheduler...');
    cron.getTasks().forEach((task) => {
      task.stop();
    });
  }

  /**
   * Main processing logic for smart notifications
   */
  private async processSmartNotifications(): Promise<void> {
    try {
      // Fetch all active tasks (PLANNING or IN_PROGRESS) with future due dates
      const activeTasks = await prisma.project.findMany({
        where: {
          status: {
            in: ['PLANNING', 'IN_PROGRESS']
          },
          dueDate: {
            gt: new Date() // Only future due dates
          }
        },
        include: {
          assignedUser: {
            select: {
              id: true,
              username: true,
              email: true
            }
          },
          group: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      console.log(`📋 Found ${activeTasks.length} active tasks to analyze`);

      // Process each task for potential notifications
      for (const task of activeTasks) {
        if (task.assignedUser) {
          await this.analyzeTaskForNotifications(task);
        }
      }

    } catch (error) {
      console.error('Error fetching active tasks:', error);
      throw error;
    }
  }

  /**
   * Analyzes a single task to determine if notifications should be sent
   */
  private async analyzeTaskForNotifications(task: any): Promise<void> {
    try {
      const userId = task.assignedUser.id;
      const currentTime = new Date();
      const dueDate = new Date(task.dueDate);

      // Get user analytics for personalized notifications
      const analytics = await getUserAnalytics(userId);

      // Calculate realistic start time based on procrastination coefficient
      // Assume a default estimated time of 4 hours (240 minutes) if not available
      const estimatedTimeMinutes = 240; // TODO: This should come from task estimation
      const bufferTimeMinutes = estimatedTimeMinutes * analytics.procrastinationCoefficient;
      
      const realisticStartTime = new Date(dueDate.getTime() - (bufferTimeMinutes * 60 * 1000));

      console.log(`🎯 Analyzing task "${task.title}" for user ${task.assignedUser.username}`);
      console.log(`   Due: ${dueDate.toISOString()}`);
      console.log(`   Realistic start time: ${realisticStartTime.toISOString()}`);
      console.log(`   Procrastination coefficient: ${analytics.procrastinationCoefficient}`);

      // Check for smart start reminder
      if (currentTime >= realisticStartTime && !await this.hasNotificationBeenSent(task.id, 'smart_start_reminder')) {
        await this.sendSmartStartReminder(task, analytics);
      }

      // Check for critical deadline alert (24 hours before due date)
      const criticalThreshold = new Date(dueDate.getTime() - (24 * 60 * 60 * 1000)); // 24 hours before
      if (currentTime >= criticalThreshold && !await this.hasNotificationBeenSent(task.id, 'deadline_critical')) {
        await this.sendDeadlineCriticalAlert(task);
      }

      // Additional check for very urgent tasks (2 hours before due date)
      const urgentThreshold = new Date(dueDate.getTime() - (2 * 60 * 60 * 1000)); // 2 hours before
      if (currentTime >= urgentThreshold && !await this.hasNotificationBeenSent(task.id, 'deadline_urgent')) {
        await this.sendUrgentDeadlineAlert(task);
      }

    } catch (error) {
      console.error(`Error analyzing task ${task.id}:`, error);
    }
  }

  /**
   * Checks if a specific type of notification has already been sent for a task
   */
  private async hasNotificationBeenSent(projectId: string, alertType: string): Promise<boolean> {
    try {
      const existingNotification = await prisma.notification.findFirst({
        where: {
          projectId: projectId,
          alertType: alertType
        }
      });

      return existingNotification !== null;
    } catch (error) {
      console.error(`Error checking existing notifications for project ${projectId}:`, error);
      return false; // If error occurs, assume notification hasn't been sent to avoid missing alerts
    }
  }

  /**
   * Sends a smart start reminder based on user's procrastination patterns
   */
  private async sendSmartStartReminder(task: any, analytics: any): Promise<void> {
    try {
      const timeUntilDue = Math.round((new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60));
      
      const message = `⚡ Perfect timing! Based on your work patterns, now is the ideal time to start "${task.title}". ` +
                     `You have ${timeUntilDue} hours until the deadline. Your success rate when starting at this time: ${Math.round(analytics.onTimeDeliveryRate * 100)}%`;

      await prisma.notification.create({
        data: {
          userId: task.assignedUser.id,
          type: 'TASK_ASSIGNED', // Using existing enum value
          title: '🎯 Smart Start Reminder',
          message: message,
          projectId: task.id,
          groupId: task.groupId,
          alertType: 'smart_start_reminder',
          metadata: {
            taskTitle: task.title,
            groupName: task.group.name,
            procrastinationCoefficient: analytics.procrastinationCoefficient,
            onTimeDeliveryRate: analytics.onTimeDeliveryRate,
            hoursUntilDue: timeUntilDue,
            notificationType: 'smart_start_reminder'
          }
        }
      });

      console.log(`📤 Sent smart start reminder for task "${task.title}" to ${task.assignedUser.username}`);
    } catch (error) {
      console.error(`Error sending smart start reminder for task ${task.id}:`, error);
    }
  }

  /**
   * Sends a critical deadline alert (24 hours before due date)
   */
  private async sendDeadlineCriticalAlert(task: any): Promise<void> {
    try {
      const message = `⚠️ Heads up! "${task.title}" is due in less than 24 hours. ` +
                     `Time to focus and get it done! 🚀`;

      await prisma.notification.create({
        data: {
          userId: task.assignedUser.id,
          type: 'DEADLINE_APPROACHING',
          title: '⚠️ 24-Hour Deadline Alert',
          message: message,
          projectId: task.id,
          groupId: task.groupId,
          alertType: 'deadline_critical',
          metadata: {
            taskTitle: task.title,
            groupName: task.group.name,
            dueDate: task.dueDate,
            notificationType: 'deadline_critical'
          }
        }
      });

      console.log(`📤 Sent 24-hour deadline alert for task "${task.title}" to ${task.assignedUser.username}`);
    } catch (error) {
      console.error(`Error sending deadline critical alert for task ${task.id}:`, error);
    }
  }

  /**
   * Sends an urgent deadline alert (2 hours before due date)
   */
  private async sendUrgentDeadlineAlert(task: any): Promise<void> {
    try {
      const message = `🚨 URGENT: "${task.title}" is due in 2 hours! ` +
                     `This is your final reminder. Drop everything and complete this task now! ⏰`;

      await prisma.notification.create({
        data: {
          userId: task.assignedUser.id,
          type: 'DEADLINE_APPROACHING',
          title: '🚨 FINAL DEADLINE WARNING',
          message: message,
          projectId: task.id,
          groupId: task.groupId,
          alertType: 'deadline_urgent',
          metadata: {
            taskTitle: task.title,
            groupName: task.group.name,
            dueDate: task.dueDate,
            notificationType: 'deadline_urgent',
            urgencyLevel: 'CRITICAL'
          }
        }
      });

      console.log(`📤 Sent urgent deadline alert for task "${task.title}" to ${task.assignedUser.username}`);
    } catch (error) {
      console.error(`Error sending urgent deadline alert for task ${task.id}:`, error);
    }
  }

  /**
   * Manual trigger for testing - processes notifications immediately
   */
  public async triggerManualCheck(): Promise<void> {
    console.log('🔧 Manual notification check triggered...');
    await this.processSmartNotifications();
  }
}

// Create and export a singleton instance
export const notificationScheduler = new NotificationScheduler();