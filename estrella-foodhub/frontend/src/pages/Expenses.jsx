import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { formatCurrency, formatDate } from '../utils/format';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Loading from '../components/Loading';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({ category: 'other', description: '', amount: '', expense_date: '', remarks: '' });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await api.get('/expenses');
      setExpenses(response.data.data);
    } catch (error) {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      expense_date: expense.expense_date.split('T')[0],
      remarks: expense.remarks || ''
    });
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
    setFormData({ category: 'other', description: '', amount: '', expense_date: '', remarks: '' });
  };

  if (loading) return <Loading message="Loading expenses..." />;

  const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600">Track business expenses</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn btn-primary flex items-center gap-2">
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
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Added By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(expense => (
                <tr key={expense.id}>
                  <td>{formatDate(expense.expense_date)}</td>
                  <td className="capitalize">{expense.category.replace('_', ' ')}</td>
                  <td>{expense.description}</td>
                  <td className="font-semibold text-red-600">{formatCurrency(expense.amount)}</td>
                  <td>{expense.user?.first_name} {expense.user?.last_name}</td>
                  <td>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(expense)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit size={18} /></button>
                      <button onClick={() => setDeleteConfirm(expense)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {expenses.length === 0 && <div className="text-center py-12 text-gray-500">No expenses found</div>}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editingExpense ? 'Edit Expense' : 'Add Expense'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Category *</label>
            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="input" required>
              <option value="utilities">Utilities</option>
              <option value="supplies">Supplies</option>
              <option value="transportation">Transportation</option>
              <option value="maintenance">Maintenance</option>
              <option value="salaries">Salaries</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="label">Description *</label>
            <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input" required />
          </div>
          <div>
            <label className="label">Amount *</label>
            <input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="input" required />
          </div>
          <div>
            <label className="label">Date *</label>
            <input type="date" value={formData.expense_date} onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })} className="input" required />
          </div>
          <div>
            <label className="label">Remarks</label>
            <textarea value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} className="input" rows="2" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary flex-1">{editingExpense ? 'Update' : 'Create'}</button>
            <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="btn btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete} title="Delete Expense" message={`Are you sure you want to delete this expense?`} />
    </div>
  );
};

export default Expenses;
