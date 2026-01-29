
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import { ADMIN_BASE_PATH } from './constants';

import { Layout } from './components/layout/Layout';
import { NotificationCenter } from './components/common/NotificationCenter';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import Bookings from './pages/Bookings';
import Users from './pages/Users';
import Payments from './pages/Payments';
import Settings from './pages/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, setLoading } = useAuthStore();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [setLoading]);

  if (isLoading) return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#F0F9FF]">
      <div className="relative">
         <div className="w-20 h-20 border-4 border-primary/20 rounded-[2rem] animate-pulse"></div>
         <div className="absolute inset-0 w-20 h-20 border-4 border-primary border-t-transparent rounded-[2rem] animate-spin"></div>
      </div>
      <p className="mt-8 text-dark font-black uppercase tracking-widest text-xs animate-pulse">Initializing Portal...</p>
    </div>
  );

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationCenter />
      <HashRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Admin Protected Routes */}
          <Route path={ADMIN_BASE_PATH} element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="rooms" element={<Rooms />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="users" element={<Users />} />
            <Route path="payments" element={<Payments />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Root Redirects */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </HashRouter>
    </QueryClientProvider>
  );
};

export default App;
