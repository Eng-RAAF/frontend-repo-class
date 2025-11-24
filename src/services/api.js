// API Base URL
// In development: uses '/api' which is proxied to http://localhost:3000 via vite.config.js
// In production: uses VITE_API_URL environment variable if set, otherwise '/api'
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Debug logging (only in development)
if (import.meta.env.DEV) {
  console.log('🔧 Development mode - API Base URL:', API_BASE_URL);
  console.log('🔧 Vite proxy should forward /api to http://localhost:3000');
}

// Generic API functions
const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    // Get response text first to check if it's empty
    const text = await response.text();
    
    if (!response.ok) {
      // Try to parse as JSON, fallback to status text
      let errorMessage = 'Something went wrong';
      try {
        if (text) {
          const error = JSON.parse(text);
          errorMessage = error.error || error.message || errorMessage;
        } else {
          errorMessage = response.statusText || errorMessage;
        }
      } catch (e) {
        errorMessage = text || response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
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
      const errorMessage = 'Network error: Could not connect to server.\n\n' +
        'Please check:\n' +
        '1. Backend server is running on http://localhost:3000\n' +
        '2. Frontend dev server is running (npm run dev)\n' +
        '3. No firewall blocking the connection';
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
  register: (name, email, password, role, phoneNumber, otp) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role, phoneNumber, otp })
    }),
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

