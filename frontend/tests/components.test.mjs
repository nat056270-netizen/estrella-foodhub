import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
const server = await createServer({ server:{ middlewareMode:true,hmr:false }, appType:'custom' });
after(async () => { await server.close(); });
const { default:Receipt } = await server.ssrLoadModule('/src/components/Receipt.jsx');
const { default:Pagination } = await server.ssrLoadModule('/src/components/Pagination.jsx');
const { default:Loading } = await server.ssrLoadModule('/src/components/Loading.jsx');
const { ErrorState,EmptyState } = await server.ssrLoadModule('/src/components/AsyncState.jsx');
const sale = {
  transaction_number:'TEST-RECEIPT',created_at:'2026-11-13T01:00:00Z',cashier:{first_name:'Test',last_name:'Cashier'},
  items:[{id:1,product:{name:'Rice <script>alert(1)</script>'},quantity:2,unit_price:'50.00',subtotal:'100.00'}],
  subtotal:'100.00',total:'100.00',discount:0,tax:0,payment_method:'cash',amount_received:'150.00',change_amount:'50.00'
};
test('receipt uses supplied transaction, item, payment and change data', () => {
  const html = renderToStaticMarkup(createElement(Receipt,{sale}));
  assert.match(html,/TEST-RECEIPT/);
  assert.match(html,/Walk-in customer/);
  assert.match(html,/Cash received/);
  assert.match(html,/150\.00/);
  assert.match(html,/50\.00/);
  assert.doesNotMatch(html,/Invalid Date|123 Main Street|09123456789/);
});
test('receipt escapes product text and handles missing product relationships', () => {
  const html = renderToStaticMarkup(createElement(Receipt,{sale:{...sale,items:[...sale.items,{quantity:1,unit_price:0,subtotal:0}]}}));
  assert.doesNotMatch(html,/<script>/);
  assert.match(html,/&lt;script&gt;/);
  assert.match(html,/Product unavailable/);
});
test('noncash receipts omit cash received and change rows', () => {
  const html = renderToStaticMarkup(createElement(Receipt,{sale:{...sale,payment_method:'gcash'}}));
  assert.match(html,/gcash/); assert.doesNotMatch(html,/Cash received/);
});
test('pagination explains displayed records and disables unavailable pages', () => {
  const html = renderToStaticMarkup(createElement(Pagination,{page:1,pages:2,count:20,pageSize:12,onChange:()=>{}}));
  assert.match(html,/1.*12 of 20 products/); assert.match(html,/aria-label="Previous page"/); assert.match(html,/disabled/);
});
test('loading, empty and error states provide readable status and retry actions', () => {
  assert.match(renderToStaticMarkup(createElement(Loading,{message:'Loading catalog'})),/role="status"/);
  assert.match(renderToStaticMarkup(createElement(ErrorState,{message:'Offline',onRetry:()=>{}})),/Try again/);
  assert.match(renderToStaticMarkup(createElement(EmptyState,{title:'No orders'})),/No orders/);
});


const {default:ResponsiveTable}=await server.ssrLoadModule('/src/components/ResponsiveTable.jsx');
test('responsive records preserve table semantics and expose column labels for phone cards',()=>{
  const h=createElement;
  const html=renderToStaticMarkup(h(ResponsiveTable,{className:'table',label:'Product records'},
    h('thead',null,h('tr',null,h('th',{scope:'col'},'Product'),h('th',{scope:'col'},'Price'),h('th',{scope:'col'},'Actions'))),
    h('tbody',null,h('tr',{key:1},h('td',null,'Takoyaki'),h('td',null,'45.00'),h('td',null,h('button',{type:'button','aria-label':'Edit'},'Edit'))))
  ));
  assert.match(html,/role="table"/);
  assert.match(html,/role="rowgroup"/);
  assert.match(html,/data-label="Product"/);
  assert.match(html,/data-label="Price"/);
  assert.match(html,/data-actions="true"/);
  assert.match(html,/Takoyaki/);
});
test('permission-hidden action columns keep remaining mobile labels aligned',()=>{
  const h=createElement;
  const html=renderToStaticMarkup(h(ResponsiveTable,{className:'table'},
    h('thead',null,h('tr',null,h('th',null,'Name'),false,h('th',null,'Status'))),
    h('tbody',null,h('tr',null,h('td',null,'Customer'),false,h('td',null,'Active')))
  ));
  assert.match(html,/data-label="Name"/);
  assert.match(html,/data-label="Status"/);
  assert.doesNotMatch(html,/data-label="Details"/);
});

