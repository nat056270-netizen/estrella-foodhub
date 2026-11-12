import { Suspense, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('estrella-sidebar') === 'collapsed');
  const [online, setOnline] = useState(navigator.onLine);
  const {
    pathname
  } = useLocation();
  const mainRef = useRef(null);
  useEffect(() => {
    setSidebarOpen(false);
    mainRef.current?.scrollTo(0, 0);
    const title = pathname.slice(1).replaceAll('-', ' ');
    document.title = title.charAt(0).toUpperCase() + title.slice(1) + ' · Estrella Foodhub';
  }, [pathname]);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);
  const toggle = () => setCollapsed(value => {
    localStorage.setItem('estrella-sidebar', value ? 'expanded' : 'collapsed');
    return !value;
  });
  return <div className="app-shell">
    <a href="#main-content" className="skip-link">Skip to content</a>
    <div className="hidden lg:flex shrink-0"><Sidebar collapsed={collapsed} onToggle={toggle} /></div>
    <Modal isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} title="Navigation" size="nav"><Sidebar mobile onClose={() => setSidebarOpen(false)} /></Modal>
    <div className="app-workspace"><Header onMenuClick={() => setSidebarOpen(true)} />
      {!online && <div className="offline-banner" role="status">You’re offline. Reconnect before saving changes or completing a sale.</div>}
      <main id="main-content" ref={mainRef} className="app-main" tabIndex={-1}><div key={pathname} className="page-enter"><Suspense fallback={<Loading message="Opening workspace..." />}><Outlet /></Suspense></div></main>
    </div>
  </div>;
}
