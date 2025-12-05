import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { superadminAPI } from '../services/api';
import { isSuperAdmin, isAdmin, isTeacherOrAdmin, getRoleBadgeColor, getRoleDisplayName } from '../utils/roleHelper';
import Header from '../components/Header';

function RoleManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Check if user has access (Super Admin, Admin, or Teacher)
  useEffect(() => {
    if (user && !isTeacherOrAdmin(user)) {
      setError('Access denied. Only Super Administrators, Admins, and Teachers can access role management.');
      setLoading(false);
    }
  }, [user]);

  // Fetch all users (filtered by role)
  useEffect(() => {
    if (user && isTeacherOrAdmin(user)) {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await superadminAPI.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      setError(null);
      setSuccess(null);

      // Only Super Admins can change roles
      if (!isSuperAdmin(user)) {
        setError('Only Super Administrators can change user roles.');
        return;
      }

      // Prevent changing own role (but allow managing other superadmins)
      if (userId === user.id && role !== 'superadmin') {
        setError('You cannot change your own role. Super Admins cannot demote themselves.');
        return;
      }

      // Allow changing other superadmin roles - show warning for confirmation
      const targetUser = users.find(u => u.id === userId);
      if (targetUser && targetUser.role === 'superadmin' && userId !== user.id) {
        const confirmMessage = `Warning: You are about to change another Super Admin's role from "${getRoleDisplayName(targetUser.role)}" to "${getRoleDisplayName(role)}". This will affect their system access. Continue?`;
        if (!window.confirm(confirmMessage)) {
          return;
        }
      }

      await superadminAPI.changeUserRole(userId, role);
      setSuccess(`User role updated to ${getRoleDisplayName(role)} successfully!`);
      setEditingUser(null);
      setNewRole('');
      fetchUsers(); // Refresh list
    } catch (err) {
      console.error('Error changing role:', err);
      setError(err.message || 'Failed to change user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      setError(null);
      setSuccess(null);

      // Only Super Admins can delete users
      if (!isSuperAdmin(user)) {
        setError('Only Super Administrators can delete users.');
        return;
      }

      // Prevent deleting yourself (but allow deleting other superadmins)
      if (userId === user.id) {
        setError('You cannot delete your own account.');
        return;
      }

      // Allow deleting other superadmins - show strong warning
      const targetUser = users.find(u => u.id === userId);
      if (targetUser && targetUser.role === 'superadmin') {
        const confirmMessage = `⚠️ WARNING: You are about to DELETE another Super Administrator (${targetUser.name || targetUser.email}). This is a critical action that cannot be undone. Are you absolutely sure?`;
        if (!window.confirm(confirmMessage)) {
          return;
        }
      }

      await superadminAPI.deleteUser(userId);
      setSuccess('User deleted successfully!');
      fetchUsers(); // Refresh list
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.message || 'Failed to delete user');
    }
  };

  const startEditing = (user) => {
    setEditingUser(user.id);
    setNewRole(user.role);
  };

  const cancelEditing = () => {
    setEditingUser(null);
    setNewRole('');
  };

  // Filter users
  const filteredUsers = users.filter(u => {
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    const matchesSearch = 
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  // Count users by role
  const roleCounts = {
    all: users.length,
    superadmin: users.filter(u => u.role === 'superadmin').length,
    admin: users.filter(u => u.role === 'admin').length,
    teacher: users.filter(u => u.role === 'teacher').length,
    student: users.filter(u => u.role === 'student').length,
  };

  if (!user || !isTeacherOrAdmin(user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">Only Super Administrators, Admins, and Teachers can access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header title="Role Management" subtitle="Manage user roles and permissions" />

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Users</div>
          <div className="text-2xl font-bold text-gray-900">{roleCounts.all}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Super Admins</div>
          <div className="text-2xl font-bold text-purple-600">{roleCounts.superadmin}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Admins</div>
          <div className="text-2xl font-bold text-red-600">{roleCounts.admin}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Teachers</div>
          <div className="text-2xl font-bold text-blue-600">{roleCounts.teacher}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Students</div>
          <div className="text-2xl font-bold text-green-600">{roleCounts.student}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="w-full md:w-48">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="superadmin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Mobile Card View */}
        <div className="lg:hidden divide-y divide-gray-200">
          {filteredUsers.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500">No users found</div>
          ) : (
            filteredUsers.map((u) => (
              <div key={u.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{u.name || 'N/A'}</h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(u.role)}`}>
                        {getRoleDisplayName(u.role)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{u.email}</p>
                    {u.phoneNumber && (
                      <p className="text-xs text-gray-500 mt-1">{u.phoneNumber}</p>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  {isSuperAdmin(user) && (
                    <button
                      onClick={() => startEditing(u)}
                      className="text-sm text-indigo-600 hover:text-indigo-900"
                      disabled={u.id === user.id && u.role === 'superadmin'}
                    >
                      Change Role
                    </button>
                  )}
                  {isSuperAdmin(user) && u.id !== user.id && (
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className={`text-sm text-red-600 hover:text-red-900 ${u.role === 'superadmin' ? 'font-bold' : ''}`}
                    >
                      {u.role === 'superadmin' ? '⚠️ Delete' : 'Delete'}
                    </button>
                  )}
                  {!isSuperAdmin(user) && (
                    <span className="text-sm text-gray-400">View only</span>
                  )}
                </div>
                {editingUser === u.id && (
                  <div className="mt-3 flex flex-col gap-2">
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    >
                      <option value="superadmin">Super Admin</option>
                      <option value="admin">Admin</option>
                      <option value="teacher">Teacher</option>
                      <option value="student">Student</option>
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRoleChange(u.id, newRole)}
                        className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{u.name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">
                        {u.phoneNumber || 'No phone'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{u.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(u.role)}`}>
                        {getRoleDisplayName(u.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingUser === u.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="superadmin">Super Admin</option>
                            <option value="admin">Admin</option>
                            <option value="teacher">Teacher</option>
                            <option value="student">Student</option>
                          </select>
                          <button
                            onClick={() => handleRoleChange(u.id, newRole)}
                            className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {isSuperAdmin(user) && (
                            <button
                              onClick={() => startEditing(u)}
                              className="text-indigo-600 hover:text-indigo-900"
                              disabled={u.id === user.id && u.role === 'superadmin'}
                              title={u.id === user.id && u.role === 'superadmin' ? 'Cannot change your own role' : 'Change role'}
                            >
                              Change Role
                            </button>
                          )}
                          {isSuperAdmin(user) && u.id !== user.id && (
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className={`text-red-600 hover:text-red-900 ${u.role === 'superadmin' ? 'font-bold' : ''}`}
                              title={u.role === 'superadmin' ? 'Delete Super Admin (requires confirmation)' : 'Delete user'}
                            >
                              {u.role === 'superadmin' ? '⚠️ Delete' : 'Delete'}
                            </button>
                          )}
                          {!isSuperAdmin(user) && (
                            <span className="text-gray-400 text-sm">View only</span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Role Management Guidelines</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li><strong>Super Admins:</strong> Can see and manage ALL users (including other Super Admins)</li>
          <li><strong>Admins:</strong> Can see and manage Teachers and Students only</li>
          <li><strong>Teachers:</strong> Can see Students only</li>
          <li><strong>Students:</strong> Cannot access role management</li>
          <li className="mt-2 font-semibold">⚠️ Important:</li>
          <li>You cannot change your own role or delete your own account</li>
          <li>Super Admins can now edit and delete other Super Admins (with confirmation)</li>
          <li>Changing a Super Admin's role will affect their system access immediately</li>
        </ul>
      </div>

      {/* Role-based Visibility Info */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-purple-900 mb-2">👁️ Current View Access</h3>
        <p className="text-sm text-purple-800">
          {user.role === 'superadmin' && (
            <>You are viewing <strong>ALL users</strong> in the system. You can manage roles for all users, including other Super Admins.</>
          )}
          {user.role === 'admin' && (
            <>You are viewing <strong>Teachers and Students only</strong>. You cannot see or manage other Admins or Super Admins.</>
          )}
          {user.role === 'teacher' && (
            <>You are viewing <strong>Students only</strong>. You cannot see or manage Teachers, Admins, or Super Admins.</>
          )}
          {user.role === 'student' && (
            <>You do not have access to role management.</>
          )}
        </p>
      </div>
    </div>
  );
}

export default RoleManagement;

