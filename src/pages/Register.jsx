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
    phoneNumber: '',
    otp: '',
    role: 'user'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [verifyingOTP, setVerifyingOTP] = useState(false);
  const [receivedOTP, setReceivedOTP] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSendOTP = async () => {
    if (!formData.phoneNumber || formData.phoneNumber.trim() === '') {
      setError('Please enter a phone number');
      return;
    }

    setSendingOTP(true);
    setError('');

    try {
      console.log('Requesting OTP for:', formData.phoneNumber);
      const response = await authAPI.sendOTP(formData.phoneNumber);
      console.log('OTP Response received:', response);
      
      setOtpSent(true);
      
      // In development mode, OTP is returned in response for testing
      // In production, it would be sent via SMS
      if (response && response.otp) {
        const otpCode = response.otp;
        console.log('📱 OTP Code:', otpCode);
        
        // Store OTP to display in UI
        setReceivedOTP(otpCode);
        
        // Show OTP in a prominent alert
        try {
          alert(
            `🔐 OTP CODE\n\n` +
            `Your verification code: ${otpCode}\n\n` +
            `This code is valid for 5 minutes.\n\n` +
            `(Development Mode - In production this would be sent via SMS)`
          );
        } catch (e) {
          console.log('Alert blocked, OTP is displayed below');
        }
        
        // Try to copy to clipboard automatically
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(otpCode).then(() => {
            console.log('✅ OTP copied to clipboard');
          }).catch((err) => {
            console.log('Could not copy to clipboard:', err);
          });
        }
      } else {
        // Production mode - OTP sent via SMS
        console.log('Production mode - OTP sent via SMS');
        setReceivedOTP(''); // Clear OTP display
        alert('✅ OTP sent to your phone number! Please check your SMS.');
      }
    } catch (err) {
      console.error('Send OTP error:', err);
      console.error('Error details:', err);
      const errorMessage = err.message || 'Failed to send OTP. Please check the browser console for details.';
      setError(errorMessage);
      alert(`Error: ${errorMessage}\n\nCheck the browser console (F12) for more details.`);
    } finally {
      setSendingOTP(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!formData.otp) {
      setError('Please enter the OTP');
      return;
    }

    setVerifyingOTP(true);
    setError('');

    try {
      await authAPI.verifyOTP(formData.phoneNumber, formData.otp);
      setOtpVerified(true);
      setReceivedOTP(''); // Clear OTP display after verification
      alert('Phone number verified successfully!');
    } catch (err) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setVerifyingOTP(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
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

    // Phone number and OTP verification are both optional
    // Users can register with phone number without verification if they want

    try {
      const response = await authAPI.register(
        formData.name,
        formData.email,
        formData.password,
        formData.role,
        formData.phoneNumber,
        formData.otp
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
      console.error('Registration error:', err);
      console.error('Error details:', {
        message: err.message,
        name: err.name,
        stack: err.stack
      });
      
      // Show more helpful error message
      let errorMessage = err.message || 'Registration failed. Please try again.';
      
      // Check if it's a network error
      if (err.message && err.message.includes('Network error')) {
        errorMessage = err.message + '\n\nMake sure:\n• Backend server is running (cd backend && npm run dev)\n• Frontend dev server is running (cd frontend && npm run dev)';
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
              <span className="block sm:inline">{error}</span>
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
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Phone Number <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  autoComplete="tel"
                  className="flex-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="+1234567890 (Optional)"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={sendingOTP || !formData.phoneNumber || formData.phoneNumber.trim() === ''}
                  className="inline-flex items-center px-4 py-3 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-700 text-sm font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingOTP ? 'Sending...' : otpSent ? 'Resend OTP' : 'Verify (Optional)'}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Phone verification is optional. You can register without verifying your phone number.
              </p>
              {otpSent && (
                <div className="mt-2">
                  {receivedOTP && (
                    <div className="mb-3 p-3 bg-green-50 border-2 border-green-400 rounded-lg">
                      <p className="text-xs text-green-700 font-semibold mb-1">
                        🔐 Your OTP Code (Development Mode):
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-2xl font-mono font-bold text-green-800 tracking-widest">
                          {receivedOTP}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(receivedOTP);
                            alert('OTP copied to clipboard!');
                          }}
                          className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Copy
                        </button>
                      </div>
                      <p className="text-xs text-green-600 mt-1">
                        Valid for 5 minutes • In production, this would be sent via SMS
                      </p>
                    </div>
                  )}
                  {!receivedOTP && (
                    <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-xs text-blue-700 font-medium">
                        💡 Check browser console (F12) for OTP or check alert popup
                      </p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      maxLength="6"
                      pattern="[0-9]{6}"
                      inputMode="numeric"
                      className="flex-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm text-center text-lg font-mono tracking-widest"
                      placeholder="000000 (Optional)"
                      value={formData.otp}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOTP}
                      disabled={verifyingOTP || !formData.otp || formData.otp.length !== 6}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {verifyingOTP ? 'Verifying...' : 'Verify (Optional)'}
                    </button>
                  </div>
                  {otpVerified && (
                    <p className="mt-2 text-sm text-green-600 font-medium">✓ Phone number verified (optional)</p>
                  )}
                  {!otpVerified && formData.phoneNumber && (
                    <p className="mt-2 text-xs text-gray-500">You can register without verifying your phone number</p>
                  )}
                </div>
              )}
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
                <option value="user">User</option>
                <option value="admin">Admin</option>
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

