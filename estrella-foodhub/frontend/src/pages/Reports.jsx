import ResponsiveTable from '../components/ResponsiveTable';
import { useRef, useState } from 'react';
import api from '../services/api';
import { formatCurrency, formatDateTime } from '../utils/format';
import { reportQuery } from '../utils/reportDates';
import { downloadCSV } from '../utils/export';
import { FileText, TrendingUp, Package, Download, ArrowRight } from 'lucide-react';
import Loading from '../components/Loading';
import { ErrorState, EmptyState } from '../components/AsyncState';
const types = [{
  id: 'sales',
  title: 'Sales report',
  description: 'Transactions and revenue',
  icon: FileText
}, {
  id: 'inventory',
  title: 'Inventory report',
  description: 'Stock levels and valuation',
  icon: Package
}, {
  id: 'financial-summary',
  title: 'Financial summary',
  description: 'Profit and expense breakdown',
  icon: TrendingUp
}];
export default function Reports() {
  const [dates, setDates] = useState({
    start_date: '',
    end_date: ''
  });
  const [active, setActive] = useState('sales');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rangeError, setRangeError] = useState('');
  const lock = useRef(false);
  const generate = async (type = active) => {
    if (lock.current) return;
    if (type !== 'inventory' && (!!dates.start_date !== !!dates.end_date || dates.start_date && dates.start_date > dates.end_date)) {
      setRangeError('Choose both dates, with the end date on or after the start date.');
      return;
    }
    lock.current = true;
    setLoading(true);
    setActive(type);
    setError('');
    setRangeError('');
    setResult(null);
    try {
      const params = reportQuery(dates);
      const response = await api.get('/reports/' + type + (type === 'inventory' ? '' : '?' + params));
      setResult({
        type,
        data: response.data.data,
        dates: {
          ...dates
        }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to generate your report. Check the connection and try again.');
    } finally {
      lock.current = false;
      setLoading(false);
    }
  };
  const exportReport = () => {
    if (!result) return;
    const {
      type,
      data
    } = result;
    let rows;
    if (type === 'sales') rows = [['Transaction', 'Date', 'Cashier', 'Payment', 'Total', 'Status'], ...data.sales.map(s => [s.transaction_number, formatDateTime(s.created_at), [s.cashier?.first_name, s.cashier?.last_name].filter(Boolean).join(' '), s.payment_method, s.total, s.status])];else if (type === 'inventory') rows = [['SKU', 'Product', 'Category', 'Stock', 'Unit', 'Cost', 'Retail price'], ...data.products.map(p => [p.sku, p.name, p.category?.name, p.current_stock, p.unit, p.cost_price, p.selling_price])];else rows = [['Metric', 'Value'], ...Object.entries(data)];
    downloadCSV('estrella-' + type + '.csv', rows);
  };
  return <div className="space-y-6"><div><p className="eyebrow">Turn numbers into next steps</p><h1 className="page-title">Reports & insights</h1><p className="page-description">A clearer view of sales, stock, and business performance.</p></div>
    <div className="card"><div className="flex flex-col lg:flex-row lg:items-end gap-4"><div className="flex-1"><label htmlFor="report-start" className="label">Start date</label><input id="report-start" type="date" className="input" disabled={loading} value={dates.start_date} onChange={e => setDates({
            ...dates,
            start_date: e.target.value
          })} aria-describedby={rangeError ? 'range-error' : undefined} /></div><div className="flex-1"><label htmlFor="report-end" className="label">End date</label><input id="report-end" type="date" className="input" disabled={loading} value={dates.end_date} min={dates.start_date || undefined} onChange={e => setDates({
            ...dates,
            end_date: e.target.value
          })} aria-describedby={rangeError ? 'range-error' : undefined} /></div><p className="text-xs text-gray-500 lg:max-w-52 pb-2">Leave both dates blank for all available records. Inventory shows current stock.</p></div>{rangeError && <p id="range-error" className="error-message" role="alert">{rangeError}</p>}</div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{types.map(({
        id,
        title,
        description,
        icon: Icon
      }) => <button key={id} onClick={() => generate(id)} disabled={loading} className="card flex items-center gap-3 text-left hover:border-primary-400 transition-colors disabled:opacity-50" aria-pressed={active === id && !!result} type="button"><span className="kpi-icon"><Icon size={20} /></span><div className="flex-1"><h2 className="text-sm font-semibold">{title}</h2><p className="text-xs text-gray-500 mt-1">{description}</p></div><ArrowRight size={17} className="text-gray-400" /></button>)}</div>
    {loading && <Loading message="Generating your report…" />}
    {error && <ErrorState message={error} onRetry={() => generate(active)} />}
    {!result && !loading && !error && <div className="card"><EmptyState title="Your next insight is a click away" message="Select a report above to load real business data for your chosen period." /></div>}
    {result && <section className="card"><div className="flex flex-wrap justify-between items-center gap-3 mb-6"><div><h2 className="section-heading">{types.find(t => t.id === result.type)?.title}</h2><p className="page-description">{result.type === 'inventory' ? 'Current stock snapshot' : result.dates.start_date ? result.dates.start_date + ' to ' + result.dates.end_date : 'All available records'}</p></div><button className="btn btn-secondary" onClick={exportReport} type="button"><Download size={16} /> Export CSV</button></div>
      {result.type === 'sales' && <><div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">{[['Total sales', formatCurrency(result.data.summary.totalSales)], ['Net sales', formatCurrency(result.data.summary.netSales)], ['Transactions', result.data.summary.totalTransactions]].map(([label, value]) => <div className="rounded-xl bg-gray-50 p-4" key={label}><p className="text-xs text-gray-500">{label}</p><p className="kpi-value">{value}</p></div>)}</div>{result.data.sales.length ? <div className="overflow-x-auto"><ResponsiveTable className="table" label="Reports records"><thead><tr><th scope="col">Transaction</th><th scope="col">Date</th><th scope="col">Payment</th><th scope="col">Total</th></tr></thead><tbody>{result.data.sales.map(s => <tr key={s.id}><td className="font-semibold">{s.transaction_number}</td><td>{formatDateTime(s.created_at)}</td><td className="uppercase">{s.payment_method}</td><td>{formatCurrency(s.total)}</td></tr>)}</tbody></ResponsiveTable></div> : <EmptyState title="No completed sales in this period" message="Choose a different date range to explore more transactions." />}</>}
      {result.type === 'inventory' && <><div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">{[['Products', result.data.summary.totalProducts], ['Inventory value', formatCurrency(result.data.summary.totalInventoryValue)], ['Low stock', result.data.summary.lowStockCount], ['Out of stock', result.data.summary.outOfStockCount]].map(([label, value]) => <div className="bg-gray-50 p-4 rounded-xl" key={label}><p className="text-xs text-gray-500">{label}</p><p className="kpi-value">{value}</p></div>)}</div><div className="overflow-x-auto"><ResponsiveTable className="table" label="Reports records"><thead><tr><th scope="col">Product</th><th scope="col">SKU</th><th scope="col">Stock</th><th scope="col">Cost value</th></tr></thead><tbody>{result.data.products.map(p => <tr key={p.id}><td>{p.name}</td><td>{p.sku}</td><td>{p.current_stock} {p.unit}</td><td>{formatCurrency(Number(p.cost_price) * Number(p.current_stock))}</td></tr>)}</tbody></ResponsiveTable></div>{!result.data.products.length && <EmptyState title="No products to report" />}</>}
      {result.type === 'financial-summary' && <div className="space-y-2">{[['Gross sales', 'grossSales'], ['Discounts', 'totalDiscount'], ['Net sales', 'netSales'], ['Cost of goods sold', 'costOfGoodsSold'], ['Gross profit', 'grossProfit'], ['Expenses', 'totalExpenses'], ['Net income', 'netIncome'], ['Net profit margin', 'netProfitMargin']].map(([label, key]) => <div key={key} className={`flex flex-wrap justify-between gap-2 p-4 rounded-xl ${key === 'netIncome' ? 'bg-green-50 text-green-800 font-bold' : 'bg-gray-50'}`}><span className="text-sm">{label}</span><strong className="text-sm">{key === 'netProfitMargin' ? result.data[key] + '%' : formatCurrency(result.data[key])}</strong></div>)}</div>}
    </section>}
  </div>;
}
