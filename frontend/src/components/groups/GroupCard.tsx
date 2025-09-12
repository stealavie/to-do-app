import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Lock, Calendar, BookOpen } from 'lucide-react';
import type { LearningGroup } from '../../types';

interface GroupCardProps {
  group: LearningGroup;
}

export const GroupCard: React.FC<GroupCardProps> = ({ group }) => {
  const memberCount = group.memberships?.length || 0;
  const projectCount = group.projects?.length || 0;
  const userRole = group.memberships?.[0]?.role || 'MEMBER';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Link to={`/groups/${group.id}`} className="block">
      <div className="bg-white rounded-lg border hover:shadow-md transition-shadow p-6 h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-lg text-gray-900 truncate">
                {group.name}
              </h3>
              <div title="Private group">
                <Lock className="w-4 h-4 text-gray-500" />
              </div>
            </div>
            {group.description && (
              <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                {group.description}
              </p>
            )}
          </div>
          <div className="flex-shrink-0 ml-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              userRole === 'OWNER' 
                ? 'bg-purple-100 text-purple-800'
                : userRole === 'ADMIN'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {userRole.toLowerCase()}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center space-x-1">
              <BookOpen className="w-4 h-4" />
              <span>{projectCount} project{projectCount !== 1 ? 's' : ''}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>Created {formatDate(group.createdAt)}</span>
            </div>
          </div>

          {/* Recent activity or next deadline */}
          {group.projects && group.projects.length > 0 && (
            <div className="pt-3 border-t border-gray-100">
              {(() => {
                const upcomingProject = group.projects
                  .filter(p => p.dueDate && new Date(p.dueDate) > new Date())
                  .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())[0];
                
                if (upcomingProject) {
                  const daysUntilDue = Math.ceil(
                    (new Date(upcomingProject.dueDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  );
                  
                  return (
                    <div className="text-xs text-orange-600">
                      <span className="font-medium">{upcomingProject.title}</span> due in {daysUntilDue} day{daysUntilDue !== 1 ? 's' : ''}
                    </div>
                  );
                }

                const latestProject = group.projects
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
                
                return (
                  <div className="text-xs text-gray-500">
                    Latest: <span className="font-medium">{latestProject.title}</span>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};
