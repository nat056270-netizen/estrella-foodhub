import ResponsiveTable from '../components/ResponsiveTable';
import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import Loading from '../components/Loading';
import { ErrorState } from '../components/AsyncState';
import Modal from '../components/Modal';
import AsyncForm from '../components/AsyncForm';
import ConfirmDialog from '../components/ConfirmDialog';
const Categories = () => {
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [categories, setCategories] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active'
  });
  useEffect(() => {
    fetchCategories();
  }, []);
  const fetchCategories = async () => {
    setLoadError('');
    setLoading(true);
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data);
    } catch (error) {
      setLoadError(error.response?.data?.message || 'Unable to load this information. Check your connection and try again.');
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async e => {
    e.preventDefault();
    setFormError('');
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, formData);
        toast.success('Category updated successfully');
      } else {
        await api.post('/categories', formData);
        toast.success('Category created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      setFormError(error.response?.data?.message || 'Changes could not be saved. Check your connection and try again.');
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };
  const handleEdit = category => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      status: category.status
    });
    setFormError('');
    setShowModal(true);
  };
  const handleDelete = async () => {
    try {
      await api.delete(`/categories/${deleteConfirm.id}`);
      toast.success('Category deactivated successfully');
      setDeleteConfirm(null);
      fetchCategories();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };
  const resetForm = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      status: 'active'
    });
  };
  const filteredCategories = categories.filter(cat => cat.name.toLowerCase().includes(searchTerm.toLowerCase()) && (!statusFilter || cat.status === statusFilter));
  if (loading) return <Loading message="Loading categories..." />;
  if (loadError) return <ErrorState message={loadError} onRetry={fetchCategories} />;
  return <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-description">Manage product categories</p>
        </div>
        <button onClick={() => {
        resetForm();
        setFormError('');
        setShowModal(true);
      }} className="btn btn-primary flex items-center gap-2" type="button">
          <Plus size={20} /> Add Category
        </button>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3"><div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input aria-label="Search categories..." type="text" placeholder="Search categories..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input pl-10" /></div><select className="input sm:w-44" aria-label="Filter category status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="active">Active sections</option><option value="inactive">Archived sections</option><option value="">All sections</option></select>
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <ResponsiveTable className="table" label="Categories records">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Description</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map(category => <tr key={category.id}>
                  <td className="font-medium">{category.name}</td>
                  <td className="text-gray-600">{category.description || '-'}</td>
                  <td>
                    <span className={`badge ${category.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                      {category.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button aria-label="Edit record" title="Edit record" onClick={() => handleEdit(category)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" type="button">
                        <Edit size={18} />
                      </button>
                      <button aria-label="Delete or deactivate record" title="Delete or deactivate record" onClick={() => setDeleteConfirm(category)} className="p-1 text-red-600 hover:bg-red-50 rounded" type="button">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>)}
            </tbody>
          </ResponsiveTable>
        </div>
      </div>

      <Modal busy={saving} isOpen={showModal} onClose={() => {
      setShowModal(false);
      resetForm();
    }} title={editingCategory ? 'Edit Category' : 'Add Category'}>
        <AsyncForm error={formError} onBusyChange={setSaving} onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="categories-field-1" className="label">Category Name *</label>
            <input id="categories-field-1" type="text" value={formData.name} onChange={e => setFormData({
            ...formData,
            name: e.target.value
          })} className="input" required />
          </div>
          <div>
            <label htmlFor="categories-field-2" className="label">Description</label>
            <textarea id="categories-field-2" value={formData.description} onChange={e => setFormData({
            ...formData,
            description: e.target.value
          })} className="input" rows="3" />
          </div>
          <div>
            <label htmlFor="categories-field-3" className="label">Status</label>
            <select id="categories-field-3" value={formData.status} onChange={e => setFormData({
            ...formData,
            status: e.target.value
          })} className="input">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary flex-1">{editingCategory ? 'Update' : 'Create'}</button>
            <button type="button" onClick={() => {
            setShowModal(false);
            resetForm();
          }} className="btn btn-secondary flex-1">Cancel</button>
          </div>
        </AsyncForm>
      </Modal>

      <ConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete} title="Deactivate Category" message={`Are you sure you want to deactivate "${deleteConfirm?.name}"?`} />
    </div>;
};
export default Categories;
