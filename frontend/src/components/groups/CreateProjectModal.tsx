import React, { useState } from 'react';
import { X } from 'lucide-react';
import { projectsApi } from '../../services/api';
import { Button } from '../ui/Button';
import type { CreateProjectRequest } from '../../types';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  groupId: string;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  groupId,
}) => {
  const [formData, setFormData] = useState<CreateProjectRequest>({
    title: '',
    description: '',
    dueDate: '',
    priority: 'MEDIUM',
    status: 'PLANNING',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const projectData = {
        ...formData,
        dueDate: formData.dueDate || undefined,
      };
      await projectsApi.createProject(groupId, projectData);
      onSuccess();
      setFormData({ title: '', description: '', dueDate: '', priority: 'MEDIUM', status: 'PLANNING' });
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      setError(axiosError.response?.data?.error || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ title: '', description: '', dueDate: '', priority: 'MEDIUM', status: 'PLANNING' });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative z-[101]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Create New Project</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Project Title *
            </label>
            <input
              id="title"
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter project title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Describe the project (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                id="priority"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' })}
              >
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'PLANNING' | 'IN_PROGRESS' | 'DONE' })}
              >
                <option value="PLANNING">Planning</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              id="dueDate"
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Create Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
