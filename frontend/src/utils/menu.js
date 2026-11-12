export function categoryParts(category) {
  const name = category?.name || '';
  const split = name.indexOf(' / ');
  return split < 0 ? { stall: 'Other', section: name || 'Uncategorized' }
    : { stall: name.slice(0, split), section: name.slice(split + 3) };
}

export function menuStalls(categories) {
  return [...new Set(categories.map(category => categoryParts(category).stall))];
}

export function matchesMenu(product, categories, { stall = '', category = '', search = '' }) {
  const productCategory = product.category || categories.find(row => String(row.id) === String(product.category_id));
  const text = search.trim().toLowerCase();
  return (!stall || categoryParts(productCategory).stall === stall) &&
    (!category || String(product.category_id) === String(category)) &&
    (!text || [product.name, product.sku, product.barcode, productCategory?.name].some(value => String(value || '').toLowerCase().includes(text)));
}

