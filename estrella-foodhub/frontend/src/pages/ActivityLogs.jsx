import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { formatDateTime } from '../utils/format';
import { Search, Filter } from 'lucide-react';
import Loading from '../components/Loading';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await api.get('/activity-logs?limit=200');
      setLogs(response.data.data);
    } catch (error) {
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user?.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = !moduleFilter || log.module === moduleFilter;
    return matchesSearch && matchesModule;
  });

  const modules = [...new Set(logs.map(log => log.module))];

  if (loading) return <Loading message="Loading activity logs..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
        <p className="text-gray-600">Monitor system activities and user actions</p>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input type="text" placeholder="Search activities..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input pl-10" />
          </div>
          <select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)} className="input sm:w-48">
            <option value="">All Modules</option>
            {modules.map(module => (
              <option key={module} value={module}>{module}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>User</th>
                <th>Action</th>
                <th>Module</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id}>
                  <td className="text-sm">{formatDateTime(log.created_at)}</td>
                  <td>
                    <div className="font-medium">{log.user?.username}</div>
                    <div className="text-xs text-gray-500 capitalize">{log.user?.role.replace('_', ' ')}</div>
                  </td>
                  <td><span className="badge badge-info">{log.action}</span></td>
                  <td><span className="badge badge-secondary">{log.module}</span></td>
                  <td className="text-sm">{log.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLogs.length === 0 && (
            <div className="text-center py-12 text-gray-500">No activity logs found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLogs;
