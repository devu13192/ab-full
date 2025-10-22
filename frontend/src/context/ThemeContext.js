// Single-theme stub to keep imports working while removing theme switching
import React, { createContext, useContext } from 'react';

const ThemeContext = createContext({ theme: 'light', toggle: () => {}, setTheme: () => {} });

export const ThemeProvider = ({ children }) => (
  <ThemeContext.Provider value={{ theme: 'light', toggle: () => {}, setTheme: () => {} }}>
    {children}
  </ThemeContext.Provider>
);

export const useTheme = () => useContext(ThemeContext);
