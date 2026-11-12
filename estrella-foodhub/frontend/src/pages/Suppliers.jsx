import ResponsiveTable from '../components/ResponsiveTable';
import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import Loading from '../components/Loading';
import { ErrorState, EmptyState } from '../components/AsyncState';
import Modal from '../components/Modal';
import AsyncForm from '../components/AsyncForm';
import ConfirmDialog from '../components/ConfirmDialog';
const Suppliers = () => {
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [suppliers, setSuppliers] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    status: 'active'
  });
  useEffect(() => {
    fetchSuppliers();
  }, []);
  const fetchSuppliers = async () => {
    setLoadError('');
    setLoading(true);
    try {
      const response = await api.get('/suppliers');
      setSuppliers(response.data.data);
    } catch (error) {
      setLoadError(error.response?.data?.message || 'Unable to load this information. Check your connection and try again.');
      toast.error('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async e => {
    e.preventDefault();
    setFormError('');
    try {
      if (editingSupplier) {
        await api.put(`/suppliers/${editingSupplier.id}`, formData);
        toast.success('Supplier updated successfully');
      } else {
        await api.post('/suppliers', formData);
        toast.success('Supplier created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchSuppliers();
    } catch (error) {
      setFormError(error.response?.data?.message || 'Changes could not be saved. Check your connection and try again.');
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };
  const handleEdit = supplier => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      contact_person: supplier.contact_person || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      status: supplier.status
    });
    setFormError('');
    setShowModal(true);
  };
  const handleDelete = async () => {
    try {
      await api.delete(`/suppliers/${deleteConfirm.id}`);
      toast.success('Supplier deactivated successfully');
      setDeleteConfirm(null);
      fetchSuppliers();
    } catch (error) {
      toast.error('Failed to delete supplier');
    }
  };
  const resetForm = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      contact_person: '',
      phone: '',
      email: '',
      address: '',
      status: 'active'
    });
  };
  const filteredSuppliers = suppliers.filter(sup => sup.name.toLowerCase().includes(searchTerm.toLowerCase()));
  if (loading) return <Loading message="Loading suppliers..." />;
  if (loadError) return <ErrorState message={loadError} onRetry={fetchSuppliers} />;
  return <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Suppliers</h1>
          <p className="page-description">Manage your suppliers</p>
        </div>
        <button onClick={() => {
        resetForm();
        setFormError('');
        setShowModal(true);
      }} className="btn btn-primary flex items-center gap-2" type="button">
          <Plus size={20} /> Add Supplier
        </button>
      </div>

      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input aria-label="Search suppliers..." type="text" placeholder="Search suppliers..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input pl-10" />
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <ResponsiveTable className="table" label="Suppliers records">
            <thead>
              <tr>
                <th scope="col">Supplier Name</th>
                <th scope="col">Contact Person</th>
                <th scope="col">Phone</th>
                <th scope="col">Email</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map(supplier => <tr key={supplier.id}>
                  <td className="font-medium">{supplier.name}</td>
                  <td>{supplier.contact_person || '-'}</td>
                  <td>{supplier.phone || '-'}</td>
                  <td>{supplier.email || '-'}</td>
                  <td>
                    <span className={`badge ${supplier.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                      {supplier.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button aria-label="Edit record" title="Edit record" onClick={() => handleEdit(supplier)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" type="button"><Edit size={18} /></button>
                      <button aria-label="Delete or deactivate record" title="Delete or deactivate record" onClick={() => setDeleteConfirm(supplier)} className="p-1 text-red-600 hover:bg-red-50 rounded" type="button"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>)}
            </tbody>
          </ResponsiveTable>
          {filteredSuppliers.length === 0 && <EmptyState title="No suppliers found" message="Records will appear here when they are available. Try changing your search if one is applied." />}
        </div>
      </div>

      <Modal busy={saving} isOpen={showModal} onClose={() => {
      setShowModal(false);
      resetForm();
    }} title={editingSupplier ? 'Edit Supplier' : 'Add Supplier'}>
        <AsyncForm error={formError} onBusyChange={setSaving} onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="suppliers-field-1" className="label">Supplier Name *</label>
            <input id="suppliers-field-1" type="text" value={formData.name} onChange={e => setFormData({
            ...formData,
            name: e.target.value
          })} className="input" required />
          </div>
          <div>
            <label htmlFor="suppliers-field-2" className="label">Contact Person</label>
            <input id="suppliers-field-2" type="text" value={formData.contact_person} onChange={e => setFormData({
            ...formData,
            contact_person: e.target.value
          })} className="input" />
          </div>
          <div>
            <label htmlFor="suppliers-field-3" className="label">Phone</label>
            <input id="suppliers-field-3" type="text" value={formData.phone} onChange={e => setFormData({
            ...formData,
            phone: e.target.value
          })} className="input" />
          </div>
          <div>
            <label htmlFor="suppliers-field-4" className="label">Email</label>
            <input id="suppliers-field-4" type="email" value={formData.email} onChange={e => setFormData({
            ...formData,
            email: e.target.value
          })} className="input" />
          </div>
          <div>
            <label htmlFor="suppliers-field-5" className="label">Address</label>
            <textarea id="suppliers-field-5" value={formData.address} onChange={e => setFormData({
            ...formData,
            address: e.target.value
          })} className="input" rows="2" />
          </div>
          <div>
            <label htmlFor="suppliers-field-6" className="label">Status</label>
            <select id="suppliers-field-6" value={formData.status} onChange={e => setFormData({
            ...formData,
            status: e.target.value
          })} className="input">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary flex-1">{editingSupplier ? 'Update' : 'Create'}</button>
            <button type="button" onClick={() => {
            setShowModal(false);
            resetForm();
          }} className="btn btn-secondary flex-1">Cancel</button>
          </div>
        </AsyncForm>
      </Modal>

      <ConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete} title="Deactivate Supplier" message={`Are you sure you want to deactivate "${deleteConfirm?.name}"?`} />
    </div>;
};
export default Suppliers;
