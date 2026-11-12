import { formatCurrency, formatDateTime } from '../utils/format';
export default function Receipt({
  sale
}) {
  if (!sale) return null;
  return <div className="print-area">
    <div className="text-center mb-5"><h2 className="text-xl font-bold">ESTRELLA FOODHUB</h2><p className="text-xs text-gray-500 mt-1">Sales receipt</p></div>
    <div className="border-y border-dashed py-3 mb-3 space-y-1 text-xs"><p className="flex justify-between gap-3"><span>Transaction</span><strong>{sale.transaction_number}</strong></p><p className="flex justify-between gap-3"><span>Date</span><span>{formatDateTime(sale.created_at)}</span></p><p className="flex justify-between gap-3"><span>Cashier</span><span>{sale.cashier?.first_name} {sale.cashier?.last_name}</span></p><p className="flex justify-between gap-3"><span>Customer</span><span>{sale.customer?.name || 'Walk-in customer'}</span></p></div>
    <table className="w-full text-xs mb-4"><thead><tr className="border-b"><th className="text-left py-2" scope="col">Item</th><th className="text-center" scope="col">Qty</th><th className="text-right" scope="col">Price</th><th className="text-right" scope="col">Total</th></tr></thead><tbody>{sale.items?.map((item, index) => <tr key={item.id || index} className="border-b"><td className="py-2 pr-2">{item.product?.name || 'Product unavailable'}</td><td className="text-center">{item.quantity}</td><td className="text-right">{formatCurrency(item.unit_price)}</td><td className="text-right">{formatCurrency(item.subtotal)}</td></tr>)}</tbody></table>
    <div className="space-y-2 text-xs"><p className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(sale.subtotal)}</span></p>{Number(sale.discount) > 0 && <p className="flex justify-between"><span>Discount</span><span>−{formatCurrency(sale.discount)}</span></p>}{Number(sale.tax) > 0 && <p className="flex justify-between"><span>Tax</span><span>{formatCurrency(sale.tax)}</span></p>}<p className="flex justify-between text-lg font-bold border-t border-dashed pt-3"><span>Total</span><span>{formatCurrency(sale.total)}</span></p><p className="flex justify-between"><span>Payment</span><span className="uppercase">{sale.payment_method}</span></p>{sale.payment_method === 'cash' && <><p className="flex justify-between"><span>Cash received</span><span>{formatCurrency(sale.amount_received)}</span></p><p className="flex justify-between font-semibold"><span>Change</span><span>{formatCurrency(sale.change_amount)}</span></p></>}</div>
    <p className="text-center text-xs text-gray-500 mt-6">Thank you for dining with Estrella!</p>
  </div>;
}
