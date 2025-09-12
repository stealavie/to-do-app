import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';
import { SocketContext } from './SocketContextDefinition';

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    if (token && user) {
      // Create socket connection
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
        auth: {
          token
        },
        autoConnect: true
      });

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('Connected to Socket.IO server');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from Socket.IO server');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
        setIsConnected(false);
      });

      // Real-time notification handler
      newSocket.on('new-notification', (notification) => {
        console.log('New notification received:', notification);
        // This will be handled by the NotificationContext
      });

      // Real-time project updates
      newSocket.on('project-created', (project) => {
        console.log('New project created:', project);
        // Trigger refetch in relevant components
      });

      newSocket.on('project-updated', (project) => {
        console.log('Project updated:', project);
        // Trigger refetch in relevant components
      });

      newSocket.on('project-status-changed', (project) => {
        console.log('Project status changed:', project);
        // Trigger refetch in relevant components
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
        setSocket(null);
        setIsConnected(false);
      };
    } else {
      // Disconnect if no auth token
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [token, user, socket]);

  const value = {
    socket,
    isConnected,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
