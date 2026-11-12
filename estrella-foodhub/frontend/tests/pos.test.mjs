import test from 'node:test';
import assert from 'node:assert/strict';
import { cartSubtotal, cashChange, canSell } from '../src/utils/cart.js';
import { normalizeTimestamps } from '../src/utils/normalize.js';
import { csvText } from '../src/utils/export.js';
import { getStockStatus } from '../src/utils/format.js';

test('cash totals use cent precision for repeated decimal prices', () => {
  assert.equal(cartSubtotal([{price:.1,quantity:3},{price:.2,quantity:1}]),.5);
  assert.equal(cashChange(1,.3),.7);
});
test('multi-item order quantities contribute to the correct total', () => {
  assert.equal(cartSubtotal([{price:'125.50',quantity:2},{price:'45.25',quantity:3}]),386.75);
  assert.equal(cashChange(500,386.75),113.25);
});
test('an empty order has no payable subtotal', () => assert.equal(cartSubtotal([]),0));
test('cash change never becomes negative on insufficient payment', () => assert.equal(cashChange(20,25),0));
test('zero-stock products cannot be sold, including numeric API strings', () => {
  assert.equal(canSell({current_stock:0}),false);
  assert.equal(canSell({current_stock:'0'}),false);
  assert.equal(canSell({current_stock:2}),true);
});
test('expired tracked products are unavailable and future stock remains sellable', () => {
  assert.equal(canSell({current_stock:1,expiration_tracking:true,expiration_date:'2000-01-01'}),false);
  assert.equal(canSell({current_stock:1,expiration_tracking:true,expiration_date:'2999-01-01'}),true);
  assert.equal(canSell({current_stock:1,expiration_tracking:false,expiration_date:'2000-01-01'}),true);
});
test('stock status works with both numeric and string quantities', () => {
  assert.equal(getStockStatus({current_stock:'0',minimum_stock:5}).color,'danger');
  assert.equal(getStockStatus({current_stock:5,minimum_stock:5}).color,'warning');
  assert.equal(getStockStatus({current_stock:6,minimum_stock:5}).color,'success');
});
test('Sequelize timestamps are available throughout nested sale and receipt data', () => {
  const source = {data:[{id:1,createdAt:'2026-01-02T10:00:00Z',items:[{updatedAt:'2026-01-03T10:00:00Z'}]}]};
  const normalized = normalizeTimestamps(source);
  assert.equal(normalized.data[0].created_at,source.data[0].createdAt);
  assert.equal(normalized.data[0].items[0].updated_at,source.data[0].items[0].updatedAt);
  assert.equal(source.data[0].created_at,undefined);
  assert.equal(normalized.data[0].id,1);
});
test('normalization preserves existing snake_case fields and null values', () => {
  assert.deepEqual(normalizeTimestamps({created_at:'original',createdAt:'alias',customer:null}),{created_at:'original',createdAt:'alias',customer:null});
});
test('CSV exports escape names, commas, quotes, and newlines', () => {
  assert.equal(csvText([['name','value'],['rice, large','a "quote"'],['line\nbreak',null]]),'"name","value"\r\n"rice, large","a ""quote"""\r\n"line\nbreak",""');
});
test('CSV exports neutralize spreadsheet formulas in user-entered values', () => {
  assert.equal(csvText([['=1+1','+cmd','@sum','-2']]),'"\'=1+1","\'+cmd","\'@sum","\'-2"');
});


import { addProduct, changeCartQuantity, checkoutError, salePayload } from '../src/utils/cart.js';
const product = {id:7,name:'Lunch bowl',selling_price:'125.50',current_stock:2};
test('rapid repeated additions merge into one line and respect available stock', () => {
  let cart = [];
  for (let index=0;index<10;index++) cart=addProduct(cart,product);
  assert.equal(cart.length,1);
  assert.equal(cart[0].quantity,2);
  assert.equal(cartSubtotal(cart),251);
});
test('quantity increases respect stock, decreases update totals, zero removes the line', () => {
  const cart = addProduct([],product);
  assert.equal(changeCartQuantity(cart,7,5)[0].quantity,2);
  const increased = changeCartQuantity(cart,7,1);
  assert.equal(cartSubtotal(changeCartQuantity(increased,7,-1)),125.5);
  assert.deepEqual(changeCartQuantity(cart,7,-1),[]);
  assert.equal(cart[0].quantity,1);
});
test('checkout rejects empty carts and insufficient or invalid cash', () => {
  const cart=addProduct([],product);
  assert.ok(checkoutError([],'cash',500));
  assert.ok(checkoutError(cart,'cash',100));
  assert.ok(checkoutError(cart,'cash','not a number'));
  assert.equal(checkoutError(cart,'cash','125.50'),'');
  assert.equal(checkoutError(cart,'card',''),'');
});
test('sale requests preserve server-calculated prices and existing request fields', () => {
  const cart=addProduct([],product);
  assert.deepEqual(salePayload(cart,{customerId:'12',paymentMethod:'cash',amountReceived:'200'}),{
    customer_id:'12',items:[{product_id:7,quantity:1}],payment_method:'cash',amount_received:200,discount:0,tax:0
  });
  for (const method of ['card','gcash','other']) {
    const payload=salePayload(cart,{customerId:'',paymentMethod:method,amountReceived:''});
    assert.equal(payload.customer_id,null);
    assert.equal(payload.amount_received,125.5);
    assert.equal(payload.payment_method,method);
    assert.equal(payload.items[0].price,undefined);
  }
});


import { adjustmentPayload } from '../src/utils/inventory.js';
import { reportQuery } from '../src/utils/reportDates.js';
test('inventory adjustments send numeric quantities instead of concatenating stock strings', () => {
  const positive=adjustmentPayload({product_id:'7',adjustment_quantity:'10',reason:'manual_correction',remarks:''});
  assert.equal(positive.product_id,7);
  assert.equal(positive.adjustment_quantity,10);
  assert.equal(100+positive.adjustment_quantity,110);
  assert.equal(100+adjustmentPayload({...positive,adjustment_quantity:'-5'}).adjustment_quantity,95);
});
test('inventory adjustments reject blank, fractional and zero changes', () => {
  for (const quantity of ['',0,'1.5','invalid']) assert.throws(() => adjustmentPayload({product_id:7,adjustment_quantity:quantity}),/whole quantity/);
});
test('reports include the full Philippine calendar day through its final millisecond', () => {
  const params=new URLSearchParams(reportQuery({start_date:'2026-11-13',end_date:'2026-11-13'}));
  assert.equal(params.get('start_date'),'2026-11-13T00:00:00.000+08:00');
  assert.equal(params.get('end_date'),'2026-11-13T23:59:59.999+08:00');
  assert.equal(new Date(params.get('end_date'))-new Date(params.get('start_date')),86399999);
});
test('all-time reports do not send empty or misleading date filters', () => {
  assert.equal(reportQuery({start_date:'',end_date:''}),'');
});


import { resolveApiUrl } from '../src/utils/apiUrl.js';
test('phones and tablets use the same-origin proxy for a PC loopback API setting',()=>{
  assert.equal(resolveApiUrl('http://localhost:5001/api','192.168.1.20'),'/api');
  assert.equal(resolveApiUrl('http://127.0.0.1:5001/api','192.168.1.20'),'/api');
  assert.equal(resolveApiUrl('http://[::1]:5001/api','192.168.1.20'),'/api');
});
test('local and explicitly hosted API addresses preserve their configured contracts',()=>{
  assert.equal(resolveApiUrl('http://localhost:5001/api','localhost'),'http://localhost:5001/api');
  assert.equal(resolveApiUrl('https://api.example.test/api','erp.example.test'),'https://api.example.test/api');
  assert.equal(resolveApiUrl('/api','192.168.1.20'),'/api');
  assert.equal(resolveApiUrl(undefined,'localhost'),'/api');
});

