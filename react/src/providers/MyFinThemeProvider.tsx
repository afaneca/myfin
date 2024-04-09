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
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/pt.js';
import 'dayjs/locale/en.js';

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

  const [locale, setLocale] = useState<SupportedLocales>('ptPT');
  const [dayJsLocale, setDayJsLocale] = useState<'en' | 'pt'>('pt');
  const theme = useMemo(
    () => createTheme(generateGlobalTheme(mode), locales[locale]),
    [mode, locale],
  );
  const { i18n } = useTranslation();

  function setAppLocale(language: string) {
    switch (language) {
      case 'pt':
        setLocale('ptPT');
        setYupLocale(pt);
        setDayJsLocale('pt');
        break;
      default:
        setLocale('enUS');
        setYupLocale(en);
        setDayJsLocale('en');
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
      <LocalizationProvider
        dateAdapter={AdapterDayjs}
        adapterLocale={dayJsLocale}
      >
        <ThemeProvider theme={theme}>
          <Suspense fallback={<CircularProgress color="inherit" />}>
            <CssBaseline />
            <LoadingProvider>
              <SnackbarProvider>{children}</SnackbarProvider>
            </LoadingProvider>
          </Suspense>
        </ThemeProvider>
      </LocalizationProvider>
    </ColorModeContext.Provider>
  );
};

export default MyFinThemeProvider;
