import { useState, useEffect } from 'react';
import { teachersAPI } from '../services/api';
import Modal from '../components/Modal';
import Header from '../components/Header';

function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', department: '' });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const data = await teachersAPI.getAll();
      setTeachers(data);
    } catch (error) {
      alert('Error fetching teachers: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTeacher) {
        await teachersAPI.update(editingTeacher.id, formData);
      } else {
        await teachersAPI.create(formData);
      }
      setIsModalOpen(false);
      setEditingTeacher(null);
      setFormData({ name: '', email: '', subject: '', department: '' });
      fetchTeachers();
    } catch (error) {
      alert('Error saving teacher: ' + error.message);
    }
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name || '',
      email: teacher.email || '',
      subject: teacher.subject || '',
      department: teacher.department || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        await teachersAPI.delete(id);
        fetchTeachers();
      } catch (error) {
        alert('Error deleting teacher: ' + error.message);
      }
    }
  };

  const openModal = () => {
    setEditingTeacher(null);
    setFormData({ name: '', email: '', subject: '', department: '' });
    setIsModalOpen(true);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <Header
        title="Teachers"
        subtitle="Manage teacher profiles and information"
        action={
          <button
            onClick={openModal}
            className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-2.5 rounded-lg hover:from-indigo-700 hover:to-indigo-800 shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
          >
            <span>+</span>
            <span>Add Teacher</span>
          </button>
        }
      />

      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {teachers.length === 0 ? (
            <li className="px-6 py-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">👨‍🏫</div>
              <p className="text-gray-500 text-lg">No teachers found</p>
              <p className="text-gray-400 text-sm mt-2">Add your first teacher to get started</p>
            </li>
          ) : (
            teachers.map((teacher) => (
              <li key={teacher.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                        {teacher.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900">{teacher.name}</h3>
                      <p className="text-sm text-gray-600 truncate">{teacher.email}</p>
                      <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500">
                        {teacher.subject && (
                          <span className="flex items-center bg-purple-50 px-2 py-1 rounded">
                            <span className="mr-1">📖</span>
                            {teacher.subject}
                          </span>
                        )}
                        {teacher.department && (
                          <span className="flex items-center bg-indigo-50 px-2 py-1 rounded">
                            <span className="mr-1">🏢</span>
                            {teacher.department}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(teacher)}
                      className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(teacher.id)}
                      className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
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
          setEditingTeacher(null);
        }}
        title={editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
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
            <label className="block text-sm font-medium text-gray-700">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Subject</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingTeacher(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
            >
              {editingTeacher ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Teachers;

