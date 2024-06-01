import { Account, UserSession } from '../services/auth/authServices.ts';

const storagePrefix = 'myfin';

const sessionDataTag = 'sessionData';
const userAccountsTag = 'accounts';
const uiModeTag = 'uiMode';

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
  getUiMode: (): 'light' | 'dark' => {
    return (
      (window.localStorage.getItem(`${storagePrefix}.${uiModeTag}`) as
        | 'light'
        | 'dark') ?? 'dark'
    );
  },
  setUiMode: (mode: 'light' | 'dark') => {
    window.localStorage.setItem(`${storagePrefix}.${uiModeTag}`, mode);
  },
  toggleUiMode: () => {
    const prevMode = localStore.getUiMode();
    localStore.setUiMode(prevMode === 'light' ? 'dark' : 'light');
  },
};

export default localStore;