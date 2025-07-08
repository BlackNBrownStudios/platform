'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Define available themes
export type ThemeType = 'light' | 'dark' | 'sepia' | 'historical';

// Define theme colors and styles for each theme
export const themeStyles = {
  light: {
    primary: '#1976d2',
    secondary: '#f50057',
    background: '#ffffff',
    surface: '#f5f5f5',
    text: '#212121',
    timelineColor: '#1976d2',
  },
  dark: {
    primary: '#90caf9',
    secondary: '#f48fb1',
    background: '#121212',
    surface: '#1e1e1e',
    text: '#e0e0e0',
    timelineColor: '#90caf9',
  },
  sepia: {
    primary: '#8d6e63',
    secondary: '#6d4c41',
    background: '#f5f5dc',
    surface: '#e8e4c9',
    text: '#5d4037',
    timelineColor: '#8d6e63',
  },
  historical: {
    primary: '#7b5d3f',
    secondary: '#9c816b',
    background: '#f4e8d9',
    surface: '#e6dace',
    text: '#3e2723',
    timelineColor: '#7b5d3f',
  },
};

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  styles: typeof themeStyles.light;
}

// Create theme context with default values
const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
  styles: themeStyles.light,
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Return default theme if context is not available (during SSR)
    return {
      theme: 'light' as ThemeType,
      setTheme: () => {},
      styles: themeStyles.light,
    };
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use state for the theme with a default value
  const [theme, setThemeState] = useState<ThemeType>('light');
  const [styles, setStyles] = useState(themeStyles.light);
  const [mounted, setMounted] = useState(false);

  // Set theme function that updates state and localStorage
  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
    }
  };

  // Effect to load theme from localStorage and apply it
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as ThemeType;
    if (savedTheme && Object.keys(themeStyles).includes(savedTheme)) {
      setThemeState(savedTheme);
    } else {
      // Check for user's preferred color scheme if no saved theme
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setThemeState('dark');
      }
    }
  }, []);

  // Update styles when theme changes
  useEffect(() => {
    setStyles(themeStyles[theme]);

    // Add or remove dark class on body
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Only render the provider when mounted to avoid hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, styles }}>{children}</ThemeContext.Provider>
  );
};
