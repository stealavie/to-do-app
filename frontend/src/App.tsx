import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import { NotificationProvider } from './contexts/NotificationContext';
import { SocketProvider } from './contexts/SocketContext';
import { ChatProvider } from './contexts/ChatContext';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/Dashboard';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { GroupDetail } from './components/groups/GroupDetail';
import { AccountDetails } from './components/AccountDetails';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { Chat } from './components/chat/Chat';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50">
        <Header />
        <main className="container mx-auto px-6 py-10">
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/groups/:id"
              element={
                <ProtectedRoute>
                  <GroupDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <AccountDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        {/* Chat component - only show for authenticated users */}
        {isAuthenticated && <Chat />}
      </div>
    </Router>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <NotificationProvider>
            <ChatProvider>
              <AppContent />
            </ChatProvider>
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;