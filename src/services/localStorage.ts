import type { Task, Project, StudySession } from '../types';
import { Priority, TaskStatus } from '../types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEYS = {
  TASKS: 'studentTasks',
  PROJECTS: 'studentProjects',
  SESSIONS: 'studySessions',
  SETTINGS: 'userSettings'
};

// Default projects
const DEFAULT_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Academic Work',
    color: '#3B82F6',
    createdAt: new Date(),
    description: 'University assignments and coursework'
  },
  {
    id: '2',
    name: 'Personal Development',
    color: '#10B981',
    createdAt: new Date(),
    description: 'Self-improvement and learning'
  },
  {
    id: '3',
    name: 'Part-time Job',
    color: '#F59E0B',
    createdAt: new Date(),
    description: 'Work-related tasks'
  }
];

// Sample tasks for demo
const SAMPLE_TASKS: Task[] = [
  {
    id: uuidv4(),
    title: 'Complete Data Structures Assignment',
    description: 'Implement binary search tree with full documentation',
    status: TaskStatus.IN_PROGRESS,
    priority: Priority.HIGH,
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    tags: ['computer-science', 'assignment'],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: new Date(),
    projectId: '1',
    estimatedTime: 180,
    reminderTime: new Date(Date.now() + 24 * 60 * 60 * 1000)
  },
  {
    id: uuidv4(),
    title: 'Study for Calculus Midterm',
    description: 'Review chapters 5-8, practice integration problems',
    status: TaskStatus.TODO,
    priority: Priority.HIGH,
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    tags: ['mathematics', 'exam'],
    createdAt: new Date(),
    updatedAt: new Date(),
    projectId: '1',
    estimatedTime: 300
  },
  {
    id: uuidv4(),
    title: 'Read "Clean Code" Chapter 3',
    description: 'Functions chapter - take notes on best practices',
    status: TaskStatus.TODO,
    priority: Priority.MEDIUM,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    tags: ['reading', 'programming'],
    createdAt: new Date(),
    updatedAt: new Date(),
    projectId: '2',
    estimatedTime: 90
  },
  {
    id: uuidv4(),
    title: 'Update Resume',
    description: 'Add recent projects and skills',
    status: TaskStatus.DONE,
    priority: Priority.MEDIUM,
    tags: ['career'],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    projectId: '3',
    estimatedTime: 60,
    actualTime: 75,
    completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: uuidv4(),
    title: 'Coffee Shop Shift - Weekend',
    description: 'Saturday morning shift 8AM-2PM',
    status: TaskStatus.TODO,
    priority: Priority.MEDIUM,
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    tags: ['work', 'shift'],
    createdAt: new Date(),
    updatedAt: new Date(),
    projectId: '3',
    estimatedTime: 360
  }
];

export class LocalStorageService {
  static getTasks(): Task[] {
    try {
      const tasks = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (!tasks) {
        // Initialize with sample data
        this.setTasks(SAMPLE_TASKS);
        return SAMPLE_TASKS.map(task => ({
          ...task,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          reminderTime: task.reminderTime ? new Date(task.reminderTime) : undefined,
          completedAt: task.completedAt ? new Date(task.completedAt) : undefined
        }));
      }
      return JSON.parse(tasks).map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        reminderTime: task.reminderTime ? new Date(task.reminderTime) : undefined,
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined
      }));
    } catch (error) {
      console.error('Error loading tasks:', error);
      return [];
    }
  }

  static setTasks(tasks: Task[]): void {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }

  static getProjects(): Project[] {
    try {
      const projects = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (!projects) {
        this.setProjects(DEFAULT_PROJECTS);
        return DEFAULT_PROJECTS.map(project => ({
          ...project,
          createdAt: new Date(project.createdAt)
        }));
      }
      return JSON.parse(projects).map((project: any) => ({
        ...project,
        createdAt: new Date(project.createdAt)
      }));
    } catch (error) {
      console.error('Error loading projects:', error);
      return DEFAULT_PROJECTS;
    }
  }

  static setProjects(projects: Project[]): void {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }

  static getStudySessions(): StudySession[] {
    try {
      const sessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      return sessions ? JSON.parse(sessions).map((session: any) => ({
        ...session,
        startTime: new Date(session.startTime),
        endTime: session.endTime ? new Date(session.endTime) : undefined
      })) : [];
    } catch (error) {
      console.error('Error loading study sessions:', error);
      return [];
    }
  }

  static setStudySessions(sessions: StudySession[]): void {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  }

  static addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
    const tasks = this.getTasks();
    const newTask: Task = {
      ...task,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    tasks.push(newTask);
    this.setTasks(tasks);
    return newTask;
  }

  static updateTask(id: string, updates: Partial<Task>): Task | null {
    const tasks = this.getTasks();
    const taskIndex = tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) return null;
    
    const updatedTask = {
      ...tasks[taskIndex],
      ...updates,
      updatedAt: new Date(),
      completedAt: updates.status === TaskStatus.DONE && tasks[taskIndex].status !== TaskStatus.DONE 
        ? new Date() 
        : tasks[taskIndex].completedAt
    };
    
    tasks[taskIndex] = updatedTask;
    this.setTasks(tasks);
    return updatedTask;
  }

  static deleteTask(id: string): boolean {
    const tasks = this.getTasks();
    const filteredTasks = tasks.filter(task => task.id !== id);
    
    if (filteredTasks.length === tasks.length) return false;
    
    this.setTasks(filteredTasks);
    return true;
  }

  static addProject(project: Omit<Project, 'id' | 'createdAt'>): Project {
    const projects = this.getProjects();
    const newProject: Project = {
      ...project,
      id: uuidv4(),
      createdAt: new Date()
    };
    projects.push(newProject);
    this.setProjects(projects);
    return newProject;
  }

  static updateProject(id: string, updates: Partial<Project>): Project | null {
    const projects = this.getProjects();
    const projectIndex = projects.findIndex(project => project.id === id);
    
    if (projectIndex === -1) return null;
    
    const updatedProject = { ...projects[projectIndex], ...updates };
    projects[projectIndex] = updatedProject;
    this.setProjects(projects);
    return updatedProject;
  }

  static deleteProject(id: string): boolean {
    const projects = this.getProjects();
    const filteredProjects = projects.filter(project => project.id !== id);
    
    if (filteredProjects.length === projects.length) return false;
    
    // Also delete associated tasks
    const tasks = this.getTasks();
    const filteredTasks = tasks.filter(task => task.projectId !== id);
    this.setTasks(filteredTasks);
    
    this.setProjects(filteredProjects);
    return true;
  }
}
