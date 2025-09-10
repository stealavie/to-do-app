import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Plus, Users, Settings, Copy, Globe, Lock, Calendar, BookOpen } from 'lucide-react';
import { groupsApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ProjectCard } from './ProjectCard';
import { CreateProjectModal } from './CreateProjectModal';
import type { LearningGroup, Project, Role } from '../../types';

export const GroupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const { data: groupData, isLoading, error, refetch } = useQuery({
    queryKey: ['group', id],
    queryFn: () => groupsApi.getGroup(id!),
    enabled: !!id,
  });

  const group: LearningGroup | undefined = groupData?.group;
  const userMembership = group?.memberships?.find(m => m.user.id === user?.id);
  const userRole: Role = userMembership?.role || 'MEMBER';
  const canManageGroup = userRole === 'OWNER' || userRole === 'ADMIN';

  const handleCopyInviteCode = async () => {
    if (group?.inviteCode) {
      try {
        await navigator.clipboard.writeText(group.inviteCode);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (error) {
        console.error('Failed to copy invite code:', error);
      }
    }
  };

  const handleProjectCreated = () => {
    setShowCreateProjectModal(false);
    refetch();
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !group) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Failed to load group details</p>
        <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
      </div>
    );
  }

  const projects = group.projects || [];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button
          variant="secondary"
          onClick={() => navigate('/')}
          className="mr-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
            {group.isPublic ? (
              <div title="Public group" className="bg-green-100 p-2 rounded-full">
                <Globe className="w-5 h-5 text-green-600" />
              </div>
            ) : (
              <div title="Private group" className="bg-gray-100 p-2 rounded-full">
                <Lock className="w-5 h-5 text-gray-500" />
              </div>
            )}
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              userRole === 'OWNER'
                ? 'bg-purple-100 text-purple-800'
                : userRole === 'ADMIN'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {userRole.toLowerCase()}
            </span>
          </div>
          {group.description && (
            <p className="text-gray-600">{group.description}</p>
          )}
        </div>
      </div>

      {/* Group Stats & Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <div className="bg-primary-100 p-3 rounded-full">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{group.memberships?.length || 0}</p>
              <p className="text-gray-600">Members</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
              <p className="text-gray-600">Projects</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <div className="bg-orange-100 p-3 rounded-full">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {projects.filter(p => p.dueDate && new Date(p.dueDate) > new Date()).length}
              </p>
              <p className="text-gray-600">Due Soon</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Invite Code</span>
              <button
                onClick={handleCopyInviteCode}
                className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700"
              >
                <Copy className="w-4 h-4" />
                <span>{copySuccess ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <div className="bg-gray-50 p-2 rounded text-center font-mono text-sm">
              {group.inviteCode}
            </div>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="bg-white rounded-lg border">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Projects</h2>
            <div className="flex space-x-3">
              {canManageGroup && (
                <Button variant="secondary">
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Group
                </Button>
              )}
              <Button onClick={() => setShowCreateProjectModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first project to start collaborating with your group.
              </p>
              <Button onClick={() => setShowCreateProjectModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project: Project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onUpdate={refetch}
                  canEdit={canManageGroup}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Members Section */}
      <div className="mt-8 bg-white rounded-lg border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Members ({group.memberships?.length || 0})</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {group.memberships?.map((membership) => (
              <div key={membership.user.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="bg-primary-100 text-primary-600 rounded-full w-10 h-10 flex items-center justify-center font-medium">
                  {membership.user.username[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{membership.user.username}</p>
                  <p className="text-sm text-gray-500">{membership.user.email}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  membership.role === 'OWNER'
                    ? 'bg-purple-100 text-purple-800'
                    : membership.role === 'ADMIN'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {membership.role.toLowerCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateProjectModal}
        onClose={() => setShowCreateProjectModal(false)}
        onSuccess={handleProjectCreated}
        groupId={group.id}
      />
    </div>
  );
};
