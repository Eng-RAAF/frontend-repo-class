import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  isSuperAdmin,
  isAdmin,
  isTeacherOrAdmin,
  canViewStudents,
  canViewTeachers,
  canViewClasses,
  canViewEnrollments,
  canViewUsers,
  canViewMessages,
  canViewReports,
  canViewSchools,
  canViewBranches,
  canViewDashboard,
  canViewLessonPlans,
  canChangeRoles
} from '../utils/roleHelper';

function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Filter navigation links based on user permissions
  const navLinks = useMemo(() => {
    if (!user) return [];

    const allLinks = [
      { path: '/', label: 'Dashboard', icon: '📊', canAccess: canViewDashboard(user) },
      { path: '/schools', label: 'Schools', icon: '🏫', canAccess: canViewSchools(user) },
      { path: '/branches', label: 'Branches', icon: '🏢', canAccess: canViewBranches(user) },
      { path: '/students', label: 'Students', icon: '👨‍🎓', canAccess: canViewStudents(user) },
      { path: '/classes', label: 'Classes', icon: '📚', canAccess: canViewClasses(user) },
      { path: '/teachers', label: 'Teachers', icon: '👨‍🏫', canAccess: canViewTeachers(user) },
      { path: '/lesson-plans', label: 'Lesson Plans', icon: '📋', canAccess: canViewLessonPlans(user) },
      { path: '/enrollments', label: 'Enrollments', icon: '📝', canAccess: canViewEnrollments(user) },
      { path: '/users', label: 'Users', icon: '👤', canAccess: canViewUsers(user) },
      { path: '/chat', label: 'Messages', icon: '💬', canAccess: canViewMessages(user) },
      { path: '/reports', label: 'Reports', icon: '📈', canAccess: canViewReports(user) },
      { path: '/role-management', label: 'Role Management', icon: '👑', canAccess: canChangeRoles(user) },
    ];

    // Filter out links user doesn't have access to
    return allLinks.filter(link => link.canAccess);
  }, [user]);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-colors"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 bg-gradient-to-b from-indigo-900 to-indigo-800 shadow-xl transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex h-full flex-col overflow-y-auto px-3 py-4">
        {/* Logo */}
        <div className="mb-8 flex items-center px-3 py-2">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white bg-opacity-20">
              <span className="text-2xl">🎓</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">ClassManager</h1>
              <p className="text-xs text-indigo-200">Management System</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <ul className="space-y-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-indigo-900 shadow-lg'
                      : 'text-indigo-100 hover:bg-white hover:bg-opacity-10 hover:text-white'
                  }`}
                >
                  <span className="mr-3 text-xl">{link.icon}</span>
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-indigo-900"></span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Bottom Section */}
        <div className="mt-auto border-t border-indigo-700 pt-4">
          <div className="px-3 py-2">
            <div className="rounded-lg bg-white bg-opacity-10 p-3">
              <p className="text-xs font-medium text-indigo-200">Need Help?</p>
              <p className="mt-1 text-xs text-indigo-300">
                Contact support for assistance
              </p>
            </div>
          </div>
        </div>
      </div>
      </aside>
    </>
  );
}

export default Sidebar;

