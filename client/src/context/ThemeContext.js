import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('fleet_theme') || 'light';
  });

  const [accent, setAccent] = useState(() => {
    return localStorage.getItem('fleet_accent') || 'blue';
  });

  useEffect(() => {
    localStorage.setItem('fleet_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('fleet_accent', accent);
    document.documentElement.setAttribute('data-accent', accent);
  }, [accent]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const changeAccent = (newAccent) => {
    setAccent(newAccent);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, accent, changeAccent }}>
      {children}
    </ThemeContext.Provider>
  );
};
