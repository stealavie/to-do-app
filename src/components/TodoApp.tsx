import React, { useState, useEffect } from 'react';

// Simple Task interface
interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: Date;
  createdAt: Date;
}

// Simple Project interface
interface Project {
  id: string;
  name: string;
  color: string;
}

// Sample data
const SAMPLE_PROJECTS: Project[] = [
  { id: '1', name: 'Academic Work', color: '#3b82f6' },
  { id: '2', name: 'Personal Development', color: '#10b981' },
  { id: '3', name: 'Part-time Job', color: '#f59e0b' }
];

const SAMPLE_TASKS: Task[] = [
  {
    id: '1',
    title: 'Complete Data Structures Assignment',
    description: 'Implement binary search tree with full documentation',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
  },
  {
    id: '2',
    title: 'Study for Calculus Midterm',
    description: 'Review chapters 5-8, practice integration problems',
    status: 'TODO',
    priority: 'HIGH',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    createdAt: new Date()
  },
  {
    id: '3',
    title: 'Read Clean Code Chapter 3',
    description: 'Functions chapter - take notes on best practices',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date()
  },
  {
    id: '4',
    title: 'Update Resume',
    description: 'Add recent projects and skills',
    status: 'DONE',
    priority: 'MEDIUM',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  }
];

export const TodoApp: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(SAMPLE_TASKS);
  const [,] = useState<Project[]>(SAMPLE_PROJECTS);
  const [currentView, setCurrentView] = useState<'kanban' | 'list' | 'analytics'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as const,
    dueDate: ''
  });

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('studyflow-tasks');
    if (savedTasks) {
      try {
        const parsed = JSON.parse(savedTasks).map((task: any) => ({
          ...task,
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          createdAt: new Date(task.createdAt)
        }));
        setTasks(parsed);
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('studyflow-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!newTask.title.trim()) return;

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description || undefined,
      status: 'TODO',
      priority: newTask.priority,
      dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
      createdAt: new Date()
    };

    setTasks(prev => [...prev, task]);
    setNewTask({ title: '', description: '', priority: 'MEDIUM', dueDate: '' });
    setShowAddForm(false);
  };

  const toggleTaskStatus = (id: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        const statusOrder: Task['status'][] = ['TODO', 'IN_PROGRESS', 'DONE'];
        const currentIndex = statusOrder.indexOf(task.status);
        const nextIndex = (currentIndex + 1) % statusOrder.length;
        return { ...task, status: statusOrder[nextIndex] };
      }
      return task;
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tasksByStatus = {
    TODO: filteredTasks.filter(task => task.status === 'TODO'),
    IN_PROGRESS: filteredTasks.filter(task => task.status === 'IN_PROGRESS'),
    DONE: filteredTasks.filter(task => task.status === 'DONE')
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays <= 7) return `In ${diffDays} days`;
    
    return date.toLocaleDateString();
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'HIGH': return '#ef4444';
      case 'MEDIUM': return '#f59e0b';
      case 'LOW': return '#10b981';
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'TODO': return '○';
      case 'IN_PROGRESS': return '◐';
      case 'DONE': return '●';
    }
  };

  const stats = {
    total: tasks.length,
    completed: tasks.filter(task => task.status === 'DONE').length,
    inProgress: tasks.filter(task => task.status === 'IN_PROGRESS').length,
    overdue: tasks.filter(task => 
      task.dueDate && task.dueDate < new Date() && task.status !== 'DONE'
    ).length
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-main">
            <div className="header-title">
              <h1>StudyFlow</h1>
              <div className="header-subtitle">Vietnamese Student Time Management</div>
            </div>
            
            <div className="header-actions">
              {/* Search */}
              <div className="search-container">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              {/* View Toggle */}
              <div className="view-toggle">
                <button
                  className={currentView === 'kanban' ? 'active' : ''}
                  onClick={() => setCurrentView('kanban')}
                >
                  <span>📋</span> <span>Kanban</span>
                </button>
                <button
                  className={currentView === 'list' ? 'active' : ''}
                  onClick={() => setCurrentView('list')}
                >
                  <span>📝</span> <span>List</span>
                </button>
                <button
                  className={currentView === 'analytics' ? 'active' : ''}
                  onClick={() => setCurrentView('analytics')}
                >
                  <span>📊</span> <span>Analytics</span>
                </button>
              </div>

              {/* Add Task Button */}
              <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
                <span>➕</span> Add Task
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {currentView === 'kanban' && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '1.5rem' 
          }}>
            {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
              <div key={status} className="card">
                <div className="card-header">
                  <h3 style={{ 
                    margin: 0, 
                    fontSize: '1.125rem', 
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    {status.replace('_', ' ')}
                    <span style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: '500',
                      backgroundColor: '#f3f4f6',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.5rem'
                    }}>
                      {statusTasks.length}
                    </span>
                  </h3>
                </div>
                <div className="card-content">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {statusTasks.map(task => (
                      <div
                        key={task.id}
                        style={{
                          padding: '1rem',
                          backgroundColor: '#ffffff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.5rem',
                          borderLeft: `4px solid ${getPriorityColor(task.priority)}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          marginBottom: '0.5rem'
                        }}>
                          <button
                            onClick={() => toggleTaskStatus(task.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              fontSize: '1.25rem',
                              cursor: 'pointer',
                              padding: 0,
                              color: task.status === 'DONE' ? '#10b981' : '#6b7280'
                            }}
                          >
                            {getStatusIcon(task.status)}
                          </button>
                          <button
                            onClick={() => deleteTask(task.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              padding: '0.25rem',
                              fontSize: '0.875rem'
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                        
                        <h4 style={{
                          margin: '0 0 0.5rem 0',
                          fontSize: '1rem',
                          fontWeight: '500',
                          color: task.status === 'DONE' ? '#9ca3af' : '#111827',
                          textDecoration: task.status === 'DONE' ? 'line-through' : 'none'
                        }}>
                          {task.title}
                        </h4>
                        
                        {task.description && (
                          <p style={{
                            margin: '0 0 0.5rem 0',
                            fontSize: '0.875rem',
                            color: '#6b7280',
                            lineHeight: '1.25rem'
                          }}>
                            {task.description}
                          </p>
                        )}
                        
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          fontSize: '0.75rem',
                          color: '#9ca3af'
                        }}>
                          {task.dueDate && (
                            <span style={{
                              color: task.dueDate < new Date() && task.status !== 'DONE' ? '#ef4444' : '#6b7280'
                            }}>
                              📅 {formatDate(task.dueDate)}
                            </span>
                          )}
                          <span style={{ color: getPriorityColor(task.priority) }}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {currentView === 'list' && (
          <div className="card">
            <div className="card-header">
              <h3 style={{ margin: 0 }}>All Tasks</h3>
            </div>
            <div className="card-content">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {filteredTasks.map(task => (
                  <div
                    key={task.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      backgroundColor: task.status === 'DONE' ? '#f9fafb' : '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.375rem',
                      borderLeft: `4px solid ${getPriorityColor(task.priority)}`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                      <button
                        onClick={() => toggleTaskStatus(task.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '1.25rem',
                          cursor: 'pointer',
                          padding: 0,
                          color: task.status === 'DONE' ? '#10b981' : '#6b7280'
                        }}
                      >
                        {getStatusIcon(task.status)}
                      </button>
                      
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '1rem',
                          fontWeight: '500',
                          color: task.status === 'DONE' ? '#9ca3af' : '#111827',
                          textDecoration: task.status === 'DONE' ? 'line-through' : 'none'
                        }}>
                          {task.title}
                        </div>
                        {task.description && (
                          <div style={{
                            fontSize: '0.875rem',
                            color: '#6b7280',
                            marginTop: '0.25rem'
                          }}>
                            {task.description}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem' }}>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.375rem',
                        backgroundColor: task.status === 'TODO' ? '#f3f4f6' : 
                                       task.status === 'IN_PROGRESS' ? '#dbeafe' : '#dcfce7',
                        color: task.status === 'TODO' ? '#374151' :
                               task.status === 'IN_PROGRESS' ? '#1d4ed8' : '#166534'
                      }}>
                        {task.status.replace('_', ' ')}
                      </span>
                      
                      {task.dueDate && (
                        <span style={{
                          color: task.dueDate < new Date() && task.status !== 'DONE' ? '#ef4444' : '#6b7280'
                        }}>
                          {formatDate(task.dueDate)}
                        </span>
                      )}
                      
                      <button
                        onClick={() => deleteTask(task.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: '0.25rem'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentView === 'analytics' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div className="card">
              <div className="card-header">
                <h3 style={{ margin: 0 }}>📊 Task Statistics</h3>
              </div>
              <div className="card-content">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
                      {stats.total}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Tasks</div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
                      {stats.completed}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Completed</div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
                      {stats.inProgress}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>In Progress</div>
                  </div>
                  
                  {stats.overdue > 0 && (
                    <div>
                      <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>
                        {stats.overdue}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Overdue</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-header">
                <h3 style={{ margin: 0 }}>🎯 Productivity Insights</h3>
              </div>
              <div className="card-content">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
                      {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Completion Rate</div>
                  </div>
                  
                  <div style={{ 
                    padding: '1rem',
                    backgroundColor: '#f0f9ff',
                    borderRadius: '0.5rem',
                    border: '1px solid #bfdbfe'
                  }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                      💡 AI Insight
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#1d4ed8' }}>
                      {stats.overdue > 0 
                        ? `You have ${stats.overdue} overdue task${stats.overdue > 1 ? 's' : ''}. Consider breaking them into smaller chunks!`
                        : stats.completed === stats.total && stats.total > 0
                        ? 'Excellent! All tasks completed. Time to set new goals!'
                        : stats.inProgress > stats.total * 0.5
                        ? 'You have many tasks in progress. Try focusing on completing some before starting new ones.'
                        : 'Great progress! Keep up the momentum.'
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Task Modal */}
      {showAddForm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>Add New Task</h3>
              <button
                onClick={() => setShowAddForm(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  Title *
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem'
                  }}
                  placeholder="Enter task title..."
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                  placeholder="Enter task description..."
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                    Priority
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as any }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem'
                    }}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem'
                    }}
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  onClick={addTask}
                  disabled={!newTask.title.trim()}
                  className="btn btn-primary"
                  style={{
                    flex: 1,
                    opacity: !newTask.title.trim() ? 0.5 : 1,
                    cursor: !newTask.title.trim() ? 'not-allowed' : 'pointer'
                  }}
                >
                  Add Task
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
