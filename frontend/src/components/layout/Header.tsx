import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, 
  LogOut, 
  User, 
  Settings, 
  ChevronDown,
  Home,
  CheckSquare, 
  Calendar, 
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { NotificationBell } from '../ui/NotificationBell';

export const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    {
      path: '/',
      label: 'Dashboard',
      icon: Home,
      description: 'Main Dashboard'
    },
    {
      path: '/smart-todo',
      label: 'Smart To-Do',
      icon: CheckSquare,
      description: 'Smart To-Do Demo'
    },
    {
      path: '/tasks',
      label: 'Do Now',
      icon: CheckSquare,
      description: 'AI-Prioritized Tasks'
    },
    {
      path: '/calendar',
      label: 'Calendar',
      icon: Calendar,
      description: 'Deadline Overview'
    },
    {
      path: '/analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'Productivity Insights'
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsDropdownOpen(false);
  };

  const handleAccountClick = () => {
    navigate('/account');
    setIsDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-secondary-200/50 sticky top-0 z-50 shadow-soft">
      {/* Top Header Bar */}
      <div className="px-6 py-5">
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
            
            {/* User Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 bg-secondary-50 px-4 py-2.5 rounded-2xl border border-secondary-200/50 hover:bg-secondary-100 hover:border-secondary-300 transition-all duration-200"
              >
                <div className="bg-primary-100 p-1.5 rounded-xl">
                  <User className="w-4 h-4 text-primary-600" />
                </div>
                <div className="text-left">
                  <span className="font-semibold text-secondary-900 text-sm block">{user?.username}</span>
                  <p className="text-xs text-secondary-500">{user?.email}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-secondary-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-lg border border-secondary-200 py-2 z-[60]">
                  <button
                    onClick={handleAccountClick}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-secondary-50 transition-colors duration-150"
                  >
                    <div className="bg-blue-100 p-2 rounded-xl">
                      <Settings className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <span className="font-medium text-secondary-900 block">Account Settings</span>
                      <p className="text-xs text-secondary-500">Manage your profile and security</p>
                    </div>
                  </button>
                  
                  <div className="h-px bg-secondary-200 mx-4 my-2"></div>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-danger-50 transition-colors duration-150"
                  >
                    <div className="bg-danger-100 p-2 rounded-xl">
                      <LogOut className="w-4 h-4 text-danger-600" />
                    </div>
                    <div>
                      <span className="font-medium text-danger-600 block">Sign out</span>
                      <p className="text-xs text-secondary-500">Sign out of your account</p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="px-6 py-2 border-t border-secondary-200/30">
        <div className="flex justify-center">
          <div className="flex space-x-1 bg-secondary-50 p-1 rounded-2xl border border-secondary-200/50">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                    ${active 
                      ? 'bg-white text-primary-600 shadow-soft border border-primary-200/50' 
                      : 'text-secondary-600 hover:text-secondary-900 hover:bg-white/50'
                    }
                  `}
                  title={item.description}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
