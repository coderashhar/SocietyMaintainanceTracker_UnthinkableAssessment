import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Navbar from './components/Navbar.jsx';

// Pages
import Login              from './pages/Login.jsx';
import Register           from './pages/Register.jsx';
import ResidentDashboard  from './pages/ResidentDashboard.jsx';
import RaiseComplaint     from './pages/RaiseComplaint.jsx';
import ComplaintDetail    from './pages/ComplaintDetail.jsx';
import AdminDashboard     from './pages/AdminDashboard.jsx';
import AdminComplaints    from './pages/AdminComplaints.jsx';
import NoticeBoard        from './pages/NoticeBoard.jsx';

/**
 * Inner router — rendered inside AuthProvider so it can access useAuth()
 */
function AppRoutes() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <div className={user ? 'app-layout' : ''}>
        {user && <Navbar />}
        <main className={user ? 'main-content' : ''}>
          <Routes>
            {/* Public */}
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Resident routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute role="resident">
                <ResidentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/complaints/new" element={
              <ProtectedRoute role="resident">
                <RaiseComplaint />
              </ProtectedRoute>
            } />
            <Route path="/complaints/:id" element={
              <ProtectedRoute role="resident">
                <ComplaintDetail />
              </ProtectedRoute>
            } />

            {/* Admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/complaints" element={
              <ProtectedRoute role="admin">
                <AdminComplaints />
              </ProtectedRoute>
            } />
            <Route path="/admin/complaints/:id" element={
              <ProtectedRoute role="admin">
                <ComplaintDetail />
              </ProtectedRoute>
            } />

            {/* Shared */}
            <Route path="/notices" element={
              <ProtectedRoute>
                <NoticeBoard />
              </ProtectedRoute>
            } />

            {/* Root redirect */}
            <Route path="/" element={
              user
                ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
                : <Navigate to="/login" replace />
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
