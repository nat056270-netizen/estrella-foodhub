# 🚀 Estrella Food Hub ERP - Quick Start Guide

## 📍 Access the System

### 🌐 Web Application
**URL:** http://localhost:5174/

### 🔐 Login Credentials

| Role | Username | Password | Access Level |
|------|----------|----------|--------------|
| **Admin** | `admin` | `admin123` | Full system access |
| **Manager** | `manager` | `manager123` | All except system admin |
| **Cashier** | `cashier` | `cashier123` | POS & Sales |
| **Inventory** | `inventory` | `inventory123` | Inventory & Products |

---

## 🖥️ Server Management

### Start Servers
```bash
# Backend (from backend folder)
npm start

# Frontend (from frontend folder)
npm run dev
```

### Stop Servers
- Press `Ctrl+C` in each terminal
- Or close the terminal windows

### Server Status
- **Backend**: http://localhost:5000/api/health
- **Frontend**: http://localhost:5174/

---

## 📱 Features Overview

### 🏪 Point of Sale (POS)
- Real-time product search
- Cart management
- Multiple payment methods (Cash, GCash, Card)
- Receipt printing
- Customer selection

### 📦 Inventory Management
- Stock tracking
- Low stock alerts
- Inventory adjustments
- Movement history
- Expiration tracking

### 📊 Products Management
- Add/Edit/Delete products
- Category assignment
- Supplier linking
- Barcode scanning support
- Price management

### 💰 Sales Management
- View all transactions
- Filter by date/payment method
- Void sales (admin/manager only)
- Transaction details

### 🛒 Purchase Management
- Create purchase orders
- Receive inventory
- Supplier management
- Purchase history

### 📈 Reports & Analytics
- Sales reports (daily/weekly/monthly)
- Inventory reports
- Financial reports
- Product performance
- Export capabilities

### 👥 User Management (Admin/Manager)
- Create/Edit users
- Role assignment
- Status management
- Activity logging

---

## 🎯 Quick Actions

### Make a Sale
1. Login as **cashier** or **admin**
2. Go to **POS** menu
3. Search and add products
4. Select payment method
5. Process sale
6. Print receipt

### Add New Product
1. Login as **admin** or **manager**
2. Go to **Products** menu
3. Click **+ Add Product**
4. Fill in details
5. Save

### Adjust Inventory
1. Login as **inventory** staff
2. Go to **Inventory** menu
3. Click **Adjust Stock** on a product
4. Enter adjustment details
5. Submit for approval

### View Reports
1. Login as **admin** or **manager**
2. Go to **Reports** menu
3. Select report type
4. Choose date range
5. View/Export

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `ESC` | Close modal/dialog |
| `Enter` | Submit form |
| `Tab` | Navigate form fields |
| `Ctrl+P` | Print receipt (in POS) |

---

## 📱 Mobile Access

The system is fully responsive and can be accessed from:
- ✅ Smartphones
- ✅ Tablets
- ✅ Desktop computers

Simply open http://localhost:5174/ in any modern browser.

---

## 🛠️ Troubleshooting

### Can't Login?
- Check you're using correct credentials
- Ensure backend server is running (port 5000)
- Check database connection

### Backend Not Starting?
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill process if needed
taskkill /F /PID <process_id>

# Restart backend
npm start
```

### Frontend Not Loading?
```bash
# Clear node_modules and reinstall
cd frontend
rm -rf node_modules
npm install
npm run dev
```

### Database Issues?
```bash
# Re-run migration
cd backend
npm run migrate

# Re-seed database
npm run seed
```

---

## 📞 Common Issues & Solutions

### Issue: "Port already in use"
**Solution:** Stop existing process or use different port

### Issue: "Cannot connect to database"
**Solution:** 
1. Check MySQL is running
2. Verify credentials in `.env`
3. Ensure database exists

### Issue: "Token expired"
**Solution:** Logout and login again

### Issue: "Permission denied"
**Solution:** Check user role has access to that feature

---

## 💡 Tips & Best Practices

1. **Regular Backups**: Backup database daily
2. **Stock Management**: Set minimum stock levels
3. **Receipt Printer**: Test print before going live
4. **User Roles**: Assign appropriate roles to staff
5. **Activity Logs**: Monitor system activity regularly
6. **Browser**: Use Chrome/Edge for best experience
7. **Updates**: Keep npm packages updated

---

## 📚 System Modules

### Core Modules:
- ✅ Authentication & Authorization
- ✅ Point of Sale (POS)
- ✅ Inventory Management
- ✅ Product Management
- ✅ Sales Management
- ✅ Purchase Management
- ✅ Customer Management
- ✅ Supplier Management
- ✅ Expense Tracking
- ✅ Reports & Analytics
- ✅ User Management
- ✅ Activity Logging

---

## 🎓 Training Resources

### For Cashiers:
1. How to use POS system
2. Processing sales
3. Handling returns
4. Receipt printing

### For Inventory Staff:
1. Adding products
2. Stock adjustments
3. Receiving purchases
4. Managing expiration dates

### For Managers:
1. Viewing reports
2. Managing users
3. Approving adjustments
4. Expense management

### For Administrators:
1. System configuration
2. User management
3. Database maintenance
4. System monitoring

---

**Need Help?** Check the IMPROVEMENTS_SUMMARY.md file for detailed technical information.

**Version:** 1.0.0  
**Last Updated:** October 12, 2026
