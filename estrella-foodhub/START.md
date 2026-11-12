# 🚀 How to Run Estrella Food Hub ERP

## Prerequisites
- ✅ Node.js installed (v14 or higher)
- ✅ MySQL/MariaDB installed and running (via Laragon)
- ✅ Database created: `estrella_foodhub`

## 📋 Quick Start Guide

### Step 1: Start Laragon
1. Open **Laragon**
2. Click **Start All** button
3. Wait for Apache and MySQL to start (green indicators)

### Step 2: Open Two Terminals

#### Terminal 1 - Backend Server
```bash
cd "c:\laragon\www\Sir Nicko System ERP_moncada\estrella-foodhub\backend"
npm start
```

#### Terminal 2 - Frontend Server
```bash
cd "c:\laragon\www\Sir Nicko System ERP_moncada\estrella-foodhub\frontend"
npm run dev
```

### Step 3: Access the Application
1. **Frontend URL:** http://localhost:5173
2. **Backend API:** http://localhost:5000/api

## 🔐 Login Credentials

### Admin Account
- **Username:** `admin`
- **Password:** `admin123`
- **Role:** Full system access

### Manager Account
- **Username:** `manager`
- **Password:** `manager123`
- **Role:** Reports, expenses, inventory management

### Cashier Account
- **Username:** `cashier`
- **Password:** `cashier123`
- **Role:** POS, sales

### Inventory Staff Account
- **Username:** `inventory`
- **Password:** `inventory123`
- **Role:** Inventory management

## 🛠️ First Time Setup

If this is your first time running the system:

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies
```bash
cd frontend
npm install
```

### 3. Run Database Migration
```bash
cd backend
npm run migrate
```

### 4. Seed the Database (Create Test Data)
```bash
cd backend
npm run seed
```

## 🔧 Troubleshooting

### Port Already in Use

**Backend (Port 5000):**
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual number)
taskkill /F /PID [PID]
```

**Frontend (Port 5173):**
```bash
# Find process using port 5173
netstat -ano | findstr :5173

# Kill the process (replace PID with actual number)
taskkill /F /PID [PID]
```

### Database Connection Error
1. Make sure **Laragon is running**
2. Check MySQL is active (green light in Laragon)
3. Verify database exists:
   - Open **HeidiSQL** (in Laragon)
   - Look for `estrella_foodhub` database
   - If not found, run: `npm run migrate` from backend folder

### Cannot Login
1. Make sure backend is running (check Terminal 1)
2. Verify database is seeded:
   ```bash
   cd backend
   npm run seed
   ```
3. Check browser console for errors (F12)

### Modules Not Found
```bash
# Reinstall dependencies
cd backend
npm install

cd ../frontend
npm install
```

## 📱 Available Scripts

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with test data

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🌐 System URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | Main application interface |
| Backend API | http://localhost:5000/api | REST API endpoints |
| Health Check | http://localhost:5000/api/health | API status check |

## 📞 Support

If you encounter any issues:
1. Check Laragon is running
2. Verify both terminals are active
3. Check browser console for errors (F12)
4. Review terminal logs for error messages

---

**Ready to start?** Follow Step 1-3 above! 🎉
