import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import Students from './pages/Students';
import Classes from './pages/Classes';
import Teachers from './pages/Teachers';
import Enrollments from './pages/Enrollments';
import Users from './pages/Users';
import Chat from './pages/Chat';
import Reports from './pages/Reports';
import Dashboard from './pages/Dashboard';
import Schools from './pages/Schools';
import Branches from './pages/Branches';
import RoleManagement from './pages/RoleManagement';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Check both isAuthenticated and user, with localStorage fallback
  // This handles the case where state hasn't updated yet after login
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  const hasAuth = isAuthenticated && user || (token && storedUser);

  if (!hasAuth) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Main App Layout
const AppLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 lg:ml-64 w-full lg:w-[calc(100%-16rem)]">
        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pt-16 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <Routes>
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/schools" element={<ProtectedRoute><Schools /></ProtectedRoute>} />
              <Route path="/branches" element={<ProtectedRoute><Branches /></ProtectedRoute>} />
              <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
              <Route path="/classes" element={<ProtectedRoute><Classes /></ProtectedRoute>} />
              <Route path="/teachers" element={<ProtectedRoute><Teachers /></ProtectedRoute>} />
              <Route path="/enrollments" element={<ProtectedRoute><Enrollments /></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
              <Route path="/role-management" element={<ProtectedRoute><RoleManagement /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            </Routes>
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

// Login Route Component - redirects if already authenticated
const LoginRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <Login />;
};

// Register Route Component - redirects if already authenticated
const RegisterRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <Register />;
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/register" element={<RegisterRoute />} />
        <Route path="/*" element={<AppLayout />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
