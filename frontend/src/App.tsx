import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { Layout } from './components/Layout';
import { RoleRoute } from './components/RoleRoute';
import { AlertsPage } from './pages/AlertsPage';
import { AreasPage } from './pages/AreasPage';
import { DashboardPage } from './pages/DashboardPage';
import { DevicesPage } from './pages/DevicesPage';
import { EnvironmentPage } from './pages/EnvironmentPage';
import { HistoryPage } from './pages/HistoryPage';
import { IntegrationPage } from './pages/IntegrationPage';
import { LoginPage } from './pages/LoginPage';
import { TasksPage } from './pages/TasksPage';
import { ThresholdsPage } from './pages/ThresholdsPage';
import { UsersPage } from './pages/UsersPage';

export default function App() {
  const { user } = useAuth();

  if (!user) {
    return <LoginPage />;
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route
          path="environment"
          element={
            <RoleRoute roles={['owner', 'technician']}>
              <EnvironmentPage />
            </RoleRoute>
          }
        />
        <Route path="devices" element={<DevicesPage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route
          path="integration"
          element={
            <RoleRoute roles={['admin', 'owner', 'technician']}>
              <IntegrationPage />
            </RoleRoute>
          }
        />
        <Route
          path="history"
          element={
            <RoleRoute roles={['owner', 'technician']}>
              <HistoryPage />
            </RoleRoute>
          }
        />
        <Route
          path="thresholds"
          element={
            <RoleRoute roles={['admin', 'owner']}>
              <ThresholdsPage />
            </RoleRoute>
          }
        />
        <Route
          path="areas"
          element={
            <RoleRoute roles={['admin', 'owner']}>
              <AreasPage />
            </RoleRoute>
          }
        />
        <Route
          path="tasks"
          element={
            <RoleRoute roles={['admin', 'technician']}>
              <TasksPage />
            </RoleRoute>
          }
        />
        <Route
          path="users"
          element={
            <RoleRoute roles={['admin']}>
              <UsersPage />
            </RoleRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
