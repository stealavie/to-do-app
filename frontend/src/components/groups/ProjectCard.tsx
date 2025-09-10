import React from 'react';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import type { Project } from '../../types';

interface ProjectCardProps {
  project: Project;
  onUpdate: () => void;
  canEdit: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
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

  return (
    <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-medium text-gray-900 flex-1">{project.title}</h4>
        {dueDateStatus?.status === 'overdue' && (
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 ml-2" />
        )}
      </div>

      {project.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {project.description}
        </p>
      )}

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-1 text-gray-500">
          <Clock className="w-4 h-4" />
          <span>Created {formatDate(project.createdAt)}</span>
        </div>

        {dueDateStatus && (
          <div className={`flex items-center space-x-1 ${dueDateStatus.color}`}>
            <Calendar className="w-4 h-4" />
            <span className="font-medium">{dueDateStatus.text}</span>
          </div>
        )}
      </div>
    </div>
  );
};
