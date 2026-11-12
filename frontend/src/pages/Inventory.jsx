import ResponsiveTable from '../components/ResponsiveTable';
import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { adjustmentPayload } from '../utils/inventory';
import { formatCurrency, getStockStatus } from '../utils/format';
import { Search, Plus } from 'lucide-react';
import Loading from '../components/Loading';
import { ErrorState } from '../components/AsyncState';
import Modal from '../components/Modal';
import AsyncForm from '../components/AsyncForm';
const Inventory = () => {
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [formData, setFormData] = useState({
    product_id: '',
    adjustment_quantity: '',
    reason: 'manual_correction',
    remarks: ''
  });
  useEffect(() => {
    fetchData();
  }, [statusFilter]);
  const fetchData = async () => {
    setLoadError('');
    setLoading(true);
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const [inventoryRes, productsRes] = await Promise.all([api.get(`/inventory${params}`), api.get('/products?status=active')]);
      setInventory(inventoryRes.data.data);
      setProducts(productsRes.data.data);
    } catch (error) {
      setLoadError(error.response?.data?.message || 'Unable to load this information. Check your connection and try again.');
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };
  const handleSubmitAdjustment = async e => {
    e.preventDefault();
    setFormError('');
    try {
      await api.post('/inventory/adjustments', adjustmentPayload(formData));
      toast.success('Inventory adjusted successfully');
      setShowAdjustmentModal(false);
      setFormData({
        product_id: '',
        adjustment_quantity: '',
        reason: 'manual_correction',
        remarks: ''
      });
      fetchData();
    } catch (error) {
      setFormError(error.response?.data?.message || error.message || 'Changes could not be saved.');
      toast.error(error.response?.data?.message || 'Failed to adjust inventory');
    }
  };
  const filteredInventory = inventory.filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.sku.toLowerCase().includes(searchTerm.toLowerCase()));
  if (loading) return <Loading message="Loading inventory..." />;
  if (loadError) return <ErrorState message={loadError} onRetry={fetchData} />;
  return <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Inventory Management</h1>
          <p className="page-description">Monitor and adjust product stock levels</p>
        </div>
        <button onClick={() => {
        setFormError('');
        setShowAdjustmentModal(true);
      }} className="btn btn-primary flex items-center gap-2" type="button">
          <Plus size={20} /> Adjust Inventory
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[['Products in this view', inventory.length], ['Low stock', inventory.filter(p => Number(p.current_stock) > 0 && Number(p.current_stock) <= Number(p.minimum_stock)).length], ['Out of stock', inventory.filter(p => Number(p.current_stock) <= 0).length]].map(([label, value]) => <div className="card" key={label}><p className="text-xs text-gray-500">{label}</p><p className="kpi-value">{value}</p></div>)}
      </div>
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input aria-label="Search products..." type="text" placeholder="Search products..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input pl-10" />
          </div>
          <select aria-label="Filter stock status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input sm:w-48">
            <option value="">All Status</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <ResponsiveTable className="table" label="Inventory records">
            <thead>
              <tr>
                <th scope="col">SKU</th>
                <th scope="col">Product Name</th>
                <th scope="col">Category</th>
                <th scope="col">Current Stock</th>
                <th scope="col">Min Stock</th>
                <th scope="col">Max Stock</th>
                <th scope="col">Unit</th>
                <th scope="col">Value</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map(product => {
              const status = getStockStatus(product);
              const stockValue = product.current_stock * parseFloat(product.cost_price);
              return <tr key={product.id}>
                    <td className="font-medium">{product.sku}</td>
                    <td>{product.name}</td>
                    <td>{product.category?.name}</td>
                    <td className="font-semibold">{product.current_stock}</td>
                    <td>{product.minimum_stock}</td>
                    <td>{product.maximum_stock}</td>
                    <td>{product.unit}</td>
                    <td>{formatCurrency(stockValue)}</td>
                    <td>
                      <span className={`badge badge-${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                  </tr>;
            })}
            </tbody>
          </ResponsiveTable>
          {filteredInventory.length === 0 && <div className="text-center py-12 text-gray-500">No inventory found</div>}
        </div>
      </div>

      <Modal busy={saving} isOpen={showAdjustmentModal} onClose={() => setShowAdjustmentModal(false)} title="Adjust Inventory" size="md">
        <AsyncForm error={formError} onBusyChange={setSaving} onSubmit={handleSubmitAdjustment} className="space-y-4">
          <div>
            <label htmlFor="inventory-field-1" className="label">Product *</label>
            <select id="inventory-field-1" value={formData.product_id} onChange={e => setFormData({
            ...formData,
            product_id: e.target.value
          })} className="input" required>
              <option value="">Select Product</option>
              {products.map(product => <option key={product.id} value={product.id}>
                  {product.name} (Current: {product.current_stock})
                </option>)}
            </select>
          </div>
          <div>
            <label htmlFor="inventory-field-2" className="label">Adjustment Quantity * (Use + or -)</label>
            <input id="inventory-field-2" type="number" value={formData.adjustment_quantity} onChange={e => setFormData({
            ...formData,
            adjustment_quantity: e.target.value
          })} className="input" placeholder="e.g., +10 or -5" required />
            <p className="text-xs text-gray-500 mt-1">Positive to add, negative to reduce</p>
          </div>
          <div>
            <label htmlFor="inventory-field-3" className="label">Reason *</label>
            <select id="inventory-field-3" value={formData.reason} onChange={e => setFormData({
            ...formData,
            reason: e.target.value
          })} className="input" required>
              <option value="manual_correction">Manual Correction</option>
              <option value="damaged">Damaged</option>
              <option value="expired">Expired</option>
              <option value="spoiled">Spoiled</option>
              <option value="missing">Missing</option>
              <option value="overstock">Overstock</option>
              <option value="physical_count">Physical Count</option>
            </select>
          </div>
          <div>
            <label htmlFor="inventory-field-4" className="label">Remarks</label>
            <textarea id="inventory-field-4" value={formData.remarks} onChange={e => setFormData({
            ...formData,
            remarks: e.target.value
          })} className="input" rows="3" placeholder="Additional notes..." />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary flex-1">Adjust Inventory</button>
            <button type="button" onClick={() => setShowAdjustmentModal(false)} className="btn btn-secondary flex-1">Cancel</button>
          </div>
        </AsyncForm>
      </Modal>
    </div>;
};
export default Inventory;
