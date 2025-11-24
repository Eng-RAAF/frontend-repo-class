import { useState, useEffect } from 'react';
import { studentsAPI } from '../services/api';
import Modal from '../components/Modal';
import Header from '../components/Header';

function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', age: '', grade: '' });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const data = await studentsAPI.getAll();
      setStudents(data);
    } catch (error) {
      alert('Error fetching students: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await studentsAPI.update(editingStudent.id, formData);
      } else {
        await studentsAPI.create(formData);
      }
      setIsModalOpen(false);
      setEditingStudent(null);
      setFormData({ name: '', email: '', age: '', grade: '' });
      fetchStudents();
    } catch (error) {
      alert('Error saving student: ' + error.message);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name || '',
      email: student.email || '',
      age: student.age || '',
      grade: student.grade || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await studentsAPI.delete(id);
        fetchStudents();
      } catch (error) {
        alert('Error deleting student: ' + error.message);
      }
    }
  };

  const openModal = () => {
    setEditingStudent(null);
    setFormData({ name: '', email: '', age: '', grade: '' });
    setIsModalOpen(true);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <Header
        title="Students"
        subtitle="Manage student information and records"
        action={
          <button
            onClick={openModal}
            className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-2.5 rounded-lg hover:from-indigo-700 hover:to-indigo-800 shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
          >
            <span>+</span>
            <span>Add Student</span>
          </button>
        }
      />

      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {students.length === 0 ? (
            <li className="px-6 py-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">👨‍🎓</div>
              <p className="text-gray-500 text-lg">No students found</p>
              <p className="text-gray-400 text-sm mt-2">Add your first student to get started</p>
            </li>
          ) : (
            students.map((student) => (
              <li key={student.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                      <p className="text-sm text-gray-600 truncate">{student.email}</p>
                      <div className="mt-1 flex space-x-4 text-sm text-gray-500">
                        {student.age && (
                          <span className="flex items-center">
                            <span className="mr-1">🎂</span>
                            {student.age} years
                          </span>
                        )}
                        {student.grade && (
                          <span className="flex items-center">
                            <span className="mr-1">⭐</span>
                            Grade {student.grade}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(student)}
                      className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(student.id)}
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
          setEditingStudent(null);
        }}
        title={editingStudent ? 'Edit Student' : 'Add New Student'}
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
            <label className="block text-sm font-medium text-gray-700">Age</label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Grade</label>
            <input
              type="text"
              value={formData.grade}
              onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingStudent(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
            >
              {editingStudent ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Students;

