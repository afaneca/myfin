import React, { createContext, useState, useEffect, useContext } from 'react';
import localStore from '../data/localStore.ts';
import { Account, UserSession } from '../services/auth/authServices.ts';

export const useUserData = () => {
  return useContext(UserContext);
};

interface UserContextType {
  userSessionData: UserSession | null;
  userAccounts: Account[] | null;
  updateUserSessionData: (newSessionData: UserSession) => void;
  updateUserAccounts: (newAccounts: Account[]) => void;
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
  }, []);

  // Update data
  const updateUserSessionData = (newSessionData: UserSession) => {
    setUserSessionData(newSessionData);
    localStore.setSessionData(newSessionData);
  };

  const updateUserAccounts = (newAccounts: Account[]) => {
    setUserAccounts(newAccounts);
    localStore.setUserAccounts(newAccounts);
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
        updateUserSessionData,
        updateUserAccounts,
        clearSessionData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
