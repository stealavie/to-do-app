import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '../../hooks/useNotifications';
import { useNotificationNavigation } from '../../hooks/useNotificationNavigation';
import type { Notification } from '../../types';

interface NotificationBellProps {
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications();
  const { navigateToNotification } = useNotificationNavigation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        bellRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !bellRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBellClick = () => {
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    navigateToNotification(notification);
    setIsOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'TASK_ASSIGNED':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'DEADLINE_APPROACHING':
        return <Clock className="w-4 h-4 text-orange-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'TASK_ASSIGNED':
        return 'border-l-blue-500 bg-blue-50';
      case 'DEADLINE_APPROACHING':
        return 'border-l-orange-500 bg-orange-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Bell Icon Button */}
      <button
        ref={bellRef}
        onClick={handleBellClick}
        className={`relative p-2.5 rounded-2xl transition-all duration-200 ${
          isOpen
            ? 'bg-primary-100 text-primary-600 shadow-soft'
            : 'bg-secondary-50 text-secondary-600 hover:bg-primary-50 hover:text-primary-600'
        }`}
      >
        <Bell className="w-5 h-5" />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] shadow-soft">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-xl border border-secondary-200/50 z-50 max-h-96 overflow-hidden"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-secondary-200/50 flex items-center justify-between bg-gradient-to-r from-primary-50 to-secondary-50">
            <h3 className="font-semibold text-secondary-900 text-sm">
              Notifications ({notifications.length})
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-secondary-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-secondary-300" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={() => handleNotificationClick(notification)}
                  onRemove={() => removeNotification(notification.id)}
                  icon={getNotificationIcon(notification.type)}
                  colorClass={getNotificationColor(notification.type)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
  onRemove: () => void;
  icon: React.ReactNode;
  colorClass: string;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClick,
  onRemove,
  icon,
  colorClass,
}) => {
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });

  return (
    <div
      onClick={onClick}
      className={`border-l-4 ${colorClass} ${
        !notification.isRead 
          ? 'bg-opacity-100 shadow-sm' 
          : 'bg-opacity-40 opacity-75'
      } transition-all duration-300 hover:bg-opacity-80 hover:shadow-md cursor-pointer group relative`}
    >
      {/* Unread indicator dot - more prominent */}
      {!notification.isRead && (
        <div className="absolute top-2 right-2 w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex-shrink-0 shadow-sm animate-pulse" />
      )}
      
      <div className="px-4 py-3 flex items-start space-x-3">
        {/* Icon with enhanced styling */}
        <div className={`flex-shrink-0 mt-0.5 p-1.5 rounded-lg ${
          !notification.isRead 
            ? 'bg-white shadow-sm' 
            : 'bg-gray-100'
        } transition-all duration-200`}>
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-start justify-between mb-1">
            <h4 className={`text-sm font-semibold leading-tight ${
              !notification.isRead 
                ? 'text-secondary-900' 
                : 'text-secondary-600'
            } transition-colors duration-200`}>
              {notification.title}
            </h4>
          </div>
          
          <p className={`text-sm leading-relaxed ${
            !notification.isRead 
              ? 'text-secondary-700' 
              : 'text-secondary-500'
          } overflow-hidden text-ellipsis max-h-12 transition-colors duration-200`}>
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between mt-2">
            <span className={`text-xs ${
              !notification.isRead ? 'text-secondary-500' : 'text-secondary-400'
            } transition-colors duration-200`}>
              {timeAgo}
            </span>
            {notification.projectId && (
              <ArrowRight className={`w-3 h-3 ${
                !notification.isRead ? 'text-primary-500' : 'text-secondary-400'
              } opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1`} />
            )}
          </div>
        </div>

        {/* Remove Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 rounded-lg transition-all duration-200 transform hover:scale-110"
        >
          <X className="w-3 h-3 text-red-400 hover:text-red-600" />
        </button>
      </div>
    </div>
  );
};
