import { PaletteMode, ThemeOptions, colors } from '@mui/material';
import { PaletteOptions } from '@mui/material/styles';
import { Theme as NivoTheme } from '@nivo/theming';
import { generateNivoTheme } from '../utils/nivoUtils.ts';

export const MY_FIN_THEME_NAMES = [
  'light',
  'dark',
  'midnight-teal',
  'carbon-ember',
  'plum-aurora',
] as const;

export type MyFinThemeName = (typeof MY_FIN_THEME_NAMES)[number];

export const DEFAULT_MY_FIN_THEME: MyFinThemeName = 'dark';

export const MY_FIN_THEME_LABEL_KEYS: Record<MyFinThemeName, string> = {
  light: 'profile.lightTheme',
  dark: 'profile.darkTheme',
  'midnight-teal': 'profile.midnightTealTheme',
  'carbon-ember': 'profile.carbonEmberTheme',
  'plum-aurora': 'profile.plumAuroraTheme',
};

type MyFinPaletteOptions = PaletteOptions & {
  neutral: {
    dark: string;
    main: string;
    light: string;
  };
};

// Extend MUI's Theme object to include Nivo theme settings
export interface MyFinTheme extends ThemeOptions {
  nivo: NivoTheme;
  myFin: {
    name: MyFinThemeName;
  };
}

declare module '@mui/material/styles' {
  interface Theme extends MyFinTheme {}

  interface ThemeOptions {
    myFin?: {
      name?: MyFinThemeName;
    };
  }
}

const muiLightPalette: MyFinPaletteOptions = {
  // palette values for light mode
  primary: {
    dark: colors.blue[500],
    main: colors.blue[400],
    light: colors.blue[300],
    contrastText: '#ffffff',
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
  divider: '#ebe7e7',
};

const muiDarkPalette: MyFinPaletteOptions = {
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
  divider: '#304052',
};

const midnightTealPalette: MyFinPaletteOptions = {
  primary: {
    dark: '#26a6b7',
    main: '#4dd0e1',
    light: '#8eeaf3',
    contrastText: '#08202b',
  },
  secondary: {
    dark: '#46b581',
    main: '#73d6a4',
    light: '#a4e7c2',
    contrastText: '#10271c',
  },
  neutral: {
    dark: '#1d3448',
    main: '#547287',
    light: '#a8c0cf',
  },
  background: {
    default: '#0d1726',
    paper: '#15263a',
  },
  text: {
    primary: '#eaf4f5',
    secondary: '#9cb0c0',
  },
  error: {
    main: '#ff8a80',
  },
  success: {
    main: '#73d6a4',
  },
  divider: '#2c485a',
};

const carbonEmberPalette: MyFinPaletteOptions = {
  primary: {
    dark: '#d99816',
    main: '#f4b942',
    light: '#ffd77b',
    contrastText: '#241b09',
  },
  secondary: {
    dark: '#c86660',
    main: '#f28b82',
    light: '#ffb3ae',
    contrastText: '#2d1412',
  },
  neutral: {
    dark: '#272c35',
    main: '#59616d',
    light: '#b5bac2',
  },
  background: {
    default: '#17191f',
    paper: '#232832',
  },
  text: {
    primary: '#f4f1ea',
    secondary: '#a6a9b2',
  },
  error: {
    main: '#ff8a80',
  },
  success: {
    main: '#74d99b',
  },
  divider: '#3a404b',
};

const plumAuroraPalette: MyFinPaletteOptions = {
  primary: {
    dark: '#9876ea',
    main: '#b9a1ff',
    light: '#d5c7ff',
    contrastText: '#22163c',
  },
  secondary: {
    dark: '#33bfae',
    main: '#63e6d2',
    light: '#a5f4e8',
    contrastText: '#0b2a27',
  },
  neutral: {
    dark: '#2c2447',
    main: '#6e6290',
    light: '#c5bddb',
  },
  background: {
    default: '#171327',
    paper: '#241c3b',
  },
  text: {
    primary: '#f4f0ff',
    secondary: '#aaa0c4',
  },
  error: {
    main: '#ff8a80',
  },
  success: {
    main: '#63e6d2',
  },
  divider: '#463a62',
};

const palettes: Record<MyFinThemeName, MyFinPaletteOptions> = {
  light: muiLightPalette,
  dark: muiDarkPalette,
  'midnight-teal': midnightTealPalette,
  'carbon-ember': carbonEmberPalette,
  'plum-aurora': plumAuroraPalette,
};

export const MY_FIN_THEME_PALETTE_PREVIEWS: Record<
  MyFinThemeName,
  readonly [string, string, string, string]
> = {
  light: ['#f5f5f5', '#ffffff', colors.blue[400], colors.green[300]],
  dark: ['#1f2d3d', '#253649', colors.blue[200], colors.green[400]],
  'midnight-teal': ['#0d1726', '#15263a', '#4dd0e1', '#73d6a4'],
  'carbon-ember': ['#17191f', '#232832', '#f4b942', '#f28b82'],
  'plum-aurora': ['#171327', '#241c3b', '#b9a1ff', '#63e6d2'],
};
const isDarkTheme = (themeName: MyFinThemeName) => themeName !== 'light';

export const generateGlobalTheme = (
  themeName: MyFinThemeName,
): MyFinTheme => {
  const mode: PaletteMode = isDarkTheme(themeName) ? 'dark' : 'light';
  const palette = palettes[themeName];

  const tooltipBackground = palette.background?.paper ?? '#000000';
  const tooltipText = palette.text?.primary ?? '#ffffff';
  const tooltipBorder = palette.divider ?? 'transparent';

  return {
    palette: { mode, ...palette },
    myFin: { name: themeName },
    shape: { borderRadius: 7 },
    components: {
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: tooltipBackground,
            color: tooltipText,
            border: `1px solid ${tooltipBorder}`,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.24)',
          },
          arrow: {
            color: tooltipBackground,
          },
        },
      },
    },
    nivo: generateNivoTheme(mode, palette) as NivoTheme,
  };
};
