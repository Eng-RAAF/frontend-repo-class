// Role definitions
export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student'
};

// Check if user has specific role
export const hasRole = (user, role) => {
  return user?.role === role;
};

// Check if user is admin
export const isAdmin = (user) => {
  return user?.role === ROLES.ADMIN;
};

// Check if user is teacher or admin
export const isTeacherOrAdmin = (user) => {
  return user?.role === ROLES.TEACHER || user?.role === ROLES.ADMIN;
};

// Check if user is student
export const isStudent = (user) => {
  return user?.role === ROLES.STUDENT;
};

// Check if user has any of the specified roles
export const hasAnyRole = (user, roles) => {
  return roles.includes(user?.role);
};

// Get role display name
export const getRoleDisplayName = (role) => {
  const names = {
    [ROLES.ADMIN]: 'Administrator',
    [ROLES.TEACHER]: 'Teacher',
    [ROLES.STUDENT]: 'Student'
  };
  return names[role] || role;
};

// Get role badge color
export const getRoleBadgeColor = (role) => {
  const colors = {
    [ROLES.ADMIN]: 'bg-red-100 text-red-800',
    [ROLES.TEACHER]: 'bg-blue-100 text-blue-800',
    [ROLES.STUDENT]: 'bg-green-100 text-green-800'
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
};

// Permission checks for specific actions
export const canViewStudents = (user) => {
  return hasAnyRole(user, [ROLES.ADMIN, ROLES.TEACHER]);
};

export const canCreateStudents = (user) => {
  return isAdmin(user);
};

export const canEditStudents = (user) => {
  return isAdmin(user);
};

export const canDeleteStudents = (user) => {
  return isAdmin(user);
};

export const canViewTeachers = (user) => {
  return hasAnyRole(user, [ROLES.ADMIN, ROLES.TEACHER]);
};

export const canManageTeachers = (user) => {
  return isAdmin(user);
};

export const canManageClasses = (user) => {
  return isAdmin(user);
};

export const canManageEnrollments = (user) => {
  return hasAnyRole(user, [ROLES.ADMIN, ROLES.TEACHER]);
};

export const canManageUsers = (user) => {
  return isAdmin(user);
};

export const canViewAnalytics = (user) => {
  return hasAnyRole(user, [ROLES.ADMIN, ROLES.TEACHER]);
};

export const canManageSchools = (user) => {
  return isAdmin(user);
};

export default {
  ROLES,
  hasRole,
  isAdmin,
  isTeacherOrAdmin,
  isStudent,
  hasAnyRole,
  getRoleDisplayName,
  getRoleBadgeColor,
  canViewStudents,
  canCreateStudents,
  canEditStudents,
  canDeleteStudents,
  canViewTeachers,
  canManageTeachers,
  canManageClasses,
  canManageEnrollments,
  canManageUsers,
  canViewAnalytics,
  canManageSchools
};

