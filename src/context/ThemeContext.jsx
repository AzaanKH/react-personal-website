import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Add transition styles to the document
    const style = document.createElement('style');
    style.textContent = `
      * {
        transition: background-color 0.3s ease, 
                    color 0.3s ease, 
                    border-color 0.3s ease, 
                    box-shadow 0.3s ease;
      }
      
      [data-bs-theme="dark"] .card.project-card,
      [data-bs-theme="light"] .card.project-card {
        transition: background-color 0.3s ease, 
                    color 0.3s ease, 
                    border-color 0.3s ease,
                    transform 0.3s ease,
                    box-shadow 0.3s ease;
      }
    `;
    document.head.appendChild(style);
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.setAttribute('data-bs-theme', 'dark');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  const toggleTheme = () => {
    setIsTransitioning(true);
    
    setIsDarkMode(prev => {
      const newValue = !prev;
      
      // Update the document attribute and class for shadcn/ui
      document.documentElement.setAttribute('data-bs-theme', newValue ? 'dark' : 'light');
      if (newValue) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Store preference
      localStorage.setItem('theme', newValue ? 'dark' : 'light');
      
      // Set a short timeout to allow transition to complete
      setTimeout(() => {
        setIsTransitioning(false);
      }, 350);
      
      return newValue;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, isTransitioning }}>
      {children}
    </ThemeContext.Provider>
  );
};