import { prisma } from '../lib/prisma';

export interface UserAnalytics {
  procrastinationCoefficient: number;
  averageCompletionTime: number; // in minutes
  onTimeDeliveryRate: number; // percentage
  preferredWorkingHours: {
    start: number; // hour (0-23)
    end: number;   // hour (0-23)
  };
  taskCompletionPatterns: {
    morningProductivity: number; // 0-1 scale
    afternoonProductivity: number;
    eveningProductivity: number;
  };
}

/**
 * Retrieves user analytics data for intelligent notification scheduling.
 * This function will eventually integrate with Module 5 (AI & Analytics Engine).
 * For now, it provides calculated analytics based on task history.
 * 
 * @param userId - The ID of the user to analyze
 * @returns UserAnalytics object containing procrastination patterns and preferences
 */
export async function getUserAnalytics(userId: string): Promise<UserAnalytics> {
  try {
    // Get user's task completion history for analysis
    const taskHistory = await prisma.taskHistory.findMany({
      where: {
        userId: userId,
        eventType: 'completed'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // Analyze last 50 completed tasks
    });

    // Get user's assigned projects with due dates for deadline analysis
    const completedProjects = await prisma.project.findMany({
      where: {
        assignedTo: userId,
        status: 'DONE',
        dueDate: { not: null }
      },
      include: {
        lastEditor: true
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 30 // Analyze last 30 completed projects
    });

    // Calculate procrastination coefficient
    const procrastinationCoefficient = calculateProcrastinationCoefficient(completedProjects);
    
    // Calculate average completion time
    const averageCompletionTime = calculateAverageCompletionTime(taskHistory);
    
    // Calculate on-time delivery rate
    const onTimeDeliveryRate = calculateOnTimeDeliveryRate(completedProjects);
    
    // Calculate preferred working hours (mock implementation)
    const preferredWorkingHours = calculatePreferredWorkingHours(taskHistory);
    
    // Calculate productivity patterns (mock implementation)
    const taskCompletionPatterns = calculateProductivityPatterns(taskHistory);

    return {
      procrastinationCoefficient,
      averageCompletionTime,
      onTimeDeliveryRate,
      preferredWorkingHours,
      taskCompletionPatterns
    };

  } catch (error) {
    console.error('Error calculating user analytics:', error);
    
    // Return default values if calculation fails
    return {
      procrastinationCoefficient: 1.5, // Default: assume user needs 50% more time than estimated
      averageCompletionTime: 120, // Default: 2 hours average
      onTimeDeliveryRate: 0.7, // Default: 70% on-time delivery
      preferredWorkingHours: {
        start: 9,
        end: 17
      },
      taskCompletionPatterns: {
        morningProductivity: 0.8,
        afternoonProductivity: 0.7,
        eveningProductivity: 0.6
      }
    };
  }
}

/**
 * Calculates how much extra time a user typically needs compared to estimates
 */
function calculateProcrastinationCoefficient(completedProjects: any[]): number {
  if (completedProjects.length === 0) {
    return 1.5; // Default coefficient
  }

  let totalDelayRatio = 0;
  let validProjects = 0;

  for (const project of completedProjects) {
    if (project.dueDate && project.updatedAt) {
      const dueDate = new Date(project.dueDate);
      const completedDate = new Date(project.updatedAt);
      
      // Calculate how many days before/after the due date the task was completed
      const daysDifference = (completedDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysDifference > 0) {
        // Task was late - increase coefficient
        totalDelayRatio += 1 + (daysDifference / 7); // Add 1 for each week late
      } else {
        // Task was early or on time
        totalDelayRatio += 1;
      }
      validProjects++;
    }
  }

  if (validProjects === 0) {
    return 1.5;
  }

  const averageRatio = totalDelayRatio / validProjects;
  
  // Ensure coefficient is between 1.0 and 3.0
  return Math.max(1.0, Math.min(3.0, averageRatio));
}

/**
 * Calculates average time spent on task completion
 */
function calculateAverageCompletionTime(taskHistory: any[]): number {
  if (taskHistory.length === 0) {
    return 120; // Default 2 hours
  }

  const validTimes = taskHistory
    .filter(task => task.actualTimeMinutes && task.actualTimeMinutes > 0)
    .map(task => task.actualTimeMinutes);

  if (validTimes.length === 0) {
    return 120;
  }

  const sum = validTimes.reduce((acc, time) => acc + time, 0);
  return Math.round(sum / validTimes.length);
}

/**
 * Calculates percentage of tasks completed on time
 */
function calculateOnTimeDeliveryRate(completedProjects: any[]): number {
  if (completedProjects.length === 0) {
    return 0.7; // Default 70%
  }

  let onTimeCount = 0;
  let validProjects = 0;

  for (const project of completedProjects) {
    if (project.dueDate && project.updatedAt) {
      const dueDate = new Date(project.dueDate);
      const completedDate = new Date(project.updatedAt);
      
      if (completedDate <= dueDate) {
        onTimeCount++;
      }
      validProjects++;
    }
  }

  if (validProjects === 0) {
    return 0.7;
  }

  return onTimeCount / validProjects;
}

/**
 * Determines user's preferred working hours based on completion patterns
 */
function calculatePreferredWorkingHours(taskHistory: any[]): { start: number; end: number } {
  // This is a simplified implementation
  // In a real scenario, this would analyze completion timestamps
  
  if (taskHistory.length === 0) {
    return { start: 9, end: 17 }; // Default business hours
  }

  // For now, return business hours
  // TODO: Implement actual time pattern analysis
  return { start: 9, end: 17 };
}

/**
 * Calculates productivity patterns throughout the day
 */
function calculateProductivityPatterns(taskHistory: any[]) {
  // This is a simplified implementation
  // In a real scenario, this would analyze completion timestamps and quality
  
  return {
    morningProductivity: 0.8,   // 80% productivity in morning
    afternoonProductivity: 0.7, // 70% productivity in afternoon  
    eveningProductivity: 0.6    // 60% productivity in evening
  };
}