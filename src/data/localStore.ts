import { Account, UserSession } from '../services/auth/authServices.ts';
import {
  DEFAULT_MY_FIN_THEME,
  MY_FIN_THEME_NAMES,
  type MyFinThemeName,
} from '../theme';

const storagePrefix = 'myfin';

const sessionDataTag = 'sessionData';
const userAccountsTag = 'accounts';
const uiModeTag = 'uiMode';
const lastTrxTag = 'lastTrxTag';

export type CachedTransaction = {
  account_from_id?: bigint;
  account_to_id?: bigint;
  amount: number;
  category_id?: bigint;
  date_timestamp?: number;
  entity_id?: bigint;
  is_essential: 0 | 1;
};

const isMyFinThemeName = (
  value: string | null,
): value is MyFinThemeName =>
  value !== null &&
  (MY_FIN_THEME_NAMES as readonly string[]).includes(value);

const localStore = {
  getSessionData: (): UserSession => {
    return (
      JSON.parse(
        window.localStorage.getItem(
          `${storagePrefix}.${sessionDataTag}`,
        ) as string,
      ) ?? []
    );
  },
  setSessionData: (sessionData: UserSession) => {
    window.localStorage.setItem(
      `${storagePrefix}.${sessionDataTag}`,
      JSON.stringify(sessionData),
    );
  },
  setUserAccounts: (accounts: Account[]) => {
    window.localStorage.setItem(
      `${storagePrefix}.${userAccountsTag}`,
      JSON.stringify(accounts),
    );
  },
  clearSessionData: () => {
    window.localStorage.removeItem(`${storagePrefix}.${sessionDataTag}`);
    window.localStorage.removeItem(`${storagePrefix}.${userAccountsTag}`);
  },
  getUserAccounts: (): Array<Account> => {
    return (
      JSON.parse(
        window.localStorage.getItem(
          `${storagePrefix}.${userAccountsTag}`,
        ) as string,
      ) ?? []
    );
  },
  getUiMode: (): MyFinThemeName => {
    const storedTheme = window.localStorage.getItem(
      `${storagePrefix}.${uiModeTag}`,
    );
    return isMyFinThemeName(storedTheme)
      ? storedTheme
      : DEFAULT_MY_FIN_THEME;
  },
  setUiMode: (themeName: MyFinThemeName) => {
    window.localStorage.setItem(
      `${storagePrefix}.${uiModeTag}`,
      themeName,
    );
  },
  toggleUiMode: () => {
    const currentTheme = localStore.getUiMode();
    const currentIndex = MY_FIN_THEME_NAMES.indexOf(currentTheme);
    const nextTheme =
      MY_FIN_THEME_NAMES[(currentIndex + 1) % MY_FIN_THEME_NAMES.length];
    localStore.setUiMode(nextTheme);
  },
  getLastCachedTrx: (): CachedTransaction | null => {
    return JSON.parse(
      window.localStorage.getItem(`${storagePrefix}.${lastTrxTag}`) as string,
    );
  },
  setLastCachedTrx: (trx: CachedTransaction) => {
    window.localStorage.setItem(
      `${storagePrefix}.${lastTrxTag}`,
      JSON.stringify(trx),
    );
  },
};

export default localStore;
