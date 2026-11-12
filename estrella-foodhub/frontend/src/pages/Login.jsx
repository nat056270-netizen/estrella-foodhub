import { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';
import { Lock, User, Loader2, Eye, EyeOff, ArrowRight, Sun, Moon, UtensilsCrossed } from 'lucide-react';
import Brand from '../components/Brand';
export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const pending = useRef(false);
  const {
    login
  } = useAuth();
  const {
    theme,
    toggleTheme
  } = useTheme();
  const handleSubmit = async event => {
    event.preventDefault();
    if (pending.current) return;
    const next = {};
    if (!username.trim()) next.username = 'Enter your username.';
    if (!password) next.password = 'Enter your password.';
    setErrors(next);
    setServerError('');
    if (Object.keys(next).length) {
      document.getElementById(Object.keys(next)[0])?.focus();
      return;
    }
    pending.current = true;
    setLoading(true);
    try {
      const result = await login(username.trim(), password);
      if (result.success) toast.success('Welcome back to Estrella.');else setServerError(result.message);
    } finally {
      pending.current = false;
      setLoading(false);
    }
  };
  return <div className="login-page">
    <section className="login-story"><Brand /><div><span className="login-story-badge"><UtensilsCrossed size={13} /> Made for the daily rush</span><h1>Good food.<br />Great service.<br /><em>Everything in sync.</em></h1><p>From the first order to the last receipt, keep your food hub running beautifully.</p><div className="flex gap-6 mt-10 text-xs text-green-100"><span>Point of sale</span><span>Inventory</span><span>Business insights</span></div></div><footer>© {new Date().getFullYear()} Estrella Foodhub. A little more organized. A lot more possible.</footer></section>
    <section className="login-form-side"><button className="icon-button login-theme" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Use light theme' : 'Use dark theme'} title="Change theme" type="button">{theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}</button>
      <div className="login-form-wrap page-enter"><div className="lg:hidden mb-10"><Brand /></div><p className="eyebrow">Your workspace awaits</p><h2 className="page-title">Welcome back.</h2><p className="page-description mb-8">Sign in to manage another great day at Estrella.</p>
        <form onSubmit={handleSubmit} className="space-y-5" noValidate aria-busy={loading}>
          {serverError && <p className="p-3 rounded-xl bg-red-50 text-red-700 text-sm" role="alert">{serverError}</p>}
          <div><label htmlFor="username" className="label">Username</label><div className="relative"><User size={17} className="absolute left-3 top-3.5 text-gray-400" /><input id="username" autoComplete="username" value={username} onChange={e => {
                setUsername(e.target.value);
                setErrors(v => ({
                  ...v,
                  username: ''
                }));
              }} placeholder="Your username" disabled={loading} className={`input pl-10 ${errors.username ? 'input-error' : ''}`} aria-invalid={!!errors.username} aria-describedby={errors.username ? 'username-error' : undefined} required /></div>{errors.username && <p id="username-error" className="error-message" role="alert">{errors.username}</p>}</div>
          <div><label htmlFor="password" className="label">Password</label><div className="relative"><Lock size={17} className="absolute left-3 top-3.5 text-gray-400" /><input id="password" type={visible ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={e => {
                setPassword(e.target.value);
                setErrors(v => ({
                  ...v,
                  password: ''
                }));
              }} placeholder="Your password" disabled={loading} className={`input pl-10 pr-12 ${errors.password ? 'input-error' : ''}`} aria-invalid={!!errors.password} aria-describedby={errors.password ? 'password-error' : undefined} required /><button type="button" onClick={() => setVisible(v => !v)} className="icon-button absolute right-0 top-0" aria-label={visible ? 'Hide password' : 'Show password'} title={visible ? 'Hide password' : 'Show password'}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>{errors.password && <p id="password-error" className="error-message" role="alert">{errors.password}</p>}</div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full" style={{
            minHeight: 48
          }}>{loading ? <><Loader2 size={18} className="animate-spin" /> Signing in…</> : <>Sign in to workspace <ArrowRight size={17} /></>}</button>
        </form>
        <p className="login-note flex items-start gap-3"><Lock size={15} className="mt-1" /><span>Your workspace is protected. Need access or help signing in? Contact your system administrator.</span></p>
      </div>
    </section>
  </div>;
}
