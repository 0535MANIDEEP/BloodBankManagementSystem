import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

// UI Layouts
import DashboardLayout from '../layouts/DashboardLayout';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Donor Pages
import DonorDashboard from '../pages/donor/DonorDashboard';
import DonateForm from '../pages/donor/DonateForm';
import DonorProfile from '../pages/donor/DonorProfile';

// Hospital Pages
import HospitalDashboard from '../pages/hospital/HospitalDashboard';
import RequestBlood from '../pages/hospital/RequestBlood';
import TrackRequests from '../pages/hospital/TrackRequests';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageInventory from '../pages/admin/ManageInventory';
import ManageRequests from '../pages/admin/ManageRequests';
import ManageDonors from '../pages/admin/ManageDonors';

// Protective Route Guard
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { token, initialized } = useAuthStore();

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-darkbg">
        <div className="flex flex-col items-center gap-2">
          <svg className="animate-spin h-8 w-8 text-blood" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm font-semibold text-slate-500">Checking credentials...</span>
        </div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Role-based Access Guard
interface RoleGuardProps {
  allowedRoles: ('admin' | 'donor' | 'hospital')[];
  children: React.ReactNode;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect based on current role
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'donor') return <Navigate to="/donor/dashboard" replace />;
    if (user.role === 'hospital') return <Navigate to="/hospital/dashboard" replace />;
  }

  return <>{children}</>;
};

// Root Redirect Component
const RootRedirect: React.FC = () => {
  const { token, user } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'donor') return <Navigate to="/donor/dashboard" replace />;
    if (user.role === 'hospital') return <Navigate to="/hospital/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected App Routes */}
      <Route path="/" element={<ProtectedRoute><RootRedirect /></ProtectedRoute>} />

      {/* Donor Workspaces */}
      <Route
        path="/donor"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['donor']}>
              <DashboardLayout />
            </RoleGuard>
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DonorDashboard />} />
        <Route path="donate" element={<DonateForm />} />
        <Route path="profile" element={<DonorProfile />} />
      </Route>

      {/* Hospital Workspaces */}
      <Route
        path="/hospital"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['hospital']}>
              <DashboardLayout />
            </RoleGuard>
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<HospitalDashboard />} />
        <Route path="request" element={<RequestBlood />} />
        <Route path="track" element={<TrackRequests />} />
      </Route>

      {/* Admin Workspaces */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['admin']}>
              <DashboardLayout />
            </RoleGuard>
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="inventory" element={<ManageInventory />} />
        <Route path="requests" element={<ManageRequests />} />
        <Route path="donors" element={<ManageDonors />} />
      </Route>

      {/* Catch-all Fallback */}
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
};

export default AppRoutes;
