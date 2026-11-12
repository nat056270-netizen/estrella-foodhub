export function adjustmentPayload(form) {
  const quantity = Number(form.adjustment_quantity);
  if (!String(form.adjustment_quantity).trim() || !Number.isInteger(quantity) || quantity === 0) throw new Error('Enter a non-zero whole quantity, such as 10 or -5.');
  return { ...form, product_id: Number(form.product_id), adjustment_quantity: quantity };
}

