import type { Task, UserStats } from '../types';
import { TaskStatus, Priority } from '../types';
import { format, isToday, isTomorrow, isThisWeek, differenceInDays, differenceInHours } from 'date-fns';

export const calculateUserStats = (tasks: Task[]): UserStats => {
  const completedTasks = tasks.filter(task => task.status === TaskStatus.DONE);
  const totalTasks = tasks.length;
  
  // Calculate average completion time
  const tasksWithActualTime = completedTasks.filter(task => task.actualTime);
  const avgCompletionTime = tasksWithActualTime.length > 0
    ? tasksWithActualTime.reduce((sum, task) => sum + (task.actualTime || 0), 0) / tasksWithActualTime.length
    : 0;
  
  // Calculate procrastination factor (actual vs estimated time)
  const tasksWithBothTimes = completedTasks.filter(task => task.estimatedTime && task.actualTime);
  const procrastinationFactor = tasksWithBothTimes.length > 0
    ? tasksWithBothTimes.reduce((sum, task) => sum + ((task.actualTime || 0) / (task.estimatedTime || 1)), 0) / tasksWithBothTimes.length
    : 1;
  
  // Determine best working hours (simplified)
  const completionHours = completedTasks
    .filter(task => task.completedAt)
    .map(task => task.completedAt!.getHours());
  
  const hourCounts = completionHours.reduce((acc, hour) => {
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);
  
  const bestWorkingHours = Object.entries(hourCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([hour]) => `${hour}:00`);
  
  // Simple productivity trend (completed vs total tasks ratio)
  const productivityTrend = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;
  
  return {
    totalTasks,
    completedTasks: completedTasks.length,
    avgCompletionTime,
    procrastinationFactor,
    bestWorkingHours,
    productivityTrend
  };
};

export const getTaskUrgency = (task: Task): 'overdue' | 'today' | 'tomorrow' | 'this-week' | 'later' => {
  if (!task.dueDate) return 'later';
  
  const now = new Date();
  const dueDate = new Date(task.dueDate);
  
  if (dueDate < now) return 'overdue';
  if (isToday(dueDate)) return 'today';
  if (isTomorrow(dueDate)) return 'tomorrow';
  if (isThisWeek(dueDate)) return 'this-week';
  
  return 'later';
};

export const formatDueDate = (dueDate: Date): string => {
  const now = new Date();
  
  if (isToday(dueDate)) return 'Today';
  if (isTomorrow(dueDate)) return 'Tomorrow';
  
  const daysDiff = differenceInDays(dueDate, now);
  const hoursDiff = differenceInHours(dueDate, now);
  
  if (daysDiff < 0) {
    return `Overdue by ${Math.abs(daysDiff)} day${Math.abs(daysDiff) !== 1 ? 's' : ''}`;
  }
  
  if (daysDiff === 0 && hoursDiff > 0) {
    return `In ${hoursDiff} hour${hoursDiff !== 1 ? 's' : ''}`;
  }
  
  if (daysDiff <= 7) {
    return `In ${daysDiff} day${daysDiff !== 1 ? 's' : ''}`;
  }
  
  return format(dueDate, 'MMM d, yyyy');
};

export const getPriorityColor = (priority: Priority): string => {
  switch (priority) {
    case Priority.HIGH:
      return '#EF4444'; // red-500
    case Priority.MEDIUM:
      return '#F59E0B'; // amber-500
    case Priority.LOW:
      return '#10B981'; // emerald-500
    default:
      return '#6B7280'; // gray-500
  }
};

export const getStatusColor = (status: TaskStatus): string => {
  switch (status) {
    case TaskStatus.TODO:
      return '#6B7280'; // gray-500
    case TaskStatus.IN_PROGRESS:
      return '#3B82F6'; // blue-500
    case TaskStatus.DONE:
      return '#10B981'; // emerald-500
    default:
      return '#6B7280';
  }
};

export const sortTasksBySmartPriority = (tasks: Task[], procrastinationFactor = 1.5): Task[] => {
  return [...tasks].sort((a, b) => {
    // Calculate smart priority score
    const getScore = (task: Task): number => {
      let score = 0;
      
      // Priority weight
      const priorityWeights = {
        [Priority.HIGH]: 3,
        [Priority.MEDIUM]: 2,
        [Priority.LOW]: 1
      };
      score += priorityWeights[task.priority] * 10;
      
      // Due date urgency
      if (task.dueDate) {
        const urgency = getTaskUrgency(task);
        const urgencyWeights = {
          'overdue': 50,
          'today': 40,
          'tomorrow': 30,
          'this-week': 20,
          'later': 10
        };
        score += urgencyWeights[urgency];
      }
      
      // Estimated time (shorter tasks get slight priority)
      if (task.estimatedTime) {
        const adjustedTime = task.estimatedTime * procrastinationFactor;
        score += Math.max(0, 20 - (adjustedTime / 60)); // Bonus for tasks under 1 hour
      }
      
      // Status penalty (completed tasks go to bottom)
      if (task.status === TaskStatus.DONE) score -= 1000;
      if (task.status === TaskStatus.IN_PROGRESS) score += 5;
      
      return score;
    };
    
    return getScore(b) - getScore(a);
  });
};

export const getProductivityInsights = (tasks: Task[]): string[] => {
  const insights: string[] = [];
  const stats = calculateUserStats(tasks);
  
  if (stats.procrastinationFactor > 2) {
    insights.push("🐌 You tend to underestimate task duration. Consider adding 2x buffer time!");
  }
  
  if (stats.productivityTrend > 80) {
    insights.push("🔥 Amazing productivity! You're completing most of your tasks.");
  } else if (stats.productivityTrend < 50) {
    insights.push("💡 Try breaking larger tasks into smaller, manageable chunks.");
  }
  
  const overdueTasks = tasks.filter(task => 
    task.dueDate && task.dueDate < new Date() && task.status !== TaskStatus.DONE
  );
  
  if (overdueTasks.length > 0) {
    insights.push(`⚠️ You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}. Focus on catching up!`);
  }
  
  const todayTasks = tasks.filter(task => 
    task.dueDate && isToday(task.dueDate) && task.status !== TaskStatus.DONE
  );
  
  if (todayTasks.length > 5) {
    insights.push("📅 You have many tasks due today. Consider rescheduling some to avoid overwhelm.");
  }
  
  if (stats.bestWorkingHours.length > 0) {
    insights.push(`⏰ Your most productive hours are: ${stats.bestWorkingHours.join(', ')}`);
  }
  
  return insights;
};
