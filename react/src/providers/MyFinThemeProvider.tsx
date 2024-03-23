import { createContext, ReactNode, Suspense, useMemo, useState } from 'react';
import localStore from '../data/localStore.ts';
import { CircularProgress, createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { getDesignTokens } from '../theme';
import { LoadingProvider } from './LoadingProvider.tsx';
import { SnackbarProvider } from './SnackbarProvider.tsx';

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

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

  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <Suspense fallback={<CircularProgress color="inherit" />}>
          <CssBaseline />
          <LoadingProvider>
            <SnackbarProvider>{children}</SnackbarProvider>
          </LoadingProvider>
        </Suspense>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default MyFinThemeProvider;
