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
import CircularProgress from '@mui/material/CircularProgress';
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from '@mui/material/GlobalStyles';
import { ThemeProvider } from '@mui/material/styles';
import {
  generateGlobalTheme,
  type MyFinThemeName,
} from '../theme';
import { LoadingProvider } from './LoadingProvider.tsx';
import { SnackbarProvider } from './SnackbarProvider.tsx';
import { useTranslation } from 'react-i18next';
import { en, fr, pt } from 'yup-locales';
import { setLocale as setYupLocale } from 'yup';
import * as locales from '@mui/material/locale';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/pt.js';
import 'dayjs/locale/en.js';
import 'dayjs/locale/fr.js';
import { UserContextProvider } from './UserProvider.tsx';

type SupportedLocales = keyof typeof locales;

interface ColorModeContextType {
  themeName: MyFinThemeName;
  setColorMode: (themeName: MyFinThemeName) => void;
}
export const ColorModeContext = createContext({} as ColorModeContextType);

const MyFinThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeName, setThemeName] = useState<MyFinThemeName>(
    localStore.getUiMode(),
  );
  const colorMode = useMemo(
    () => ({
      themeName,
      setColorMode: (selectedThemeName: MyFinThemeName) => {
        setThemeName(selectedThemeName);
        localStore.setUiMode(selectedThemeName);
      },
    }),
    [themeName],
  );

  const [locale, setLocale] = useState<SupportedLocales>('ptPT');
  const [dayJsLocale, setDayJsLocale] = useState<'en' | 'pt' | 'fr'>('pt');
  const theme = useMemo(
    () => createTheme(generateGlobalTheme(themeName), locales[locale]),
    [themeName, locale],
  );
  const { i18n } = useTranslation();

  function setAppLocale(language: string) {
    switch (language.split('-')[0]) {
      case 'pt':
        setLocale('ptPT');
        setYupLocale(pt);
        setDayJsLocale('pt');
        break;
      case 'fr':
        setLocale('frFR');
        setYupLocale(fr);
        setDayJsLocale('fr');
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
      <UserContextProvider>
        <LocalizationProvider
          dateAdapter={AdapterDayjs}
          adapterLocale={dayJsLocale}
        >
          <ThemeProvider theme={theme}>
            <Suspense fallback={<CircularProgress color="inherit" />}>
              <CssBaseline />
              <GlobalStyles
                styles={(theme) => ({
                  ':root': {
                    '--myfin-scrollbar-track': theme.palette.background.default,
                    '--myfin-scrollbar-thumb': theme.palette.divider,
                    '--myfin-scrollbar-thumb-hover': theme.palette.action.hover,
                  },
                })}
              />
              <LoadingProvider>
                <SnackbarProvider>{children}</SnackbarProvider>
              </LoadingProvider>
            </Suspense>
          </ThemeProvider>
        </LocalizationProvider>
      </UserContextProvider>
    </ColorModeContext.Provider>
  );
};

export default MyFinThemeProvider;
