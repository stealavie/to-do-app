import { useContext } from 'react';
import { SocketContext } from '../contexts/SocketContextDefinition';

/**
 * Hook to access the socket context
 * @returns SocketContextType with socket instance and connection status
 */
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
