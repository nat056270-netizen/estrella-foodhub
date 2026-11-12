# ESTRELLA FOOD HUB ERP System

**Point of Sale and Inventory Management System**

A complete, professional, and responsive ERP-based Point of Sale (POS) and Inventory Management System built with React, Node.js, Express, and MySQL.

## 🌟 Features

### Core Modules
- **Dashboard** - Real-time business overview with charts and statistics
- **Point of Sale (POS)** - Modern cashier interface with cart management
- **Products Management** - Complete CRUD operations for products
- **Categories** - Organize products by categories
- **Inventory Management** - Real-time stock tracking and adjustments
- **Stock-In/Receiving** - Purchase order receiving and stock updates
- **Suppliers Management** - Manage supplier information
- **Customers Management** - Track customer information
- **Sales History** - View and manage all sales transactions
- **Purchases** - Create and receive purchase orders
- **Inventory Adjustments** - Track stock adjustments with reasons
- **Expenses** - Record and track business expenses
- **Reports** - Generate sales, inventory, and financial reports
- **Users & Roles** - Role-based access control system
- **Activity Logs** - Complete audit trail of system activities

### User Roles & Permissions

#### Admin
- Full system access
- User management
- All CRUD operations
- View all reports
- Access activity logs

#### Manager
- Dashboard access
- Product and inventory management
- Supplier and customer management
- View sales and purchases
- Generate reports
- Approve inventory adjustments

#### Cashier
- POS access
- Process sales
- Manage customers
- View own transactions
- Cannot modify prices or inventory

#### Inventory Staff
- View and manage products
- Receive stock
- Perform inventory counts
- Record adjustments
- Cannot access POS or sensitive reports

### Key Features

✅ **Authentication & Authorization**
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Protected routes

✅ **Point of Sale**
- Product search by name, SKU, barcode
- Category filtering
- Real-time cart management
- Multiple payment methods (Cash, GCash, Card, Other)
- Automatic change calculation
- Stock validation before checkout
- Expiration date checking
- Printable receipts

✅ **Inventory Management**
- Real-time stock tracking
- Low stock alerts
- Out of stock indicators
- Expiration tracking for food products
- Inventory adjustments with reasons
- Stock movement history

✅ **Reporting**
- Sales reports (daily, weekly, monthly)
- Inventory reports
- Financial summary with profit/loss
- Top-selling products
- Purchase history

✅ **Responsive Design**
- Desktop, tablet, and mobile support
- Modern and professional UI
- Tailwind CSS styling
- Touch-friendly controls

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router DOM** - Routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **React Toastify** - Notifications
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Sequelize ORM** - Database ORM
- **MySQL** - Database (via Laragon)
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logger

### Database
- **MySQL 8.0+** (via Laragon)
- Normalized database design
- Proper relationships and constraints
- Migrations and seeders

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **Laragon** (for MySQL) - [Download](https://laragon.org/download/)
- **Git** (optional) - [Download](https://git-scm.com/)

## 🚀 Installation & Setup

### Step 1: Install Laragon and Start MySQL

1. Download and install [Laragon](https://laragon.org/download/)
2. Open Laragon
3. Click "Start All" to start Apache and MySQL
4. Verify MySQL is running (default port: 3306)

### Step 2: Clone or Extract the Project

```bash
# If using Git
git clone <repository-url>
cd estrella-foodhub

# Or extract the ZIP file and navigate to the folder
cd estrella-foodhub
```

### Step 3: Create MySQL Database

1. Open HeidiSQL or phpMyAdmin from Laragon
2. Create a new database named `estrella_foodhub`

OR use MySQL command line:

```sql
CREATE DATABASE estrella_foodhub;
```

### Step 4: Configure Environment Variables

The `.env` file is already included in the `backend` folder. Verify the settings:

```env
# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=estrella_foodhub

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRE=7d

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

**Important:** Change `JWT_SECRET` for production use!

### Step 5: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 6: Run Database Migrations

This will create all database tables:

```bash
npm run migrate
```

You should see:
```
✓ Database migration completed successfully
✓ All tables created
```

### Step 7: Seed Database with Sample Data

This will populate the database with test data:

```bash
npm run seed
```

You should see the test accounts displayed.

### Step 8: Start Backend Server

```bash
npm run dev
```

The backend should now be running on `http://localhost:5000`

You should see:
```
✓ Database connection established successfully
✓ Server running on port 5000
✓ Environment: development
✓ API URL: http://localhost:5000/api
```

### Step 9: Install Frontend Dependencies

Open a **NEW terminal window** and:

```bash
cd frontend
npm install
```

### Step 10: Start Frontend Development Server

```bash
npm run dev
```

The frontend should now be running on `http://localhost:5173`

### Step 11: Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

## 🔐 Test Accounts

Use these credentials to login:

| Role | Username | Password |
|------|----------|----------|
| **Admin** | admin | admin123 |
| **Manager** | manager | manager123 |
| **Cashier** | cashier | cashier123 |
| **Inventory Staff** | inventory | inventory123 |

## 📁 Project Structure

```
estrella-foodhub/
│
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Sequelize models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Authentication & error handling
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Helper functions
│   │   └── server.js       # Express server entry point
│   ├── .env                # Environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── layouts/        # Layout components
│   │   ├── services/       # API services
│   │   ├── context/        # React context
│   │   ├── utils/          # Utility functions
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── public/             # Static files
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── database/
│   ├── migrations/         # Database migrations
│   ├── seeders/           # Database seeders
│   ├── migrate.js         # Migration script
│   └── seed.js            # Seeding script
│
├── .env                    # Root environment variables
└── README.md              # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - User logout

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/sales-chart` - Get sales chart data
- `GET /api/dashboard/top-products` - Get top selling products
- `GET /api/dashboard/recent-transactions` - Get recent transactions
- `GET /api/dashboard/low-stock` - Get low stock products

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Sales
- `GET /api/sales` - Get all sales
- `GET /api/sales/:id` - Get sale by ID
- `POST /api/sales` - Create new sale
- `POST /api/sales/:id/void` - Void a sale

### Purchases
- `GET /api/purchases` - Get all purchases
- `GET /api/purchases/:id` - Get purchase by ID
- `POST /api/purchases` - Create purchase order
- `POST /api/purchases/:id/receive` - Receive purchase

### Inventory
- `GET /api/inventory` - Get inventory
- `GET /api/inventory/movements` - Get inventory movements
- `POST /api/inventory/adjustments` - Create adjustment
- `GET /api/inventory/expiring` - Get expiring products

### Reports
- `GET /api/reports/sales` - Generate sales report
- `GET /api/reports/inventory` - Generate inventory report
- `GET /api/reports/financial-summary` - Generate financial summary

And more...

## 🧪 Testing the System

### 1. Test Login
- Go to `http://localhost:5173`
- Login with admin/admin123

### 2. Test Dashboard
- View statistics, charts, and tables
- All data should be loaded from the database

### 3. Test POS (as Cashier)
- Login as cashier/cashier123
- Navigate to Point of Sale
- Add products to cart
- Process a sale with cash payment
- Verify change calculation
- Print receipt
- Check that inventory decreased

### 4. Test Inventory (as Inventory Staff)
- Login as inventory/inventory123
- Navigate to Inventory
- Create an inventory adjustment
- Verify stock levels update

### 5. Test Reports (as Manager/Admin)
- Login as admin
- Navigate to Reports
- Generate sales report
- Generate inventory report
- Generate financial summary

## 🐛 Troubleshooting

### Backend won't start
- Verify Laragon MySQL is running
- Check database credentials in `.env`
- Ensure port 5000 is not in use
- Run `npm install` in backend folder

### Frontend won't start
- Ensure Node.js is installed
- Run `npm install` in frontend folder
- Check that port 5173 is available
- Clear npm cache: `npm cache clean --force`

### Database connection error
- Verify MySQL is running in Laragon
- Check database name is `estrella_foodhub`
- Verify DB credentials in `.env`
- Ensure database was created

### "Cannot find module" errors
- Delete `node_modules` folder
- Delete `package-lock.json`
- Run `npm install` again

### CORS errors
- Check FRONTEND_URL in backend `.env`
- Verify backend is running on port 5000
- Check browser console for specific errors

## 📱 Responsive Design

The system is fully responsive and works on:
- **Desktop** (1920px+) - Full features
- **Laptop** (1366px+) - Optimized layout
- **Tablet** (768px+) - Touch-friendly
- **Mobile** (375px+) - Compact interface

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected API routes
- Role-based authorization
- SQL injection prevention (Sequelize ORM)
- XSS protection
- CORS configuration
- Input validation
- Secure error handling

## 📊 Database Schema

The system uses a normalized MySQL database with the following main tables:

- `users` - System users
- `categories` - Product categories
- `suppliers` - Supplier information
- `products` - Product catalog
- `customers` - Customer information
- `sales` - Sales transactions
- `sale_items` - Sale line items
- `purchases` - Purchase orders
- `purchase_items` - Purchase line items
- `inventory_movements` - Stock movements
- `inventory_adjustments` - Stock adjustments
- `expenses` - Business expenses
- `activity_logs` - System audit trail
- `settings` - System configuration

## 🚀 Production Deployment

For production deployment:

1. Change `JWT_SECRET` to a strong random string
2. Set `NODE_ENV=production`
3. Update database credentials
4. Build frontend: `npm run build`
5. Use a process manager like PM2 for backend
6. Configure proper MySQL security
7. Use HTTPS/SSL
8. Set up proper backup procedures

## 📝 License

This project is licensed for educational and commercial use.

## 👥 Support

For support or questions:
- Email: info@estrellafoodhub.com
- Phone: 09123456789

## 🎉 Acknowledgments

Built with modern web technologies and best practices for enterprise-level applications.

---

**© 2026 ESTRELLA FOOD HUB. All rights reserved.**
