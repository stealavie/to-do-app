import React from 'react';
import { Calendar, Clock, AlertCircle, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { formatDate, getDueDateStatus } from '../../utils/projectUtils';
import { PriorityBadge } from '../ui/PriorityBadge';
import { StatusBadge } from '../ui/StatusBadge';
import type { Project } from '../../types';

interface ProjectCardProps {
  /** Project data to display */
  project: Project;
  /** Callback fired when the project card is clicked */
  onCardClick: (project: Project) => void;
}

/**
 * ProjectCard component displays project information in a card format
 * Features:
 * - Priority-based left border color
 * - Status and priority badges using reusable components
 * - Due date status with visual indicators
 * - Assignment information with user-friendly text
 * - Click handler for opening project details
 */
export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onCardClick }) => {
  const { user } = useAuth();
  
  // Get due date status with visual styling information
  const dueDateStatus = project.dueDate ? getDueDateStatus(project.dueDate) : null;

  /**
   * Returns user-friendly assignment display text
   * @returns Assignment text: 'Unassigned', 'You', or username
   */
  const getAssignmentDisplayText = () => {
    if (!project.assignedUser) return 'Unassigned';
    if (project.assignedUser.id === user?.id) return 'You';
    return project.assignedUser.username;
  };

  // Map priority levels to border colors for visual hierarchy
  const priorityStyles = project.priority === 'HIGH' ? 'border-red-500' : 
                        project.priority === 'LOW' ? 'border-blue-500' : 'border-yellow-500';

  return (
    <div 
      className={`bg-white rounded-2xl p-6 shadow-soft hover:shadow-soft-lg border-l-4 ${priorityStyles} border-r border-t border-b border-secondary-200/50 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 group`}
      onClick={() => onCardClick(project)}
    >
      <div className="flex items-start justify-between mb-4">
        <h4 className="font-semibold text-secondary-900 flex-1 text-lg group-hover:text-primary-600 transition-colors duration-200">
          {project.title}
        </h4>
        <div className="flex items-center gap-2">
          {/* Priority Badge */}
          <PriorityBadge priority={project.priority || 'MEDIUM'} size="sm" />
          {dueDateStatus?.status === 'overdue' && (
            <div className="bg-danger-100 p-2 rounded-xl flex-shrink-0">
              <AlertCircle className="w-4 h-4 text-danger-600" />
            </div>
          )}
        </div>
      </div>

      {project.description && (
        <p className="text-secondary-600 mb-4 line-clamp-2 leading-relaxed">
          {project.description}
        </p>
      )}

      {/* Assignment and Status Display */}
      <div className="mb-4 space-y-3">
        <div className="flex items-center space-x-3">
          <div className="bg-primary-100 p-2 rounded-xl">
            <User className="w-4 h-4 text-primary-600" />
          </div>
          <div>
            <p className="text-xs text-secondary-500 uppercase tracking-wide font-medium">Assigned to</p>
            <p className="text-sm font-medium text-secondary-900">
              {getAssignmentDisplayText()}
            </p>
          </div>
        </div>
        
        {/* Status Display */}
        <div className="flex items-center justify-between">
          <StatusBadge status={project.status || 'PLANNING'} showIcon={true} size="md" />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-secondary-100">
        <div className="flex items-center space-x-2 text-secondary-500">
          <Clock className="w-4 h-4" />
          <span className="text-sm">Created {formatDate(project.createdAt)}</span>
        </div>

        {dueDateStatus && (
          <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl font-medium text-sm ${dueDateStatus.bgColor} ${dueDateStatus.color}`}>
            <Calendar className="w-4 h-4" />
            <span>{dueDateStatus.text}</span>
          </div>
        )}
      </div>
    </div>
  );
};
