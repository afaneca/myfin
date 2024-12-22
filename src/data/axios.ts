import Axios, { InternalAxiosRequestConfig } from 'axios';
import { MYFIN_BASE_API_URL } from '../config';
import localStore from './localStore.ts';
import i18next from 'i18next';

function authRequestInterceptor(
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig {
  const sessionData = localStore.getSessionData();
  if (sessionData) {
    config.headers.sessionkey = `${sessionData.sessionkey}`;
    config.headers.authusername = `${sessionData.username}`;
  }

  config.headers.Accept = 'application/json';
  config.headers['Accept-Language'] =
    sessionData.language ?? i18next.resolvedLanguage;
  config.headers['Cache-Control'] = 'no-cache';
  config.headers['Pragma'] = 'no-cache';
  config.headers['Expires'] = '0';

  // Add a dynamic timestamp to the request parameters
  config.params = {
    ...config.params,
    t: new Date().getTime(),
  };

  return config;
}

export const axios = Axios.create({
  baseURL: MYFIN_BASE_API_URL,
});

axios.interceptors.request.use(authRequestInterceptor);
