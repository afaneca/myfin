import { PaletteMode, colors } from "@mui/material";

export const getDesignTokens = (mode: PaletteMode) => {
  return {
    palette: {
      mode,
      ...(mode === 'light'
        ? {
          // palette values for light mode
          primary: {
            dark: colors.blue[400],
              main: colors.blue[300],
              light: colors.blue[200]
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
            primary: '#173A5E',
            secondary: '#46505A',
          },
        }
        : {
          // palette values for dark mode
          primary: {
            darkest: "#1f2d3d",
            dark: colors.blue[300],
            main: colors.blue[200],
            light: colors.blue[100]
          },
          secondary: {
            dark: colors.green[500],
            main: colors.green[400],
            light: colors.green[200]
          },
          neutral: {
            dark: colors.grey[700],
            main: colors.grey[500],
            light: colors.grey[100],
          },
          background: {
            default: "#1f2d3d",
            paper: "#253649",
          },
          text: {
            primary: colors.grey[100],
            secondary: colors.grey[400],
          },
        }),
    },
    shadows: [
      "0 1px 10px 0 rgba(69,90,100,.08)",
      ...Array(24).fill('none')
    ],
    components: {
      // component style overrides in here
      MuiDataGrid: {
        styleOverrides: {
          root: {
            /* backgroundColor: 'red', */
          },
        },
      },
    }
  };
}