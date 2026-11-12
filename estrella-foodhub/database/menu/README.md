# Supplied six-stall menu

This catalog replaces the previous sample food/grocery menu.

- 6 stalls and 28 menu sections.
- All 160 priced rows from the supplied document are included.
- 201 selectable products after expanding drink sizes and fries flavors.
- Takoyaki: 11; Pizza: 12; B&B: 65; Shawarma: 15; Fried Noodles: 17; Pawsome: 81.
- Drink Regular/Large sizes and each of the five B&B fries flavors have separate SKUs because the existing API sells product SKUs rather than item modifiers.
- Add-ons and take-out fees are separate menu items. Bundle prices apply to one selected bundle.
- Wednesday Sale entries remain explicitly labeled products; the existing backend does not automatically enforce a weekday promotion schedule.
- Bundle/recipe ingredient deductions are not implemented by the existing inventory system.

## Applied to the local database

The supplied catalog was imported into the configured `estrella_foodhub` database. The 20 previous products and 6 previous categories were marked inactive, preserving their IDs, names, prices, costs, stock quantities, and transaction relationships.

A pre-import snapshot was saved under `database/backups/`, which is excluded from Git. Sales, sale items, purchases, and inventory movement counts were unchanged.

The importer uses a single transaction, saves the original catalog before mutation, validates every active product/category/price, and writes an import audit record. Stable SKUs allow it to update the menu again while retaining stock, costs, suppliers and expiry settings for existing menu products. Products outside this catalog are archived when applying a replacement.

## Opening setup

The supplied menu contains selling prices but no costs, opening stock, suppliers, or reorder thresholds. New products therefore use zero stock and zero cost, no supplier, and zero minimum/maximum thresholds. These are unset initial values, not claimed real inventory or cost figures.

Enter actual costs and thresholds in Products, and record opening quantities through Inventory adjustments or purchase receiving before trading. The POS shows the menu immediately and preserves existing out-of-stock protections. Product units now include cup, set, portion, and add-on, and supplier assignment is optional.

## Files and commands

- `source-menu.md`: the original supplied menu.
- `catalog.json`: exact names/prices, drink sizes, fries flavors, units and stable SKUs.
- `catalog.js`: shared catalog validation and model mapping.
- `../import-menu.js`: safe catalog replacement and verification.
- `../seed.js`: fresh installations now seed this menu; the seeder was not run on the existing database.
- Frontend POS and Products include stall filters. Products and Categories default to active records; archived records remain accessible through status filters.

From `backend/`:

```powershell
npm.cmd run menu:preview
npm.cmd run menu:check
# Apply a replacement only when intended:
npm.cmd run menu:import
```

Validation performed: import verification passed for 201 products/28 categories; live API returned the same counts and prices; all 20 archived products retained their original non-status fields; history counts were preserved; 30 frontend tests, the 39-file source checker, and production build passed.

Browser interaction and visual checks remain unavailable in this session. Refresh the POS to fetch the updated catalog.

