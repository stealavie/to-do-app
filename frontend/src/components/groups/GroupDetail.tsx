import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Plus, Settings, Copy, Calendar, BookOpen, Filter, User, Inbox, BarChart3 } from 'lucide-react';
import { groupsApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ProjectCard } from './ProjectCard';
import { CreateProjectModal } from './CreateProjectModal';
import { TaskDetailsPanel } from './TaskDetailsPanel';
import type { LearningGroup, Project, Role } from '../../types';

export const GroupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Project | null>(null);
  const [projectFilter, setProjectFilter] = useState<'all' | 'my'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'PLANNING' | 'IN_PROGRESS' | 'DONE'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'LOW' | 'MEDIUM' | 'HIGH'>('all');

  const { data: groupData, isLoading, error, refetch } = useQuery({
    queryKey: ['group', id],
    queryFn: () => groupsApi.getGroup(id!),
    enabled: !!id,
  });

  const group: LearningGroup | undefined = groupData?.group;
  const userMembership = group?.memberships?.find(m => m.user.id === user?.id);
  const userRole: Role = userMembership?.role || 'MEMBER';
  const canManageGroup = userRole === 'OWNER' || userRole === 'ADMIN';

  // Filter projects based on current filters - MOVED TO TOP TO AVOID HOOKS VIOLATION
  const filteredProjects = useMemo(() => {
    if (!group?.projects) return [];
    
    let filtered = group.projects;

    // Filter by assignment
    if (projectFilter === 'my') {
      filtered = filtered.filter(project => project.assignedUser?.id === user?.id);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    // Filter by priority
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(project => project.priority === priorityFilter);
    }

    return filtered;
  }, [group?.projects, projectFilter, statusFilter, priorityFilter, user?.id]);

  // Progress statistics - MOVED TO TOP TO AVOID HOOKS VIOLATION
  const progressStats = useMemo(() => {
    const allProjects = group?.projects || [];
    const myProjects = allProjects.filter(project => project.assignedUser?.id === user?.id);
    
    return {
      total: allProjects.length,
      my: myProjects.length,
      planning: allProjects.filter(p => p.status === 'PLANNING').length,
      inProgress: allProjects.filter(p => p.status === 'IN_PROGRESS').length,
      completed: allProjects.filter(p => p.status === 'DONE').length,
      myCompleted: myProjects.filter(p => p.status === 'DONE').length
    };
  }, [group?.projects, user?.id]);

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

  // Handle automatic project selection from URL parameters (for notifications)
  useEffect(() => {
    const projectId = searchParams.get('projectId');
    if (projectId && group?.projects) {
      const project = group.projects.find(p => p.id === projectId);
      if (project) {
        setSelectedTask(project);
        // Clear the search parameter to clean up the URL
        setSearchParams(new URLSearchParams());
      }
    }
  }, [group?.projects, searchParams, setSearchParams]);

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

      {/* Invite Code Section */}
      <div className="mb-8">
        <div className="bg-white p-6 rounded-2xl border border-secondary-200/50 shadow-soft hover:shadow-soft-lg transition-all duration-300">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-secondary-700 uppercase tracking-wide">Invite Code</span>
              <button
                onClick={handleCopyInviteCode}
                className="flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-700 px-3 py-1.5 rounded-xl hover:bg-primary-50 transition-all duration-200 font-medium"
              >
                <Copy className="w-4 h-4" />
                <span>{copySuccess ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <div className="bg-secondary-50 p-3 rounded-xl text-center font-mono text-sm font-semibold text-secondary-900 border border-secondary-200">
              {group.inviteCode}
            </div>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="bg-white rounded-2xl border border-secondary-200/50 shadow-soft">
        <div className="px-6 py-5 border-b border-secondary-200/50 bg-secondary-50/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-secondary-900">Projects</h2>
            <div className="flex space-x-3">
              {canManageGroup && (
                <Button variant="secondary" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Group
                </Button>
              )}
              <Button onClick={() => setShowCreateProjectModal(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>
          </div>

          {/* Progress Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl border border-secondary-200/50 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="bg-primary-100 p-2 rounded-lg">
                  <Inbox className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <p className="text-xs text-secondary-500 font-medium">Total Projects</p>
                  <p className="text-xl font-bold text-secondary-900">{progressStats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-secondary-200/50 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-secondary-500 font-medium">My Projects</p>
                  <p className="text-xl font-bold text-secondary-900">{progressStats.my}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-secondary-200/50 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <BarChart3 className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-secondary-500 font-medium">In Progress</p>
                  <p className="text-xl font-bold text-secondary-900">{progressStats.inProgress}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-secondary-200/50 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Calendar className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-secondary-500 font-medium">Completed</p>
                  <p className="text-xl font-bold text-secondary-900">{progressStats.completed}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Project Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-secondary-500" />
              <span className="text-sm font-medium text-secondary-700">Filter:</span>
            </div>
            
            {/* Assignment Filter */}
            <div className="flex space-x-1">
              <button
                onClick={() => setProjectFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  projectFilter === 'all'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                }`}
              >
                All Projects
              </button>
              <button
                onClick={() => setProjectFilter('my')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  projectFilter === 'my'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                }`}
              >
                My Projects
              </button>
            </div>

            {/* Status Filter */}
            <div className="flex space-x-1">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === 'all'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                }`}
              >
                All Status
              </button>
              <button
                onClick={() => setStatusFilter('PLANNING')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === 'PLANNING'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                }`}
              >
                Planning
              </button>
              <button
                onClick={() => setStatusFilter('IN_PROGRESS')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === 'IN_PROGRESS'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => setStatusFilter('DONE')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === 'DONE'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                }`}
              >
                Done
              </button>
            </div>

            {/* Priority Filter */}
            <div className="flex space-x-1">
              <button
                onClick={() => setPriorityFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  priorityFilter === 'all'
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                }`}
              >
                All Priority
              </button>
              <button
                onClick={() => setPriorityFilter('HIGH')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  priorityFilter === 'HIGH'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                }`}
              >
                High
              </button>
              <button
                onClick={() => setPriorityFilter('MEDIUM')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  priorityFilter === 'MEDIUM'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                }`}
              >
                Medium
              </button>
              <button
                onClick={() => setPriorityFilter('LOW')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  priorityFilter === 'LOW'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                }`}
              >
                Low
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-primary-100 rounded-3xl w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-secondary-900 mb-3">No projects yet</h3>
              <p className="text-secondary-600 mb-8 text-lg max-w-md mx-auto leading-relaxed">
                Create your first project to start collaborating with your group and track your progress together.
              </p>
              <Button onClick={() => setShowCreateProjectModal(true)} size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project: Project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onCardClick={setSelectedTask}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Members Section */}
      <div className="mt-8 bg-white rounded-2xl border border-secondary-200/50 shadow-soft">
        <div className="px-6 py-5 border-b border-secondary-200/50 bg-secondary-50/50">
          <h3 className="text-xl font-bold text-secondary-900">
            Members <span className="text-secondary-500 font-medium">({group.memberships?.length || 0})</span>
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {group.memberships?.map((membership) => (
              <div 
                key={membership.user.id} 
                className="flex items-center space-x-4 p-4 bg-secondary-50 rounded-2xl hover:bg-secondary-100 transition-all duration-200 border border-secondary-200/50"
              >
                <div className="bg-primary-100 text-primary-700 rounded-2xl w-12 h-12 flex items-center justify-center font-bold text-lg">
                  {membership.user.username[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-secondary-900 truncate">{membership.user.username}</p>
                  <p className="text-sm text-secondary-500 truncate">{membership.user.email}</p>
                </div>
                <span className={`px-3 py-1.5 text-xs font-bold rounded-xl uppercase tracking-wide ${
                  membership.role === 'OWNER'
                    ? 'bg-primary-100 text-primary-700'
                    : membership.role === 'ADMIN'
                    ? 'bg-success-100 text-success-700'
                    : 'bg-secondary-100 text-secondary-700'
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
        groupId={id!}
      />

      {/* Task Details Panel */}
      <TaskDetailsPanel
        project={selectedTask}
        groupMembers={group?.memberships || []}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={refetch}
        canEdit={canManageGroup}
      />
    </div>
  );
};
