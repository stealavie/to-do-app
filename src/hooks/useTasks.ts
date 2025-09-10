import { useState, useEffect, useCallback } from 'react';
import type { Task, Project, FilterOptions, ViewType } from '../types';
import { TaskStatus } from '../types';
import { LocalStorageService } from '../services/localStorage';
import { sortTasksBySmartPriority, calculateUserStats } from '../utils/analytics';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [currentView, setCurrentView] = useState<ViewType>('kanban');
  const [loading, setLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [loadedTasks, loadedProjects] = await Promise.all([
          LocalStorageService.getTasks(),
          LocalStorageService.getProjects()
        ]);
        setTasks(loadedTasks);
        setProjects(loadedProjects);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Task CRUD operations
  const addTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask = LocalStorageService.addTask(taskData);
    setTasks(prevTasks => [...prevTasks, newTask]);
    return newTask;
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    const updatedTask = LocalStorageService.updateTask(id, updates);
    if (updatedTask) {
      setTasks(prevTasks => 
        prevTasks.map(task => task.id === id ? updatedTask : task)
      );
    }
    return updatedTask;
  }, []);

  const deleteTask = useCallback((id: string) => {
    const success = LocalStorageService.deleteTask(id);
    if (success) {
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    }
    return success;
  }, []);

  const toggleTaskStatus = useCallback((id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return null;

    let newStatus: TaskStatus;
    switch (task.status) {
      case TaskStatus.TODO:
        newStatus = TaskStatus.IN_PROGRESS;
        break;
      case TaskStatus.IN_PROGRESS:
        newStatus = TaskStatus.DONE;
        break;
      case TaskStatus.DONE:
        newStatus = TaskStatus.TODO;
        break;
      default:
        newStatus = TaskStatus.TODO;
    }

    return updateTask(id, { status: newStatus });
  }, [tasks, updateTask]);

  // Project CRUD operations
  const addProject = useCallback((projectData: Omit<Project, 'id' | 'createdAt'>) => {
    const newProject = LocalStorageService.addProject(projectData);
    setProjects(prevProjects => [...prevProjects, newProject]);
    return newProject;
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    const updatedProject = LocalStorageService.updateProject(id, updates);
    if (updatedProject) {
      setProjects(prevProjects => 
        prevProjects.map(project => project.id === id ? updatedProject : project)
      );
    }
    return updatedProject;
  }, []);

  const deleteProject = useCallback((id: string) => {
    const success = LocalStorageService.deleteProject(id);
    if (success) {
      setProjects(prevProjects => prevProjects.filter(project => project.id !== id));
      // Also remove tasks from deleted project
      setTasks(prevTasks => prevTasks.filter(task => task.projectId !== id));
    }
    return success;
  }, []);

  // Filter and sort tasks
  const getFilteredTasks = useCallback(() => {
    let filtered = [...tasks];

    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(task => filters.status!.includes(task.status));
    }

    if (filters.priority && filters.priority.length > 0) {
      filtered = filtered.filter(task => filters.priority!.includes(task.priority));
    }

    if (filters.projects && filters.projects.length > 0) {
      filtered = filtered.filter(task => filters.projects!.includes(task.projectId));
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(task => 
        filters.tags!.some(tag => task.tags.includes(tag))
      );
    }

    if (filters.dueDate) {
      if (filters.dueDate.from) {
        filtered = filtered.filter(task => 
          task.dueDate && task.dueDate >= filters.dueDate!.from!
        );
      }
      if (filters.dueDate.to) {
        filtered = filtered.filter(task => 
          task.dueDate && task.dueDate <= filters.dueDate!.to!
        );
      }
    }

    return filtered;
  }, [tasks, filters]);

  const getSortedTasks = useCallback((sortBy: 'smart' | 'dueDate' | 'priority' | 'created' = 'smart') => {
    const filtered = getFilteredTasks();
    
    switch (sortBy) {
      case 'smart':
        const userStats = calculateUserStats(tasks);
        return sortTasksBySmartPriority(filtered, userStats.procrastinationFactor);
      
      case 'dueDate':
        return [...filtered].sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.getTime() - b.dueDate.getTime();
        });
      
      case 'priority':
        const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        return [...filtered].sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
      
      case 'created':
        return [...filtered].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      default:
        return filtered;
    }
  }, [getFilteredTasks, tasks]);

  // Get tasks by status for kanban view
  const getTasksByStatus = useCallback(() => {
    const filtered = getSortedTasks();
    return {
      [TaskStatus.TODO]: filtered.filter(task => task.status === TaskStatus.TODO),
      [TaskStatus.IN_PROGRESS]: filtered.filter(task => task.status === TaskStatus.IN_PROGRESS),
      [TaskStatus.DONE]: filtered.filter(task => task.status === TaskStatus.DONE)
    };
  }, [getSortedTasks]);

  // Statistics
  const getStats = useCallback(() => {
    return calculateUserStats(tasks);
  }, [tasks]);

  return {
    // Data
    tasks,
    projects,
    loading,
    
    // Filtered/sorted data
    filteredTasks: getFilteredTasks(),
    sortedTasks: getSortedTasks(),
    tasksByStatus: getTasksByStatus(),
    
    // CRUD operations
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    addProject,
    updateProject,
    deleteProject,
    
    // View and filters
    filters,
    setFilters,
    currentView,
    setCurrentView,
    
    // Analytics
    stats: getStats(),
    
    // Utilities
    getSortedTasks
  };
};
