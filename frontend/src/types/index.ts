// Backend API Types (synchronized with Prisma schema)

export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

export interface LearningGroup {
  id: string;
  name: string;
  description?: string;
  inviteCode: string;
  createdAt: string;
  memberships: GroupMembership[];
  projects: Project[];
}

export interface GroupMembership {
  userId: string;
  groupId: string;
  role: Role;
  joinedAt: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  assignedTo?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PLANNING' | 'IN_PROGRESS' | 'DONE';
  lastEditedBy?: string;
  lastEditedAt?: string;
  createdAt: string;
  updatedAt?: string;
  groupId: string;
  group?: {
    id: string;
    name: string;
  };
  assignedUser?: {
    id: string;
    username: string;
    email: string;
  };
  lastEditor?: {
    id: string;
    username: string;
    email: string;
  };
}

export const Role = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER'
} as const;

export type Role = typeof Role[keyof typeof Role];

// Auth Types
export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

// API Request Types
export interface CreateGroupRequest {
  name: string;
  description?: string;
}

export interface JoinGroupRequest {
  inviteCode: string;
}

export interface CreateProjectRequest {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  status?: 'PLANNING' | 'IN_PROGRESS' | 'DONE';
}

// API Response Types
export interface ApiResponse<T> {
  message?: string;
  data?: T;
  error?: string;
}

export interface GroupsResponse {
  groups: LearningGroup[];
}

export interface ProjectsResponse {
  projects: Project[];
}

// Notification Types
export const NotificationType = {
  TASK_ASSIGNED: 'TASK_ASSIGNED',
  DEADLINE_APPROACHING: 'DEADLINE_APPROACHING'
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  projectId?: string;
  groupId?: string;
  metadata?: {
    assignedBy?: string;
    projectTitle?: string;
    groupName?: string;
    dueDate?: string;
  };
}

export interface NotificationContext {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  refreshNotifications?: () => void;
  loading?: boolean;
}

// Chat API Types
export interface ChatMessageRequest {
  message: string;
  apiKey: string;
}

export interface ChatMessageResponse {
  message: string;
  timestamp: string;
}

// Tasks API Types
export interface TasksResponse {
  tasks: Project[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface TasksQueryParams {
  status?: string | string[];
  page?: number;
  pageSize?: number;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  groupId?: string;
}

export interface TaskStats {
  planning: number;
  inProgress: number;
  done: number;
  total: number;
}

// Smart To-Do List Analytics Types
export interface AnalyticsData {
  tasksCompletedLast7Days: {
    day: string;
    count: number;
  }[];
  productivityByHour: {
    hour: string;
    completed: number;
  }[];
}

// Enhanced Task/Project type with Smart To-Do features
export interface SmartTask extends Project {
  realisticDeadline?: string; // AI-calculated realistic deadline
  urgencyLevel: 'low' | 'medium' | 'high'; // Based on proximity to due date
  completionProbability?: number; // AI prediction (0-1)
}

// Calendar Event type for react-big-calendar
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: SmartTask;
  allDay?: boolean;
}
