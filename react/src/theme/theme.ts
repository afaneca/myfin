import {PaletteMode, colors} from "@mui/material";
    
export const getDesignTokens = (mode: PaletteMode) => {
    return {
        palette: {
            mode,
            ...(mode === 'light'
                ? {
                    // palette values for light mode
                    /* primary: {
                        main: colors.primary[100],
                      },
                      secondary: {
                        main: colors.greenAccent[500],
                      },
                      neutral: {
                        dark: colors.grey[700],
                        main: colors.grey[500],
                        light: colors.grey[100],
                      }, */
                      background: {
                        paper: colors.grey[100],
                      },
                }
                : {
                    // palette values for dark mode
                    /* primary: {
                        main: colors.primary[500],
                      },
                      secondary: {
                        main: colors.greenAccent[500],
                      },
                      neutral: {
                        dark: colors.grey[700],
                        main: colors.grey[500],
                        light: colors.grey[100],
                      }, */
                      background: {
                        default: "#1f2d3d",
                        paper: "#253649",
                        
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