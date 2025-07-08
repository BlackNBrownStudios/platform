import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';

// Theme style definitions
export interface ThemeStyle {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  timelineColor: string;
}

// Available theme types
export type ThemeType = 'light' | 'dark' | 'blue' | 'green' | 'sepia';

// Theme context state interface
interface ThemeContextState {
  theme: ThemeType;
  styles: ThemeStyle;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
  themeStyles: Record<ThemeType, ThemeStyle>;
}

// Predefined theme styles
const themeStyles: Record<ThemeType, ThemeStyle> = {
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
  blue: {
    primary: '#0d47a1',
    secondary: '#00b0ff',
    background: '#e3f2fd',
    surface: '#bbdefb',
    text: '#102027',
    timelineColor: '#0d47a1',
  },
  green: {
    primary: '#2e7d32',
    secondary: '#00c853',
    background: '#e8f5e9',
    surface: '#c8e6c9',
    text: '#1b5e20',
    timelineColor: '#2e7d32',
  },
  sepia: {
    primary: '#795548',
    secondary: '#ff9800',
    background: '#f5eee6',
    surface: '#e7dbd0',
    text: '#3e2723',
    timelineColor: '#795548',
  },
};

// Create the theme context with a default value
const ThemeContext = createContext<ThemeContextState>({
  theme: 'light',
  styles: themeStyles.light,
  setTheme: () => {},
  toggleTheme: () => {},
  themeStyles,
});

// Storage key for persisting theme preference
const THEME_STORAGE_KEY = 'history_time_theme_preference';

// Theme provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const deviceTheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeType>('light');

  // Load saved theme preference on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && Object.keys(themeStyles).includes(savedTheme)) {
          setThemeState(savedTheme as ThemeType);
        } else if (deviceTheme) {
          // If no saved theme, use device theme
          setThemeState(deviceTheme === 'dark' ? 'dark' : 'light');
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      }
    };

    loadTheme();
  }, [deviceTheme]);

  // Set theme and save to storage
  const setTheme = async (newTheme: ThemeType) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  // Toggle between light and dark themes
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        styles: themeStyles[theme],
        setTheme,
        toggleTheme,
        themeStyles,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for accessing theme context
export const useAppTheme = () => useContext(ThemeContext);
