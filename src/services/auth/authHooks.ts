import { queryClient } from '../../data/react-query.ts';
import AuthServices from './authServices.ts';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useUserData } from '../../providers/UserProvider.tsx';
import i18next from 'i18next';
import axios, { AxiosError } from 'axios';
import { CurrencyCode } from '../../consts/Currency.ts';
import {
  BusinessLogicError,
  CustomApiError,
} from '../../data/customApiError.ts';

const QUERY_KEY_SESSION_VALIDITY = 'session_validity';

export function useLogout() {
  const { clearSessionData } = useUserData();

  function logout() {
    clearSessionData();
    queryClient
      .invalidateQueries({ queryKey: [QUERY_KEY_SESSION_VALIDITY] })
      .then();
  }

  return logout;
}

export function useLogin() {
  const { updateUserSessionData, updateUserAccounts } = useUserData();

  async function login(data: { username: string; password: string }) {
    const resp = await AuthServices.attemptLogin(data);
    const { accounts, is_demo, ...sessionData } = resp.data;
    const language = i18next.resolvedLanguage;
    const apiVersion = resp.headers['api-version'];
    updateUserSessionData({
      ...sessionData,
      language,
      apiVersion,
      is_demo: is_demo === 1 || is_demo === '1' || is_demo === true,
    });
    updateUserAccounts(accounts);
    return resp;
  }

  return useMutation({
    mutationFn: login,
  });
}

export function useAuthStatus(checkServer: boolean = true) {
  const { userSessionData } = useUserData();

  async function checkIsAuthenticated() {
    const hasLocalSessionData = userSessionData != null;
    if (!checkServer) return Promise.resolve(hasLocalSessionData);
    return AuthServices.validateSession();
  }

  const query = useQuery({
    queryKey: [QUERY_KEY_SESSION_VALIDITY],
    queryFn: checkIsAuthenticated,
  });

  const needsSetup =
    query.isError && (query.error as AxiosError)?.response?.status === 404;

  return {
    isAuthenticated: query.isSuccess ? query.data : null,
    needsSetup,
    ...query,
  };
}

export function useChangePassword() {
  async function changePassword(data: {
    currentPassword: string;
    newPassword1: string;
    newPassword2: string;
  }) {
    try {
      const resp = await AuthServices.changePassword(data);
      return resp.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as CustomApiError;

        if (errorData.rationale && errorData.message) {
          throw new BusinessLogicError(
            errorData.rationale,
            errorData.message,
            error,
          );
        }
      }

      throw error;
    }
  }

  return useMutation({
    mutationFn: changePassword,
  });
}

export function useRegister() {
  async function register(data: {
    email: string;
    username: string;
    password: string;
  }) {
    const resp = await AuthServices.register(data);
    return resp;
  }

  return useMutation({
    mutationFn: register,
  });
}

export function useSendRecoveryOtp() {
  async function register(username: string) {
    const resp = await AuthServices.sendRecoveryOtp(username);
    return resp;
  }

  return useMutation({
    mutationFn: register,
  });
}

export function useSetRecoveryNewPassword() {
  async function register(data: {
    username: string;
    otp: string;
    new_password1: string;
    new_password2: string;
  }) {
    const resp = await AuthServices.setRecoveryNewPassword(data);
    return resp;
  }

  return useMutation({
    mutationFn: register,
  });
}

export function useInitSetup() {
  async function initSetup(data: {
    username: string;
    email: string;
    password: string;
    currency: CurrencyCode;
  }) {
    const resp = await AuthServices.initSetup(data);
    return resp;
  }

  return useMutation({
    mutationFn: initSetup,
  });
}

export function useChangeCurrency() {
  async function changeCurrency(currency: CurrencyCode) {
    const resp = await AuthServices.changeCurrency(currency);
    return resp.data;
  }

  return useMutation({
    mutationFn: changeCurrency,
  });
}
