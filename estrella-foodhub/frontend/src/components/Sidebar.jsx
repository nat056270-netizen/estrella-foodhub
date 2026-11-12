import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, ShoppingCart, Package, FolderOpen, Warehouse, Users, UserCircle, Receipt, ShoppingBag, TrendingDown, FileText, ShieldCheck, Activity, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import Brand from './Brand';
const all = ['admin', 'manager', 'cashier', 'inventory_staff'];
const management = ['admin', 'manager'];
export const navigation = [{
  path: '/dashboard',
  icon: LayoutDashboard,
  label: 'Overview',
  group: 'Workspace',
  roles: all
}, {
  path: '/pos',
  icon: ShoppingCart,
  label: 'Point of sale',
  group: 'Workspace',
  roles: ['admin', 'manager', 'cashier']
}, {
  path: '/sales',
  icon: Receipt,
  label: 'Sales history',
  group: 'Workspace',
  roles: ['admin', 'manager', 'cashier']
}, {
  path: '/customers',
  icon: UserCircle,
  label: 'Customers',
  group: 'Workspace',
  roles: ['admin', 'manager', 'cashier']
}, {
  path: '/products',
  icon: Package,
  label: 'Products',
  group: 'Catalog & stock',
  roles: ['admin', 'manager', 'inventory_staff']
}, {
  path: '/categories',
  icon: FolderOpen,
  label: 'Categories',
  group: 'Catalog & stock',
  roles: management
}, {
  path: '/inventory',
  icon: Warehouse,
  label: 'Inventory',
  group: 'Catalog & stock',
  roles: ['admin', 'manager', 'inventory_staff']
}, {
  path: '/purchases',
  icon: ShoppingBag,
  label: 'Purchases',
  group: 'Catalog & stock',
  roles: ['admin', 'manager', 'inventory_staff']
}, {
  path: '/suppliers',
  icon: Users,
  label: 'Suppliers',
  group: 'Catalog & stock',
  roles: management
}, {
  path: '/expenses',
  icon: TrendingDown,
  label: 'Expenses',
  group: 'Management',
  roles: management
}, {
  path: '/reports',
  icon: FileText,
  label: 'Reports & insights',
  group: 'Management',
  roles: management
}, {
  path: '/users',
  icon: ShieldCheck,
  label: 'Users & roles',
  group: 'Management',
  roles: management
}, {
  path: '/activity-logs',
  icon: Activity,
  label: 'Activity logs',
  group: 'Management',
  roles: management
}];
export default function Sidebar({
  collapsed,
  onToggle,
  onClose,
  mobile = false
}) {
  const {
    user
  } = useAuth();
  const items = navigation.filter(item => item.roles.includes(user?.role));
  return <aside className={`app-sidebar ${collapsed && !mobile ? 'sidebar-collapsed' : ''}`} aria-label="Main navigation">
    <div className="sidebar-brand"><Brand compact={collapsed && !mobile} />{mobile && <button className="icon-button" onClick={onClose} aria-label="Close navigation" type="button"><X size={20} /></button>}</div>
    <nav className="sidebar-nav">{['Workspace', 'Catalog & stock', 'Management'].map(group => {
        const links = items.filter(item => item.group === group);
        return links.length > 0 && <div className="nav-group" key={group}><p className="nav-group-title">{collapsed && !mobile ? '···' : group}</p>{links.map(({
            path,
            label,
            icon: Icon
          }) => <NavLink key={path} to={path} onClick={onClose} title={collapsed && !mobile ? label : undefined} className={({
            isActive
          }) => `nav-link ${isActive ? 'active' : ''}`}><Icon size={19} aria-hidden="true" /><span>{label}</span></NavLink>)}</div>;
      })}</nav>
    <div className="sidebar-footer">{!mobile && <button className="nav-link w-full" onClick={onToggle} title={collapsed ? 'Expand navigation' : 'Collapse navigation'} aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'} type="button">{collapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}<span>Collapse sidebar</span></button>}
      <div className="sidebar-account"><span className="avatar">{user?.first_name?.[0]}{user?.last_name?.[0]}</span><div><strong>{user?.first_name} {user?.last_name}</strong><small>{user?.role?.replaceAll('_', ' ')}</small></div><span className="account-dot" title="Signed in" /></div>
    </div>
  </aside>;
}
