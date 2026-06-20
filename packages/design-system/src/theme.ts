/**
 * Light & dark (night reading) themes built from the raw palette.
 * Components consume semantic theme roles, never raw palette values.
 */
import { memoryColors, palette } from './tokens/colors';

export interface Theme {
  name: 'light' | 'dark';
  colors: {
    /** App background. */
    background: string;
    /** Reading surface (Mushaf page). */
    surface: string;
    /** Elevated surface (cards, sheets). */
    surfaceElevated: string;
    /** Mushaf "paper" — warm parchment reading page (printed-muṣḥaf feel). */
    mushafPaper: string;
    /** Primary brand color. */
    primary: string;
    primaryContrast: string;
    accent: string;
    /** Vibrant highlight for the actively-sounding ayah (distinct from primary). */
    highlight: string;
    /** Soft wash behind the active ayah. */
    highlightSoft: string;
    /** Text colors. */
    text: string;
    textMuted: string;
    textInverse: string;
    /** Lines & dividers. */
    border: string;
    /** Status. */
    danger: string;
    warning: string;
    success: string;
    /** Memory-state map (shared across themes). */
    memory: typeof memoryColors;
  };
}

export const lightTheme: Theme = {
  name: 'light',
  colors: {
    background: palette.sand[50],
    surface: palette.sand[50],
    surfaceElevated: palette.ink[0],
    mushafPaper: '#FCF7EA',
    primary: palette.green[600],
    primaryContrast: palette.ink[0],
    accent: palette.gold[500],
    highlight: '#0E7C86',
    highlightSoft: 'rgba(21,160,166,0.16)',
    text: palette.ink[800],
    textMuted: palette.ink[500],
    textInverse: palette.ink[0],
    border: palette.sand[200],
    danger: palette.red[500],
    warning: palette.amber[500],
    success: palette.green[500],
    memory: memoryColors,
  },
};

export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    background: palette.ink[900],
    surface: palette.ink[800],
    surfaceElevated: palette.ink[700],
    mushafPaper: '#16231D',
    primary: palette.green[400],
    primaryContrast: palette.ink[900],
    accent: palette.gold[300],
    highlight: '#3FC9C2',
    highlightSoft: 'rgba(63,201,194,0.18)',
    text: palette.ink[50],
    textMuted: palette.ink[300],
    textInverse: palette.ink[900],
    border: palette.ink[700],
    danger: palette.red[400],
    warning: palette.amber[400],
    success: palette.green[400],
    memory: memoryColors,
  },
};

export const themes = { light: lightTheme, dark: darkTheme } as const;
