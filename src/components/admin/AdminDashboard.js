import React, { useState, useEffect } from 'react';
import { Users, Clock, Calendar, Activity, Shield, TrendingUp, UserCheck, RefreshCw } from 'lucide-react';
import { authService } from '../../services/authService';

function AdminDashboard({ currentUser }) {
  const [userActivity, setUserActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');

  useEffect(() => {
    loadUserActivity();
  }, [selectedTimeframe]);

  const loadUserActivity = async () => {
    setLoading(true);
    
    try {
      // Fetch real data from Supabase
      const data = await authService.getUserActivity(selectedTimeframe);
      setUserActivity(data);
    } catch (error) {
      console.error('Error loading user activity:', error);
      setUserActivity([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTimeSinceLogin = (lastLogin) => {
    const now = new Date();
    const diff = now - new Date(lastLogin);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    return 'Just now';
  };

  const getActivityStatus = (lastLogin) => {
    const now = new Date();
    const diff = now - new Date(lastLogin);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return { status: 'Active Today', color: 'text-green-600 bg-green-50' };
    if (days === 1) return { status: 'Yesterday', color: 'text-blue-600 bg-blue-50' };
    if (days <= 7) return { status: 'This Week', color: 'text-yellow-600 bg-yellow-50' };
    return { status: 'Inactive', color: 'text-gray-600 bg-gray-50' };
  };

  const getTotalStats = () => {
    const totalUsers = userActivity.length;
    const activeToday = userActivity.filter(u => {
      const today = new Date();
      const lastLogin = new Date(u.last_login);
      return lastLogin.toDateString() === today.toDateString();
    }).length;
    const totalLogins = userActivity.reduce((sum, u) => sum + u.login_count, 0);
    const avgLogins = totalUsers > 0 ? Math.round(totalLogins / totalUsers) : 0;
    
    return { totalUsers, activeToday, totalLogins, avgLogins };
  };

  const stats = getTotalStats();

  if (!currentUser?.isAdmin) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Admin Access Required</h3>
        <p className="text-gray-600">You need administrator privileges to view this dashboard.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-800">Admin Dashboard - User Activity</h2>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <option value="day">Last 24 Hours</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
            <button
              onClick={loadUserActivity}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4 p-6 bg-gray-50 border-b border-gray-200">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalUsers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <UserCheck className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Active Today</p>
              <p className="text-2xl font-bold text-gray-800">{stats.activeToday}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Total Logins</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalLogins}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Avg Logins/User</p>
              <p className="text-2xl font-bold text-gray-800">{stats.avgLogins}</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Activity Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Login Count</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First Login</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Session</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total Time</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Loading user activity...
                  </div>
                </td>
              </tr>
            ) : userActivity.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  No user activity found
                </td>
              </tr>
            ) : (
              userActivity.map((user) => {
                const activityStatus = getActivityStatus(user.last_login);
                return (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${activityStatus.color}`}>
                        {activityStatus.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-semibold text-gray-900">{user.login_count}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{formatDateTime(user.last_login)}</div>
                        <div className="text-xs text-gray-500">{getTimeSinceLogin(user.last_login)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(user.first_login)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm text-gray-600">{user.average_session_time} min</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm text-gray-600">
                        {Math.floor(user.total_session_time / 60)}h {user.total_session_time % 60}m
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;