import axios, { type AxiosResponse } from 'axios';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  LearningGroup,
  Project,
  CreateGroupRequest,
  JoinGroupRequest,
  CreateProjectRequest,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await api.post('/api/auth/login', data);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await api.post('/api/auth/register', data);
    return response.data;
  },
};

// Groups API
export const groupsApi = {
  async createGroup(data: CreateGroupRequest): Promise<{ group: LearningGroup; message: string }> {
    const response = await api.post('/api/groups', data);
    return response.data;
  },

  async getGroup(id: string): Promise<{ group: LearningGroup }> {
    const response = await api.get(`/api/groups/${id}`);
    return response.data;
  },

  async getUserGroups(): Promise<{ groups: LearningGroup[] }> {
    const response = await api.get('/api/groups');
    return response.data;
  },

  async joinGroup(data: JoinGroupRequest): Promise<{ group: LearningGroup; message: string }> {
    const response = await api.post('/api/groups/join', data);
    return response.data;
  },

  async inviteUser(groupId: string, data: { username: string }): Promise<{ message: string }> {
    const response = await api.post(`/api/groups/${groupId}/invite`, data);
    return response.data;
  },

  async leaveGroup(groupId: string): Promise<{ message: string }> {
    const response = await api.delete(`/api/groups/${groupId}/leave`);
    return response.data;
  },

  async updateGroup(groupId: string, data: Partial<CreateGroupRequest>): Promise<{ group: LearningGroup; message: string }> {
    const response = await api.put(`/api/groups/${groupId}`, data);
    return response.data;
  },

  async deleteGroup(groupId: string): Promise<{ message: string }> {
    const response = await api.delete(`/api/groups/${groupId}`);
    return response.data;
  },
};

// Projects API
export const projectsApi = {
  async createProject(groupId: string, data: CreateProjectRequest): Promise<{ project: Project; message: string }> {
    const response = await api.post(`/api/groups/${groupId}/projects`, data);
    return response.data;
  },

  async getGroupProjects(groupId: string): Promise<{ projects: Project[] }> {
    const response = await api.get(`/api/groups/${groupId}/projects`);
    return response.data;
  },

  async updateProject(groupId: string, projectId: string, data: Partial<CreateProjectRequest>): Promise<{ project: Project; message: string }> {
    const response = await api.put(`/api/groups/${groupId}/projects/${projectId}`, data);
    return response.data;
  },

  async deleteProject(groupId: string, projectId: string): Promise<{ message: string }> {
    const response = await api.delete(`/api/groups/${groupId}/projects/${projectId}`);
    return response.data;
  },
};

export default api;
