import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import LivestockPage from './pages/Livestock';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import InventoryPage from './pages/Inventory';
import WorkforcePage from './pages/Workforce';
import CommercePage from './pages/Commerce';
import SettingsPage from './pages/Settings';
import ProducePage from './pages/Produce';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex-center h-screen">Loading...</div>;
  }

  if (!token) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="livestock" element={<LivestockPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="workforce" element={<WorkforcePage />} />
        <Route path="commerce" element={<CommercePage />} />
        <Route path="produce" element={<ProducePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
