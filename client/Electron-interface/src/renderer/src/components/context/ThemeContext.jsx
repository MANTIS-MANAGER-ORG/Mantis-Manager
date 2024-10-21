// components/context/ThemeContext.js
import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();
// una opción que probablemente no implementemos pero  se intentará 
export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en'); // Ejemplo de idioma por defecto

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, language, changeLanguage }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  return useContext(ThemeContext);
};
