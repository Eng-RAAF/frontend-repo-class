// API Base URL
// In development: uses '/api' which is proxied to http://localhost:3000 via vite.config.js
// In production: uses VITE_API_URL environment variable + '/api' prefix
// VITE_API_URL should be your backend base URL (e.g., https://your-backend.vercel.app)
// We automatically add '/api' to it since all backend routes are under /api
let API_BASE_URL;
if (import.meta.env.DEV) {
  // Development: use proxy
  API_BASE_URL = '/api';
} else {
  // Production: use VITE_API_URL + /api
  const baseUrl = import.meta.env.VITE_API_URL || '';
  if (baseUrl) {
    // Remove trailing slash if present, then add /api
    API_BASE_URL = baseUrl.replace(/\/$/, '') + '/api';
  } else {
    API_BASE_URL = '';
  }
}

// Debug logging
if (import.meta.env.DEV) {
  console.log('🔧 Development mode - API Base URL:', API_BASE_URL);
  console.log('🔧 Vite proxy should forward /api to http://localhost:3000');
} else {
  console.log('🔧 Production mode - API Base URL:', API_BASE_URL || 'NOT SET');
  if (!API_BASE_URL) {
    console.error('❌ VITE_API_URL is not set!');
    console.error('❌ Please set VITE_API_URL environment variable in Vercel to your backend URL');
    console.error('❌ Example: https://your-backend.vercel.app');
    console.error('❌ (Do NOT include /api in the URL - it will be added automatically)');
  } else {
    console.log('✅ API Base URL configured:', API_BASE_URL);
  }
}

// Generic API functions
const apiRequest = async (endpoint, options = {}) => {
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  
  // Get token from localStorage
  const token = localStorage.getItem('token');
  
  // Log the request for debugging
  if (!import.meta.env.DEV) {
    console.log('🌐 API Request:', fullUrl);
  }
  
  try {
    const response = await fetch(fullUrl, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    // Get response text first to check if it's empty
    const text = await response.text();
    
    if (!response.ok) {
      // Try to parse as JSON, fallback to status text
      let errorMessage = 'Something went wrong';
      let errorDetails = null;
      
      try {
        if (text) {
          const error = JSON.parse(text);
          errorMessage = error.error || error.message || errorMessage;
          errorDetails = error.details; // Include details if available
        } else {
          errorMessage = response.statusText || errorMessage;
        }
      } catch (e) {
        errorMessage = text || response.statusText || errorMessage;
      }
      
      // Create error with more context
      const apiError = new Error(errorMessage);
      if (errorDetails) {
        apiError.details = errorDetails;
      }
      apiError.status = response.status;
      throw apiError;
    }

    // Parse JSON only if there's content
    if (!text || text.trim() === '') {
      return null; // Empty response
    }

    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error('Invalid JSON response from server');
    }
  } catch (error) {
    // Re-throw with more context if it's a network error
    if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
      const isProduction = !import.meta.env.DEV;
      let errorMessage = 'Network error: Could not connect to server.\n\n';
      
      // Add diagnostic information
      console.error('❌ Network Error Details:');
      console.error('   - API Base URL:', API_BASE_URL || 'NOT SET');
      console.error('   - Full URL attempted:', fullUrl);
      console.error('   - Endpoint:', endpoint);
      console.error('   - Error:', error.message);
      
      if (isProduction) {
        if (!API_BASE_URL) {
          errorMessage += '❌ VITE_API_URL is not set!\n\n' +
            'To fix this:\n' +
            '1. Go to your Frontend project in Vercel Dashboard\n' +
            '2. Navigate to Settings → Environment Variables\n' +
            '3. Add VITE_API_URL with your backend URL (e.g., https://your-backend.vercel.app)\n' +
            '4. Make sure to set it for Production, Preview, and Development\n' +
            '5. Redeploy your frontend after adding the variable\n\n' +
            'Note: Do NOT include /api in the URL - it is added automatically';
        } else {
          errorMessage += 'Production Mode - Connection Failed:\n\n' +
            '1. Verify VITE_API_URL is correct: ' + (import.meta.env.VITE_API_URL || 'NOT SET') + '\n' +
            '2. Check that backend is deployed: Visit ' + (import.meta.env.VITE_API_URL || 'your-backend-url') + ' in browser\n' +
            '3. Check Vercel backend logs: Go to Backend project → Functions → View logs\n' +
            '4. Verify CORS: Check that FRONTEND_URL is set in backend environment variables\n' +
            '5. Test backend directly: Try ' + fullUrl + ' in browser or Postman\n\n' +
            'Current API Base URL: ' + API_BASE_URL;
        }
      } else {
        errorMessage += 'Development Mode:\n' +
          '1. Backend server is running on http://localhost:3000\n' +
          '2. Frontend dev server is running (npm run dev)\n' +
          '3. No firewall blocking the connection\n' +
          '4. Check that Vite proxy is configured in vite.config.js';
      }
      
      console.error('Network error details:', error);
      throw new Error(errorMessage);
    }
    throw error;
  }
};

// Students API
export const studentsAPI = {
  getAll: () => apiRequest('/students'),
  getById: (id) => apiRequest(`/students/${id}`),
  create: (data) => apiRequest('/students', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiRequest(`/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiRequest(`/students/${id}`, { method: 'DELETE' }),
};

// Classes API
export const classesAPI = {
  getAll: () => apiRequest('/classes'),
  getById: (id) => apiRequest(`/classes/${id}`),
  create: (data) => apiRequest('/classes', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiRequest(`/classes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiRequest(`/classes/${id}`, { method: 'DELETE' }),
};

// Teachers API
export const teachersAPI = {
  getAll: () => apiRequest('/teachers'),
  getById: (id) => apiRequest(`/teachers/${id}`),
  create: (data) => apiRequest('/teachers', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiRequest(`/teachers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiRequest(`/teachers/${id}`, { method: 'DELETE' }),
};

// Enrollments API
export const enrollmentsAPI = {
  getAll: () => apiRequest('/enrollments'),
  getById: (id) => apiRequest(`/enrollments/${id}`),
  getByStudent: (studentId) => apiRequest(`/enrollments/student/${studentId}`),
  getByClass: (classId) => apiRequest(`/enrollments/class/${classId}`),
  create: (data) => apiRequest('/enrollments', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id) => apiRequest(`/enrollments/${id}`, { method: 'DELETE' }),
  unenroll: (studentId, classId) =>
    apiRequest(`/enrollments/student/${studentId}/class/${classId}`, { method: 'DELETE' }),
};

// Authentication API
export const authAPI = {
  login: async (email, password) => {
    try {
      console.log('Login API: Attempting login for:', email);
      const response = await apiRequest('/auth/login', { 
        method: 'POST', 
        body: JSON.stringify({ email, password }) 
      });
      console.log('Login API: Success, response received');
      return response;
    } catch (error) {
      console.error('Login API error:', error);
      console.error('Error message:', error.message);
      console.error('Error name:', error.name);
      // Make sure we throw a clear error message
      if (error.message) {
        throw error;
      }
      throw new Error('Login failed. Please check your credentials and try again.');
    }
  },
  sendOTP: async (phoneNumber) => {
    try {
      console.log('Sending OTP request for:', phoneNumber);
      const response = await apiRequest('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber })
      });
      console.log('Send OTP response:', response);
      return response;
    } catch (error) {
      console.error('Send OTP API error:', error);
      throw error;
    }
  },
  verifyOTP: (phoneNumber, otp) =>
    apiRequest('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, otp })
    }),
  register: async (name, email, password, role) => {
    try {
      console.log('Register API: Calling /auth/register');
      console.log('Register API: Base URL:', API_BASE_URL);
      console.log('Register API: Full URL:', `${API_BASE_URL}/auth/register`);
      console.log('Register API: Data:', { name, email, hasPassword: !!password, role });
      
      if (!API_BASE_URL && !import.meta.env.DEV) {
        throw new Error('VITE_API_URL is not configured. Please set it in Vercel environment variables to your backend URL (e.g., https://your-backend.vercel.app)');
      }
      
      const response = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role })
      });
      console.log('Register API: Success, response received');
      return response;
    } catch (error) {
      console.error('Register API error:', error);
      console.error('Error message:', error.message);
      console.error('Error status:', error.status);
      console.error('Error details:', error.details);
      console.error('API_BASE_URL:', API_BASE_URL);
      throw error;
    }
  },
  verify: () => {
    const token = localStorage.getItem('token');
    return apiRequest('/auth/verify', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// Users API
export const usersAPI = {
  getAll: () => apiRequest('/users'),
  getById: (id) => apiRequest(`/users/${id}`),
  create: (data) => apiRequest('/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiRequest(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiRequest(`/users/${id}`, { method: 'DELETE' }),
};

// Messages API
export const messagesAPI = {
  getAll: (userId) => apiRequest(`/messages?userId=${userId}`),
  getConversation: (userId1, userId2) => apiRequest(`/messages/conversation?userId1=${userId1}&userId2=${userId2}`),
  getUnreadCount: (userId) => apiRequest(`/messages/unread/${userId}`),
  create: (data) => apiRequest('/messages', { method: 'POST', body: JSON.stringify(data) }),
  markAsRead: (id) => apiRequest(`/messages/${id}/read`, { method: 'PUT' }),
  delete: (id) => apiRequest(`/messages/${id}`, { method: 'DELETE' }),
};

// Analytics API
export const analyticsAPI = {
  getStats: () => apiRequest('/analytics/stats'),
  getEnrollmentsByClass: () => apiRequest('/analytics/enrollments-by-class'),
  getStudentsByGrade: () => apiRequest('/analytics/students-by-grade'),
  getRecentEnrollments: (limit = 10) => apiRequest(`/analytics/recent-enrollments?limit=${limit}`),
  getClassCapacity: () => apiRequest('/analytics/class-capacity'),
  getActivityTimeline: (limit = 20) => apiRequest(`/analytics/activity-timeline?limit=${limit}`),
};

// Schools API
export const schoolsAPI = {
  getAll: () => apiRequest('/schools'),
  getById: (id) => apiRequest(`/schools/${id}`),
  create: (data) => apiRequest('/schools', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiRequest(`/schools/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiRequest(`/schools/${id}`, { method: 'DELETE' }),
};

// Branches API
export const branchesAPI = {
  getAll: () => apiRequest('/branches'),
  getById: (id) => apiRequest(`/branches/${id}`),
  getBySchool: (schoolId) => apiRequest(`/branches/school/${schoolId}`),
  create: (data) => apiRequest('/branches', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiRequest(`/branches/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiRequest(`/branches/${id}`, { method: 'DELETE' }),
};

// Lesson Plans API
export const lessonPlansAPI = {
  getAll: (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.teacherId) queryParams.append('teacherId', filters.teacherId);
    if (filters.classId) queryParams.append('classId', filters.classId);
    if (filters.status) queryParams.append('status', filters.status);
    const query = queryParams.toString();
    return apiRequest(`/lesson-plans${query ? `?${query}` : ''}`);
  },
  getById: (id) => apiRequest(`/lesson-plans/${id}`),
  create: (data) => apiRequest('/lesson-plans', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiRequest(`/lesson-plans/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiRequest(`/lesson-plans/${id}`, { method: 'DELETE' }),
};

// Super Admin API
export const superadminAPI = {
  getAllUsers: () => apiRequest('/superadmin/users/all'),
  getAllAdmins: () => apiRequest('/superadmin/admins'),
  getSystemStats: () => apiRequest('/superadmin/system/stats'),
  changeUserRole: (userId, role) => apiRequest(`/superadmin/users/${userId}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role })
  }),
  promoteToAdmin: (userId) => apiRequest(`/superadmin/users/${userId}/promote-admin`, {
    method: 'POST'
  }),
  demoteUser: (userId, role) => apiRequest(`/superadmin/users/${userId}/demote`, {
    method: 'POST',
    body: JSON.stringify({ role })
  }),
  deleteUser: (userId) => apiRequest(`/superadmin/users/${userId}`, {
    method: 'DELETE'
  }),
};

