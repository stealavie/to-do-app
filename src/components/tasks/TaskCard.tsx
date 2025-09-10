import React from 'react';
import type { Task } from '../../types';
import { TaskStatus } from '../../types';
import { formatDueDate, getTaskUrgency, getPriorityColor } from '../../utils/analytics';
import { Calendar, Clock, Tag, MoreHorizontal, CheckCircle2, Circle, PlayCircle } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onToggleStatus: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onToggleStatus
}) => {
  const urgency = getTaskUrgency(task);
  const priorityColor = getPriorityColor(task.priority);
  
  const getStatusIcon = () => {
    switch (task.status) {
      case TaskStatus.TODO:
        return <Circle className="w-5 h-5 text-gray-400" />;
      case TaskStatus.IN_PROGRESS:
        return <PlayCircle className="w-5 h-5 text-blue-500" />;
      case TaskStatus.DONE:
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    }
  };

  const getUrgencyStyle = () => {
    switch (urgency) {
      case 'overdue':
        return 'border-l-4 border-l-red-500 bg-red-50';
      case 'today':
        return 'border-l-4 border-l-orange-500 bg-orange-50';
      case 'tomorrow':
        return 'border-l-4 border-l-yellow-500 bg-yellow-50';
      default:
        return 'border-l-4 border-l-gray-200';
    }
  };

  return (
    <div className={`p-4 bg-white rounded-lg shadow-sm border ${getUrgencyStyle()} hover:shadow-md transition-shadow`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onToggleStatus(task.id)}
            className="flex-shrink-0"
          >
            {getStatusIcon()}
          </button>
          <h3 className={`font-medium text-gray-900 ${task.status === TaskStatus.DONE ? 'line-through text-gray-500' : ''}`}>
            {task.title}
          </h3>
        </div>
        
        <div className="flex items-center space-x-1">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: priorityColor }}
            title={`${task.priority} priority`}
          />
          <button className="text-gray-400 hover:text-gray-600">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
            >
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-3">
          {task.dueDate && (
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span className={urgency === 'overdue' ? 'text-red-600 font-medium' : ''}>
                {formatDueDate(task.dueDate)}
              </span>
            </div>
          )}
          
          {task.estimatedTime && (
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{Math.round(task.estimatedTime / 60)}h {task.estimatedTime % 60}m</span>
            </div>
          )}
        </div>
        
        <span className="text-xs text-gray-400">
          {task.priority}
        </span>
      </div>
    </div>
  );
};
