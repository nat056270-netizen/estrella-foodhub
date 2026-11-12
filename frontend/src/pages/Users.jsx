import ResponsiveTable from '../components/ResponsiveTable';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import Loading from '../components/Loading';
import { ErrorState, EmptyState } from '../components/AsyncState';
import Modal from '../components/Modal';
import AsyncForm from '../components/AsyncForm';
import ConfirmDialog from '../components/ConfirmDialog';
const Users = () => {
  const {
    hasRole
  } = useAuth();
  const canDelete = hasRole(['admin']);
  const canModify = hasRole(['admin']);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [users, setUsers] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'cashier',
    phone: '',
    status: 'active'
  });
  useEffect(() => {
    fetchUsers();
  }, []);
  const fetchUsers = async () => {
    setLoadError('');
    setLoading(true);
    try {
      const response = await api.get('/users');
      setUsers(response.data.data);
    } catch (error) {
      setLoadError(error.response?.data?.message || 'Unable to load this information. Check your connection and try again.');
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async e => {
    e.preventDefault();
    setFormError('');
    try {
      if (editingUser) {
        const updateData = {
          ...formData
        };
        if (!updateData.password) delete updateData.password;
        await api.put(`/users/${editingUser.id}`, updateData);
        toast.success('User updated successfully');
      } else {
        await api.post('/users', formData);
        toast.success('User created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      setFormError(error.response?.data?.message || 'Changes could not be saved. Check your connection and try again.');
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };
  const handleEdit = user => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      phone: user.phone || '',
      status: user.status
    });
    setFormError('');
    setShowModal(true);
  };
  const handleDelete = async () => {
    try {
      await api.delete(`/users/${deleteConfirm.id}`);
      toast.success('User deactivated successfully');
      setDeleteConfirm(null);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };
  const resetForm = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      role: 'cashier',
      phone: '',
      status: 'active'
    });
  };
  const filteredUsers = users.filter(user => user.username.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase()));
  if (loading) return <Loading message="Loading users..." />;
  if (loadError) return <ErrorState message={loadError} onRetry={fetchUsers} />;
  return <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Users & Roles</h1>
          <p className="page-description">Manage system users and permissions</p>
        </div>
        {canModify && <button onClick={() => {
        resetForm();
        setFormError('');
        setShowModal(true);
      }} className="btn btn-primary flex items-center gap-2" type="button">
          <Plus size={20} /> Add User
        </button>}
      </div>

      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input aria-label="Search users..." type="text" placeholder="Search users..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input pl-10" />
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <ResponsiveTable className="table" label="Users records">
            <thead>
              <tr>
                <th scope="col">Username</th>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Role</th>
                <th scope="col">Status</th>
                {canModify && <th scope="col">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => <tr key={user.id}>
                  <td className="font-medium">{user.username}</td>
                  <td>{user.first_name} {user.last_name}</td>
                  <td>{user.email}</td>
                  <td><span className="badge badge-info capitalize">{user.role.replace('_', ' ')}</span></td>
                  <td><span className={`badge ${user.status === 'active' ? 'badge-success' : 'badge-danger'}`}>{user.status}</span></td>
                  {canModify && <td>
                    <div className="flex gap-2">
                      <button aria-label="Edit record" title="Edit record" onClick={() => handleEdit(user)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" type="button"><Edit size={18} /></button>
                      {canDelete && <button aria-label="Delete or deactivate record" title="Delete or deactivate record" onClick={() => setDeleteConfirm(user)} className="p-1 text-red-600 hover:bg-red-50 rounded" disabled={user.id === 1} type="button"><Trash2 size={18} /></button>}
                    </div>
                  </td>}
                </tr>)}
            </tbody>
          </ResponsiveTable>
          {filteredUsers.length === 0 && <EmptyState title="No users found" message="Records will appear here when they are available. Try changing your search if one is applied." />}
        </div>
      </div>

      <Modal busy={saving} isOpen={showModal} onClose={() => {
      setShowModal(false);
      resetForm();
    }} title={editingUser ? 'Edit User' : 'Add User'} size="lg">
        <AsyncForm error={formError} onBusyChange={setSaving} onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="users-field-1" className="label">Username *</label>
              <input id="users-field-1" type="text" value={formData.username} onChange={e => setFormData({
              ...formData,
              username: e.target.value
            })} className="input" required />
            </div>
            <div>
              <label htmlFor="users-field-2" className="label">Email *</label>
              <input id="users-field-2" type="email" value={formData.email} onChange={e => setFormData({
              ...formData,
              email: e.target.value
            })} className="input" required />
            </div>
            <div>
              <label htmlFor="users-field-3" className="label">First Name *</label>
              <input id="users-field-3" type="text" value={formData.first_name} onChange={e => setFormData({
              ...formData,
              first_name: e.target.value
            })} className="input" required />
            </div>
            <div>
              <label htmlFor="users-field-4" className="label">Last Name *</label>
              <input id="users-field-4" type="text" value={formData.last_name} onChange={e => setFormData({
              ...formData,
              last_name: e.target.value
            })} className="input" required />
            </div>
            <div>
              <label htmlFor="users-field-5" className="label">Password {editingUser ? '(leave blank to keep current)' : '*'}</label>
              <input id="users-field-5" type="password" value={formData.password} onChange={e => setFormData({
              ...formData,
              password: e.target.value
            })} className="input" required={!editingUser} />
            </div>
            <div>
              <label htmlFor="users-field-6" className="label">Phone</label>
              <input id="users-field-6" type="text" value={formData.phone} onChange={e => setFormData({
              ...formData,
              phone: e.target.value
            })} className="input" />
            </div>
            <div>
              <label htmlFor="users-field-7" className="label">Role *</label>
              <select id="users-field-7" value={formData.role} onChange={e => setFormData({
              ...formData,
              role: e.target.value
            })} className="input" required>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="cashier">Cashier</option>
                <option value="inventory_staff">Inventory Staff</option>
              </select>
            </div>
            <div>
              <label htmlFor="users-field-8" className="label">Status</label>
              <select id="users-field-8" value={formData.status} onChange={e => setFormData({
              ...formData,
              status: e.target.value
            })} className="input">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary flex-1">{editingUser ? 'Update' : 'Create'}</button>
            <button type="button" onClick={() => {
            setShowModal(false);
            resetForm();
          }} className="btn btn-secondary flex-1">Cancel</button>
          </div>
        </AsyncForm>
      </Modal>

      <ConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete} title="Deactivate User" message={`Are you sure you want to deactivate "${deleteConfirm?.username}"?`} />
    </div>;
};
export default Users;
