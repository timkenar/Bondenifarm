import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useThemeLoader } from './hooks/useThemeLoader';
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
import { canAccess } from './config/permissions';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isLoading } = useAuth();
  const storedToken = token ?? localStorage.getItem('token');

  if (isLoading) {
    return <div className="flex-center h-screen">Loading...</div>;
  }

  if (!storedToken) {
    return <Navigate to="/welcome" replace />;
  }

  return <>{children}</>;
};

// Restrict a page to roles that are allowed to see it. Users who reach a
// forbidden URL are bounced to their dashboard instead of seeing the page.
const RoleRoute: React.FC<{ path: string; children: React.ReactNode }> = ({ path, children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return <div className="flex-center h-screen">Loading...</div>;
  }
  if (user && !canAccess(user.role, path)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  useThemeLoader();
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
        <Route path="livestock" element={<RoleRoute path="/livestock"><LivestockPage /></RoleRoute>} />
        <Route path="crops" element={<RoleRoute path="/crops"><CropsPage /></RoleRoute>} />
        <Route path="inventory" element={<RoleRoute path="/inventory"><InventoryPage /></RoleRoute>} />
        <Route path="workforce" element={<RoleRoute path="/workforce"><WorkforcePage /></RoleRoute>} />
        <Route path="commerce" element={<RoleRoute path="/commerce"><CommercePage /></RoleRoute>} />
        <Route path="produce" element={<RoleRoute path="/produce"><ProducePage /></RoleRoute>} />
        <Route path="settings" element={<RoleRoute path="/settings"><SettingsPage /></RoleRoute>} />
      </Route>

      {/* Backwards-compat: old root + unknown URLs land on the dashboard if signed in,
          otherwise the protected route bounces them to /welcome. */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="livestock" element={<RoleRoute path="/livestock"><LivestockPage /></RoleRoute>} />
        <Route path="crops" element={<RoleRoute path="/crops"><CropsPage /></RoleRoute>} />
        <Route path="inventory" element={<RoleRoute path="/inventory"><InventoryPage /></RoleRoute>} />
        <Route path="workforce" element={<RoleRoute path="/workforce"><WorkforcePage /></RoleRoute>} />
        <Route path="commerce" element={<RoleRoute path="/commerce"><CommercePage /></RoleRoute>} />
        <Route path="produce" element={<RoleRoute path="/produce"><ProducePage /></RoleRoute>} />
        <Route path="settings" element={<RoleRoute path="/settings"><SettingsPage /></RoleRoute>} />
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
