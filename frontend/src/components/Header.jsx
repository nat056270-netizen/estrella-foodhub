import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLocation } from 'react-router-dom';
import { Menu, LogOut, Moon, Sun, ChevronRight } from 'lucide-react';
import { navigation } from './Sidebar';
export default function Header({
  onMenuClick
}) {
  const {
    user,
    logout
  } = useAuth();
  const {
    theme,
    toggleTheme
  } = useTheme();
  const {
    pathname
  } = useLocation();
  const page = navigation.find(item => item.path === pathname);
  return <header className="app-header">
    <div className="flex items-center gap-3 min-w-0"><button className="icon-button lg:hidden" onClick={onMenuClick} aria-label="Open navigation" title="Open navigation" type="button"><Menu size={22} /></button><div className="breadcrumb"><span className="hidden sm:inline">Workspace</span><ChevronRight className="hidden sm:block" size={14} /><strong>{page?.label || 'Estrella Foodhub'}</strong></div></div>
    <div className="flex items-center gap-2"><span className="header-date hidden md:inline">{new Date().toLocaleDateString('en-PH', {
          timeZone: 'Asia/Manila',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })}</span><button onClick={toggleTheme} className="icon-button" aria-label={theme === 'dark' ? 'Use light theme' : 'Use dark theme'} title={theme === 'dark' ? 'Use light theme' : 'Use dark theme'} type="button">{theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}</button><div className="header-divider" /><span className="avatar hidden sm:flex" title={user?.first_name}>{user?.first_name?.[0]}{user?.last_name?.[0]}</span><button onClick={logout} className="icon-button" aria-label="Sign out" title="Sign out" type="button"><LogOut size={19} /></button></div>
  </header>;
}
