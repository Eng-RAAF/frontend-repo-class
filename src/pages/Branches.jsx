import { useState, useEffect } from 'react';
import { branchesAPI, schoolsAPI } from '../services/api';
import Modal from '../components/Modal';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { canManageSchools } from '../utils/roleHelper';

function Branches() {
  const { user } = useAuth();
  const [branches, setBranches] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    code: '', 
    schoolId: '', 
    address: '', 
    phone: '', 
    email: '', 
    manager: '', 
    description: '' 
  });

  useEffect(() => {
    fetchBranches();
    fetchSchools();
  }, []);

  const fetchBranches = async () => {
    try {
      const data = await branchesAPI.getAll();
      setBranches(data);
    } catch (error) {
      alert('Error fetching branches: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchools = async () => {
    try {
      const data = await schoolsAPI.getAll();
      setSchools(data);
    } catch (error) {
      console.error('Error fetching schools:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBranch) {
        await branchesAPI.update(editingBranch.id, formData);
      } else {
        await branchesAPI.create(formData);
      }
      setIsModalOpen(false);
      setEditingBranch(null);
      setFormData({ name: '', code: '', schoolId: '', address: '', phone: '', email: '', manager: '', description: '' });
      fetchBranches();
    } catch (error) {
      alert('Error saving branch: ' + error.message);
    }
  };

  const handleEdit = (branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name || '',
      code: branch.code || '',
      schoolId: branch.schoolId || '',
      address: branch.address || '',
      phone: branch.phone || '',
      email: branch.email || '',
      manager: branch.manager || '',
      description: branch.description || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this branch?')) {
      try {
        await branchesAPI.delete(id);
        fetchBranches();
      } catch (error) {
        alert('Error deleting branch: ' + error.message);
      }
    }
  };

  const openModal = () => {
    setEditingBranch(null);
    setFormData({ name: '', code: '', schoolId: '', address: '', phone: '', email: '', manager: '', description: '' });
    setIsModalOpen(true);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <Header
        title="Branches"
        subtitle="Manage school branch information and records"
        action={
          canManageSchools(user) && (
            <button
              onClick={openModal}
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 sm:px-6 py-2.5 rounded-lg hover:from-indigo-700 hover:to-indigo-800 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>+</span>
              <span>Add Branch</span>
            </button>
          )
        }
      />

      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {branches.length === 0 ? (
            <li className="px-6 py-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">🏢</div>
              <p className="text-gray-500 text-lg">No branches found</p>
              <p className="text-gray-400 text-sm mt-2">Add your first branch to get started</p>
            </li>
          ) : (
            branches.map((branch) => (
              <li key={branch.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg">
                        🏢
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900">{branch.name}</h3>
                      <p className="text-sm text-gray-600">Code: {branch.code}</p>
                      {branch.school && (
                        <p className="text-sm text-indigo-600">School: {branch.school.name}</p>
                      )}
                      <div className="mt-1 flex flex-wrap gap-4 text-sm text-gray-500">
                        {branch.manager && (
                          <span className="flex items-center">
                            <span className="mr-1">👤</span>
                            Manager: {branch.manager}
                          </span>
                        )}
                        {branch.phone && (
                          <span className="flex items-center">
                            <span className="mr-1">📞</span>
                            {branch.phone}
                          </span>
                        )}
                        {branch.email && (
                          <span className="flex items-center">
                            <span className="mr-1">📧</span>
                            {branch.email}
                          </span>
                        )}
                      </div>
                      {branch.address && (
                        <p className="text-xs text-gray-400 mt-1">📍 {branch.address}</p>
                      )}
                    </div>
                  </div>
                  {canManageSchools(user) && (
                    <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
                      <button
                        onClick={() => handleEdit(branch)}
                        className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(branch.id)}
                        className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBranch(null);
        }}
        title={editingBranch ? 'Edit Branch' : 'Add New Branch'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">School *</label>
            <select
              required
              value={formData.schoolId}
              onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select a school</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name} ({school.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Code *</label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., BR001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Manager</label>
            <input
              type="text"
              value={formData.manager}
              onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingBranch(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
            >
              {editingBranch ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Branches;

