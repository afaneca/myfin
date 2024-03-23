import {
  createContext,
  ReactNode,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import localStore from '../data/localStore.ts';
import {
  CircularProgress,
  createTheme,
  CssBaseline,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { getDesignTokens } from '../theme';
import { LoadingProvider } from './LoadingProvider.tsx';
import { SnackbarProvider } from './SnackbarProvider.tsx';
import { useTranslation } from 'react-i18next';
import { en, pt } from 'yup-locales';
import {setLocale} from 'yup';

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
  const { i18n } = useTranslation();

function setYupLocale(language: string) {
  console.log('SET LOCALE: ' + language);
  switch(language){
    case 'pt':
      setLocale(pt);
      break;
      default: 
      setLocale(en);
      break;
  }
}

  /* useEffect(() => {
    const handleLanguageChange = () => {
      console.log('NEW LANGUAGE: ' + i18n.language);
      setYupLocale(i18n.language)
    };

    i18n.on('languageChanged', handleLanguageChange);
    setYupLocale(i18n.language)
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]); */

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
