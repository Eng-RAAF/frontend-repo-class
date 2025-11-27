import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/schools', label: 'Schools', icon: '🏫' },
    { path: '/branches', label: 'Branches', icon: '🏢' },
    { path: '/students', label: 'Students', icon: '👨‍🎓' },
    { path: '/classes', label: 'Classes', icon: '📚' },
    { path: '/teachers', label: 'Teachers', icon: '👨‍🏫' },
    { path: '/enrollments', label: 'Enrollments', icon: '📝' },
    { path: '/users', label: 'Users', icon: '👤' },
    { path: '/chat', label: 'Messages', icon: '💬' },
    { path: '/reports', label: 'Reports', icon: '📈' },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-gradient-to-b from-indigo-900 to-indigo-800 shadow-xl transition-transform">
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
  );
}

export default Sidebar;

