import React, { createContext, useContext, useEffect, useState } from 'react';
import localStore, { CachedTransaction } from '../data/localStore.ts';
import { Account, UserSession } from '../services/auth/authServices.ts';
import Cookies from 'universal-cookie';

export const useUserData = () => {
  return useContext(UserContext);
};

interface UserContextType {
  userSessionData: UserSession | null;
  userAccounts: Account[] | null;
  lastCachedTrx: CachedTransaction | null;
  updateUserSessionData: (newSessionData: UserSession) => void;
  partiallyUpdateUserSessionData: (
    partialSessionData: Partial<UserSession>,
  ) => void;
  updateUserAccounts: (newAccounts: Account[]) => void;
  updateLastCachedTrx: (newTrx: CachedTransaction) => void;
  clearSessionData: () => void;
}

// Create a context to hold user session data and account list data
export const UserContext = createContext({} as UserContextType);

// UserContextProvider component to manage state and provide context
export const UserContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [userSessionData, setUserSessionData] = useState<UserSession | null>(
    null,
  );
  const [userAccounts, setUserAccounts] = useState<Account[] | null>(null);

  const [lastCachedTrx, setLastCachedTrx] = useState<CachedTransaction | null>(
    null,
  );

  // Retrieve data
  useEffect(() => {
    if (!userSessionData) {
      const storedSessionData = localStore.getSessionData();
      setUserSessionData(storedSessionData);
    }
    if (!userAccounts) {
      const storedAccounts = localStore.getUserAccounts();
      setUserAccounts(storedAccounts);
    }

    if (!lastCachedTrx) {
      const cachedTrx = localStore.getLastCachedTrx();
      setLastCachedTrx(cachedTrx);
    }
  }, []);

  // Update data
  const updateUserSessionData = (newSessionData: UserSession) => {
    setUserSessionData(newSessionData);
    localStore.setSessionData(newSessionData);
    if (newSessionData.currency) {
      new Cookies().set('currency', newSessionData.currency, { sameSite: 'strict' });
    }
  };

  const partiallyUpdateUserSessionData = (
    partialSessionData: Partial<UserSession>,
  ) => {
    if (userSessionData) {
      updateUserSessionData({ ...userSessionData, ...partialSessionData });
    }
  };

  const updateUserAccounts = (newAccounts: Account[]) => {
    setUserAccounts(newAccounts);
    localStore.setUserAccounts(newAccounts);
  };

  const updateLastCachedTrx = (newTrx: CachedTransaction) => {
    setLastCachedTrx(newTrx);
    localStore.setLastCachedTrx(newTrx);
  };

  const clearSessionData = () => {
    setUserAccounts([]);
    setUserSessionData(null);
    localStore.clearSessionData();
  };

  return (
    <UserContext.Provider
      value={{
        userSessionData,
        userAccounts,
        lastCachedTrx,
        updateUserSessionData,
        partiallyUpdateUserSessionData,
        updateUserAccounts,
        updateLastCachedTrx,
        clearSessionData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
