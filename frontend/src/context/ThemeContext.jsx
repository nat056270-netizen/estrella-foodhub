import { createContext, useContext, useEffect, useState } from 'react';
const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);
export function ThemeProvider({
  children
}) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('estrella-theme') === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    try {
      localStorage.setItem('estrella-theme', theme);
    } catch {/* Storage may be disabled. */}
  }, [theme]);
  return <ThemeContext.Provider value={{
    theme,
    toggleTheme: () => setTheme(value => value === 'dark' ? 'light' : 'dark')
  }}>{children}</ThemeContext.Provider>;
}
