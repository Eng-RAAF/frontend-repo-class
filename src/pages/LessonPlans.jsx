import { useState, useEffect } from 'react';
import { lessonPlansAPI, teachersAPI, classesAPI } from '../services/api';
import Modal from '../components/Modal';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { isTeacher, isAdmin, isSuperAdmin, isStudent } from '../utils/roleHelper';

function LessonPlans() {
  const { user } = useAuth();
  const [lessonPlans, setLessonPlans] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    classId: '',
    teacherId: '',
    date: '',
    objectives: '',
    materials: '',
    activities: '',
    homework: '',
    notes: '',
    status: 'draft'
  });

  useEffect(() => {
    fetchData();
  }, [filterStatus]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansData, teachersData, classesData] = await Promise.all([
        lessonPlansAPI.getAll(filterStatus !== 'all' ? { status: filterStatus } : {}),
        teachersAPI.getAll(),
        classesAPI.getAll()
      ]);
      
      setLessonPlans(plansData);
      setTeachers(teachersData);
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
      if (!formData.title || !formData.date || !formData.teacherId) {
        alert('Title, date, and teacher are required');
        return;
      }

      const submitData = {
        ...formData,
        classId: formData.classId || null,
        teacherId: parseInt(formData.teacherId),
        date: new Date(formData.date).toISOString()
      };

      if (editingPlan) {
        await lessonPlansAPI.update(editingPlan.id, submitData);
      } else {
        await lessonPlansAPI.create(submitData);
      }
      
      setIsModalOpen(false);
      setEditingPlan(null);
      resetForm();
      fetchData();
    } catch (error) {
      alert('Error saving lesson plan: ' + error.message);
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      title: plan.title || '',
      description: plan.description || '',
      subject: plan.subject || '',
      classId: plan.classId ? plan.classId.toString() : '',
      teacherId: plan.teacherId ? plan.teacherId.toString() : '',
      date: plan.date ? new Date(plan.date).toISOString().split('T')[0] : '',
      objectives: plan.objectives || '',
      materials: plan.materials || '',
      activities: plan.activities || '',
      homework: plan.homework || '',
      notes: plan.notes || '',
      status: plan.status || 'draft'
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lesson plan?')) {
      try {
        await lessonPlansAPI.delete(id);
        fetchData();
      } catch (error) {
        alert('Error deleting lesson plan: ' + error.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      subject: '',
      classId: '',
      teacherId: '',
      date: '',
      objectives: '',
      materials: '',
      activities: '',
      homework: '',
      notes: '',
      status: 'draft'
    });
  };

  const openModal = () => {
    setEditingPlan(null);
    resetForm();
    // If user is teacher, set their teacher ID (if available)
    // For now, we'll let them select
    setIsModalOpen(true);
  };

  const canManage = isAdmin(user) || isSuperAdmin(user) || isTeacher(user);
  const canOnlyView = isStudent(user);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Lesson Plans"
        subtitle="Create and manage lesson plans for your classes"
        action={
          canManage && !canOnlyView && (
            <button
              onClick={openModal}
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 sm:px-6 py-2.5 rounded-lg hover:from-indigo-700 hover:to-indigo-800 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>+</span>
              <span>Add Lesson Plan</span>
            </button>
          )
        }
      />

      {/* Filter */}
      <div className="mb-4 bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Lesson Plans List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lessonPlans.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <p className="text-gray-500 text-lg">No lesson plans found</p>
            <p className="text-gray-400 text-sm mt-2">Create your first lesson plan to get started</p>
          </div>
        ) : (
          lessonPlans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{plan.title}</h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      plan.status === 'published' ? 'bg-green-100 text-green-800' :
                      plan.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {plan.status}
                    </span>
                  </div>
                  {plan.teacher && (
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Teacher:</span> {plan.teacher.name}
                    </p>
                  )}
                  {plan.class && (
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Class:</span> {plan.class.name}
                    </p>
                  )}
                  {plan.subject && (
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Subject:</span> {plan.subject}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    {new Date(plan.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {plan.description && (
                <p className="text-sm text-gray-700 mb-4 line-clamp-2">{plan.description}</p>
              )}

              {canManage && !canOnlyView && (
                <div className="flex space-x-2 pt-4 border-t">
                  <button
                    onClick={() => handleEdit(plan)}
                    className="flex-1 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="flex-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              )}
              {canOnlyView && (
                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500 text-center">View only - Students cannot edit lesson plans</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPlan(null);
        }}
        title={editingPlan ? 'Edit Lesson Plan' : 'Create New Lesson Plan'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Teacher *</label>
            <select
              required
              value={formData.teacherId}
              onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select a teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name} {teacher.email && `(${teacher.email})`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date *</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Class</label>
            <select
              value={formData.classId}
              onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select a class (optional)</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} {cls.code && `(${cls.code})`}
                </option>
              ))}
            </select>
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
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Learning Objectives</label>
            <textarea
              value={formData.objectives}
              onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
              rows="3"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="What students will learn..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Required Materials</label>
            <textarea
              value={formData.materials}
              onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
              rows="2"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Books, equipment, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Activities</label>
            <textarea
              value={formData.activities}
              onChange={(e) => setFormData({ ...formData, activities: e.target.value })}
              rows="4"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Lesson activities and timeline..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Homework/Assignments</label>
            <textarea
              value={formData.homework}
              onChange={(e) => setFormData({ ...formData, homework: e.target.value })}
              rows="2"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="2"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingPlan(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
            >
              {editingPlan ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default LessonPlans;

