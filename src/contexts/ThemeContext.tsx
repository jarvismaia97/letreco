import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Appearance } from 'react-native';
import { Theme, ThemeMode, darkTheme, lightTheme } from '../theme';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@letreco/theme';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark'); // Default to dark
  const [isLoading, setIsLoading] = useState(true);

  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      // First try to load saved preference
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        setThemeMode(savedTheme);
      } else {
        // No saved preference, check system preference
        const systemTheme = getSystemTheme();
        setThemeMode(systemTheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
      // Fall back to dark theme on error
      setThemeMode('dark');
    } finally {
      setIsLoading(false);
    }
  };

  const getSystemTheme = (): ThemeMode => {
    if (Platform.OS === 'web') {
      // Check CSS media query for web
      if (typeof window !== 'undefined' && window.matchMedia) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return prefersDark ? 'dark' : 'light';
      }
      return 'dark'; // Default to dark for web
    } else {
      // Use Appearance API for React Native
      const colorScheme = Appearance.getColorScheme();
      return colorScheme === 'light' ? 'light' : 'dark';
    }
  };

  const toggleTheme = async () => {
    const newTheme: ThemeMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(newTheme);
    
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, themeMode, toggleTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}