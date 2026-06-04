import { useState, useEffect } from 'react';

export default function useTheme() {
  const [theme, setThemeState] = useState(
    localStorage.getItem('theme') || 'light'
  );

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    window.dispatchEvent(new CustomEvent('theme-change', { detail: newTheme }));
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    const handleThemeChange = (e) => {
      if (e.detail !== theme) {
        setThemeState(e.detail);
      }
    };
    window.addEventListener('theme-change', handleThemeChange);
    return () => window.removeEventListener('theme-change', handleThemeChange);
  }, [theme]);

  return [theme, setTheme];
}