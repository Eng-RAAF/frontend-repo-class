import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasAnyRole } from '../utils/roleHelper';

// Protected route that requires specific roles
export const RoleBasedRoute = ({ children, requiredRoles, redirectTo = '/' }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && !hasAnyRole(user, requiredRoles)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-8">
            You don't have permission to access this page.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Required role(s): {requiredRoles.join(', ')}
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Your role: {user.role}
          </p>
          <button
            onClick={() => window.location.href = redirectTo}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default RoleBasedRoute;

