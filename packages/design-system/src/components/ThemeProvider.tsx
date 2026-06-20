import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme, type Theme } from '../theme';

const ThemeContext = createContext<Theme>(lightTheme);

export interface ThemeProviderProps {
  /** Force a theme; defaults to following the OS color scheme. */
  scheme?: 'light' | 'dark';
  children: React.ReactNode;
}

export function ThemeProvider({ scheme, children }: ThemeProviderProps) {
  const system = useColorScheme();
  const theme = useMemo<Theme>(() => {
    const resolved = scheme ?? (system === 'dark' ? 'dark' : 'light');
    return resolved === 'dark' ? darkTheme : lightTheme;
  }, [scheme, system]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

/** Access the active theme inside any component below <ThemeProvider>. */
export function useTheme(): Theme {
  return useContext(ThemeContext);
}
