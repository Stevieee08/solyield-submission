import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const Colors = {
  light: {
    background: '#F8FAFC',
    card: '#FFFFFF',
    text: '#0F172A',
    subText: '#64748B',
    primary: '#2563EB',
    border: '#E2E8F0',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    tint: '#EFF6FF',
    gradientStart: '#F8FAFC',
    gradientEnd: '#F1F5F9',
    cardGradientStart: '#FFFFFF',
    cardGradientEnd: '#F8FAFC'
  },
  dark: {
    background: '#040B16', // Deep space blue from your image
    card: '#0D1B2A',       
    text: '#FFFFFF',
    subText: '#94A3B8',
    primary: '#3B82F6',    // Neon blue
    border: '#1E293B',
    success: '#10B981',
    warning: '#FBBF24',
    error: '#F87171',
    tint: '#1E293B',
    gradientStart: '#040B16', 
    gradientEnd: '#0A1428',
    cardGradientStart: '#112240', // Glowing card top
    cardGradientEnd: '#0A192F'    // Glowing card bottom
  }
};

type Theme = 'light' | 'dark';

const ThemeContext = createContext<any>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>(systemScheme === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    AsyncStorage.getItem('user-theme').then(saved => {
      if (saved) setTheme(saved as Theme);
    });
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    AsyncStorage.setItem('user-theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors: Colors[theme] }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);