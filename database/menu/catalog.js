const catalog = require('./catalog.json');

function categoryValues(section) {
  return {
    name: section.stall + ' / ' + section.name,
    description: section.stall + ' Stall - ' + section.name,
    status: 'active'
  };
}

function productValues(section, item) {
  return {
    sku: item.sku,
    name: item.name,
    description: section.stall + ' Stall - ' + section.name +
      (item.flavor ? '. Flavor: ' + item.flavor + '.' : '') +
      (item.size ? '. Size: ' + item.size + '.' : ''),
    selling_price: item.price,
    unit: item.unit,
    status: 'active'
  };
}

function validateCatalog() {
  const seen = new Set();
  for (const section of catalog.sections) {
    if (!section.stall || !section.name || !section.items.length) throw new Error('Invalid menu section');
    if (categoryValues(section).name.length > 100) throw new Error('Category name is too long');
    for (const item of section.items) {
      if (!item.sku || seen.has(item.sku) || !item.name || item.name.length > 200 || !Number.isFinite(item.price) || item.price <= 0) throw new Error('Invalid or duplicate menu entry: ' + item.name);
      seen.add(item.sku);
    }
  }
  return { stalls: new Set(catalog.sections.map(section => section.stall)).size, categories: catalog.sections.length, products: seen.size };
}

module.exports = { catalog, categoryValues, productValues, validateCatalog };

