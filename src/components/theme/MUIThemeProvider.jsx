import React, { useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useTheme } from './ThemeProvider';

export default function MUIThemeProvider({ children }) {
  const { theme: currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';

  const theme = useMemo(() => createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: {
        main: '#003366',
        light: '#004488',
        dark: '#002244',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#FF8C00',
        light: '#FFA500',
        dark: '#CC7000',
        contrastText: '#ffffff',
      },
      background: {
        default: isDark ? '#0d0d12' : '#f5f7fa',
        paper: isDark ? '#17171e' : '#ffffff',
      },
      text: {
        primary: isDark ? '#f5f5fa' : '#1a1a1a',
        secondary: isDark ? '#c8c8d2' : '#666666',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2 },
      h2: { fontSize: '2rem', fontWeight: 600, lineHeight: 1.3 },
      h3: { fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.4 },
      h4: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.4 },
      h5: { fontSize: '1.25rem', fontWeight: 500, lineHeight: 1.5 },
      h6: { fontSize: '1rem', fontWeight: 500, lineHeight: 1.5 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: '10px 24px',
            fontSize: '1rem',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0px 4px 12px rgba(0,0,0,0.15)',
            },
          },
          sizeLarge: {
            padding: '14px 32px',
            fontSize: '1.125rem',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: isDark ? '0px 4px 12px rgba(0,0,0,0.4)' : '0px 4px 12px rgba(0,0,0,0.08)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: isDark ? '0px 8px 24px rgba(0,0,0,0.6)' : '0px 8px 24px rgba(0,0,0,0.12)',
              transform: 'translateY(-4px)',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 500,
          },
        },
      },
    },
  }), [isDark]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}