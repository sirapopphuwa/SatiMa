import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import {
  ACCENT_THEMES,
  AccentTheme,
  ColorScheme,
  Colors,
  ThemeColors,
} from '@/constants/theme';

const THEME_KEY  = '@satima_theme';
const ACCENT_KEY = '@satima_accent';

interface ThemeContextType {
  colorScheme: ColorScheme;
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (scheme: ColorScheme) => void;
  accentTheme: AccentTheme;
  setAccentTheme: (theme: AccentTheme) => void;
  heroGradient: [string, string];
  /** Full-screen background gradient — top to bottom, theme-tinted */
  backgroundGradient: [string, string];
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorScheme, setColorScheme] = useState<ColorScheme>('dark');
  const [accentTheme, setAccentThemeState] = useState<AccentTheme>('dream');

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(THEME_KEY),
      AsyncStorage.getItem(ACCENT_KEY),
    ]).then(([savedScheme, savedAccent]) => {
      if (savedScheme === 'light' || savedScheme === 'dark') setColorScheme(savedScheme);
      if (savedAccent && savedAccent in ACCENT_THEMES) setAccentThemeState(savedAccent as AccentTheme);
    });
  }, []);

  const setTheme = useCallback((scheme: ColorScheme) => {
    setColorScheme(scheme);
    AsyncStorage.setItem(THEME_KEY, scheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(colorScheme === 'light' ? 'dark' : 'light');
  }, [colorScheme, setTheme]);

  const setAccentTheme = useCallback((theme: AccentTheme) => {
    setAccentThemeState(theme);
    AsyncStorage.setItem(ACCENT_KEY, theme);
  }, []);

  const isDark = colorScheme === 'dark';
  const accent = ACCENT_THEMES[accentTheme];
  const colors: ThemeColors = {
    ...Colors[colorScheme],
    primary:   accent.primary,
    secondary: accent.secondary,
  };

  return (
    <ThemeContext.Provider
      value={{
        colorScheme,
        colors,
        isDark,
        toggleTheme,
        setTheme,
        accentTheme,
        setAccentTheme,
        heroGradient:       accent.gradient,
        backgroundGradient: isDark ? accent.bgDark : accent.bgLight,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
