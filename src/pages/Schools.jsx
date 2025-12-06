import { useState, useEffect } from 'react';
import { schoolsAPI } from '../services/api';
import Modal from '../components/Modal';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { canManageSchools } from '../utils/roleHelper';

function Schools() {
  const { user } = useAuth();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    code: '', 
    address: '', 
    phone: '', 
    email: '', 
    principal: '', 
    description: '' 
  });

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const data = await schoolsAPI.getAll();
      setSchools(data);
    } catch (error) {
      alert('Error fetching schools: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSchool) {
        await schoolsAPI.update(editingSchool.id, formData);
      } else {
        await schoolsAPI.create(formData);
      }
      setIsModalOpen(false);
      setEditingSchool(null);
      setFormData({ name: '', code: '', address: '', phone: '', email: '', principal: '', description: '' });
      fetchSchools();
    } catch (error) {
      alert('Error saving school: ' + error.message);
    }
  };

  const handleEdit = (school) => {
    setEditingSchool(school);
    setFormData({
      name: school.name || '',
      code: school.code || '',
      address: school.address || '',
      phone: school.phone || '',
      email: school.email || '',
      principal: school.principal || '',
      description: school.description || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this school? All branches associated with this school will also be deleted.')) {
      try {
        await schoolsAPI.delete(id);
        fetchSchools();
      } catch (error) {
        alert('Error deleting school: ' + error.message);
      }
    }
  };

  const openModal = () => {
    setEditingSchool(null);
    setFormData({ name: '', code: '', address: '', phone: '', email: '', principal: '', description: '' });
    setIsModalOpen(true);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <Header
        title="Schools"
        subtitle="Manage school information and records"
        action={
          canManageSchools(user) && (
            <button
              onClick={openModal}
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 sm:px-6 py-2.5 rounded-lg hover:from-indigo-700 hover:to-indigo-800 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>+</span>
              <span>Add School</span>
            </button>
          )
        }
      />

      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {schools.length === 0 ? (
            <li className="px-6 py-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">🏫</div>
              <p className="text-gray-500 text-lg">No schools found</p>
              <p className="text-gray-400 text-sm mt-2">Add your first school to get started</p>
            </li>
          ) : (
            schools.map((school) => (
              <li key={school.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg">
                        🏫
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900">{school.name}</h3>
                      <p className="text-sm text-gray-600">Code: {school.code}</p>
                      <div className="mt-1 flex flex-wrap gap-4 text-sm text-gray-500">
                        {school.principal && (
                          <span className="flex items-center">
                            <span className="mr-1">👤</span>
                            Principal: {school.principal}
                          </span>
                        )}
                        {school.phone && (
                          <span className="flex items-center">
                            <span className="mr-1">📞</span>
                            {school.phone}
                          </span>
                        )}
                        {school.email && (
                          <span className="flex items-center">
                            <span className="mr-1">📧</span>
                            {school.email}
                          </span>
                        )}
                        {school.branches && school.branches.length > 0 && (
                          <span className="flex items-center">
                            <span className="mr-1">🏢</span>
                            {school.branches.length} branch{school.branches.length !== 1 ? 'es' : ''}
                          </span>
                        )}
                      </div>
                      {school.address && (
                        <p className="text-xs text-gray-400 mt-1">📍 {school.address}</p>
                      )}
                    </div>
                  </div>
                  {canManageSchools(user) && (
                    <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
                      <button
                        onClick={() => handleEdit(school)}
                        className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(school.id)}
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
          setEditingSchool(null);
        }}
        title={editingSchool ? 'Edit School' : 'Add New School'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="e.g., SCH001"
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
            <label className="block text-sm font-medium text-gray-700">Principal</label>
            <input
              type="text"
              value={formData.principal}
              onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
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
                setEditingSchool(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
            >
              {editingSchool ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Schools;

