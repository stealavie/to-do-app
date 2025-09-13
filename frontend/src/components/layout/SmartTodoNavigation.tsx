import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home,
  CheckSquare, 
  Calendar, 
  BarChart3
} from 'lucide-react';

const SmartTodoNavigation: React.FC = () => {
  const location = useLocation();

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

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-secondary-200/30 px-6 py-2 sticky top-24 z-[60] shadow-sm">
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
    </nav>
  );
};

export default SmartTodoNavigation;