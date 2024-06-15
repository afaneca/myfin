import { PaletteMode, ThemeOptions, colors } from '@mui/material';
import { Theme as NivoTheme } from '@nivo/core';
import { generateNivoThemeTheme } from '../utils/nivoUtils.ts';

// Extend MUI's Theme object to include Nivo theme settings
interface MyFinTheme extends ThemeOptions {
  nivo: NivoTheme;
}

declare module '@mui/material/styles' {
  interface Theme extends MyFinTheme {}
}

const muiLightPalette = {
  // palette values for light mode
  primary: {
    dark: colors.blue[400],
    main: colors.blue[300],
    light: colors.blue[200],
    contrastText: 'white',
  },
  secondary: {
    dark: colors.green[400],
    main: colors.green[300],
    light: colors.green[200],
  },
  neutral: {
    dark: colors.grey[700],
    main: colors.grey[500],
    light: colors.grey[100],
  },
  background: {
    default: '#f5f5f5',
    paper: 'white',
  },
  text: {
    primary: '#0e141f',
    secondary: '#46505A',
  },
};

const muiDarkPalette = {
  // palette values for dark mode
  primary: {
    dark: colors.blue[300],
    main: colors.blue[200],
    light: colors.blue[100],
    contrastText: '#1f2d3d',
  },
  secondary: {
    dark: colors.green[500],
    main: colors.green[400],
    light: colors.green[200],
  },
  neutral: {
    dark: colors.grey[700],
    main: colors.grey[500],
    light: colors.grey[100],
  },
  background: {
    default: '#1f2d3d',
    paper: '#253649',
  },
  text: {
    primary: colors.grey[100],
    secondary: colors.grey[400],
  },
  error: {
    main: colors.red[400],
  },
  success: {
    main: colors.green[400],
  },
};

export const generateGlobalTheme = (mode: PaletteMode): MyFinTheme => {
  const palette = mode === 'light' ? muiLightPalette : muiDarkPalette;

  return {
    palette: { mode, ...palette },
    shape: { borderRadius: 2 },
    // Use the combined shadows array
    components: {
      // component style overrides in here
      /*MuiButton: {
        styleOverrides: {
          text: {
            color: 'white',
          },
        },
      },*/
    },
    // theme for nivo charts
    nivo: generateNivoThemeTheme(mode, palette),
  };
};
