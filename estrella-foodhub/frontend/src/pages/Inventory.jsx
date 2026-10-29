import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { formatCurrency, getStockStatus } from '../utils/format';
import { Search, Plus, AlertTriangle } from 'lucide-react';
import Loading from '../components/Loading';
import Modal from '../components/Modal';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
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
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const [inventoryRes, productsRes] = await Promise.all([
        api.get(`/inventory${params}`),
        api.get('/products?status=active')
      ]);
      setInventory(inventoryRes.data.data);
      setProducts(productsRes.data.data);
    } catch (error) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAdjustment = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventory/adjustments', formData);
      toast.success('Inventory adjusted successfully');
      setShowAdjustmentModal(false);
      setFormData({ product_id: '', adjustment_quantity: '', reason: 'manual_correction', remarks: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to adjust inventory');
    }
  };

  const filteredInventory = inventory.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loading message="Loading inventory..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Monitor and adjust product stock levels</p>
        </div>
        <button onClick={() => setShowAdjustmentModal(true)} className="btn btn-primary flex items-center gap-2">
          <Plus size={20} /> Adjust Inventory
        </button>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input type="text" placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input pl-10" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input sm:w-48">
            <option value="">All Status</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Min Stock</th>
                <th>Max Stock</th>
                <th>Unit</th>
                <th>Value</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map(product => {
                const status = getStockStatus(product);
                const stockValue = product.current_stock * parseFloat(product.cost_price);
                return (
                  <tr key={product.id}>
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
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredInventory.length === 0 && (
            <div className="text-center py-12 text-gray-500">No inventory found</div>
          )}
        </div>
      </div>

      <Modal isOpen={showAdjustmentModal} onClose={() => setShowAdjustmentModal(false)} title="Adjust Inventory" size="md">
        <form onSubmit={handleSubmitAdjustment} className="space-y-4">
          <div>
            <label className="label">Product *</label>
            <select value={formData.product_id} onChange={(e) => setFormData({ ...formData, product_id: e.target.value })} className="input" required>
              <option value="">Select Product</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} (Current: {product.current_stock})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Adjustment Quantity * (Use + or -)</label>
            <input type="number" value={formData.adjustment_quantity} onChange={(e) => setFormData({ ...formData, adjustment_quantity: e.target.value })} className="input" placeholder="e.g., +10 or -5" required />
            <p className="text-xs text-gray-500 mt-1">Positive to add, negative to reduce</p>
          </div>
          <div>
            <label className="label">Reason *</label>
            <select value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} className="input" required>
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
            <label className="label">Remarks</label>
            <textarea value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} className="input" rows="3" placeholder="Additional notes..." />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary flex-1">Adjust Inventory</button>
            <button type="button" onClick={() => setShowAdjustmentModal(false)} className="btn btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Inventory;
