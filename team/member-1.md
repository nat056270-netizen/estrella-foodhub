# Member 1: POS & Sales

Branch: `feature/member-1-pos-sales`

Local frontend: http://localhost:5181

Local API: http://localhost:5011/api

Local MySQL database: `estrella_member_1`

## Assigned features

- Cashier product selection and cart
- Checkout and tender recording
- Sales history, voiding and receipts

## Owned files

- `estrella-foodhub/frontend/src/pages/POS.jsx`
- `estrella-foodhub/frontend/src/pages/Sales.jsx`
- `estrella-foodhub/frontend/src/components/Receipt.jsx`
- `estrella-foodhub/frontend/src/components/CartItems.jsx`
- `estrella-foodhub/frontend/src/utils/cart.js`
- `estrella-foodhub/backend/src/controllers/saleController.js`
- `estrella-foodhub/backend/src/routes/sales.js`
- `estrella-foodhub/backend/src/models/Sale.js`
- `estrella-foodhub/backend/src/models/SaleItem.js`
- `estrella-foodhub/frontend/tests/pos.test.mjs`

Use [WORKFLOW.md](WORKFLOW.md) for setup, pulling integration changes, validation, pushing your branch and pull requests. Every member has the full application. Coordinate changes to another member's files and shared API/database contracts before integration.

