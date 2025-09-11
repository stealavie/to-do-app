import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationBell } from '../ui/NotificationBell';

export const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-secondary-200/50 px-6 py-5 sticky top-0 z-50 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 text-white p-3 rounded-2xl group-hover:scale-105 transition-transform duration-200 shadow-soft">
              <Users className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-secondary-900 group-hover:text-primary-600 transition-colors duration-200">
              StudyFlow
            </h1>
          </Link>
        </div>

        {/* User Menu */}
        <div className="flex items-center space-x-6">
          {/* Notification Bell */}
          <NotificationBell />
          
          <div className="flex items-center space-x-3 bg-secondary-50 px-4 py-2.5 rounded-2xl border border-secondary-200/50">
            <div className="bg-primary-100 p-1.5 rounded-xl">
              <User className="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <span className="font-semibold text-secondary-900 text-sm">{user?.username}</span>
              <p className="text-xs text-secondary-500">{user?.email}</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2.5 text-sm font-medium text-danger-600 hover:bg-danger-50 rounded-2xl transition-all duration-200 border border-danger-200/50 hover:border-danger-300"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
