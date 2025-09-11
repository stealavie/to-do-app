import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Trash2, Save, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { projectsApi } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
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
  const notificationContext = useNotifications();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    assignedTo: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
    status: 'PLANNING' as 'PLANNING' | 'IN_PROGRESS' | 'DONE'
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
        assignedTo: project.assignedTo || '',
        priority: project.priority || 'MEDIUM',
        status: project.status || 'PLANNING'
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
      const updateData: {
        title: string;
        description?: string;
        dueDate?: string;
        priority: 'LOW' | 'MEDIUM' | 'HIGH';
        status: 'PLANNING' | 'IN_PROGRESS' | 'DONE';
      } = {
        title: formData.title,
        description: formData.description || undefined,
        dueDate: formData.dueDate || undefined,
        priority: formData.priority,
        status: formData.status
      };

      // Update basic project details
      await projectsApi.updateProject(project.groupId, project.id, updateData);
      
      // Update assignment if changed
      if (formData.assignedTo !== project.assignedTo) {
        await projectsApi.assignProject(project.groupId, project.id, formData.assignedTo || undefined);
        
        // Refresh notifications after assignment to get the new notification from backend
        if (notificationContext.refreshNotifications) {
          setTimeout(() => {
            notificationContext.refreshNotifications?.();
          }, 1000); // Small delay to ensure backend has processed the notification
        }
      }
      
      onUpdate();
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      setError(axiosError.response?.data?.error || 'Failed to update project');
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
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      setError(axiosError.response?.data?.error || 'Failed to delete project');
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
    <div className="fixed right-6 top-32 bottom-6 w-80 bg-white shadow-soft-lg border border-secondary-200/50 z-[60] flex flex-col backdrop-blur-sm rounded-2xl overflow-hidden max-h-[calc(100vh-10rem)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-secondary-200/50 bg-secondary-50/50 backdrop-blur-sm flex-shrink-0">
        <h3 className="text-lg font-bold text-secondary-900">Details</h3>
        <button
          onClick={onClose}
          className="text-secondary-400 hover:text-secondary-600 p-1.5 rounded-lg hover:bg-secondary-100 transition-all duration-200 transform hover:scale-110 active:scale-95 group"
          aria-label="Close project details"
        >
          <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {error && (
          <div className="bg-danger-50 border border-danger-200 text-danger-700 px-3 py-2 rounded-lg text-xs font-medium">
            {error}
          </div>
        )}

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-xs font-bold text-secondary-600 mb-2 uppercase tracking-wide">
            Title *
          </label>
          {canEdit ? (
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 font-medium placeholder:text-secondary-400 text-sm"
              placeholder="Enter title..."
            />
          ) : (
            <p className="text-secondary-900 font-semibold text-sm bg-secondary-50 px-3 py-2 rounded-lg">
              {project.title}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-xs font-bold text-secondary-600 mb-2 uppercase tracking-wide">
            Description
          </label>
          {canEdit ? (
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 font-medium placeholder:text-secondary-400 resize-none text-sm"
              placeholder="Add description..."
            />
          ) : (
            <div className="bg-secondary-50 px-3 py-2 rounded-lg">
              <p className="text-secondary-700 text-sm leading-relaxed">
                {project.description || 'No description provided'}
              </p>
            </div>
          )}
        </div>

        {/* Due Date */}
        <div>
          <label htmlFor="dueDate" className="block text-xs font-bold text-secondary-600 mb-2 uppercase tracking-wide">
            Due Date
          </label>
          {canEdit ? (
            <input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 font-medium text-sm"
            />
          ) : (
            <div className="bg-secondary-50 px-3 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className={`p-1.5 rounded-lg ${
                  dueDateStatus?.status === 'overdue' 
                    ? 'bg-danger-100' 
                    : dueDateStatus?.status === 'today' || dueDateStatus?.status === 'soon'
                    ? 'bg-warning-100'
                    : 'bg-primary-100'
                }`}>
                  <Calendar className={`w-3 h-3 ${
                    dueDateStatus?.status === 'overdue' 
                      ? 'text-danger-600' 
                      : dueDateStatus?.status === 'today' || dueDateStatus?.status === 'soon'
                      ? 'text-warning-600'
                      : 'text-primary-600'
                  }`} />
                </div>
                {project.dueDate ? (
                  <span className={`font-medium text-xs ${dueDateStatus?.color || 'text-secondary-700'}`}>
                    {dueDateStatus?.text}
                  </span>
                ) : (
                  <span className="text-secondary-500 font-medium text-xs">No due date</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Assignee */}
        <div>
          <label htmlFor="assignedTo" className="block text-xs font-bold text-secondary-600 mb-2 uppercase tracking-wide">
            Assigned
          </label>
          {canEdit ? (
            <select
              id="assignedTo"
              value={formData.assignedTo}
              onChange={(e) => handleInputChange('assignedTo', e.target.value)}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 font-medium appearance-none bg-white text-sm"
            >
              <option value="">Unassigned</option>
              {groupMembers.map((member) => (
                <option key={member.user.id} value={member.user.id}>
                  {member.user.id === user?.id ? 'You' : member.user.username}
                </option>
              ))}
            </select>
          ) : (
            <div className="bg-secondary-50 px-3 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className={`p-1.5 rounded-lg ${
                  project.assignedUser ? 'bg-primary-100' : 'bg-secondary-100'
                }`}>
                  <User className={`w-3 h-3 ${
                    project.assignedUser ? 'text-primary-600' : 'text-secondary-500'
                  }`} />
                </div>
                <span className={`font-medium px-2 py-1 rounded-lg text-xs ${
                  project.assignedUser 
                    ? 'bg-primary-100 text-primary-800' 
                    : 'bg-secondary-100 text-secondary-600'
                }`}>
                  {project.assignedUser ? getAssigneeDisplayName(project.assignedUser.id) : 'Unassigned'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Priority */}
        <div>
          <label htmlFor="priority" className="block text-xs font-bold text-secondary-600 mb-2 uppercase tracking-wide">
            Priority
          </label>
          {canEdit ? (
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 font-medium appearance-none bg-white text-sm"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          ) : (
            <div className="bg-secondary-50 px-3 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className={`p-1.5 rounded-lg ${
                  project?.priority === 'HIGH' 
                    ? 'bg-danger-100' 
                    : project?.priority === 'MEDIUM'
                    ? 'bg-warning-100'
                    : 'bg-success-100'
                }`}>
                  {project?.priority === 'HIGH' ? (
                    <AlertTriangle className="w-3 h-3 text-danger-600" />
                  ) : project?.priority === 'MEDIUM' ? (
                    <Clock className="w-3 h-3 text-warning-600" />
                  ) : (
                    <CheckCircle className="w-3 h-3 text-success-600" />
                  )}
                </div>
                <span className={`font-medium text-xs px-2 py-1 rounded-lg ${
                  project?.priority === 'HIGH' 
                    ? 'bg-danger-100 text-danger-800' 
                    : project?.priority === 'MEDIUM'
                    ? 'bg-warning-100 text-warning-800'
                    : 'bg-success-100 text-success-800'
                }`}>
                  {project?.priority || 'Medium'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-xs font-bold text-secondary-600 mb-2 uppercase tracking-wide">
            Status
          </label>
          {canEdit ? (
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 font-medium appearance-none bg-white text-sm"
            >
              <option value="PLANNING">Planning</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          ) : (
            <div className="bg-secondary-50 px-3 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className={`p-1.5 rounded-lg ${
                  project?.status === 'DONE' 
                    ? 'bg-success-100' 
                    : project?.status === 'IN_PROGRESS'
                    ? 'bg-primary-100'
                    : 'bg-secondary-100'
                }`}>
                  {project?.status === 'DONE' ? (
                    <CheckCircle className="w-3 h-3 text-success-600" />
                  ) : project?.status === 'IN_PROGRESS' ? (
                    <Clock className="w-3 h-3 text-primary-600" />
                  ) : (
                    <Calendar className="w-3 h-3 text-secondary-600" />
                  )}
                </div>
                <span className={`font-medium text-xs px-2 py-1 rounded-lg ${
                  project?.status === 'DONE' 
                    ? 'bg-success-100 text-success-800' 
                    : project?.status === 'IN_PROGRESS'
                    ? 'bg-primary-100 text-primary-800'
                    : 'bg-secondary-100 text-secondary-800'
                }`}>
                  {project?.status === 'DONE' ? 'Done' : project?.status === 'IN_PROGRESS' ? 'In Progress' : 'Planning'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Meta Information */}
        <div className="pt-4 border-t border-secondary-200/50">
          <div className="bg-secondary-50 p-3 rounded-lg">
            <h4 className="text-xs font-bold text-secondary-600 uppercase tracking-wide mb-2">
              Info
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-secondary-500">Created:</span>
                <span className="font-medium text-secondary-700">{formatDate(project.createdAt)}</span>
              </div>
              {project.group && (
                <div className="flex items-center justify-between">
                  <span className="text-secondary-500">Group:</span>
                  <span className="font-medium text-secondary-700 truncate ml-2">{project.group.name}</span>
                </div>
              )}
              {project.lastEditor && project.lastEditedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-secondary-500">Last edited:</span>
                  <span className="font-medium text-secondary-700">
                    {project.lastEditor.id === user?.id ? 'You' : project.lastEditor.username} on {formatDate(project.lastEditedAt)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      {canEdit && (
        <div className="p-4 border-t border-secondary-200/50 bg-secondary-50/50 backdrop-blur-sm flex-shrink-0">
          <div className="flex flex-col space-y-2">
            <Button
              onClick={handleSave}
              loading={loading}
              disabled={!formData.title.trim()}
              size="sm"
              className="w-full"
            >
              <Save className="w-3 h-3 mr-2" />
              Save Changes
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={loading}
              size="sm"
              className="w-full"
            >
              <Trash2 className="w-3 h-3 mr-2" />
              Delete Project
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
