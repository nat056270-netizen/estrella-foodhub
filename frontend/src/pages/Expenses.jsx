import ResponsiveTable from '../components/ResponsiveTable';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import { formatCurrency, formatDate } from '../utils/format';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Loading from '../components/Loading';
import { ErrorState } from '../components/AsyncState';
import Modal from '../components/Modal';
import AsyncForm from '../components/AsyncForm';
import ConfirmDialog from '../components/ConfirmDialog';
const Expenses = () => {
  const {
    hasRole
  } = useAuth();
  const canDelete = hasRole(['admin']);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    category: 'other',
    description: '',
    amount: '',
    expense_date: '',
    remarks: ''
  });
  useEffect(() => {
    fetchExpenses();
  }, []);
  const fetchExpenses = async () => {
    setLoadError('');
    setLoading(true);
    try {
      const response = await api.get('/expenses');
      setExpenses(response.data.data);
    } catch (error) {
      setLoadError(error.response?.data?.message || 'Unable to load this information. Check your connection and try again.');
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async e => {
    e.preventDefault();
    setFormError('');
    try {
      if (editingExpense) {
        await api.put(`/expenses/${editingExpense.id}`, formData);
        toast.success('Expense updated successfully');
      } else {
        await api.post('/expenses', formData);
        toast.success('Expense created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchExpenses();
    } catch (error) {
      setFormError(error.response?.data?.message || 'Changes could not be saved. Check your connection and try again.');
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };
  const handleEdit = expense => {
    setEditingExpense(expense);
    setFormData({
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      expense_date: expense.expense_date.split('T')[0],
      remarks: expense.remarks || ''
    });
    setFormError('');
    setShowModal(true);
  };
  const handleDelete = async () => {
    try {
      await api.delete(`/expenses/${deleteConfirm.id}`);
      toast.success('Expense deleted successfully');
      setDeleteConfirm(null);
      fetchExpenses();
    } catch (error) {
      toast.error('Failed to delete expense');
    }
  };
  const resetForm = () => {
    setEditingExpense(null);
    setFormData({
      category: 'other',
      description: '',
      amount: '',
      expense_date: '',
      remarks: ''
    });
  };
  if (loading) return <Loading message="Loading expenses..." />;
  if (loadError) return <ErrorState message={loadError} onRetry={fetchExpenses} />;
  const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  return <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="page-description">Track business expenses</p>
        </div>
        <button onClick={() => {
        resetForm();
        setFormError('');
        setShowModal(true);
      }} className="btn btn-primary flex items-center gap-2" type="button">
          <Plus size={20} /> Add Expense
        </button>
      </div>

      <div className="card bg-red-50 border-red-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-red-700">Total Expenses</p>
            <p className="text-3xl font-bold text-red-900">{formatCurrency(totalExpenses)}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <ResponsiveTable className="table" label="Expenses records">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Category</th>
                <th scope="col">Description</th>
                <th scope="col">Amount</th>
                <th scope="col">Added By</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(expense => <tr key={expense.id}>
                  <td>{formatDate(expense.expense_date)}</td>
                  <td className="capitalize">{expense.category.replace('_', ' ')}</td>
                  <td>{expense.description}</td>
                  <td className="font-semibold text-red-600">{formatCurrency(expense.amount)}</td>
                  <td>{expense.user?.first_name} {expense.user?.last_name}</td>
                  <td>
                    <div className="flex gap-2">
                      <button aria-label="Edit record" title="Edit record" onClick={() => handleEdit(expense)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" type="button"><Edit size={18} /></button>
                      {canDelete && <button aria-label="Delete or deactivate record" title="Delete or deactivate record" onClick={() => setDeleteConfirm(expense)} className="p-1 text-red-600 hover:bg-red-50 rounded" type="button"><Trash2 size={18} /></button>}
                    </div>
                  </td>
                </tr>)}
            </tbody>
          </ResponsiveTable>
          {expenses.length === 0 && <div className="text-center py-12 text-gray-500">No expenses found</div>}
        </div>
      </div>

      <Modal busy={saving} isOpen={showModal} onClose={() => {
      setShowModal(false);
      resetForm();
    }} title={editingExpense ? 'Edit Expense' : 'Add Expense'}>
        <AsyncForm error={formError} onBusyChange={setSaving} onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="expenses-field-1" className="label">Category *</label>
            <select id="expenses-field-1" value={formData.category} onChange={e => setFormData({
            ...formData,
            category: e.target.value
          })} className="input" required>
              <option value="utilities">Utilities</option>
              <option value="supplies">Supplies</option>
              <option value="transportation">Transportation</option>
              <option value="maintenance">Maintenance</option>
              <option value="salaries">Salaries</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="expenses-field-2" className="label">Description *</label>
            <input id="expenses-field-2" type="text" value={formData.description} onChange={e => setFormData({
            ...formData,
            description: e.target.value
          })} className="input" required />
          </div>
          <div>
            <label htmlFor="expenses-field-3" className="label">Amount *</label>
            <input id="expenses-field-3" type="number" step="0.01" value={formData.amount} onChange={e => setFormData({
            ...formData,
            amount: e.target.value
          })} className="input" required />
          </div>
          <div>
            <label htmlFor="expenses-field-4" className="label">Date *</label>
            <input id="expenses-field-4" type="date" value={formData.expense_date} onChange={e => setFormData({
            ...formData,
            expense_date: e.target.value
          })} className="input" required />
          </div>
          <div>
            <label htmlFor="expenses-field-5" className="label">Remarks</label>
            <textarea id="expenses-field-5" value={formData.remarks} onChange={e => setFormData({
            ...formData,
            remarks: e.target.value
          })} className="input" rows="2" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary flex-1">{editingExpense ? 'Update' : 'Create'}</button>
            <button type="button" onClick={() => {
            setShowModal(false);
            resetForm();
          }} className="btn btn-secondary flex-1">Cancel</button>
          </div>
        </AsyncForm>
      </Modal>

      <ConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete} title="Delete Expense" message={`Are you sure you want to delete this expense?`} />
    </div>;
};
export default Expenses;
