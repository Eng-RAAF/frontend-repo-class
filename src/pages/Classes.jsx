import { useState, useEffect } from 'react';
import { classesAPI, teachersAPI } from '../services/api';
import Modal from '../components/Modal';
import Header from '../components/Header';

function Classes() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    teacherId: '',
    schedule: '',
    capacity: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [classesData, teachersData] = await Promise.all([
        classesAPI.getAll(),
        teachersAPI.getAll(),
      ]);
      setClasses(classesData);
      setTeachers(teachersData);
    } catch (error) {
      alert('Error fetching data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        teacherId: formData.teacherId ? parseInt(formData.teacherId) : null,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
      };
      if (editingClass) {
        await classesAPI.update(editingClass.id, data);
      } else {
        await classesAPI.create(data);
      }
      setIsModalOpen(false);
      setEditingClass(null);
      setFormData({
        name: '',
        code: '',
        description: '',
        teacherId: '',
        schedule: '',
        capacity: '',
      });
      fetchData();
    } catch (error) {
      alert('Error saving class: ' + error.message);
    }
  };

  const handleEdit = (classItem) => {
    setEditingClass(classItem);
    setFormData({
      name: classItem.name || '',
      code: classItem.code || '',
      description: classItem.description || '',
      teacherId: classItem.teacherId || '',
      schedule: classItem.schedule || '',
      capacity: classItem.capacity || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await classesAPI.delete(id);
        fetchData();
      } catch (error) {
        alert('Error deleting class: ' + error.message);
      }
    }
  };

  const openModal = () => {
    setEditingClass(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      teacherId: '',
      schedule: '',
      capacity: '',
    });
    setIsModalOpen(true);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <Header
        title="Classes"
        subtitle="Manage classes and course information"
        action={
          <button
            onClick={openModal}
            className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-2.5 rounded-lg hover:from-indigo-700 hover:to-indigo-800 shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
          >
            <span>+</span>
            <span>Add Class</span>
          </button>
        }
      />

      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {classes.length === 0 ? (
            <li className="px-6 py-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">📚</div>
              <p className="text-gray-500 text-lg">No classes found</p>
              <p className="text-gray-400 text-sm mt-2">Create your first class to get started</p>
            </li>
          ) : (
            classes.map((classItem) => (
              <li key={classItem.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-lg">
                        {classItem.code.charAt(0)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900">{classItem.name}</h3>
                      <p className="text-sm text-indigo-600 font-medium">Code: {classItem.code}</p>
                      {classItem.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-1">{classItem.description}</p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500">
                        {classItem.teacher && (
                          <span className="flex items-center bg-blue-50 px-2 py-1 rounded">
                            <span className="mr-1">👨‍🏫</span>
                            {classItem.teacher.name}
                          </span>
                        )}
                        {classItem.schedule && (
                          <span className="flex items-center bg-purple-50 px-2 py-1 rounded">
                            <span className="mr-1">🕐</span>
                            {classItem.schedule}
                          </span>
                        )}
                        {classItem.capacity && (
                          <span className="flex items-center bg-orange-50 px-2 py-1 rounded">
                            <span className="mr-1">👥</span>
                            Capacity: {classItem.capacity}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(classItem)}
                      className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(classItem.id)}
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
          setEditingClass(null);
        }}
        title={editingClass ? 'Edit Class' : 'Add New Class'}
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
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Teacher</label>
            <select
              value={formData.teacherId}
              onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select a teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Schedule</label>
            <input
              type="text"
              value={formData.schedule}
              onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
              placeholder="e.g., Mon, Wed, Fri 10:00 AM"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Capacity</label>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingClass(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
            >
              {editingClass ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Classes;

