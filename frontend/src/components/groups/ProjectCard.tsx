import React from 'react';
import { Calendar, Clock, AlertCircle, User, Flag, CheckCircle2, Play, Clock as ClockIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { Project } from '../../types';

interface ProjectCardProps {
  project: Project;
  onCardClick: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onCardClick }) => {
  const { user } = useAuth();
  
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

  const dueDateStatus = project.dueDate ? getDueDateStatus(project.dueDate) : null;

  const getAssignmentDisplayText = () => {
    if (!project.assignedUser) return 'Unassigned';
    if (project.assignedUser.id === user?.id) return 'You';
    return project.assignedUser.username;
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return { 
          color: 'border-red-500', 
          bgColor: 'bg-red-100', 
          textColor: 'text-red-700',
          icon: Flag,
          label: 'High Priority'
        };
      case 'MEDIUM':
        return { 
          color: 'border-yellow-500', 
          bgColor: 'bg-yellow-100', 
          textColor: 'text-yellow-700',
          icon: Flag,
          label: 'Medium Priority'
        };
      case 'LOW':
        return { 
          color: 'border-blue-500', 
          bgColor: 'bg-blue-100', 
          textColor: 'text-blue-700',
          icon: Flag,
          label: 'Low Priority'
        };
      default:
        return { 
          color: 'border-gray-500', 
          bgColor: 'bg-gray-100', 
          textColor: 'text-gray-700',
          icon: Flag,
          label: 'Medium Priority'
        };
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PLANNING':
        return { 
          bgColor: 'bg-gray-100', 
          textColor: 'text-gray-700',
          icon: ClockIcon,
          label: 'Planning'
        };
      case 'IN_PROGRESS':
        return { 
          bgColor: 'bg-blue-100', 
          textColor: 'text-blue-700',
          icon: Play,
          label: 'In Progress'
        };
      case 'DONE':
        return { 
          bgColor: 'bg-green-100', 
          textColor: 'text-green-700',
          icon: CheckCircle2,
          label: 'Completed'
        };
      default:
        return { 
          bgColor: 'bg-gray-100', 
          textColor: 'text-gray-700',
          icon: ClockIcon,
          label: 'Planning'
        };
    }
  };

  const priorityConfig = getPriorityConfig(project.priority || 'MEDIUM');
  const statusConfig = getStatusConfig(project.status || 'PLANNING');

  return (
    <div 
      className={`bg-white rounded-2xl p-6 shadow-soft hover:shadow-soft-lg border-l-4 ${priorityConfig.color} border-r border-t border-b border-secondary-200/50 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 group`}
      onClick={() => onCardClick(project)}
    >
      <div className="flex items-start justify-between mb-4">
        <h4 className="font-semibold text-secondary-900 flex-1 text-lg group-hover:text-primary-600 transition-colors duration-200">
          {project.title}
        </h4>
        <div className="flex items-center gap-2">
          {/* Priority Badge */}
          <div className={`${priorityConfig.bgColor} px-2 py-1 rounded-lg flex items-center gap-1`}>
            <Flag className={`w-3 h-3 ${priorityConfig.textColor}`} />
            <span className={`text-xs font-medium ${priorityConfig.textColor}`}>
              {priorityConfig.label.replace(' Priority', '')}
            </span>
          </div>
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
        <div className="flex items-center space-x-3">
          <div className={`${statusConfig.bgColor} p-2 rounded-xl`}>
            <statusConfig.icon className={`w-4 h-4 ${statusConfig.textColor}`} />
          </div>
          <div>
            <p className="text-xs text-secondary-500 uppercase tracking-wide font-medium">Status</p>
            <p className={`text-sm font-medium ${statusConfig.textColor}`}>
              {statusConfig.label}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-secondary-100">
        <div className="flex items-center space-x-2 text-secondary-500">
          <Clock className="w-4 h-4" />
          <span className="text-sm">Created {formatDate(project.createdAt)}</span>
        </div>

        {dueDateStatus && (
          <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl font-medium text-sm ${
            dueDateStatus.status === 'overdue' 
              ? 'bg-danger-100 text-danger-700' 
              : dueDateStatus.status === 'today' || dueDateStatus.status === 'soon'
              ? 'bg-warning-100 text-warning-700'
              : 'bg-secondary-100 text-secondary-700'
          }`}>
            <Calendar className="w-4 h-4" />
            <span>{dueDateStatus.text}</span>
          </div>
        )}
      </div>
    </div>
  );
};
