'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  // Load theme from localStorage on initial load
  useEffect(() => {
    console.log('ThemeProvider: Initial render');
    const savedTheme = localStorage.getItem('theme') as Theme;
    console.log('Saved theme from localStorage:', savedTheme);
    
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Default to dark theme if no saved theme
      setTheme('dark');
    }
  }, []);

  // Update localStorage and apply theme
  useEffect(() => {
    console.log('Theme changed to:', theme);
    
    // Ensure localStorage is available (client-side only)
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
    }
    
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    console.log('Toggle theme called');
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'dark' ? 'light' : 'dark';
      console.log(`Switching from ${prevTheme} to ${newTheme}`);
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 