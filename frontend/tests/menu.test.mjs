import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { categoryParts, menuStalls, matchesMenu } from '../src/utils/menu.js';
const require = createRequire(import.meta.url);
const { catalog, validateCatalog, categoryValues } = require('../../database/menu/catalog.js');

test('supplied menu contains six stalls, 28 sections and 201 unique selectable variants', () => {
  assert.deepEqual(validateCatalog(), {stalls:6,categories:28,products:201});
  const items=catalog.sections.flatMap(section=>section.items);
  assert.equal(new Set(items.map(item=>item.sku)).size,201);
});
test('drink prices are preserved for regular and large sizes across every series', () => {
  for(const [name,regular,large,count] of [['Milktea Series',75,85,5],['Premium Milktea Series',79,89,6],['Chocolate Series',75,85,4],['Cream Cheese Series',89,99,6],['Fruit Tea',70,80,4]]) {
    const section=catalog.sections.find(section=>section.stall==='Pawsome'&&section.name===name);
    assert.equal(section.items.length,count*2);
    for(const item of section.items) assert.equal(item.price,item.size==='Regular'?regular:large);
  }
});
test('each fries size includes all five supplied flavors at its specified price', () => {
  const section=catalog.sections.find(section=>section.stall==='B&B'&&section.name==='Fries');
  for(const [name,price] of [['Fries Small',49],['Fries Medium',69],['Fries Large',89],['Bucket of Fries',139]]) {
    const variants=section.items.filter(item=>item.name.startsWith(name+' - '));
    assert.deepEqual(variants.map(item=>item.flavor),['Plain','Cheese','BBQ','Sour Cream','Chili BBQ']);
    assert.ok(variants.every(item=>item.price===price));
  }
});
test('all price rows from the supplied source are represented without price changes', () => {
  const source = require('../../database/menu/source-menu.json');
  assert.equal(source.currency, 'PHP');
  assert.equal(source.rows.length, 160);
  for (const { product, prices } of source.rows) {
    const matches = catalog.sections.flatMap(section => section.items).filter(item => item.name === product || item.name.startsWith(product + ' (') || item.name.startsWith(product + ' - '));
    assert.ok(matches.length, 'Missing ' + product);
    for (const price of prices) assert.ok(matches.some(item => item.price === price), 'Wrong price for ' + product);
  }
});
test('stall and category filters combine correctly and search includes stall names', () => {
  const categories=[{id:1,name:'Pizza / 10 Inches'},{id:2,name:'B&B / Sizzling Meals'},{id:3,name:'Pizza / 6 Inches'}];
  assert.deepEqual(menuStalls(categories),['Pizza','B&B']);
  assert.deepEqual(categoryParts(categories[0]),{stall:'Pizza',section:'10 Inches'});
  const product={name:'Beef Supreme 10"',sku:'MENU-PIZ-1',category_id:1,category:categories[0]};
  assert.equal(matchesMenu(product,categories,{stall:'Pizza',search:'pizza'}),true);
  assert.equal(matchesMenu(product,categories,{stall:'B&B'}),false);
  assert.equal(matchesMenu(product,categories,{category:'1',search:'supreme'}),true);
  assert.equal(matchesMenu(product,categories,{category:'3'}),false);
  assert.equal(matchesMenu(product,categories,{search:'   '}),true);
});
test('category names preserve stall grouping and remain within database length limits', () => {
  for(const section of catalog.sections) {
    assert.equal(categoryParts(categoryValues(section)).stall,section.stall);
    assert.equal(categoryParts(categoryValues(section)).section,section.name);
    assert.ok(categoryValues(section).name.length<=100);
  }
});

