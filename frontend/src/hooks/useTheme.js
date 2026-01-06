import { useState, useEffect } from 'react';

export default function useTheme() {
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') ? localStorage.getItem('theme') : 'light'
  );

  useEffect(() => {
    const root = window.document.documentElement;
    
    root.classList.remove('light', 'dark');

    root.classList.add(theme);
    
    localStorage.setItem('theme', theme);
  }, [theme]);

  return [theme, setTheme];
}