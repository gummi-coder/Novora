import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: {
        main: string;
        light: string;
        dark: string;
      };
      secondary: {
        main: string;
        light: string;
        dark: string;
      };
      success: {
        main: string;
        light: string;
        dark: string;
      };
      info: {
        main: string;
        light: string;
        dark: string;
      };
      background: {
        default: string;
        paper: string;
        hover: string;
      };
      text: {
        primary: string;
        secondary: string;
      };
    };
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    borderRadius: {
      sm: string;
      md: string;
      lg: string;
    };
    shadows: {
      sm: string;
      md: string;
      lg: string;
    };
    typography: {
      fontSize: {
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
      };
      fontWeight: {
        light: number;
        regular: number;
        medium: number;
        bold: number;
      };
    };
  }
} 