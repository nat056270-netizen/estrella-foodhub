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
const Customers = () => {
  const {
    hasRole
  } = useAuth();
  const canDelete = hasRole(['admin', 'manager']);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    status: 'active'
  });
  useEffect(() => {
    fetchCustomers();
  }, []);
  const fetchCustomers = async () => {
    setLoadError('');
    setLoading(true);
    try {
      const response = await api.get('/customers');
      setCustomers(response.data.data);
    } catch (error) {
      setLoadError(error.response?.data?.message || 'Unable to load this information. Check your connection and try again.');
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async e => {
    e.preventDefault();
    setFormError('');
    try {
      if (editingCustomer) {
        await api.put(`/customers/${editingCustomer.id}`, formData);
        toast.success('Customer updated successfully');
      } else {
        await api.post('/customers', formData);
        toast.success('Customer created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchCustomers();
    } catch (error) {
      setFormError(error.response?.data?.message || 'Changes could not be saved. Check your connection and try again.');
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };
  const handleEdit = customer => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      status: customer.status
    });
    setFormError('');
    setShowModal(true);
  };
  const handleDelete = async () => {
    try {
      await api.delete(`/customers/${deleteConfirm.id}`);
      toast.success('Customer deactivated successfully');
      setDeleteConfirm(null);
      fetchCustomers();
    } catch (error) {
      toast.error('Failed to delete customer');
    }
  };
  const resetForm = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      status: 'active'
    });
  };
  const filteredCustomers = customers.filter(cust => cust.name.toLowerCase().includes(searchTerm.toLowerCase()));
  if (loading) return <Loading message="Loading customers..." />;
  if (loadError) return <ErrorState message={loadError} onRetry={fetchCustomers} />;
  return <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-description">Manage your customers</p>
        </div>
        <button onClick={() => {
        resetForm();
        setFormError('');
        setShowModal(true);
      }} className="btn btn-primary flex items-center gap-2" type="button">
          <Plus size={20} /> Add Customer
        </button>
      </div>

      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input aria-label="Search customers..." type="text" placeholder="Search customers..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input pl-10" />
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <ResponsiveTable className="table" label="Customers records">
            <thead>
              <tr>
                <th scope="col">Customer ID</th>
                <th scope="col">Name</th>
                <th scope="col">Phone</th>
                <th scope="col">Email</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(customer => <tr key={customer.id}>
                  <td className="font-medium">{customer.customer_id}</td>
                  <td>{customer.name}</td>
                  <td>{customer.phone || '-'}</td>
                  <td>{customer.email || '-'}</td>
                  <td>
                    <span className={`badge ${customer.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button aria-label="Edit record" title="Edit record" onClick={() => handleEdit(customer)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" type="button"><Edit size={18} /></button>
                      {canDelete && <button aria-label="Delete or deactivate record" title="Delete or deactivate record" onClick={() => setDeleteConfirm(customer)} className="p-1 text-red-600 hover:bg-red-50 rounded" type="button"><Trash2 size={18} /></button>}
                    </div>
                  </td>
                </tr>)}
            </tbody>
          </ResponsiveTable>
          {filteredCustomers.length === 0 && <EmptyState title="No customers found" message="Records will appear here when they are available. Try changing your search if one is applied." />}
        </div>
      </div>

      <Modal busy={saving} isOpen={showModal} onClose={() => {
      setShowModal(false);
      resetForm();
    }} title={editingCustomer ? 'Edit Customer' : 'Add Customer'}>
        <AsyncForm error={formError} onBusyChange={setSaving} onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="customers-field-1" className="label">Customer Name *</label>
            <input id="customers-field-1" type="text" value={formData.name} onChange={e => setFormData({
            ...formData,
            name: e.target.value
          })} className="input" required />
          </div>
          <div>
            <label htmlFor="customers-field-2" className="label">Phone</label>
            <input id="customers-field-2" type="text" value={formData.phone} onChange={e => setFormData({
            ...formData,
            phone: e.target.value
          })} className="input" />
          </div>
          <div>
            <label htmlFor="customers-field-3" className="label">Email</label>
            <input id="customers-field-3" type="email" value={formData.email} onChange={e => setFormData({
            ...formData,
            email: e.target.value
          })} className="input" />
          </div>
          <div>
            <label htmlFor="customers-field-4" className="label">Address</label>
            <textarea id="customers-field-4" value={formData.address} onChange={e => setFormData({
            ...formData,
            address: e.target.value
          })} className="input" rows="2" />
          </div>
          <div>
            <label htmlFor="customers-field-5" className="label">Status</label>
            <select id="customers-field-5" value={formData.status} onChange={e => setFormData({
            ...formData,
            status: e.target.value
          })} className="input">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary flex-1">{editingCustomer ? 'Update' : 'Create'}</button>
            <button type="button" onClick={() => {
            setShowModal(false);
            resetForm();
          }} className="btn btn-secondary flex-1">Cancel</button>
          </div>
        </AsyncForm>
      </Modal>

      <ConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete} title="Deactivate Customer" message={`Are you sure you want to deactivate "${deleteConfirm?.name}"?`} />
    </div>;
};
export default Customers;
