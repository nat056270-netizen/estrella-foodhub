export const cartSubtotal = cart => Math.round(cart.reduce((sum, item) => sum + Math.round(Number(item.price) * 100) * item.quantity, 0)) / 100;

export const cashChange = (received, total) => Math.max(0, Math.round((Number(received) - total) * 100) / 100);

export const canSell = product => Number(product.current_stock) > 0 && !(product.expiration_tracking && product.expiration_date && new Date(product.expiration_date) < new Date());

export function addProduct(cart, product) {
  if (!canSell(product)) return cart;
  const existing = cart.find(item => item.product_id === product.id);
  if (existing) return cart.map(item => item.product_id === product.id
    ? { ...item, quantity: Math.min(item.quantity + 1, Number(product.current_stock)) }
    : item);
  return [...cart, { product_id: product.id, name: product.name, price: Number(product.selling_price), quantity: 1, available_stock: Number(product.current_stock) }];
}

export function changeCartQuantity(cart, productId, delta) {
  return cart.map(item => item.product_id === productId
    ? { ...item, quantity: Math.min(item.available_stock, item.quantity + delta) }
    : item).filter(item => item.quantity > 0);
}

export function checkoutError(cart, paymentMethod, amountReceived) {
  if (!cart.length) return 'Add a product to begin.';
  if (paymentMethod === 'cash' && (!Number.isFinite(Number(amountReceived)) || Number(amountReceived) < cartSubtotal(cart))) return 'Enter enough cash to cover the total.';
  return '';
}

export function salePayload(cart, { customerId, paymentMethod, amountReceived }) {
  return {
    customer_id: customerId || null,
    items: cart.map(({ product_id, quantity }) => ({ product_id, quantity })),
    payment_method: paymentMethod,
    amount_received: paymentMethod === 'cash' ? Number(amountReceived) : cartSubtotal(cart),
    discount: 0,
    tax: 0
  };
}

