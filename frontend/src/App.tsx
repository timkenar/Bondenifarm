import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useThemeLoader } from './hooks/useThemeLoader';
import { ensureCsrf } from './api/axios';
import Login from './pages/Login';
import Landing from './pages/Landing';
import LivestockPage from './pages/Livestock';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import InventoryPage from './pages/Inventory';
import WorkforcePage from './pages/Workforce';
import CommercePage from './pages/Commerce';
import SettingsPage from './pages/Settings';
import ProducePage from './pages/Produce';
import CropsPage from './pages/Crops';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex-center h-screen">Loading...</div>;
  }

  if (!token) {
    return <Navigate to="/welcome" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  useThemeLoader();
  React.useEffect(() => { ensureCsrf(); }, []);
  return (
    <Routes>
      <Route path="/welcome" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      <Route path="/app" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="livestock" element={<LivestockPage />} />
        <Route path="crops" element={<CropsPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="workforce" element={<WorkforcePage />} />
        <Route path="commerce" element={<CommercePage />} />
        <Route path="produce" element={<ProducePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Backwards-compat: old root + unknown URLs land on the dashboard if signed in,
          otherwise the protected route bounces them to /welcome. */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="livestock" element={<LivestockPage />} />
        <Route path="crops" element={<CropsPage />} />
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
