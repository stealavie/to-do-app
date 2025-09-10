import React from 'react';
import type { Task } from '../../types';
import { TaskStatus } from '../../types';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';

interface KanbanViewProps {
  tasksByStatus: Record<TaskStatus, Task[]>;
  onToggleStatus: (id: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onAddTask: () => void;
}

export const KanbanView: React.FC<KanbanViewProps> = ({
  tasksByStatus,
  onToggleStatus,
  onEditTask,
  onDeleteTask,
  onAddTask
}) => {
  const columns = [
    {
      status: TaskStatus.TODO,
      title: 'To Do',
      color: 'bg-gray-100 text-gray-700'
    },
    {
      status: TaskStatus.IN_PROGRESS,
      title: 'In Progress',
      color: 'bg-blue-100 text-blue-700'
    },
    {
      status: TaskStatus.DONE,
      title: 'Done',
      color: 'bg-green-100 text-green-700'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
      {columns.map(({ status, title, color }) => (
        <div key={status} className="flex flex-col">
          {/* Column Header */}
          <div className={`p-3 rounded-lg ${color} mb-4`}>
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{title}</h3>
              <span className="text-sm font-medium">
                {tasksByStatus[status].length}
              </span>
            </div>
          </div>

          {/* Tasks */}
          <div className="flex-1 space-y-3 min-h-[200px] max-h-[calc(100vh-300px)] overflow-y-auto">
            {tasksByStatus[status].map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleStatus={onToggleStatus}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
            
            {/* Add Task Button */}
            {status === TaskStatus.TODO && (
              <button
                onClick={onAddTask}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>Add Task</span>
                </div>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
