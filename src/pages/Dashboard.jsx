import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { studentsAPI, classesAPI, teachersAPI, enrollmentsAPI, analyticsAPI } from '../services/api';
import Header from '../components/Header';

// Simple Chart Component
const SimpleBarChart = ({ data, labelKey, valueKey, title, color = 'indigo' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <p className="text-gray-500 text-center py-8">No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d[valueKey]), 1);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center">
            <div className="w-24 text-sm text-gray-600 truncate">{item[labelKey]}</div>
            <div className="flex-1 mx-4">
              <div className="bg-gray-200 rounded-full h-6 relative overflow-hidden">
                <div
                  className={`bg-${color}-500 h-full rounded-full flex items-center justify-end pr-2 transition-all`}
                  style={{ width: `${(item[valueKey] / maxValue) * 100}%` }}
                >
                  <span className="text-xs text-white font-semibold">{item[valueKey]}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Enrollments Chart Component
const EnrollmentsChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await analyticsAPI.getEnrollmentsByClass();
        setData(result.slice(0, 5)); // Show top 5
      } catch (error) {
        console.error('Error fetching enrollments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="bg-white rounded-lg shadow p-6">Loading...</div>;

  return (
    <SimpleBarChart
      data={data}
      labelKey="className"
      valueKey="enrollmentCount"
      title="Top Classes by Enrollment"
      color="green"
    />
  );
};

// Students by Grade Chart Component
const StudentsByGradeChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await analyticsAPI.getStudentsByGrade();
        setData(result);
      } catch (error) {
        console.error('Error fetching grades:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="bg-white rounded-lg shadow p-6">Loading...</div>;

  return (
    <SimpleBarChart
      data={data}
      labelKey="grade"
      valueKey="count"
      title="Students by Grade"
      color="blue"
    />
  );
};

function Dashboard() {
  const [stats, setStats] = useState({
    students: 0,
    classes: 0,
    teachers: 0,
    enrollments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [students, classes, teachers, enrollments] = await Promise.all([
          studentsAPI.getAll(),
          classesAPI.getAll(),
          teachersAPI.getAll(),
          enrollmentsAPI.getAll(),
        ]);

        setStats({
          students: students.length,
          classes: classes.length,
          teachers: teachers.length,
          enrollments: enrollments.length,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { label: 'Students', value: stats.students, icon: '👨‍🎓', color: 'bg-blue-500', link: '/students' },
    { label: 'Classes', value: stats.classes, icon: '📚', color: 'bg-green-500', link: '/classes' },
    { label: 'Teachers', value: stats.teachers, icon: '👨‍🏫', color: 'bg-purple-500', link: '/teachers' },
    { label: 'Enrollments', value: stats.enrollments, icon: '📝', color: 'bg-orange-500', link: '/enrollments' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Dashboard"
        subtitle="Overview of your class management system"
      />
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Link
            key={card.label}
            to={card.link}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`${card.color} rounded-md p-3`}>
                  <span className="text-2xl">{card.icon}</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{card.label}</dt>
                    <dd className="text-3xl font-semibold text-gray-900">{card.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EnrollmentsChart />
        <StudentsByGradeChart />
      </div>

      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/students"
            className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Add Student
          </Link>
          <Link
            to="/classes"
            className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Add Class
          </Link>
          <Link
            to="/teachers"
            className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Add Teacher
          </Link>
          <Link
            to="/reports"
            className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            View Reports
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

