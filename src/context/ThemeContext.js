import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    if (dark) {
      document.body.style.backgroundColor = 'rgba(20,16,12,0.95)';
      document.body.style.color = '#E8E3DE';
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      document.body.style.backgroundColor = '#C8BFA8';
      document.body.style.color = '#1C1917';
      document.body.classList.remove('dark');
      document.body.classList.add('light');
    }
  }, [dark]);

  function toggleTheme() {
    setDark(prev => !prev);
  }

  return (
    <ThemeContext.Provider value={{ dark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}