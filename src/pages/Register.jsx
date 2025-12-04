import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    //qurux
    if (!formData.name || !formData.email || !formData.password) {
      setError('Name, email, and password are required');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.register(
        formData.name,
        formData.email,
        formData.password,
        formData.role
      );

      // Check if response has the expected structure
      if (!response || !response.user || !response.token) {
        throw new Error('Invalid response from server');
      }

      // Auto-login after registration
      login(response.user, response.token);

      // Navigate to dashboard
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 150);
    } catch (err) {
      console.error('=== REGISTRATION ERROR ===');
      console.error('Error:', err);
      console.error('Error message:', err.message);
      console.error('Error name:', err.name);
      console.error('Error stack:', err.stack);
      console.error('Error details:', err.details);
      console.error('Error status:', err.status);
      console.error('Error code:', err.code);
      console.error('Full error object:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
      
      // Show more helpful error message
      let errorMessage = err.message || 'Registration failed. Please try again.';
      
      // Check if it's a network error
      if (err.message && (err.message.includes('Network error') || err.message.includes('fetch') || err.message.includes('Failed to fetch'))) {
        const isProduction = window.location.hostname !== 'localhost';
        if (isProduction) {
          errorMessage = 'Cannot connect to server. Please check:\n\n' +
            '1. Backend is deployed and running on Vercel\n' +
            '2. VITE_API_URL is set correctly in Vercel environment variables\n' +
            '3. Check Vercel backend logs for errors\n' +
            '4. Verify DATABASE_URL is set in backend environment variables';
        } else {
          errorMessage = err.message + '\n\nMake sure:\n• Backend server is running (cd backend && npm run dev)\n• Frontend dev server is running (cd frontend && npm run dev)';
        }
      }
      
      // Check for database errors
      if (err.message && (err.message.includes('Database') || err.message.includes('connection') || err.message.includes('Prisma') || err.message.includes('DATABASE_URL') || err.message.includes('Tenant or user not found'))) {
        if (err.message.includes('DATABASE_URL') || err.message.includes('must start with the protocol') || err.message.includes('postgresql://')) {
          errorMessage = 'Database Configuration Error: DATABASE_URL Missing or Invalid\n\n' +
            'The DATABASE_URL environment variable is not set correctly in Vercel.\n\n' +
            'To fix:\n' +
            '1. Go to Vercel Dashboard → Your Backend Project → Settings → Environment Variables\n' +
            '2. Check if DATABASE_URL exists (if not, add it)\n' +
            '3. DATABASE_URL must start with "postgresql://" or "postgres://"\n' +
            '4. Get connection string from your database provider dashboard\n' +
            '5. Format: postgresql://user:password@host:port/database\n' +
            '6. Make sure all credentials are correct\n' +
            '8. Make sure it\'s set for Production, Preview, and Development\n' +
            '9. Redeploy the backend after updating\n\n' +
            'This error means DATABASE_URL is missing, empty, or has invalid format.';
        } else if (err.message.includes('Tenant or user not found') || err.details?.includes('Invalid DATABASE_URL')) {
          errorMessage = 'Database Connection Error: Invalid DATABASE_URL\n\n' +
            'The database connection string in Vercel is incorrect.\n\n' +
            'To fix:\n' +
            '1. Get your PostgreSQL connection string from your database provider\n' +
            '2. Format: postgresql://user:password@host:port/database\n' +
            '3. Update DATABASE_URL in Vercel Backend → Settings → Environment Variables\n' +
            '4. Make sure username, password, host, and database name are correct\n' +
            '5. Redeploy the backend\n\n' +
            'This error means the credentials or connection details are incorrect.';
        } else {
          errorMessage = err.message + '\n\nThis is a database connection issue. Please check:\n• Database connection is active\n• DATABASE_URL is set correctly in Vercel\n• Check Vercel backend logs for details';
        }
      }
      
      // Check for validation errors
      if (err.status === 400 || err.message?.includes('already exists') || err.message?.includes('required')) {
        errorMessage = err.message || 'Invalid input. Please check your information and try again.';
      }
      
      // Include error details if available
      if (err.details) {
        errorMessage += `\n\nDetails: ${err.details}`;
      }
      
      // Include error code if available
      if (err.code) {
        errorMessage += `\n\nError Code: ${err.code}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900">
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign up for Class Management System
          </p>
        </div>

        <form className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-lg" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
              <div className="font-semibold mb-1">Registration Error:</div>
              <div className="whitespace-pre-wrap text-sm">{error}</div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter password (min. 6 characters)"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                id="role"
                name="role"
                className="mt-1 block w-full px-3 py-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;

