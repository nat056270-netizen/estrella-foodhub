# ESTRELLA FOOD HUB - Quick Setup Guide

## Prerequisites Checklist
- [ ] Node.js installed (v16+)
- [ ] Laragon installed and running
- [ ] MySQL running in Laragon (port 3306)

## Quick Start (5 Minutes)

### 1. Open Laragon
Start Laragon and click "Start All" to start MySQL.

### 2. Create Database
Open HeidiSQL from Laragon menu and run:
```sql
CREATE DATABASE estrella_foodhub;
```

### 3. Install Backend
Open Command Prompt or PowerShell in the project folder:
```bash
cd backend
npm install
npm run migrate
npm run seed
```

### 4. Start Backend
```bash
npm run dev
```
Keep this terminal open. Backend runs on http://localhost:5000

### 5. Install Frontend
Open a NEW terminal in the project folder:
```bash
cd frontend
npm install
```

### 6. Start Frontend
```bash
npm run dev
```
Frontend runs on http://localhost:5173

### 7. Login
Open browser: http://localhost:5173
Login: **admin** / **admin123**

## Test Accounts
- Admin: admin / admin123
- Manager: manager / manager123
- Cashier: cashier / cashier123
- Inventory: inventory / inventory123

## Common Issues

### Port already in use
If port 5000 or 5173 is busy, change PORT in backend/.env or frontend runs on different port automatically.

### Database connection failed
- Check Laragon MySQL is running
- Verify database name is correct
- Check backend/.env settings

### Module not found
Delete node_modules and package-lock.json, then run `npm install` again.

## What to Test

1. **Login** - Try all test accounts
2. **Dashboard** - View statistics and charts
3. **POS** - Add products to cart and complete a sale
4. **Products** - Add, edit, view products
5. **Inventory** - Check stock levels and adjustments
6. **Reports** - Generate sales and financial reports

## Need Help?
Check README.md for detailed documentation.
