import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Users, BookOpen, Calendar, Search } from 'lucide-react';
import { groupsApi } from '../services/api';
import { Button } from './ui/Button';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { GroupCard } from './groups/GroupCard';
import { CreateGroupModal } from './groups/CreateGroupModal';
import { JoinGroupModal } from './groups/JoinGroupModal';
import type { LearningGroup } from '../types';

export const Dashboard: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: groupsData, isLoading, error, refetch } = useQuery({
    queryKey: ['groups'],
    queryFn: groupsApi.getUserGroups,
  });

  const groups = groupsData?.groups || [];

  // Filter function for groups
  const filteredGroups = groups.filter((group: LearningGroup) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (group.description && group.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Failed to load groups</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Learning Groups</h1>
          <p className="text-gray-600 mt-2">
            Collaborate with others on projects and assignments
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            onClick={() => setShowJoinModal(true)}
          >
            Join Group
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        </div>
      </div>

      {/* Header with Search */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">My Groups</h2>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search groups..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-80"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Groups Content */}
      <div>
        {filteredGroups.length === 0 ? (
          <div className="text-center py-12">
            {groups.length === 0 ? (
              <div className="max-w-md mx-auto">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No groups yet</h3>
                <p className="text-gray-600 mb-6">
                  Create your first learning group or join an existing one to get started.
                </p>
                <div className="flex justify-center space-x-3">
                  <Button variant="secondary" onClick={() => setShowJoinModal(true)}>
                    Join Group
                  </Button>
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Group
                  </Button>
                </div>
              </div>
            ) : (
              <div className="max-w-md mx-auto">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">
                  Try adjusting your search to find the group you're looking for.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group: LearningGroup) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      {groups.length > 0 && (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center">
              <div className="bg-primary-100 p-3 rounded-full">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{groups.length}</p>
                <p className="text-gray-600">Total Groups</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {groups.reduce((total: number, group: LearningGroup) => total + (group.projects?.length || 0), 0)}
                </p>
                <p className="text-gray-600">Total Projects</p>
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
                  {groups.filter((group: LearningGroup) => 
                    group.projects?.some(project => 
                      project.dueDate && new Date(project.dueDate) > new Date()
                    )
                  ).length}
                </p>
                <p className="text-gray-600">Active Projects</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          refetch();
        }}
      />
      <JoinGroupModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSuccess={() => {
          setShowJoinModal(false);
          refetch();
        }}
      />
    </div>
  );
};
