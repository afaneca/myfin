import { createContext, ReactNode, useMemo, useState } from "react";
import localStore from "../data/localStore.ts";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { getDesignTokens } from "../theme";
import { LoadingProvider } from "./LoadingProvider.tsx";
import { SnackbarProvider } from "./SnackbarProvider.tsx";

export const ColorModeContext = createContext({ toggleColorMode: () => { } });

const MyFinThemeProvider = ({ children }: { children: ReactNode }) => {
    const [mode, setMode] = useState<'light' | 'dark'>(localStore.getUiMode());
    const colorMode = useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
                localStore.toggleUiMode();
            },
        }),
        [],
    );

    const theme = useMemo(
        () =>
            createTheme(getDesignTokens(mode)),
        [mode],
    );

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <LoadingProvider>
                    <SnackbarProvider>
                        {children}
                    </SnackbarProvider>
                </LoadingProvider>
            </ThemeProvider>
        </ColorModeContext.Provider>
    )
}

export default MyFinThemeProvider;