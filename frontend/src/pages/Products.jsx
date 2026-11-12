import ResponsiveTable from '../components/ResponsiveTable';
import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { categoryParts, menuStalls, matchesMenu } from '../utils/menu';
import { formatCurrency, getStockStatus } from '../utils/format';
import { Plus, Edit, Trash2, Search, Package } from 'lucide-react';
import Loading from '../components/Loading';
import { ErrorState } from '../components/AsyncState';
import Modal from '../components/Modal';
import AsyncForm from '../components/AsyncForm';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAuth } from '../context/AuthContext';
const Products = () => {
  const {
    hasRole
  } = useAuth();
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stallFilter, setStallFilter] = useState('');
  const [sort, setSort] = useState('name');
  const [statusFilter, setStatusFilter] = useState('active');
  const [page, setPage] = useState(1);
  useEffect(() => {
    setPage(1);
  }, [searchTerm, categoryFilter, stallFilter, sort, statusFilter]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    sku: '',
    barcode: '',
    name: '',
    description: '',
    category_id: '',
    supplier_id: '',
    cost_price: '',
    selling_price: '',
    current_stock: '',
    minimum_stock: '',
    maximum_stock: '',
    unit: 'pcs',
    expiration_tracking: false,
    expiration_date: '',
    status: 'active'
  });
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    setLoadError('');
    setLoading(true);
    try {
      const [productsRes, categoriesRes, suppliersRes] = await Promise.all([api.get('/products'), api.get('/categories'), api.get('/suppliers')]);
      setProducts(productsRes.data.data);
      setCategories(categoriesRes.data.data);
      setSuppliers(suppliersRes.data.data);
    } catch (error) {
      setLoadError(error.response?.data?.message || 'Unable to load this information. Check your connection and try again.');
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };
  const filterCategories = categories.filter(category => statusFilter !== 'active' || category.status === 'active');
  const stalls = menuStalls(filterCategories);
  const visibleCategories = filterCategories.filter(category => !stallFilter || categoryParts(category).stall === stallFilter);
  const filteredProducts = products.filter(product => matchesMenu(product, categories, {
    stall: stallFilter,
    category: categoryFilter,
    search: searchTerm
  }) && (!statusFilter || product.status === statusFilter));
  const sortedProducts = [...filteredProducts].sort((a, b) => sort === 'price' ? Number(a.selling_price) - Number(b.selling_price) : sort === 'stock' ? Number(a.current_stock) - Number(b.current_stock) : a.name.localeCompare(b.name));
  const pages = Math.max(1, Math.ceil(sortedProducts.length / 12));
  const currentPage = Math.min(page, pages);
  const visibleProducts = sortedProducts.slice((currentPage - 1) * 12, currentPage * 12);
  const handleSubmit = async e => {
    e.preventDefault();
    setFormError('');
    const payload = {
      ...formData,
      supplier_id: formData.supplier_id || null
    };
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
        toast.success('Product updated successfully');
      } else {
        await api.post('/products', payload);
        toast.success('Product created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      setFormError(error.response?.data?.message || 'Changes could not be saved. Check your connection and try again.');
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };
  const handleEdit = product => {
    setEditingProduct(product);
    setFormData({
      sku: product.sku,
      barcode: product.barcode || '',
      name: product.name,
      description: product.description || '',
      category_id: product.category_id,
      supplier_id: product.supplier_id || '',
      cost_price: product.cost_price,
      selling_price: product.selling_price,
      current_stock: product.current_stock,
      minimum_stock: product.minimum_stock,
      maximum_stock: product.maximum_stock,
      unit: product.unit,
      expiration_tracking: product.expiration_tracking,
      expiration_date: product.expiration_date ? product.expiration_date.split('T')[0] : '',
      status: product.status
    });
    setFormError('');
    setShowModal(true);
  };
  const handleDelete = async () => {
    try {
      await api.delete(`/products/${deleteConfirm.id}`);
      toast.success('Product deactivated successfully');
      setDeleteConfirm(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  };
  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      sku: '',
      barcode: '',
      name: '',
      description: '',
      category_id: '',
      supplier_id: '',
      cost_price: '',
      selling_price: '',
      current_stock: '',
      minimum_stock: '',
      maximum_stock: '',
      unit: 'pcs',
      expiration_tracking: false,
      expiration_date: '',
      status: 'active'
    });
  };
  if (loading) {
    return <Loading message="Loading products..." />;
  }
  if (loadError) return <ErrorState message={loadError} onRetry={fetchData} />;
  const canModify = hasRole(['admin', 'manager']);
  return <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-description">Manage stall menus, prices, and inventory</p>
        </div>
        {canModify && <button onClick={() => {
        resetForm();
        setFormError('');
        setShowModal(true);
      }} className="btn btn-primary flex items-center gap-2" type="button">
            <Plus size={20} />
            Add Product
          </button>}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input aria-label="Search products..." type="text" placeholder="Search products..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input pl-10" />
          </div>
          <select aria-label="Filter by stall" className="input sm:w-44" value={stallFilter} onChange={e => {
          setStallFilter(e.target.value);
          setCategoryFilter('');
        }}><option value="">All stalls</option>{stalls.map(stall => <option key={stall} value={stall}>{stall}</option>)}</select>
          <select aria-label="Filter by category" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="input sm:w-48">
            <option value="">All Categories</option>
            {visibleCategories.map(cat => <option key={cat.id} value={cat.id}>{stallFilter ? categoryParts(cat).section : cat.name}</option>)}
          </select>
          <select aria-label="Filter product status" className="input sm:w-40" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select>
          <select aria-label="Sort products" className="input sm:w-40" value={sort} onChange={e => setSort(e.target.value)}><option value="name">Name A-Z</option><option value="price">Price: low first</option><option value="stock">Stock: low first</option></select>
        </div>
      </div>

      {/* Products Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <ResponsiveTable className="table" label="Products records">
            <thead>
              <tr>
                <th scope="col">SKU</th>
                <th scope="col">Product Name</th>
                <th scope="col">Category</th>
                <th scope="col">Cost Price</th>
                <th scope="col">Selling Price</th>
                <th scope="col">Stock</th>
                <th scope="col">Status</th>
                {canModify && <th scope="col">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {visibleProducts.map(product => {
              const stockStatus = getStockStatus(product);
              return <tr key={product.id}>
                    <td className="font-medium">{product.sku}</td>
                    <td>
                      <div className="flex items-center gap-2 font-medium"><span className="rank-art"><Package size={17} /></span>{product.name}</div>
                      <div className="text-xs text-gray-500">{product.supplier?.name}</div>
                    </td>
                    <td>{product.category?.name}</td>
                    <td>{formatCurrency(product.cost_price)}</td>
                    <td className="font-semibold">{formatCurrency(product.selling_price)}</td>
                    <td>
                      <div>{product.current_stock} {product.unit}</div>
                      <div className="text-xs text-gray-500">Min: {product.minimum_stock}</div>
                    </td>
                    <td>
                      {product.status === 'inactive' && <span className="badge badge-secondary mr-1">Inactive</span>}
                      <span className={`badge badge-${stockStatus.color}`}>
                        {stockStatus.label}
                      </span>
                    </td>
                    {canModify && <td>
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(product)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Edit" aria-label="Edit" type="button">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => setDeleteConfirm(product)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Delete" aria-label="Delete" type="button">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>}
                  </tr>;
            })}
            </tbody>
          </ResponsiveTable>
          {filteredProducts.length === 0 && <div className="text-center py-12 text-gray-500">
              No products found
            </div>}
        </div>
      </div>

      <Pagination page={currentPage} pages={pages} count={sortedProducts.length} pageSize={12} onChange={setPage} />
      {/* Add/Edit Modal */}
      <Modal busy={saving} isOpen={showModal} onClose={() => {
      setShowModal(false);
      resetForm();
    }} title={editingProduct ? 'Edit Product' : 'Add New Product'} size="lg">
        <AsyncForm error={formError} onBusyChange={setSaving} onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="products-field-1" className="label">SKU *</label>
              <input id="products-field-1" type="text" value={formData.sku} onChange={e => setFormData({
              ...formData,
              sku: e.target.value
            })} className="input" required />
            </div>
            <div>
              <label htmlFor="products-field-2" className="label">Barcode</label>
              <input id="products-field-2" type="text" value={formData.barcode} onChange={e => setFormData({
              ...formData,
              barcode: e.target.value
            })} className="input" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="products-field-3" className="label">Product Name *</label>
              <input id="products-field-3" type="text" value={formData.name} onChange={e => setFormData({
              ...formData,
              name: e.target.value
            })} className="input" required />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="products-field-4" className="label">Description</label>
              <textarea id="products-field-4" value={formData.description} onChange={e => setFormData({
              ...formData,
              description: e.target.value
            })} className="input" rows="2" />
            </div>
            <div>
              <label htmlFor="products-field-5" className="label">Category *</label>
              <select id="products-field-5" value={formData.category_id} onChange={e => setFormData({
              ...formData,
              category_id: e.target.value
            })} className="input" required>
                <option value="">Select Category</option>
                {categories.filter(c => c.status === 'active').map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="products-field-6" className="label">Supplier (optional)</label>
              <select id="products-field-6" value={formData.supplier_id} onChange={e => setFormData({
              ...formData,
              supplier_id: e.target.value
            })} className="input">
                <option value="">No supplier assigned</option>
                {suppliers.filter(s => s.status === 'active').map(sup => <option key={sup.id} value={sup.id}>{sup.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="products-field-7" className="label">Cost Price *</label>
              <input id="products-field-7" type="number" min="0" step="0.01" value={formData.cost_price} onChange={e => setFormData({
              ...formData,
              cost_price: e.target.value
            })} className="input" required />
            </div>
            <div>
              <label htmlFor="products-field-8" className="label">Selling Price *</label>
              <input id="products-field-8" type="number" min="0" step="0.01" value={formData.selling_price} onChange={e => setFormData({
              ...formData,
              selling_price: e.target.value
            })} className="input" required />
            </div>
            <div>
              <label htmlFor="products-field-9" className="label">Current Stock *</label>
              <input id="products-field-9" type="number" min="0" step="1" value={formData.current_stock} onChange={e => setFormData({
              ...formData,
              current_stock: e.target.value
            })} className="input" required />
            </div>
            <div>
              <label htmlFor="products-field-10" className="label">Minimum Stock *</label>
              <input id="products-field-10" type="number" min="0" step="1" value={formData.minimum_stock} onChange={e => setFormData({
              ...formData,
              minimum_stock: e.target.value
            })} className="input" required />
            </div>
            <div>
              <label htmlFor="products-field-11" className="label">Maximum Stock *</label>
              <input id="products-field-11" type="number" min="0" step="1" value={formData.maximum_stock} onChange={e => setFormData({
              ...formData,
              maximum_stock: e.target.value
            })} className="input" required />
            </div>
            <div>
              <label htmlFor="products-field-12" className="label">Unit *</label>
              <select id="products-field-12" value={formData.unit} onChange={e => setFormData({
              ...formData,
              unit: e.target.value
            })} className="input">
                <option value="pcs">Pieces</option>
                <option value="cup">Cup</option>
                <option value="set">Set / bundle</option>
                <option value="portion">Portion</option>
                <option value="add-on">Add-on</option>
                <option value="pack">Pack</option>
                <option value="box">Box</option>
                <option value="bottle">Bottle</option>
                <option value="can">Can</option>
                <option value="kg">Kilogram</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.expiration_tracking} onChange={e => setFormData({
                ...formData,
                expiration_tracking: e.target.checked
              })} className="rounded" />
                <span className="text-sm font-medium text-gray-700">Enable Expiration Tracking</span>
              </label>
            </div>
            {formData.expiration_tracking && <div>
                <label htmlFor="products-field-13" className="label">Expiration Date</label>
                <input id="products-field-13" type="date" value={formData.expiration_date} onChange={e => setFormData({
              ...formData,
              expiration_date: e.target.value
            })} className="input" />
              </div>}
            <div>
              <label htmlFor="products-field-14" className="label">Status</label>
              <select id="products-field-14" value={formData.status} onChange={e => setFormData({
              ...formData,
              status: e.target.value
            })} className="input">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button type="submit" className="btn btn-primary flex-1">
              {editingProduct ? 'Update Product' : 'Create Product'}
            </button>
            <button type="button" onClick={() => {
            setShowModal(false);
            resetForm();
          }} className="btn btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </AsyncForm>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete} title="Deactivate Product" message={`Are you sure you want to deactivate "${deleteConfirm?.name}"? This product will be marked as inactive.`} confirmText="Deactivate" />
    </div>;
};
export default Products;
