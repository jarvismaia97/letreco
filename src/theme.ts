export type ThemeMode = 'light' | 'dark';

export interface Theme {
  name: ThemeMode;
  colors: {
    background: string;
    correct: string;
    present: string;
    absent: string;
    border: string;
    emptyBorder: string;
    text: string;
    lightGray: string;
    keyBg: string;
    keyText: string;
    modalBg: string;
    modalOverlay: string;
  };
}

export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    background: '#121213',
    correct: '#538d4e',
    present: '#b59f3b',
    absent: '#3a3a3c',
    border: '#3a3a3c',
    emptyBorder: '#818384',
    text: '#ffffff',
    lightGray: '#818384',
    keyBg: '#818384',
    keyText: '#ffffff',
    modalBg: '#1a1a1b',
    modalOverlay: 'rgba(0, 0, 0, 0.8)',
  },
};

export const lightTheme: Theme = {
  name: 'light',
  colors: {
    background: '#ffffff',
    correct: '#6aaa64',
    present: '#c9b458',
    absent: '#787c7e',
    border: '#d3d6da',
    emptyBorder: '#d3d6da',
    text: '#1a1a1b',
    lightGray: '#878a8c',
    keyBg: '#d3d6da',
    keyText: '#1a1a1b',
    modalBg: '#ffffff',
    modalOverlay: 'rgba(255, 255, 255, 0.8)',
  },
};

// CSS custom properties for dynamic theming
export const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
  });
};

// Tile sizing constants
export const TILE_GAP = 5;
export const MAX_ATTEMPTS = 6;