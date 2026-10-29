import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { formatCurrency } from '../utils/format';
import { FileText, TrendingUp, Package, ShoppingBag, DollarSign } from 'lucide-react';
import Loading from '../components/Loading';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ start_date: '', end_date: '' });
  const [salesReport, setSalesReport] = useState(null);
  const [inventoryReport, setInventoryReport] = useState(null);
  const [financialSummary, setFinancialSummary] = useState(null);

  const generateSalesReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(dateRange).toString();
      const response = await api.get(`/reports/sales?${params}`);
      setSalesReport(response.data.data);
      toast.success('Sales report generated');
    } catch (error) {
      toast.error('Failed to generate sales report');
    } finally {
      setLoading(false);
    }
  };

  const generateInventoryReport = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reports/inventory');
      setInventoryReport(response.data.data);
      toast.success('Inventory report generated');
    } catch (error) {
      toast.error('Failed to generate inventory report');
    } finally {
      setLoading(false);
    }
  };

  const generateFinancialSummary = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(dateRange).toString();
      const response = await api.get(`/reports/financial-summary?${params}`);
      setFinancialSummary(response.data.data);
      toast.success('Financial summary generated');
    } catch (error) {
      toast.error('Failed to generate financial summary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600">Generate business reports and analytics</p>
      </div>

      {/* Date Range Filter */}
      <div className="card">
        <h3 className="font-semibold mb-3">Date Range</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="label">Start Date</label>
            <input type="date" value={dateRange.start_date} onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })} className="input" />
          </div>
          <div className="flex-1">
            <label className="label">End Date</label>
            <input type="date" value={dateRange.end_date} onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })} className="input" />
          </div>
        </div>
      </div>

      {/* Report Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button onClick={generateSalesReport} disabled={loading} className="card hover:shadow-lg transition-shadow cursor-pointer text-left">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg"><DollarSign className="text-blue-600" size={24} /></div>
            <div>
              <h3 className="font-semibold">Sales Report</h3>
              <p className="text-sm text-gray-600">View sales transactions</p>
            </div>
          </div>
        </button>

        <button onClick={generateInventoryReport} disabled={loading} className="card hover:shadow-lg transition-shadow cursor-pointer text-left">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg"><Package className="text-purple-600" size={24} /></div>
            <div>
              <h3 className="font-semibold">Inventory Report</h3>
              <p className="text-sm text-gray-600">Current stock levels</p>
            </div>
          </div>
        </button>

        <button onClick={generateFinancialSummary} disabled={loading} className="card hover:shadow-lg transition-shadow cursor-pointer text-left">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg"><TrendingUp className="text-green-600" size={24} /></div>
            <div>
              <h3 className="font-semibold">Financial Summary</h3>
              <p className="text-sm text-gray-600">Profit & loss overview</p>
            </div>
          </div>
        </button>
      </div>

      {/* Sales Report */}
      {salesReport && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Sales Report</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">Total Sales</p>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(salesReport.summary.totalSales)}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">Net Sales</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(salesReport.summary.netSales)}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-700">Transactions</p>
              <p className="text-2xl font-bold text-purple-900">{salesReport.summary.totalTransactions}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">{salesReport.sales.length} transaction(s) found</p>
        </div>
      )}

      {/* Inventory Report */}
      {inventoryReport && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Inventory Report</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">Total Products</p>
              <p className="text-2xl font-bold text-blue-900">{inventoryReport.summary.totalProducts}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">Inventory Value</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(inventoryReport.summary.totalInventoryValue)}</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-700">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-900">{inventoryReport.summary.lowStockCount}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-700">Out of Stock</p>
              <p className="text-2xl font-bold text-red-900">{inventoryReport.summary.outOfStockCount}</p>
            </div>
          </div>
        </div>
      )}

      {/* Financial Summary */}
      {financialSummary && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Financial Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium">Gross Sales</span>
              <span className="text-lg font-bold">{formatCurrency(financialSummary.grossSales)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium">Total Discount</span>
              <span className="text-lg font-bold text-red-600">-{formatCurrency(financialSummary.totalDiscount)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
              <span className="font-medium">Net Sales</span>
              <span className="text-lg font-bold text-blue-600">{formatCurrency(financialSummary.netSales)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium">Cost of Goods Sold</span>
              <span className="text-lg font-bold">-{formatCurrency(financialSummary.costOfGoodsSold)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded">
              <span className="font-medium">Gross Profit</span>
              <span className="text-lg font-bold text-green-600">{formatCurrency(financialSummary.grossProfit)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium">Total Expenses</span>
              <span className="text-lg font-bold text-red-600">-{formatCurrency(financialSummary.totalExpenses)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-100 rounded border-2 border-green-200">
              <span className="font-bold">Net Income</span>
              <span className="text-2xl font-bold text-green-700">{formatCurrency(financialSummary.netIncome)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium">Net Profit Margin</span>
              <span className="text-lg font-bold">{financialSummary.netProfitMargin}%</span>
            </div>
          </div>
        </div>
      )}

      {loading && <Loading message="Generating report..." />}
    </div>
  );
};

export default Reports;
