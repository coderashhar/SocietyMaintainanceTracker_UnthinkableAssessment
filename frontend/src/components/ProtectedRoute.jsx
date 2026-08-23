import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Wraps a route to require authentication + optional role check.
 *
 * Usage:
 *   <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
 *   <ProtectedRoute><ResidentDashboard /></ProtectedRoute>
 */
export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner" />
        <span>Authenticating…</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    // Redirect to the correct dashboard instead of showing 403 page
    const target = user.role === 'admin' ? '/admin' : '/dashboard';
    return <Navigate to={target} replace />;
  }

  return children;
}
