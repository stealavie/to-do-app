export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  projectId: string;
  estimatedTime?: number; // in minutes
  actualTime?: number; // in minutes
  reminderTime?: Date;
  completedAt?: Date;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  description?: string;
}

export const TaskStatus = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE'
} as const;

export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];

export const Priority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH'
} as const;

export type Priority = typeof Priority[keyof typeof Priority];

export interface StudySession {
  id: string;
  taskId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  productivity: number; // 1-5 scale
  notes?: string;
}

export interface UserStats {
  totalTasks: number;
  completedTasks: number;
  avgCompletionTime: number;
  procrastinationFactor: number; // estimated vs actual time ratio
  bestWorkingHours: string[];
  productivityTrend: number;
}

export type ViewType = 'kanban' | 'calendar' | 'analytics';

export interface FilterOptions {
  status?: TaskStatus[];
  priority?: Priority[];
  projects?: string[];
  tags?: string[];
  dueDate?: {
    from?: Date;
    to?: Date;
  };
}
