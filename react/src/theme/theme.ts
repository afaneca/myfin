import { PaletteMode, ThemeOptions, colors } from '@mui/material';
import { Theme as NivoTheme } from '@nivo/core';
import { PaletteOptions } from '@mui/material/styles/createPalette';

// Extend MUI's Theme object to include Nivo theme settings
declare module '@mui/material/styles' {
  interface Theme {
    nivo: NivoTheme; //NivoThemeSettings;
  }
}
function generateNivoThemeTheme(
  _mode: 'light' | 'dark',
  palette: PaletteOptions,
): NivoTheme {
  return {
    text: {
      fontSize: 11,
      fill: palette.text?.primary,
      outlineWidth: 0,
      outlineColor: 'transparent',
    },
    tooltip: {
      container: {
        background: '#ffffff',
        color: '#333333',
        fontSize: 12,
      },
    },
  };
}

const muiLightPalette = {
  // palette values for light mode
  primary: {
    dark: colors.blue[400],
    main: colors.blue[300],
    light: colors.blue[200],
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
    paper: colors.grey[100],
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
};

export const generateGlobalTheme = (mode: PaletteMode): ThemeOptions => {
  const palette = mode === 'light' ? muiLightPalette : muiDarkPalette;
  return {
    palette: {
      mode,
      ...palette,
    },
    shape: {
      borderRadius: 4,
    },
    shadows: ['0 1px 10px 0 rgba(69,90,100,.08)', ...Array(24).fill('none')],
    components: {
      // component style overrides in here
    },
    overrides: {
      /*MuiGrid: {
        container: {
          width: '100% !important',
          margin: '0 !important',
        },
      },*/
    },
    // theme for nivo charts
    nivo: generateNivoThemeTheme(mode, palette),
  };
};
