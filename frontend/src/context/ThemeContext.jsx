import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

/** Read initial theme: localStorage > system prefers-color-scheme */
function getInitialTheme() {
  const stored = localStorage.getItem('smt-theme');
  if (stored === 'light' || stored === 'dark') return stored;
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('smt-theme', theme);
  }, [theme]);

  /* Keep in sync with OS-level changes (e.g. user switches system dark mode)
     but only if the user hasn't made a manual choice in this session */
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      const stored = localStorage.getItem('smt-theme');
      // If preference was set by the OS change (no explicit user toggle),
      // respect the new OS preference automatically.
      if (!stored) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  const toggle = () =>
    setTheme(t => (t === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
