import { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import Header from '../components/Header';

function Reports() {
  const [stats, setStats] = useState(null);
  const [enrollmentsByClass, setEnrollmentsByClass] = useState([]);
  const [studentsByGrade, setStudentsByGrade] = useState([]);
  const [classCapacity, setClassCapacity] = useState([]);
  const [recentEnrollments, setRecentEnrollments] = useState([]);
  const [activityTimeline, setActivityTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data with individual error handling
      const results = await Promise.allSettled([
        analyticsAPI.getStats().catch(err => ({ error: 'Failed to fetch statistics', details: err.message })),
        analyticsAPI.getEnrollmentsByClass().catch(err => ({ error: 'Failed to fetch enrollments by class', details: err.message })),
        analyticsAPI.getStudentsByGrade().catch(err => ({ error: 'Failed to fetch students by grade', details: err.message })),
        analyticsAPI.getClassCapacity().catch(err => ({ error: 'Failed to fetch class capacity', details: err.message })),
        analyticsAPI.getRecentEnrollments(10).catch(err => ({ error: 'Failed to fetch recent enrollments', details: err.message })),
        analyticsAPI.getActivityTimeline(20).catch(err => ({ error: 'Failed to fetch activity timeline', details: err.message }))
      ]);

      // Process results
      const [statsResult, enrollmentsResult, gradesResult, capacityResult, recentResult, timelineResult] = results;

      // Set data or handle errors
      if (statsResult.status === 'fulfilled' && !statsResult.value?.error) {
        setStats(statsResult.value);
      } else {
        console.error('Stats error:', statsResult.status === 'rejected' ? statsResult.reason : statsResult.value);
        const errorResult = statsResult.status === 'rejected' ? statsResult.reason : statsResult.value;
        const errorMsg = errorResult?.message || errorResult?.error || 'Failed to fetch statistics';
        
        // Show more specific error message
        if (errorMsg.includes('Database connection') || errorMsg.includes("Can't reach database")) {
          alert('Database Connection Error: Unable to connect to the database server. Please check your database connection settings or contact the administrator.');
        } else {
          alert('Error loading reports: ' + errorMsg);
        }
      }

      if (enrollmentsResult.status === 'fulfilled' && !enrollmentsResult.value?.error) {
        setEnrollmentsByClass(enrollmentsResult.value || []);
      }

      if (gradesResult.status === 'fulfilled' && !gradesResult.value?.error) {
        setStudentsByGrade(gradesResult.value || []);
      }

      if (capacityResult.status === 'fulfilled' && !capacityResult.value?.error) {
        setClassCapacity(capacityResult.value || []);
      }

      if (recentResult.status === 'fulfilled' && !recentResult.value?.error) {
        setRecentEnrollments(recentResult.value || []);
      }

      if (timelineResult.status === 'fulfilled' && !timelineResult.value?.error) {
        setActivityTimeline(timelineResult.value || []);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      alert('Error loading reports: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const SimpleBarChart = ({ data, labelKey, valueKey, title, color = 'indigo' }) => {
    const maxValue = Math.max(...data.map(d => d[valueKey]), 1);

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center">
              <div className="w-32 text-sm text-gray-600 truncate">{item[labelKey]}</div>
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading reports...</div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Reports & Analytics"
        subtitle="Comprehensive insights and statistics"
        action={
          <button
            onClick={() => fetchAllData()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Refresh Data
          </button>
        }
      />

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'enrollments', 'capacity', 'activity'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {stats && Object.entries(stats).map(([key, value]) => (
              <div key={key} className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-500 capitalize">{key}</div>
                <div className="mt-2 text-3xl font-semibold text-gray-900">{value}</div>
              </div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {studentsByGrade.length > 0 && (
              <SimpleBarChart
                data={studentsByGrade}
                labelKey="grade"
                valueKey="count"
                title="Students by Grade"
                color="blue"
              />
            )}

            {enrollmentsByClass.length > 0 && (
              <SimpleBarChart
                data={enrollmentsByClass}
                labelKey="className"
                valueKey="enrollmentCount"
                title="Enrollments by Class"
                color="green"
              />
            )}
          </div>

          {/* Recent Enrollments */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Recent Enrollments</h3>
              <button
                onClick={() => exportToCSV(recentEnrollments, 'recent-enrollments.csv')}
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrolled At</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentEnrollments.map((enrollment) => (
                    <tr key={enrollment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {enrollment.student?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {enrollment.class?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Enrollments Tab */}
      {activeTab === 'enrollments' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Enrollments by Class</h3>
              <button
                onClick={() => exportToCSV(enrollmentsByClass, 'enrollments-by-class.csv')}
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                Export CSV
              </button>
            </div>
            {enrollmentsByClass.length > 0 ? (
              <SimpleBarChart
                data={enrollmentsByClass}
                labelKey="className"
                valueKey="enrollmentCount"
                title=""
                color="indigo"
              />
            ) : (
              <p className="text-gray-500 text-center py-8">No enrollment data available</p>
            )}
          </div>

          {studentsByGrade.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Students by Grade</h3>
                <button
                  onClick={() => exportToCSV(studentsByGrade, 'students-by-grade.csv')}
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  Export CSV
                </button>
              </div>
              <SimpleBarChart
                data={studentsByGrade}
                labelKey="grade"
                valueKey="count"
                title=""
                color="blue"
              />
            </div>
          )}
        </div>
      )}

      {/* Capacity Tab */}
      {activeTab === 'capacity' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Class Capacity Utilization</h3>
              <button
                onClick={() => exportToCSV(classCapacity, 'class-capacity.csv')}
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                Export CSV
              </button>
            </div>
            {classCapacity.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrolled</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilization</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {classCapacity.map((cls) => (
                      <tr key={cls.classId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {cls.className}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.classCode}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.capacity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.enrolled}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.available}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className={`h-2 rounded-full ${
                                  cls.utilization >= 90 ? 'bg-red-500' :
                                  cls.utilization >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(cls.utilization, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">{cls.utilization}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No capacity data available</p>
            )}
          </div>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Activity Timeline</h3>
            <button
              onClick={() => exportToCSV(activityTimeline, 'activity-timeline.csv')}
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              Export CSV
            </button>
          </div>
          {activityTimeline.length > 0 ? (
            <div className="space-y-4">
              {activityTimeline.map((activity, index) => (
                <div key={index} className="flex items-start space-x-4 pb-4 border-b border-gray-200 last:border-0">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-600 font-semibold">
                        {activity.type === 'student' ? '👨‍🎓' :
                         activity.type === 'class' ? '📚' :
                         activity.type === 'teacher' ? '👨‍🏫' : '📝'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.action} {activity.type}
                      {activity.name && `: ${activity.name}`}
                      {activity.code && ` (${activity.code})`}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.date).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No activity data available</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Reports;

