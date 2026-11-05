import React, { useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useTheme } from 'next-themes';

export default function MUIThemeProvider({ children }) {
  // resolvedTheme turns "system" into the actual light/dark choice, so MUI
  // matches the Tailwind side (which follows the device setting).
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const theme = useMemo(() => createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      // Redesign: one action colour (indigo) for buttons, links and selected tabs.
      // Brand navy lives in the header; yellow is for badges only.
      primary: isDark
        ? { main: '#818cf8', light: '#a5b4fc', dark: '#6366f1', contrastText: '#0b0b14' }
        : { main: '#4f46e5', light: '#6366f1', dark: '#3730a3', contrastText: '#ffffff' },
      secondary: {
        main: '#fbbf24',
        light: '#fcd34d',
        dark: '#d97706',
        contrastText: '#1a1a1a',
      },
      success: { main: '#16a34a', contrastText: '#ffffff' },
      background: {
        default: isDark ? '#0d0d12' : '#f6f7fb',
        paper: isDark ? '#17171e' : '#ffffff',
      },
      text: {
        primary: isDark ? '#f5f5fa' : '#1a1a1a',
        secondary: isDark ? '#c8c8d2' : '#4b5563',
      },
      divider: isDark ? 'rgba(255,255,255,0.12)' : '#e5e7eb',
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2 },
      h2: { fontSize: '2rem', fontWeight: 600, lineHeight: 1.3 },
      h3: { fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.4 },
      h4: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.4 },
      h5: { fontSize: '1.25rem', fontWeight: 500, lineHeight: 1.5 },
      h6: { fontSize: '1rem', fontWeight: 500, lineHeight: 1.5 },
      button: { textTransform: 'none', fontWeight: 700 },
    },
    shape: {
      borderRadius: 10,
    },
    components: {
      MuiDialog: {
        styleOverrides: { paper: { minWidth: 0, overflowWrap: 'anywhere',
          '@media (max-width: 600px)': { margin: 12, maxWidth: 'calc(100vw - 24px)', maxHeight: 'calc(100dvh - 24px)' } } },
      },
      MuiPopover: {
        defaultProps: { marginThreshold: 12 },
        styleOverrides: { paper: { maxWidth: 'calc(100vw - 24px)', overflowWrap: 'anywhere' } },
      },
      MuiMenu: {
        defaultProps: { marginThreshold: 12 },
        styleOverrides: { paper: { maxWidth: 'calc(100vw - 24px)' } },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: 'background-color 150ms ease, color 150ms ease, transform 160ms var(--ease-out)',
            '&:active:not(.Mui-disabled)': { transform: 'scale(0.94)' },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: '10px 20px',
            minHeight: 44,
            fontSize: '1rem',
            boxShadow: 'none',
            // Press feedback: a slight press-down confirms the click (only transform and colours
            // animate, never 'all').
            transition: 'background-color 150ms ease, border-color 150ms ease, color 150ms ease, transform 160ms var(--ease-out)',
            '&:hover': {
              boxShadow: 'none',
            },
            '&:active:not(.Mui-disabled)': {
              transform: 'scale(0.97)',
            },
          },
          sizeSmall: {
            minHeight: 36,
            padding: '6px 14px',
            fontSize: '0.875rem',
          },
          sizeLarge: {
            padding: '14px 32px',
            fontSize: '1.125rem',
          },
        },
      },
      // Calm, flat cards: white, soft shadow, no glass blur or hover lift.
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            backgroundImage: 'none',
            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #eef0f4',
            boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.08)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: 'none' }, rounded: { borderRadius: 14 } },
      },
      MuiTab: {
        styleOverrides: { root: { textTransform: 'none', fontWeight: 700, minHeight: 44 } },
      },
      // Redesign (layout L1): admin lists, forms and dialogs share one calm look.
      MuiTableCell: {
        styleOverrides: {
          root: { borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#f0f1f4', paddingTop: 12, paddingBottom: 12 },
          head: { fontSize: 13, fontWeight: 700, color: isDark ? '#c8c8d2' : '#4b5563', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e5e7eb', backgroundColor: 'transparent' },
        },
      },
      MuiTableRow: {
        styleOverrides: { root: { '&.MuiTableRow-hover:hover': { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#f8f9fc' } } },
      },
      MuiTableContainer: {
        styleOverrides: { root: { borderRadius: 14 } },
      },
      MuiOutlinedInput: {
        styleOverrides: { root: { borderRadius: 10, backgroundColor: isDark ? 'transparent' : '#ffffff' } },
      },
      MuiDialogTitle: {
        styleOverrides: { root: { fontWeight: 700, fontSize: '1.25rem' } },
      },
      MuiAlert: {
        styleOverrides: { root: { borderRadius: 10 } },
      },
      MuiTabs: {
        styleOverrides: { indicator: { height: 3, borderRadius: 3 } },
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
            borderRadius: 999,
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
