import {
  createContext,
  ReactNode,
  Suspense,
  useEffect,
  useMemo,
  useState,
} from 'react';
import localStore from '../data/localStore.ts';
import { createTheme } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress/CircularProgress';
import CssBaseline from '@mui/material/CssBaseline/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { generateGlobalTheme } from '../theme';
import { LoadingProvider } from './LoadingProvider.tsx';
import { SnackbarProvider } from './SnackbarProvider.tsx';
import { useTranslation } from 'react-i18next';
import { en, pt } from 'yup-locales';
import { setLocale as setYupLocale } from 'yup';
import * as locales from '@mui/material/locale';

type SupportedLocales = keyof typeof locales;
export const ColorModeContext = createContext({
  toggleColorMode: () => {},
});

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

  const [locale, setLocale] = useState<SupportedLocales>('enUS');
  const theme = useMemo(
    () => createTheme(generateGlobalTheme(mode), locales[locale]),
    [mode, locale],
  );
  const { i18n } = useTranslation();

  function setAppLocale(language: string) {
    switch (language) {
      case 'pt':
        setYupLocale(pt);
        setLocale('ptPT');
        break;
      default:
        setLocale('enUS');
        setYupLocale(en);
        break;
    }
  }

  useEffect(() => {
    const handleLanguageChange = () => {
      setAppLocale(i18n.language);
    };

    setAppLocale(i18n.language);
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

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
