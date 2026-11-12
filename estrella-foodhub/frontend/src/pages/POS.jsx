import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { categoryParts, menuStalls, matchesMenu } from '../utils/menu';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/format';
import { cartSubtotal, cashChange, canSell, addProduct, changeCartQuantity, checkoutError, salePayload } from '../utils/cart';
import { Search, Plus, Minus, Trash2, ShoppingCart, Printer, UtensilsCrossed, Banknote, CreditCard, Smartphone, Wallet, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import Loading from '../components/Loading';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Receipt from '../components/Receipt';
import CartItems from '../components/CartItems';
import { ErrorState, EmptyState } from '../components/AsyncState';
const paymentMethods = [{
  id: 'cash',
  label: 'Cash',
  icon: Banknote
}, {
  id: 'gcash',
  label: 'GCash',
  icon: Smartphone
}, {
  id: 'card',
  label: 'Card',
  icon: CreditCard
}, {
  id: 'other',
  label: 'Other',
  icon: Wallet
}];
const pendingKey = 'estrella-pending-sale';
export default function POS() {
  const { hasRole } = useAuth();
  const [compact, setCompact] = useState(() => window.innerWidth < 1100);
  const [layoutNode, setLayoutNode] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  useEffect(() => {
    if (!layoutNode) return;
    const update = () => setCompact(layoutNode.clientWidth < 850);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(layoutNode);
    return () => observer.disconnect();
  }, [layoutNode]);
  useEffect(() => { if (!compact) setCartOpen(false); }, [compact]);
  const [selectedStall, setSelectedStall] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cart, setCart] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountReceived, setAmountReceived] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [uncertain, setUncertain] = useState(() => !!sessionStorage.getItem(pendingKey));
  const [reviewConfirm, setReviewConfirm] = useState(false);
  const [stockStale, setStockStale] = useState(false);
  const checkoutLock = useRef(false);
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [p, c, u] = await Promise.all([api.get('/products?status=active'), api.get('/categories?status=active'), api.get('/customers?status=active')]);
      setProducts(p.data.data);
      setCategories(c.data.data.filter(category => category.status === 'active'));
      setCustomers(u.data.data);
      setStockStale(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Couldn’t load the counter. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  const refreshStock = async ({ saleSaved = false } = {}) => {
    try {
      const response = await api.get('/products?status=active');
      setProducts(response.data.data);
      setStockStale(false);
    } catch {
      setStockStale(true);
      toast.warning(saleSaved ? 'Sale saved. Refresh stock before starting another sale.' : 'Could not refresh stock. Try again before checkout.');
    }
  };
  const stalls = menuStalls(categories);
  const visibleCategories = categories.filter(category => !selectedStall || categoryParts(category).stall === selectedStall);
  const filtered = products.filter(product => matchesMenu(product, categories, { stall: selectedStall, category: selectedCategory, search: searchTerm }));
  const addToCart = product => {
    if (processing || uncertain || stockStale) return;
    if (!canSell(product)) {
      toast.error('This product is unavailable or expired.');
      return;
    }
    const current = cart.find(i => i.product_id === product.id);
    if (current && current.quantity >= Number(product.current_stock)) {
      toast.error('All available stock is already in the cart.');
      return;
    }
    setCart(previous => addProduct(previous, product));
  };
  const changeQuantity = (id, delta) => setCart(previous => changeCartQuantity(previous, id, delta));
  const clearCart = () => {
    setCart([]);
    setCustomerId('');
    setAmountReceived('');
    setPaymentMethod('cash');
  };
  const total = cartSubtotal(cart);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const handleCheckout = async () => {
    if (checkoutLock.current || processing || uncertain || stockStale) return;
    const validationError = checkoutError(cart, paymentMethod, amountReceived);
    if (validationError) {
      toast.error(validationError);
      if (cart.length && paymentMethod === 'cash') document.getElementById('cash-received')?.focus();
      return;
    }
    checkoutLock.current = true;
    setProcessing(true);
    sessionStorage.setItem(pendingKey, JSON.stringify({
      time: new Date().toISOString(),
      total
    }));
    try {
      const response = await api.post('/sales', salePayload(cart, { customerId, paymentMethod, amountReceived }));
      sessionStorage.removeItem(pendingKey);
      setCartOpen(false);
      setReceipt(response.data.data);
      clearCart();
      toast.success('Sale complete. Your receipt is ready.');
      await refreshStock({ saleSaved: true });
    } catch (err) {
      if (!err.response || err.response.status >= 500) {
        setUncertain(true);
        toast.error('The sale result is unconfirmed. Check sales history before trying again.');
      } else {
        sessionStorage.removeItem(pendingKey);
        toast.error(err.response.data?.message || 'The sale could not be completed.');
        await refreshStock();
      }
    } finally {
      checkoutLock.current = false;
      setProcessing(false);
    }
  };
  if (loading) return <Loading message="Getting your counter ready…" />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;
  const orderPanel = <section id="current-order" className="card pos-cart"><fieldset disabled={processing || uncertain} className="min-w-0"><div className="flex justify-between items-center gap-2 pb-4 border-b"><div className="flex items-center gap-2"><h2 className="section-heading">Current order</h2><span className="badge badge-secondary">{itemCount}</span></div>{cart.length > 0 && <button className="text-link" onClick={() => setClearConfirm(true)} type="button">Clear</button>}</div>
        <div className="max-h-80 overflow-y-auto mb-5"><CartItems items={cart}>{cart.length ? cart.map(item => <div className="cart-line" key={item.product_id}><div className="min-w-0"><h3 className="text-xs font-semibold break-words">{item.name}</h3><p className="text-xs text-gray-500 mt-1">{formatCurrency(item.price)} each</p><div className="quantity-control mt-3"><button onClick={() => changeQuantity(item.product_id, -1)} aria-label={`Decrease ${item.name} quantity`} title="Decrease quantity" type="button"><Minus size={14} /></button><span aria-live="polite">{item.quantity}</span><button onClick={() => changeQuantity(item.product_id, 1)} disabled={item.quantity >= item.available_stock} aria-label={`Increase ${item.name} quantity`} title="Increase quantity" type="button"><Plus size={14} /></button></div></div><div className="text-right"><p className="text-xs font-semibold">{formatCurrency(item.price * item.quantity)}</p><button className="icon-button mt-4" onClick={() => setCart(previous => previous.filter(i => i.product_id !== item.product_id))} aria-label={`Remove ${item.name}`} title="Remove item" type="button"><Trash2 size={15} /></button></div></div>) : <EmptyState title="A fresh order starts here" message="Tap a product to add it to the order." />}</CartItems></div>
        <div className="space-y-4"><div><label className="label" htmlFor="order-customer">Customer</label><select id="order-customer" className="input" value={customerId} onChange={e => setCustomerId(e.target.value)}><option value="">Walk-in customer</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div><p id="payment-label" className="label">Payment method</p><div className="payment-options" role="group" aria-labelledby="payment-label">{paymentMethods.map(({
                  id,
                  label,
                  icon: Icon
                }) => <button key={id} className="payment-option" aria-pressed={paymentMethod === id} onClick={() => setPaymentMethod(id)} type="button"><Icon size={18} />{label}</button>)}</div></div>
          {paymentMethod === 'cash' && <div><label className="label" htmlFor="cash-received">Cash received</label><div className="flex gap-2"><input id="cash-received" className="input" type="number" min="0" step="0.01" inputMode="decimal" placeholder="0.00" value={amountReceived} onChange={e => setAmountReceived(e.target.value)} /><button className="btn btn-secondary text-xs" disabled={!cart.length} onClick={() => setAmountReceived(total.toFixed(2))} type="button">Exact</button></div><p className="text-xs text-gray-500 mt-2" aria-live="polite">{Number(amountReceived) >= total && cart.length ? 'Change: ' + formatCurrency(cashChange(amountReceived, total)) : 'Enter the amount received from your customer.'}</p></div>}
        </div>
        <div className="border-t mt-5 pt-4"><p className="flex justify-between text-xs text-gray-500"><span>Subtotal · {itemCount} items</span><span>{formatCurrency(total)}</span></p><div className="cart-total"><span>Total</span><output key={total} aria-live="polite">{formatCurrency(total)}</output></div><button className="btn btn-primary w-full" style={{
              minHeight: 50
            }} onClick={handleCheckout} disabled={!cart.length || processing || uncertain || stockStale} aria-busy={processing} type="button">{processing ? <><Loader2 size={18} className="animate-spin" /> Completing sale…</> : <><CheckCircle2 size={18} /> Complete sale <ArrowRight size={16} /></>}</button><p className="text-center text-xs text-gray-500 mt-3">A receipt is ready after every completed sale.</p></div>
      </fieldset></section>;
  return <div className={`space-y-6 pos-page ${compact ? 'pos-compact' : ''}`}>
    <div className="flex flex-wrap justify-between gap-3 items-end"><div><p className="eyebrow">Made for the daily rush</p><h1 className="page-title">Point of sale</h1><p className="page-description">Pick a favorite. Build the order. Make their day.</p></div></div>
    {uncertain && <div className="card border-amber-300" role="alert"><h2 className="font-semibold mb-2">Check the previous sale before continuing</h2><p className="text-sm text-gray-600 mb-3">The server may have saved the sale before the connection was interrupted. Compare the time and total in sales history to avoid charging twice.</p><div className="flex flex-wrap gap-2"><Link to="/sales" className="btn btn-secondary" target="_blank" rel="noreferrer">Review sales history <ArrowRight size={15} /></Link><button className="btn btn-primary" onClick={() => setReviewConfirm(true)} type="button">I’ve reviewed the sale</button></div></div>}
    {stockStale && <div className="stock-banner" role="alert"><p>Refresh stock before starting another sale.</p><button className="btn btn-secondary" onClick={refreshStock} type="button">Refresh stock</button></div>}
    {products.length > 0 && products.every(product => Number(product.current_stock) <= 0) && <div className="stock-banner" role="status"><p>Menu loaded. Enter opening stock before selling these items.</p>{hasRole(['admin', 'manager']) && <Link to="/inventory" className="text-link">Set up inventory <ArrowRight size={15} /></Link>}</div>}
    <div ref={setLayoutNode} className="pos-layout">
      <section className="pos-catalog space-y-4"><div className="relative"><Search size={18} className="absolute left-4 top-3.5 text-gray-400" /><input className="input pl-11" aria-label="Search products by name, SKU or barcode" placeholder="Search menu, stall, SKU or scan a barcode…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
        <div>
          <p className="label">Choose a stall</p>
          <div className="category-tabs" role="group" aria-label="Menu stalls">
            <button type="button" className="category-tab" aria-pressed={!selectedStall} onClick={() => { setSelectedStall(''); setSelectedCategory(''); }}>All stalls</button>
            {stalls.map(stall => <button type="button" key={stall} className="category-tab" aria-pressed={selectedStall === stall} onClick={() => { setSelectedStall(stall); setSelectedCategory(''); }}>{stall}</button>)}
          </div>
        </div>
        <div className="category-tabs" role="group" aria-label="Product categories"><button className="category-tab" aria-pressed={!selectedCategory} onClick={() => setSelectedCategory('')} type="button">All sections <span className="opacity-70">{products.filter(product => matchesMenu(product, categories, {stall:selectedStall})).length}</span></button>{visibleCategories.map(c => <button key={c.id} className="category-tab" aria-pressed={String(selectedCategory) === String(c.id)} onClick={() => setSelectedCategory(c.id)} type="button">{selectedStall ? categoryParts(c).section : c.name}</button>)}</div>
        <div className="flex justify-between items-center text-xs text-gray-500 py-1"><span>{filtered.length} products available</span><span>Tap to add to order</span></div>
        <div className="product-grid">{filtered.map(p => {
            const available = canSell(p);
            return <button key={p.id} className="product-tile" onClick={() => addToCart(p)} disabled={!available || processing || uncertain || stockStale} aria-label={`Add ${p.name}, ${formatCurrency(p.selling_price)}, ${p.current_stock} in stock`} type="button"><div className="product-art"><UtensilsCrossed size={30} /></div><h3>{p.name}</h3><small>{p.category?.name || 'Uncategorized'} · {available ? p.current_stock + ' in stock' : 'Unavailable'}</small><div className="product-tile-bottom"><span className="product-price">{formatCurrency(p.selling_price)}</span><span className="product-plus"><Plus size={16} /></span></div></button>;
          })}</div>
        {!filtered.length && <EmptyState title="No matching products" message="Try a different name, SKU or category." />}
      </section>
      {!compact && orderPanel}
    </div>
    {compact && <div className="pos-order-dock"><button type="button" className="btn btn-primary w-full" onClick={() => setCartOpen(true)} disabled={processing} aria-haspopup="dialog"><ShoppingCart size={19} /><span>View order ({itemCount})</span><strong>{formatCurrency(total)}</strong></button></div>}
    {compact && <Modal isOpen={cartOpen} onClose={() => setCartOpen(false)} title="Current order" size="cart" busy={processing}>{orderPanel}</Modal>}
    <ConfirmDialog isOpen={clearConfirm} onClose={() => setClearConfirm(false)} onConfirm={() => {
      clearCart();
      setClearConfirm(false);
    }} title="Clear this order?" message="All items and payment details in this order will be removed." confirmText="Clear order" />
    <ConfirmDialog isOpen={reviewConfirm} onClose={() => setReviewConfirm(false)} onConfirm={async () => {
      sessionStorage.removeItem(pendingKey);
      setUncertain(false);
      clearCart();
      setReviewConfirm(false);
      await fetchData();
    }} title="Start a fresh order?" message="Only continue after confirming whether the previous sale was saved in sales history. The current cart will be cleared to help prevent a duplicate sale." confirmText="Start fresh" />
    <Modal isOpen={!!receipt} onClose={() => setReceipt(null)} title="Sale complete · Receipt" size="sm"><div className="no-print flex items-center gap-2 text-green-700 text-sm font-semibold mb-5"><CheckCircle2 size={19} /> Payment recorded successfully</div><Receipt sale={receipt} /><div className="flex flex-wrap gap-2 mt-6 no-print"><button className="btn btn-primary flex-1" onClick={() => window.print()} type="button"><Printer size={17} /> Print receipt</button><button className="btn btn-secondary" onClick={() => setReceipt(null)} type="button">Next order</button></div></Modal>
  </div>;
}
