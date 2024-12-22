import { queryClient } from '../../data/react-query.ts';
import AuthServices from './authServices.ts';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useUserData } from '../../providers/UserProvider.tsx';
import i18next from 'i18next';

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
    const { accounts, ...sessionData } = resp.data;
    const language = i18next.resolvedLanguage;
    updateUserSessionData({ ...sessionData, language });
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
  return { isAuthenticated: query.isSuccess ? query.data : null, ...query };
}

export function useChangePassword() {
  async function changePassword(data: {
    currentPassword: string;
    newPassword1: string;
    newPassword2: string;
  }) {
    const resp = await AuthServices.changePassword(data);
    return resp.data;
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
