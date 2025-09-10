import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Trash2, Save } from 'lucide-react';
import { projectsApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import type { Project, GroupMembership } from '../../types';

interface TaskDetailsPanelProps {
  project: Project | null;
  groupMembers: GroupMembership[];
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  canEdit: boolean;
}

export const TaskDetailsPanel: React.FC<TaskDetailsPanelProps> = ({
  project,
  groupMembers,
  isOpen,
  onClose,
  onUpdate,
  canEdit
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    assignedTo: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize form data when project changes
  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        description: project.description || '',
        dueDate: project.dueDate ? new Date(project.dueDate).toISOString().split('T')[0] : '',
        assignedTo: project.assignedTo || ''
      });
    }
  }, [project]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDueDateStatus = (dueDate?: string) => {
    if (!dueDate) return null;
    
    const now = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { status: 'overdue', text: `${Math.abs(diffDays)} days overdue`, color: 'text-red-600' };
    } else if (diffDays === 0) {
      return { status: 'today', text: 'Due today', color: 'text-orange-600' };
    } else if (diffDays <= 7) {
      return { status: 'soon', text: `Due in ${diffDays} days`, color: 'text-orange-600' };
    } else {
      return { status: 'future', text: `Due ${formatDate(dueDate)}`, color: 'text-gray-600' };
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!project || !canEdit) return;
    
    setLoading(true);
    setError('');
    
    try {
      const updateData: any = {
        title: formData.title,
        description: formData.description || undefined,
        dueDate: formData.dueDate || undefined
      };

      // Update basic project details
      await projectsApi.updateProject(project.groupId, project.id, updateData);
      
      // Update assignment if changed
      if (formData.assignedTo !== project.assignedTo) {
        await projectsApi.assignProject(project.groupId, project.id, formData.assignedTo || undefined);
      }
      
      onUpdate();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!project || !canEdit) return;
    
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await projectsApi.deleteProject(project.groupId, project.id);
      onUpdate();
      onClose();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to delete project');
    } finally {
      setLoading(false);
    }
  };

  const getAssigneeDisplayName = (userId: string) => {
    if (userId === user?.id) return 'You';
    const member = groupMembers.find(m => m.user.id === userId);
    return member?.user.username || 'Unknown User';
  };

  const dueDateStatus = project?.dueDate ? getDueDateStatus(project.dueDate) : null;

  if (!isOpen || !project) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl border-l border-gray-200 z-40 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Task Details</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          {canEdit ? (
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          ) : (
            <p className="text-gray-900 font-medium">{project.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          {canEdit ? (
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Add a description..."
            />
          ) : (
            <p className="text-gray-700">
              {project.description || 'No description provided'}
            </p>
          )}
        </div>

        {/* Due Date */}
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
            Due Date
          </label>
          {canEdit ? (
            <input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          ) : (
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              {project.dueDate ? (
                <span className={dueDateStatus?.color || 'text-gray-700'}>
                  {dueDateStatus?.text}
                </span>
              ) : (
                <span className="text-gray-500">No due date set</span>
              )}
            </div>
          )}
        </div>

        {/* Assignee */}
        <div>
          <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-2">
            Assigned to
          </label>
          {canEdit ? (
            <select
              id="assignedTo"
              value={formData.assignedTo}
              onChange={(e) => handleInputChange('assignedTo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Unassigned</option>
              {groupMembers.map((member) => (
                <option key={member.user.id} value={member.user.id}>
                  {member.user.id === user?.id ? 'You' : member.user.username}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                project.assignedUser 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {project.assignedUser ? getAssigneeDisplayName(project.assignedUser.id) : 'Unassigned'}
              </span>
            </div>
          )}
        </div>

        {/* Meta Information */}
        <div className="pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            <p>Created: {formatDate(project.createdAt)}</p>
            {project.group && (
              <p>Group: {project.group.name}</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      {canEdit && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between">
            <Button
              variant="secondary"
              onClick={handleDelete}
              loading={loading}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <Button
              onClick={handleSave}
              loading={loading}
              disabled={!formData.title.trim()}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
