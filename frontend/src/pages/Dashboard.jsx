import ResponsiveTable from '../components/ResponsiveTable';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { formatCurrency, formatDateTime, getStockStatus } from '../utils/format';
import { Wallet, ShoppingCart, Package, Warehouse, AlertTriangle, ArrowRight, RefreshCw, UtensilsCrossed, Receipt } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Loading from '../components/Loading';
import { ErrorState, EmptyState } from '../components/AsyncState';
import { useAuth } from '../context/AuthContext';
export default function Dashboard() {
  const {
    user,
    hasRole
  } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('daily');
  const [reducedMotion, setReducedMotion] = useState(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const responses = await Promise.all(['/dashboard/stats', '/dashboard/sales-chart?period=' + period, '/dashboard/top-products?limit=5', '/dashboard/recent-transactions?limit=6', '/dashboard/low-stock?limit=5'].map(url => api.get(url)));
      setData({
        stats: responses[0].data.data,
        chart: responses[1].data.data.map(row => ({
          ...row,
          total: Number(row.total)
        })),
        products: responses[2].data.data,
        transactions: responses[3].data.data,
        stock: responses[4].data.data
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reach your business data. Check that the API is running and try again.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, [period]);
  if (loading) return <Loading message="Preparing your business overview…" />;
  if (error || !data?.stats) return <ErrorState message={error} onRetry={fetchData} />;
  const {
    stats,
    chart,
    products,
    transactions,
    stock
  } = data;
  const cards = [{
    label: 'Sales today',
    value: formatCurrency(stats.todaysSales),
    detail: 'Completed transactions',
    icon: Wallet,
    featured: true
  }, {
    label: 'Orders today',
    value: stats.todaysTransactions,
    detail: 'Successfully completed',
    icon: ShoppingCart
  }, {
    label: 'Active products',
    value: stats.totalProducts,
    detail: 'In your product catalog',
    icon: Package
  }, {
    label: 'Inventory value',
    value: formatCurrency(stats.totalInventoryValue),
    detail: 'Based on current stock cost',
    icon: Warehouse
  }];
  return <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><p className="eyebrow">The bigger picture</p><h1 className="page-title">Good to see you, {user?.first_name}.</h1><p className="page-description">Here’s what’s happening at your food hub today.</p></div><div className="flex gap-2"><button className="btn btn-secondary" onClick={fetchData} title="Refresh overview" type="button"><RefreshCw size={16} /><span className="hidden sm:inline">Refresh</span></button>{hasRole(['admin', 'manager', 'cashier']) && <Link to="/pos" className="btn btn-primary"><ShoppingCart size={17} /> New sale</Link>}</div></div>
    <div className="kpi-grid">{cards.map(({
        label,
        value,
        detail,
        icon: Icon,
        featured
      }) => <div key={label} className={`card kpi-card ${featured ? 'kpi-featured' : ''}`}><div className="flex items-center justify-between"><span className="kpi-icon"><Icon size={19} /></span><span className="text-xs opacity-50">Today</span></div><p className="kpi-label">{label}</p><p className="kpi-value">{value}</p><p className="kpi-detail">{detail}</p></div>)}</div>
    {(Number(stats.lowStockItems) > 0 || Number(stats.outOfStockItems) > 0) && <div className="stock-banner"><AlertTriangle size={20} style={{
        color: 'var(--accent)'
      }} /><p><strong>{stats.lowStockItems} low-stock</strong> and <strong>{stats.outOfStockItems} out-of-stock</strong> products need a look.</p>{hasRole(['admin', 'manager', 'inventory_staff']) && <Link to="/inventory" className="text-link">Review inventory <ArrowRight size={15} /></Link>}</div>}
    <div className="dashboard-charts">
      <section className="card"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="section-heading">Sales overview</h2><p className="page-description">Revenue from completed sales</p></div><select className="input w-auto text-xs" aria-label="Sales chart period" value={period} onChange={e => setPeriod(e.target.value)}><option value="daily">Last 7 days</option><option value="weekly">Last 8 weeks</option><option value="monthly">Last 6 months</option></select></div>
        {chart.length ? <><div className="chart-frame" role="img" aria-label="Sales revenue by date; values are available in the table below"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chart} margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 0
              }}><defs><linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e47d45" stopOpacity={.22} /><stop offset="100%" stopColor="#e47d45" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="var(--line)" vertical={false} strokeDasharray="3 4" /><XAxis dataKey="date" tickLine={false} axisLine={false} minTickGap={20} tickMargin={12} /><YAxis tickLine={false} axisLine={false} width={48} tickFormatter={v => v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v} /><Tooltip formatter={value => [formatCurrency(value), 'Revenue']} /><Area type="monotone" dataKey="total" stroke="#d36a30" strokeWidth={2.5} fill="url(#revenue-fill)" isAnimationActive={!reducedMotion} animationDuration={220} /></AreaChart></ResponsiveContainer></div><details className="text-xs text-gray-500 mt-3"><summary className="cursor-pointer py-2">View chart data</summary><div className="overflow-x-auto"><ResponsiveTable className="table" label="Dashboard records"><thead><tr><th scope="col">Period</th><th scope="col">Sales</th></tr></thead><tbody>{chart.map(row => <tr key={row.date}><td>{row.date}</td><td>{formatCurrency(row.total)}</td></tr>)}</tbody></ResponsiveTable></div></details></> : <EmptyState title="Your next sale starts the story" message="Completed sales will appear in this chart." />}
      </section>
      <section className="card"><div className="flex justify-between items-center"><h2 className="section-heading">Popular products</h2><span className="badge badge-secondary">All time</span></div><p className="page-description mb-2">Ranked by quantity sold</p>{products.length ? products.map((row, index) => <div className="product-ranking" key={row.product_id}><span className="rank-number">0{index + 1}</span><span className="rank-art"><UtensilsCrossed size={18} /></span><div className="flex-1 min-w-0"><p className="text-xs font-semibold truncate">{row.product?.name || 'Product unavailable'}</p><div className="rank-track"><span style={{
                width: Math.max(3, Number(row.total_quantity) / Math.max(1, Number(products[0].total_quantity)) * 100) + '%'
              }} /></div></div><div className="text-right"><strong className="text-xs">{row.total_quantity}</strong><p className="text-gray-500 text-xs">sold</p></div></div>) : <EmptyState title="No products sold yet" message="Your best sellers will appear here." />}</section>
    </div>
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
      <section className="card xl:col-span-2"><div className="flex justify-between items-center gap-3 mb-5"><div><h2 className="section-heading">Recent transactions</h2><p className="page-description">The latest activity at your counter</p></div>{hasRole(['admin', 'manager', 'cashier']) && <Link to="/sales" className="text-link">View all <ArrowRight size={14} /></Link>}</div>{transactions.length ? <div className="overflow-x-auto"><ResponsiveTable className="table" label="Dashboard records"><thead><tr><th scope="col">Transaction</th><th scope="col">Customer</th><th scope="col">Amount</th><th scope="col">Status</th></tr></thead><tbody>{transactions.map(row => <tr key={row.id}><td><div className="flex items-center gap-3"><Receipt size={16} className="text-gray-400" /><div><p className="font-semibold text-xs">{row.transaction_number}</p><p className="text-gray-500 text-xs mt-1">{formatDateTime(row.created_at)}</p></div></div></td><td>{row.customer?.name || 'Walk-in customer'}</td><td className="font-semibold">{formatCurrency(row.total)}</td><td><span className={`badge ${row.status === 'completed' ? 'badge-success' : row.status === 'void' ? 'badge-danger' : 'badge-warning'}`}>{row.status}</span></td></tr>)}</tbody></ResponsiveTable></div> : <EmptyState title="No transactions yet" message="Your latest transactions will appear here." />}</section>
      <section className="card"><h2 className="section-heading">Stock watch</h2><p className="page-description mb-3">Products at or below their minimum</p>{stock.length ? stock.map(row => <div key={row.id} className="py-4 border-b last:border-0 flex items-center gap-3"><span className="rank-art"><Package size={17} /></span><div className="flex-1 min-w-0"><p className="text-xs font-semibold truncate">{row.name}</p><p className="text-xs text-gray-500 mt-1">{row.current_stock} {row.unit} remaining</p></div><span className={`badge badge-${getStockStatus(row).color}`}>{Number(row.current_stock) <= 0 ? 'Out' : 'Low'}</span></div>) : <EmptyState title="Stock looks good" message="No products are currently below their minimum." />}</section>
    </div>
    <div className="flex flex-wrap justify-between gap-2 pt-1 text-xs text-gray-500"><span>Estrella Foodhub · Business overview</span><span>Sales less today’s expenses: <strong className="text-gray-700">{formatCurrency(stats.netSales)}</strong></span></div>
  </div>;
}
