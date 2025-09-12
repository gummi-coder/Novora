import { DefaultTheme } from 'styled-components';

export const theme = {
  colors: {
    primary: {
      main: '#007bff',
      light: '#3395ff',
      dark: '#0056b3'
    },
    secondary: {
      main: '#6c757d',
      light: '#868e96',
      dark: '#495057'
    },
    success: {
      main: '#28a745',
      light: '#4caf50',
      dark: '#1b5e20'
    },
    danger: '#dc3545',
    warning: '#ffc107',
    info: {
      main: '#17a2b8',
      light: '#03a9f4',
      dark: '#01579b'
    },
    light: '#f8f9fa',
    dark: '#343a40',
    white: '#ffffff',
    black: '#000000',
    background: {
      default: '#ffffff',
      paper: '#f5f5f5',
      hover: '#e3f2fd'
    },
    text: {
      primary: '#212121',
      secondary: '#757575'
    }
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '16px'
  },
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    md: '0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)',
    lg: '0 10px 20px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.10)'
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
    fontSize: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px'
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  }
}; 