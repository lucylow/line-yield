import React, { createContext, useContext, useState, useEffect } from 'react';

interface WebContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const WebContext = createContext<WebContextType>({
  isDarkMode: false,
  toggleDarkMode: () => {}
});

export const WebProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('darkMode', (!isDarkMode).toString());
  };

  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved) {
      setIsDarkMode(saved === 'true');
    }
  }, []);

  return (
    <WebContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      <div className={isDarkMode ? 'dark' : ''}>
        {children}
      </div>
    </WebContext.Provider>
  );
};

export const useWeb = () => useContext(WebContext);
