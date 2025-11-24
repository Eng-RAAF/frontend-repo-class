import { useState, useEffect } from 'react';
import { enrollmentsAPI, studentsAPI, classesAPI } from '../services/api';
import Modal from '../components/Modal';
import Header from '../components/Header';

function Enrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ studentId: '', classId: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [enrollmentsData, studentsData, classesData] = await Promise.all([
        enrollmentsAPI.getAll(),
        studentsAPI.getAll(),
        classesAPI.getAll(),
      ]);
      setEnrollments(enrollmentsData);
      setStudents(studentsData);
      setClasses(classesData);
    } catch (error) {
      alert('Error fetching data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await enrollmentsAPI.create({
        studentId: parseInt(formData.studentId),
        classId: parseInt(formData.classId),
      });
      setIsModalOpen(false);
      setFormData({ studentId: '', classId: '' });
      fetchData();
    } catch (error) {
      alert('Error creating enrollment: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this enrollment?')) {
      try {
        await enrollmentsAPI.delete(id);
        fetchData();
      } catch (error) {
        alert('Error deleting enrollment: ' + error.message);
      }
    }
  };

  const openModal = () => {
    setFormData({ studentId: '', classId: '' });
    setIsModalOpen(true);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <Header
        title="Enrollments"
        subtitle="Manage student enrollments in classes"
        action={
          <button
            onClick={openModal}
            className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-2.5 rounded-lg hover:from-indigo-700 hover:to-indigo-800 shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
          >
            <span>+</span>
            <span>Enroll Student</span>
          </button>
        }
      />

      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {enrollments.length === 0 ? (
            <li className="px-6 py-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <p className="text-gray-500 text-lg">No enrollments found</p>
              <p className="text-gray-400 text-sm mt-2">Enroll a student in a class to get started</p>
            </li>
          ) : (
            enrollments.map((enrollment) => (
              <li key={enrollment.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold text-lg">
                        {enrollment.student?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {enrollment.student?.name || 'Unknown Student'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Enrolled in: <span className="font-medium text-indigo-600">{enrollment.class?.name}</span>
                      </p>
                      <div className="mt-2 flex flex-wrap gap-3 text-sm">
                        <span className="flex items-center bg-blue-50 px-2 py-1 rounded text-gray-700">
                          <span className="mr-1">📚</span>
                          {enrollment.class?.code}
                        </span>
                        <span className="flex items-center bg-gray-50 px-2 py-1 rounded text-gray-600">
                          <span className="mr-1">📅</span>
                          {new Date(enrollment.enrolledAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDelete(enrollment.id)}
                      className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Remove
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
        onClose={() => setIsModalOpen(false)}
        title="Enroll Student in Class"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Student *</label>
            <select
              required
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select a student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.email})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Class *</label>
            <select
              required
              value={formData.classId}
              onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select a class</option>
              {classes.map((classItem) => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.name} ({classItem.code})
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
            >
              Enroll
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Enrollments;

