import ResponsiveTable from '../components/ResponsiveTable';
import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { formatCurrency, formatDate } from '../utils/format';
import { Plus, Eye, CheckCircle } from 'lucide-react';
import Loading from '../components/Loading';
import { ErrorState, EmptyState } from '../components/AsyncState';
import Modal from '../components/Modal';
import AsyncForm from '../components/AsyncForm';
import ConfirmDialog from '../components/ConfirmDialog';
const Purchases = () => {
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [receiveConfirm, setReceiveConfirm] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewPurchase, setViewPurchase] = useState(null);
  const [items, setItems] = useState([{
    product_id: '',
    quantity: '',
    cost_price: ''
  }]);
  const [formData, setFormData] = useState({
    supplier_id: '',
    notes: ''
  });
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    setLoadError('');
    setLoading(true);
    try {
      const [purchasesRes, suppliersRes, productsRes] = await Promise.all([api.get('/purchases'), api.get('/suppliers?status=active'), api.get('/products?status=active')]);
      setPurchases(purchasesRes.data.data);
      setSuppliers(suppliersRes.data.data);
      setProducts(productsRes.data.data);
    } catch (error) {
      setLoadError(error.response?.data?.message || 'Unable to load this information. Check your connection and try again.');
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async e => {
    e.preventDefault();
    setFormError('');
    if (!items.length || items.some(item => !item.product_id || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) <= 0 || !Number.isFinite(Number(item.cost_price)) || Number(item.cost_price) < 0)) {
      setFormError('Choose at least one product with a positive whole quantity and a valid cost.');
      return;
    }
    try {
      await api.post('/purchases', {
        ...formData,
        items
      });
      toast.success('Purchase order created successfully');
      setShowCreateModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      setFormError(error.response?.data?.message || 'Changes could not be saved. Check your connection and try again.');
      toast.error(error.response?.data?.message || 'Failed to create purchase');
    }
  };
  const handleReceive = async purchaseId => {
    try {
      await api.post(`/purchases/${purchaseId}/receive`);
      setReceiveConfirm(null);
      toast.success('Purchase received successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to receive purchase');
    }
  };
  const resetForm = () => {
    setFormData({
      supplier_id: '',
      notes: ''
    });
    setItems([{
      product_id: '',
      quantity: '',
      cost_price: ''
    }]);
  };
  const addItem = () => {
    setItems([...items, {
      product_id: '',
      quantity: '',
      cost_price: ''
    }]);
  };
  const removeItem = index => {
    setItems(items.filter((_, i) => i !== index));
  };
  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };
    setItems(newItems);
  };
  if (loading) return <Loading message="Loading purchases..." />;
  if (loadError) return <ErrorState message={loadError} onRetry={fetchData} />;
  return <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Purchase Orders</h1>
          <p className="page-description">Manage purchase orders and stock receiving</p>
        </div>
        <button onClick={() => {
        setFormError('');
        setShowCreateModal(true);
      }} className="btn btn-primary flex items-center gap-2" type="button">
          <Plus size={20} /> Create Purchase Order
        </button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <ResponsiveTable className="table" label="Purchases records">
            <thead>
              <tr>
                <th scope="col">Purchase #</th>
                <th scope="col">Supplier</th>
                <th scope="col">Date</th>
                <th scope="col">Total Cost</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map(purchase => <tr key={purchase.id}>
                  <td className="font-medium">{purchase.purchase_number}</td>
                  <td>{purchase.supplier?.name}</td>
                  <td>{formatDate(purchase.purchase_date)}</td>
                  <td className="font-semibold">{formatCurrency(purchase.total_cost)}</td>
                  <td>
                    <span className={`badge ${purchase.status === 'received' ? 'badge-success' : purchase.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>
                      {purchase.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button aria-label="View purchase details" title="View purchase details" onClick={() => setViewPurchase(purchase)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" type="button"><Eye size={18} /></button>
                      {purchase.status === 'pending' && <button onClick={() => setReceiveConfirm(purchase)} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Receive" aria-label="Receive" type="button">
                          <CheckCircle size={18} />
                        </button>}
                    </div>
                  </td>
                </tr>)}
            </tbody>
          </ResponsiveTable>
          {purchases.length === 0 && <EmptyState title="No purchases found" message="Records will appear here when they are available. Try changing your search if one is applied." />}
        </div>
      </div>

      <ConfirmDialog isOpen={!!receiveConfirm} onClose={() => setReceiveConfirm(null)} onConfirm={() => handleReceive(receiveConfirm.id)} title="Receive this purchase?" message="Confirm that these items have arrived. Receiving this purchase will update the existing inventory." confirmText="Receive purchase" />
      <Modal busy={saving} isOpen={showCreateModal} onClose={() => {
      setShowCreateModal(false);
      resetForm();
    }} title="Create Purchase Order" size="lg">
        <AsyncForm error={formError} onBusyChange={setSaving} onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="purchases-field-1" className="label">Supplier *</label>
            <select id="purchases-field-1" value={formData.supplier_id} onChange={e => setFormData({
            ...formData,
            supplier_id: e.target.value
          })} className="input" required>
              <option value="">Select Supplier</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div>
            <p className="label">Order items</p>
            {items.map((item, idx) => <div key={idx} className="grid grid-cols-2 sm:flex gap-2 mb-3 p-3 rounded-xl bg-gray-50">
                <select aria-label={`Product for item ${idx + 1}`} value={item.product_id} onChange={e => updateItem(idx, 'product_id', e.target.value)} className="input col-span-2 sm:flex-1 sm:min-w-0" required>
                  <option value="">Select Product</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input aria-label={`Quantity for item ${idx + 1}`} type="number" min="1" step="1" placeholder="Qty" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} className="input sm:w-20" required />
                <input aria-label={`Unit cost for item ${idx + 1}`} type="number" min="0" step="0.01" placeholder="Cost" value={item.cost_price} onChange={e => updateItem(idx, 'cost_price', e.target.value)} className="input sm:w-28" required />
                {items.length > 1 && <button type="button" onClick={() => removeItem(idx)} className="btn btn-danger">Remove</button>}
              </div>)}
            <button type="button" onClick={addItem} className="btn btn-secondary text-sm">Add Item</button>
          </div>

          <div>
            <label htmlFor="purchases-field-2" className="label">Notes</label>
            <textarea id="purchases-field-2" value={formData.notes} onChange={e => setFormData({
            ...formData,
            notes: e.target.value
          })} className="input" rows="2" />
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary flex-1">Create Purchase Order</button>
            <button type="button" onClick={() => {
            setShowCreateModal(false);
            resetForm();
          }} className="btn btn-secondary flex-1">Cancel</button>
          </div>
        </AsyncForm>
      </Modal>

      <Modal busy={saving} isOpen={!!viewPurchase} onClose={() => setViewPurchase(null)} title="Purchase Details" size="lg">
        {viewPurchase && <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><p className="text-sm text-gray-600">Purchase #</p><p className="font-semibold">{viewPurchase.purchase_number}</p></div>
              <div><p className="text-sm text-gray-600">Supplier</p><p className="font-semibold">{viewPurchase.supplier?.name}</p></div>
              <div><p className="text-sm text-gray-600">Date</p><p className="font-semibold">{formatDate(viewPurchase.purchase_date)}</p></div>
              <div><p className="text-sm text-gray-600">Status</p><p className="font-semibold capitalize">{viewPurchase.status}</p></div>
            </div>
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Items</h4>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-2" scope="col">Product</th>
                    <th className="text-center p-2" scope="col">Qty</th>
                    <th className="text-right p-2" scope="col">Cost</th>
                    <th className="text-right p-2" scope="col">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {viewPurchase.items?.map((item, idx) => <tr key={idx} className="border-t">
                      <td className="p-2">{item.product?.name}</td>
                      <td className="text-center p-2">{item.quantity}</td>
                      <td className="text-right p-2">{formatCurrency(item.cost_price)}</td>
                      <td className="text-right p-2">{formatCurrency(item.subtotal)}</td>
                    </tr>)}
                </tbody>
              </table>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total Cost:</span>
                <span>{formatCurrency(viewPurchase.total_cost)}</span>
              </div>
            </div>
          </div>}
      </Modal>
    </div>;
};
export default Purchases;
