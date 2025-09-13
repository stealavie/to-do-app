import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import api from '../services/api';
import type { TasksResponse, TasksQueryParams, Project, TaskStats } from '../types';

// Cache keys for localStorage
const TASKS_CACHE_KEY = 'tasks_cache';
const TASKS_CACHE_TIMESTAMP_KEY = 'tasks_cache_timestamp';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// API functions
const fetchTasks = async (params: TasksQueryParams & { pageParam: number }): Promise<TasksResponse> => {
  const { pageParam, ...restParams } = params;
  const queryParams = new URLSearchParams();
  
  queryParams.append('page', pageParam.toString());
  if (restParams.pageSize) queryParams.append('pageSize', restParams.pageSize.toString());
  if (restParams.status) {
    const statuses = Array.isArray(restParams.status) ? restParams.status : [restParams.status];
    statuses.forEach(status => queryParams.append('status', status));
  }
  if (restParams.priority) queryParams.append('priority', restParams.priority);
  if (restParams.groupId) queryParams.append('groupId', restParams.groupId);
  
  const response = await api.get(`/api/tasks?${queryParams.toString()}`);
  return response.data;
};

const fetchTaskStats = async (): Promise<TaskStats> => {
  const response = await api.get('/api/tasks/stats');
  return response.data;
};

// localStorage utilities
const saveTasksToLocalStorage = (tasks: Project[]) => {
  try {
    localStorage.setItem(TASKS_CACHE_KEY, JSON.stringify(tasks));
    localStorage.setItem(TASKS_CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.warn('Failed to save tasks to localStorage:', error);
  }
};

const loadTasksFromLocalStorage = (): Project[] | null => {
  try {
    const cachedTasks = localStorage.getItem(TASKS_CACHE_KEY);
    const cacheTimestamp = localStorage.getItem(TASKS_CACHE_TIMESTAMP_KEY);
    
    if (!cachedTasks || !cacheTimestamp) return null;
    
    // Check if cache is still valid
    const now = Date.now();
    const timestamp = parseInt(cacheTimestamp, 10);
    if (now - timestamp > CACHE_DURATION) {
      // Cache expired, remove it
      localStorage.removeItem(TASKS_CACHE_KEY);
      localStorage.removeItem(TASKS_CACHE_TIMESTAMP_KEY);
      return null;
    }
    
    return JSON.parse(cachedTasks);
  } catch (error) {
    console.warn('Failed to load tasks from localStorage:', error);
    return null;
  }
};

// Custom hook for infinite tasks query
export const useTasks = (params: TasksQueryParams = {}) => {
  const queryClient = useQueryClient();
  const queryKey = ['tasks', params];
  
  // Initialize with localStorage data if available
  const cachedTasks = loadTasksFromLocalStorage();
  
  const infiniteQuery = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam = 1 }) => fetchTasks({ ...params, pageParam }),
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasNextPage 
        ? lastPage.pagination.currentPage + 1 
        : undefined;
    },
    initialPageParam: 1,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    ...(cachedTasks && {
      // If we have cached data, set it as initial data to show immediately
      initialData: {
        pages: [{
          tasks: cachedTasks,
          pagination: {
            currentPage: 1,
            pageSize: cachedTasks.length,
            totalCount: cachedTasks.length,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false
          }
        }],
        pageParams: [1]
      }
    })
  });

  // Get all tasks from all pages
  const allTasks = infiniteQuery.data?.pages.flatMap(page => page.tasks) || [];
  
  // Save to localStorage when data changes
  useEffect(() => {
    if (infiniteQuery.data && !infiniteQuery.isError && allTasks.length > 0) {
      saveTasksToLocalStorage(allTasks);
    }
  }, [infiniteQuery.data, infiniteQuery.isError, allTasks]);

  // Helper function to load more tasks
  const loadMoreTasks = useCallback(() => {
    if (infiniteQuery.hasNextPage && !infiniteQuery.isFetchingNextPage) {
      infiniteQuery.fetchNextPage();
    }
  }, [infiniteQuery]);

  // Helper function to refresh tasks
  const refreshTasks = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  // Helper function to get tasks by status
  const getTasksByStatus = useCallback((status: string) => {
    return allTasks.filter(task => task.status === status);
  }, [allTasks]);

  return {
    // Data
    tasks: allTasks,
    pages: infiniteQuery.data?.pages || [],
    
    // Status
    isLoading: infiniteQuery.isLoading,
    isError: infiniteQuery.isError,
    error: infiniteQuery.error,
    isFetching: infiniteQuery.isFetching,
    isFetchingNextPage: infiniteQuery.isFetchingNextPage,
    
    // Pagination
    hasNextPage: infiniteQuery.hasNextPage,
    hasPreviousPage: infiniteQuery.data?.pages[0]?.pagination.hasPreviousPage || false,
    
    // Actions
    loadMoreTasks,
    refreshTasks,
    fetchNextPage: infiniteQuery.fetchNextPage,
    
    // Utilities
    getTasksByStatus,
    
    // Statistics
    totalTasks: allTasks.length,
    activeTasks: allTasks.filter(task => ['PLANNING', 'IN_PROGRESS'].includes(task.status)),
    completedTasks: allTasks.filter(task => task.status === 'DONE'),
  };
};

// Hook for task statistics
export const useTaskStats = () => {
  return useQuery({
    queryKey: ['task-stats'],
    queryFn: fetchTaskStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for active tasks only (default behavior)
export const useActiveTasks = (params: Omit<TasksQueryParams, 'status'> = {}) => {
  return useTasks({
    ...params,
    status: ['PLANNING', 'IN_PROGRESS']
  });
};

// Hook for completed tasks
export const useCompletedTasks = (params: Omit<TasksQueryParams, 'status'> = {}) => {
  return useTasks({
    ...params,
    status: 'DONE'
  });
};