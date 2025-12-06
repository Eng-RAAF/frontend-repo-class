// Role definitions
export const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student'
};

// Check if user has specific role
export const hasRole = (user, role) => {
  return user?.role === role;
};

// Check if user is super admin
export const isSuperAdmin = (user) => {
  return user?.role === ROLES.SUPERADMIN;
};

// Check if user is admin (includes super admin)
export const isAdmin = (user) => {
  return user?.role === ROLES.ADMIN || user?.role === ROLES.SUPERADMIN;
};

// Check if user is teacher or admin
export const isTeacherOrAdmin = (user) => {
  return user?.role === ROLES.TEACHER || user?.role === ROLES.ADMIN || user?.role === ROLES.SUPERADMIN;
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
    [ROLES.SUPERADMIN]: 'Super Administrator',
    [ROLES.ADMIN]: 'Administrator',
    [ROLES.TEACHER]: 'Teacher',
    [ROLES.STUDENT]: 'Student'
  };
  return names[role] || role;
};

// Get role badge color
export const getRoleBadgeColor = (role) => {
  const colors = {
    [ROLES.SUPERADMIN]: 'bg-purple-100 text-purple-800',
    [ROLES.ADMIN]: 'bg-red-100 text-red-800',
    [ROLES.TEACHER]: 'bg-blue-100 text-blue-800',
    [ROLES.STUDENT]: 'bg-green-100 text-green-800'
  };
  return colors[role] || 'bg-gray-100 text-gray-800'
;
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

export const canManageAdmins = (user) => {
  return isSuperAdmin(user);
};

export const canChangeRoles = (user) => {
  return isSuperAdmin(user);
};

export const canDeleteUsers = (user) => {
  return isSuperAdmin(user);
};

export const canViewAnalytics = (user) => {
  return hasAnyRole(user, [ROLES.ADMIN, ROLES.TEACHER]);
};

export const canManageSchools = (user) => {
  return isAdmin(user);
};

export const canViewSchools = (user) => {
  return isTeacherOrAdmin(user);
};

export const canViewBranches = (user) => {
  return isTeacherOrAdmin(user);
};

export const canViewClasses = (user) => {
  return isTeacherOrAdmin(user);
};

export const canViewEnrollments = (user) => {
  return isTeacherOrAdmin(user);
};

export const canViewUsers = (user) => {
  return isAdmin(user);
};

export const canViewMessages = (user) => {
  return true; // All authenticated users can view messages
};

export const canViewReports = (user) => {
  return isTeacherOrAdmin(user);
};

export const canViewDashboard = (user) => {
  return true; // All authenticated users can view dashboard
};

export default {
  ROLES,
  hasRole,
  isSuperAdmin,
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
  canManageAdmins,
  canChangeRoles,
  canDeleteUsers,
  canViewAnalytics,
  canManageSchools
};

