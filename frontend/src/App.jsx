import { lazy, Suspense } from 'react';
import Loading from './components/Loading';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { navigation } from './components/Sidebar';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
const Dashboard = lazy(() => import('./pages/Dashboard'));
const POS = lazy(() => import('./pages/POS'));
const Products = lazy(() => import('./pages/Products'));
const Categories = lazy(() => import('./pages/Categories'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Suppliers = lazy(() => import('./pages/Suppliers'));
const Customers = lazy(() => import('./pages/Customers'));
const Sales = lazy(() => import('./pages/Sales'));
const Purchases = lazy(() => import('./pages/Purchases'));
const Expenses = lazy(() => import('./pages/Expenses'));
const Reports = lazy(() => import('./pages/Reports'));
const Users = lazy(() => import('./pages/Users'));
const ActivityLogs = lazy(() => import('./pages/ActivityLogs'));
const ProtectedRoute = ({
  children,
  roles
}) => {
  const {
    isAuthenticated,
    user
  } = useAuth();
  const {
    pathname
  } = useLocation();
  const allowedRoles = roles || navigation.find(item => item.path === pathname)?.roles;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};
function App() {
  const {
    isAuthenticated
  } = useAuth();
  return <BrowserRouter>
      <Suspense fallback={<Loading message="Opening workspace..." />}><Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />

        <Route path="/" element={<ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pos" element={<ProtectedRoute roles={['admin', 'manager', 'cashier']}>
              <POS />
            </ProtectedRoute>} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="customers" element={<Customers />} />
          <Route path="sales" element={<Sales />} />
          <Route path="purchases" element={<Purchases />} />
          <Route path="expenses" element={<ProtectedRoute roles={['admin', 'manager']}>
              <Expenses />
            </ProtectedRoute>} />
          <Route path="reports" element={<ProtectedRoute roles={['admin', 'manager']}>
              <Reports />
            </ProtectedRoute>} />
          <Route path="users" element={<ProtectedRoute roles={['admin', 'manager']}>
              <Users />
            </ProtectedRoute>} />
          <Route path="activity-logs" element={<ProtectedRoute roles={['admin', 'manager']}>
              <ActivityLogs />
            </ProtectedRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes></Suspense>
    </BrowserRouter>;
}
export default App;
